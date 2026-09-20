"""Restore the immutable 0.6.0 source delta after verifying every input blob."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import lzma
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = '8c4385c05a0dc90cbe1ab12ce91f49de896022406a2c9a22d52bb5dc0832e366'
ALLOWED = {'packages', 'tests', 'docs', 'README.md', 'CHANGELOG.md', 'package.json'}


def blob(path):
    if not path.exists():
        return None
    data = path.read_bytes()
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


def main():
    parts = sorted((ROOT / '.delivery').glob('parity-060.*.xzpart'))
    if [p.name for p in parts] != [f'parity-060.{i:02}.xzpart' for i in range(4)]:
        raise ValueError('Unexpected delivery parts')
    compressed = b''.join(p.read_bytes() for p in parts)
    if hashlib.sha256(compressed).hexdigest() != EXPECTED:
        raise ValueError('Delivery SHA-256 mismatch')
    decoder = lzma.LZMADecompressor(memlimit=128 * 1024 * 1024)
    raw = decoder.decompress(compressed, max_length=8 * 1024 * 1024)
    if not decoder.eof or decoder.unused_data:
        raise ValueError('Invalid or oversized source frame')
    manifest = json.loads(raw)
    if manifest['format'] != 1 or len(manifest['files']) != 94:
        raise ValueError('Unexpected source manifest')
    states = []
    names = set()
    for record in manifest['files']:
        name = record['path']
        relative = PurePosixPath(name)
        if not name or relative.is_absolute() or '..' in relative.parts or '\\' in name or '\t' in name or '\n' in name or relative.parts[0] not in ALLOWED or name in names:
            raise ValueError('Unsafe source path: ' + name)
        names.add(name)
        path = ROOT.joinpath(*relative.parts)
        if any(p.is_symlink() for p in [path, *path.parents]):
            raise ValueError('Symlink source path')
        for key in ['before', 'after']:
            value = record[key]
            if (value is None and key == 'before') or isinstance(value, str) and re.fullmatch('[0-9a-f]{40}', value):
                continue
            raise ValueError('Invalid Git blob identity')
        states.append((path, record['before'], record['after']))
    if all(blob(path) == after for path, before, after in states):
        print('All 94 source files are already materialized.')
        return
    for path, before, after in states:
        if blob(path) != before:
            raise ValueError('Source diverged: ' + str(path.relative_to(ROOT)))
    patch = manifest['patch'].encode('utf-8')
    inventory = subprocess.run(['git', 'apply', '--numstat', '-z', '--unidiff-zero'], input=patch, cwd=ROOT, check=True, capture_output=True).stdout
    changed = [record.decode('utf-8').split('\t', 2)[2] for record in inventory.split(b'\0') if record]
    if len(changed) != len(names) or set(changed) != names:
        raise ValueError('Patch paths differ from the verified manifest')
    subprocess.run(['git', 'apply', '--check', '--unidiff-zero'], input=patch, cwd=ROOT, check=True)
    subprocess.run(['git', 'apply', '--unidiff-zero'], input=patch, cwd=ROOT, check=True)
    for path, before, after in states:
        if blob(path) != after:
            raise ValueError('Restored Git blob mismatch: ' + str(path.relative_to(ROOT)))
    print('Verified and restored all 94 editable source files.')


if __name__ == '__main__':
    main()
