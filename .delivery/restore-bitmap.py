"""Restore the verified 0.10.0 source delta without replacing divergent files."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import lzma

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = '9c230eccb08fd491cda27d28e264d6ba5f69d403033e86c7bda4aa278a7a1aed'
ALLOWED = {'packages', 'tests', 'docs', 'README.md', 'CHANGELOG.md', 'package.json'}


def blob(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()


def safe_path(name):
    relative = PurePosixPath(name)
    if not name or relative.is_absolute() or '..' in relative.parts or '\\' in name or relative.parts[0] not in ALLOWED:
        raise ValueError('Unsafe source path: ' + name)
    path = ROOT.joinpath(*relative.parts)
    if any(p.is_symlink() for p in [path, *path.parents]):
        raise ValueError('Symlink source path: ' + name)
    return path


def main():
    parts = sorted((ROOT/'.delivery').glob('bitmap.*.xzpart'))
    if len(parts) != 5:
        raise ValueError('Unexpected source part count')
    compressed = b''.join(p.read_bytes() for p in parts)
    if hashlib.sha256(compressed).hexdigest() != EXPECTED:
        raise ValueError('Delivery SHA-256 mismatch')
    decoder = lzma.LZMADecompressor(memlimit=128*1024*1024)
    raw = decoder.decompress(compressed, max_length=8*1024*1024)
    if not decoder.eof or decoder.unused_data:
        raise ValueError('Invalid or oversized source frame')
    manifest = json.loads(raw)
    if manifest['format'] != 1 or manifest['baseCommit'] != '350856a48813da4d2ea45e00c196891016d049b7':
        raise ValueError('Unexpected source manifest')
    seen, plans = set(), []
    for record in manifest['records']:
        name = record['path']
        path = safe_path(name)
        if name in seen:
            raise ValueError('Duplicate source path')
        seen.add(name)
        old = path.read_bytes() if path.exists() else b''
        actual = blob(old) if path.exists() else None
        if actual == record['after']:
            continue
        if actual != record['before']:
            raise ValueError('Source diverged: ' + name)
        lines = old.decode('utf-8').splitlines(keepends=True)
        previous = 0
        for start, end, replacement in record['edits']:
            if type(start) is not int or type(end) is not int or not previous <= start <= end <= len(lines):
                raise ValueError('Invalid edit range')
            if not isinstance(replacement, list) or not all(isinstance(line, str) for line in replacement):
                raise ValueError('Invalid replacement lines')
            previous = end
        for start, end, replacement in reversed(record['edits']):
            lines[start:end] = replacement
        result = ''.join(lines).encode('utf-8')
        if blob(result) != record['after']:
            raise ValueError('Restored blob mismatch: ' + name)
        plans.append((path, result))
    # Verify the entire input before changing editable source.
    for path, data in plans:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    print(f'Verified {len(seen)} records; restored {len(plans)} source files.')


if __name__ == '__main__':
    main()
