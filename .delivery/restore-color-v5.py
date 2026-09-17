"""Restore the verified 0.5.0 text delta without overwriting divergent source."""
from __future__ import annotations
from pathlib import Path, PurePosixPath
import hashlib
import json
import lzma

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = '114c323c4cc61b56e4390321d0e65333d4cc4e324c3e01c0ce304055d3f1c091'
BASE = 'a24fdc3bdc0a321d6504fd4a387180b296e1104c'
ALLOWED = {'app', 'packages', 'scripts', 'tests', 'docs', 'README.md', 'CHANGELOG.md', 'package.json', '.gitignore'}


def blob(data: bytes) -> str:
    return hashlib.sha1(b'blob ' + str(len(data)).encode('ascii') + b'\0' + data).hexdigest()


def main() -> None:
    parts = sorted((ROOT / '.delivery').glob('color-v5.*.xzpart'))
    if [p.name for p in parts] != [f'color-v5.{i:02}.xzpart' for i in range(7)]:
        raise ValueError('Missing or unexpected delivery part')
    data = b''.join(p.read_bytes() for p in parts)
    if hashlib.sha256(data).hexdigest() != EXPECTED:
        raise ValueError('Delivery SHA-256 mismatch')
    decoder = lzma.LZMADecompressor(memlimit=128 * 1024 * 1024)
    decoded = decoder.decompress(data, max_length=8 * 1024 * 1024)
    if not decoder.eof or decoder.unused_data:
        raise ValueError('Truncated, oversized, or trailing source frame')
    manifest = json.loads(decoded)
    if manifest['format'] != 1 or manifest['baseCommit'] != BASE or manifest['release'] != '0.5.0':
        raise ValueError('Unexpected release manifest')
    plans, seen = [], set()
    for record in manifest['records']:
        name = record['path']
        relative = PurePosixPath(name)
        if (name in seen or relative.is_absolute() or '..' in relative.parts or '\\' in name
                or not relative.parts or relative.parts[0] not in ALLOWED or '.git' in relative.parts
                or str(relative) != name):
            raise ValueError('Unsafe or duplicate source path: ' + name)
        seen.add(name)
        path = ROOT.joinpath(*relative.parts)
        if any(p.is_symlink() for p in [path, *path.parents]):
            raise ValueError('Symlink source path: ' + name)
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
                raise ValueError('Invalid delta range: ' + name)
            if not isinstance(replacement, list) or not all(isinstance(x, str) for x in replacement):
                raise ValueError('Invalid replacement lines: ' + name)
            previous = end
        for start, end, replacement in reversed(record['edits']):
            lines[start:end] = replacement
        result = ''.join(lines).encode('utf-8')
        if blob(result) != record['after']:
            raise ValueError('Restored blob hash mismatch: ' + name)
        plans.append((path, result))
    if len(seen) != 109:
        raise ValueError('Unexpected source file count')
    # Validate every input and output before touching application files.
    for path, result in plans:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(result)
    print(f'Verified {len(seen)} text files; restored {len(plans)} changes.')


if __name__ == '__main__':
    main()
