"""Materialize an immutable, digest-checked source delta; reject divergent files."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import lzma

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = '7b45fc3c9bffa05374794b438de246a7f1cd7c69fe75022ed64f71d0799b6f63'

def blob(data):
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()

def main():
    data = b''.join(p.read_bytes() for p in sorted((ROOT/'.delivery').glob('production.*.xzpart')))
    if hashlib.sha256(data).hexdigest() != EXPECTED:
        raise ValueError('Source delivery SHA-256 mismatch')
    decoder = lzma.LZMADecompressor(memlimit=128*1024*1024)
    decoded = decoder.decompress(data, max_length=8*1024*1024)
    if not decoder.eof or decoder.unused_data:
        raise ValueError('Invalid or oversized source frame')
    manifest = json.loads(decoded)
    if manifest['format'] != 1:
        raise ValueError('Unsupported delta format')
    plans, seen = [], set()
    for record in manifest['records']:
        name = record['path']
        relative = PurePosixPath(name)
        if name in seen or relative.is_absolute() or '..' in relative.parts or '\\' in name:
            raise ValueError('Unsafe or duplicate path')
        if relative.parts[0] not in {'app','packages','scripts','tests','docs','README.md','CHANGELOG.md','package.json','.gitignore'}:
            raise ValueError('Disallowed source path: ' + name)
        seen.add(name)
        path = ROOT.joinpath(*relative.parts)
        if any(p.is_symlink() for p in [path, *path.parents]):
            raise ValueError('Symlink source path')
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
                raise ValueError('Invalid delta range')
            if not isinstance(replacement, list) or not all(isinstance(x, str) for x in replacement):
                raise ValueError('Invalid replacement lines')
            previous = end
        for start, end, replacement in reversed(record['edits']):
            lines[start:end] = replacement
        result = ''.join(lines).encode('utf-8')
        if blob(result) != record['after']:
            raise ValueError('Restored blob digest mismatch: ' + name)
        plans.append((path, result))
    for path, result in plans:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(result)
    print(f'Verified {len(seen)} source files; materialized {len(plans)} changes.')

if __name__ == '__main__':
    main()
