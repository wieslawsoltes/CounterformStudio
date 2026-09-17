"""Apply a SHA-256-verified source delta, after checking every existing Git blob."""
from pathlib import Path,PurePosixPath
import hashlib,json,lzma
ROOT=Path(__file__).resolve().parents[1]
EXPECTED='09c0462999768272fc60720beddb32e49018891c78608c7ef1f3620a2c5575f5'
def blob(data):return hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
def safe_path(name):
 p=PurePosixPath(name)
 if not name or p.is_absolute() or '..' in p.parts or '\\' in name or p.parts[0] not in {'packages','tests','docs','README.md','CHANGELOG.md','package.json'}:raise ValueError('Unsafe source path: '+name)
 path=ROOT.joinpath(*p.parts)
 if any(x.is_symlink() for x in [path,*path.parents]):raise ValueError('Symlink source path')
 return path

def main():
 data=b''.join(p.read_bytes() for p in sorted((ROOT/'.delivery').glob('workspace.*.xzpart')))
 if hashlib.sha256(data).hexdigest()!=EXPECTED:raise ValueError('Delivery SHA-256 mismatch')
 decoder=lzma.LZMADecompressor(memlimit=128*1024*1024);raw=decoder.decompress(data,max_length=8*1024*1024)
 if not decoder.eof or decoder.unused_data:raise ValueError('Invalid source frame')
 manifest=json.loads(raw)
 if manifest['format']!=1:raise ValueError('Invalid manifest')
 rebased=(ROOT/'.delivery/workspace-docs-rebase.json').read_bytes()
 if hashlib.sha256(rebased).hexdigest()!='ef31c12f59b360cef239ecea4b391ed7f39e19012caec68c53c30a7e48d7ad8d':raise ValueError('Documentation rebase digest mismatch')
 overrides={r['path']:r for r in json.loads(rebased)['records']}
 if set(overrides)!={'CHANGELOG.md','docs/CAPABILITIES.md'}:raise ValueError('Unexpected rebase paths')
 plans=[];seen=set()
 for source in manifest['records']:
  r=overrides.get(source['path'],source)
  name=r['path'];path=safe_path(name)
  if name in seen:raise ValueError('Duplicate path')
  seen.add(name);old=path.read_bytes() if path.exists() else b'';actual=blob(old) if path.exists() else None
  if actual==r['after']:continue
  if actual!=r['before']:raise ValueError('Source diverged: '+name)
  if 'copyFrom' in r:result=safe_path(r['copyFrom']).read_bytes()
  else:
   lines=old.decode('utf-8').splitlines(keepends=True);previous=0
   for start,end,replacement in r['edits']:
    if type(start) is not int or type(end) is not int or not previous<=start<=end<=len(lines):raise ValueError('Invalid edit range')
    if not isinstance(replacement,list) or not all(isinstance(x,str) for x in replacement):raise ValueError('Invalid replacement')
    previous=end
   for start,end,replacement in reversed(r['edits']):lines[start:end]=replacement
   result=''.join(lines).encode('utf-8')
  if blob(result)!=r['after']:raise ValueError('Restored source hash mismatch: '+name)
  plans.append((path,result))
 # Validate the entire immutable input before writing any file.
 for path,data in plans:path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
 print(f'Verified {len(seen)} source records; applied {len(plans)} changes.')
if __name__=='__main__':main()
