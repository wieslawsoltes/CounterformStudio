"""Restore exact contextual-compiler source; reject any diverged input."""
from pathlib import Path, PurePosixPath
import hashlib, json, lzma
ROOT = Path(__file__).resolve().parents[1]
EXPECTED = '2ac92be0866e62e890e0da2ea65f7aadd34dc06ad103a69215f7cd113f745c45'
def blob(data):
    return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
def main():
    data=b''.join(p.read_bytes() for p in sorted((ROOT/'.delivery').glob('contextual.*.xzpart')))
    if hashlib.sha256(data).hexdigest()!=EXPECTED: raise ValueError('Delivery digest mismatch')
    decoder=lzma.LZMADecompressor(memlimit=128*1024*1024)
    decoded=decoder.decompress(data,max_length=8*1024*1024)
    if not decoder.eof or decoder.unused_data: raise ValueError('Invalid source frame')
    manifest=json.loads(decoded)
    if manifest['format']!=1: raise ValueError('Unsupported source format')
    plans=[];seen=set()
    for record in manifest['records']:
        name=record['path'];relative=PurePosixPath(name)
        if name in seen or relative.is_absolute() or '..' in relative.parts or '\\' in name: raise ValueError('Unsafe path')
        if relative.parts[0] not in {'app','packages','scripts','tests','docs','README.md','CHANGELOG.md','package.json','.gitignore'}: raise ValueError('Disallowed path')
        seen.add(name);path=ROOT.joinpath(*relative.parts)
        if any(p.is_symlink() for p in [path,*path.parents]): raise ValueError('Symlink path')
        old=path.read_bytes() if path.exists() else b'';actual=blob(old) if path.exists() else None
        if actual==record['after']: continue
        if actual!=record['before']: raise ValueError('Source diverged: '+name)
        lines=old.decode('utf-8').splitlines(keepends=True);previous=0
        for start,end,replacement in record['edits']:
            if type(start) is not int or type(end) is not int or not previous<=start<=end<=len(lines): raise ValueError('Invalid delta')
            if not isinstance(replacement,list) or not all(isinstance(x,str) for x in replacement): raise ValueError('Invalid lines')
            previous=end
        for start,end,replacement in reversed(record['edits']): lines[start:end]=replacement
        result=''.join(lines).encode('utf-8')
        if blob(result)!=record['after']: raise ValueError('Restored hash mismatch: '+name)
        plans.append((path,result))
    for path,result in plans:
        path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(result)
    print(f'Verified {len(seen)} records; restored {len(plans)} files.')
if __name__=='__main__': main()
