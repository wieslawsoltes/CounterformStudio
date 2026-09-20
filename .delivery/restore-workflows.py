"""Materialize a digest-checked source delta; never overwrite divergent files."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import lzma

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = '5884800bf5a6e417d3edac754751486cfd2c28e973a2a2370525b90b1df8c228'
ALLOWED = {'packages', 'tests', 'docs', 'README.md', 'CHANGELOG.md', 'package.json'}

def blob(data):
    return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()

def main():
    parts = sorted((ROOT/'.delivery').glob('workflows.*.xzpart'))
    if len(parts) != 6:
        raise ValueError('Expected exactly six delivery parts')
    payload = b''.join(p.read_bytes() for p in parts)
    if hashlib.sha256(payload).hexdigest() != EXPECTED:
        raise ValueError('Delivery SHA-256 mismatch')
    decoder = lzma.LZMADecompressor(memlimit=128*1024*1024)
    raw = decoder.decompress(payload, max_length=8*1024*1024)
    if not decoder.eof or decoder.unused_data:
        raise ValueError('Invalid or oversized source frame')
    manifest = json.loads(raw)
    if manifest['format'] != 1 or len(manifest['records']) != 73:
        raise ValueError('Unexpected source manifest')
    plans, seen = [], set()
    for record in manifest['records']:
        name = record['path']
        relative = PurePosixPath(name)
        if not name or name in seen or relative.is_absolute() or '..' in relative.parts or '\\' in name:
            raise ValueError('Unsafe or duplicate source path')
        if relative.parts[0] not in ALLOWED:
            raise ValueError('Disallowed source path')
        seen.add(name)
        path = ROOT.joinpath(*relative.parts)
        if any(p.is_symlink() for p in [path, *path.parents]):
            raise ValueError('Symlink source path')
        old = path.read_bytes() if path.exists() else b''
        actual = blob(old) if path.exists() else None
        if actual == record['after']:
            continue
        if actual != record['before']:
            raise ValueError('Source diverged: '+name)
        lines = old.decode('utf-8').splitlines(keepends=True)
        previous = 0
        for start, end, replacement in record['edits']:
            if type(start) is not int or type(end) is not int or not previous <= start <= end <= len(lines):
                raise ValueError('Invalid edit range')
            if not isinstance(replacement, list) or not all(isinstance(line, str) for line in replacement):
                raise ValueError('Invalid replacement')
            previous = end
        for start, end, replacement in reversed(record['edits']):
            lines[start:end] = replacement
        result = ''.join(lines).encode('utf-8')
        if blob(result) != record['after']:
            raise ValueError('Restored source hash mismatch: '+name)
        plans.append((path, result))
    # Validate all input and output records before writing any application file.
    for path, result in plans:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(result)
    print(f'Verified {len(seen)} source records; materialized {len(plans)} files.')

if __name__ == '__main__':
    main()
