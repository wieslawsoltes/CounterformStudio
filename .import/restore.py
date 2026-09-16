"""Restore the exact delivered source and SHA-256 pinned component files."""
from __future__ import annotations
import base64, concurrent.futures, hashlib, io, json, lzma, os, pathlib, tarfile, urllib.request, urllib.error, zipfile
ROOT = pathlib.Path(__file__).resolve().parents[1]
EXPECTED = 'f6ea07e7b63fcc4990f116acb1cb53869a6160a7b557b522a5c66ec1be09fcd1'
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl): return None

def download(url, token=None):
    headers = {'User-Agent':'CounterformStudio-verified-import','Accept':'application/vnd.github+json'}
    if token: headers['Authorization'] = 'Bearer ' + token
    try:
        with urllib.request.build_opener(NoRedirect).open(urllib.request.Request(url,headers=headers),timeout=90) as r:
            return r.read(180_000_001)
    except urllib.error.HTTPError as ex:
        if ex.code not in (301,302,303,307,308): raise
        location = ex.headers.get('Location','')
        if not location.startswith('https://'): raise RuntimeError('Non-HTTPS artifact redirect')
        with urllib.request.urlopen(location,timeout=90) as r: return r.read(180_000_001)

def safe_path(root,name):
    p = pathlib.PurePosixPath(name)
    if p.is_absolute() or '..' in p.parts or '\\' in name or '.git' in p.parts: raise ValueError('Unsafe source path: '+name)
    return root.joinpath(*p.parts)

def restore_vendor(entry,paths):
    repo = entry['repository'].rsplit('/',1)[-1]
    archive_dir = os.environ.get('COUNTERFORM_ARCHIVES')
    if archive_dir:
        raw = (pathlib.Path(archive_dir)/(repo+'.zip')).read_bytes()
    else:
        urls = [(f"https://api.github.com/repos/wieslawsoltes/{repo}/actions/artifacts/{entry['artifactId']}/zip",os.environ.get('GH_TOKEN')),
                (f"https://nightly.link/wieslawsoltes/{repo}/actions/artifacts/{entry['artifactId']}.zip",None)]
        raw = None
        for url,token in urls:
            try:
                candidate = download(url,token)
                if hashlib.sha256(candidate).hexdigest()!=entry['artifactArchiveSha256']: raise ValueError('Artifact digest mismatch')
                raw=candidate; break
            except Exception as ex: print(f'{repo}: artifact transport failed: {type(ex).__name__}',flush=True)
        if raw is None: raise RuntimeError('Cannot download verified artifact for '+repo)
    if hashlib.sha256(raw).hexdigest()!=entry['artifactArchiveSha256']: raise ValueError(repo+': artifact SHA-256 mismatch')
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        suffix = ('GridWeb-source.tar.gz' if repo=='GridWeb' else 'wieslawsoltes-'+('ribbon-web' if repo=='RibbonWeb' else repo.lower())+'-'+entry['version']+'.tgz')
        matches=[p for p in z.namelist() if p.endswith(suffix)]
        if len(matches)!=1: raise ValueError(repo+': ambiguous package archive')
        with tarfile.open(fileobj=io.BytesIO(z.read(matches[0]))) as t:
            records=[]
            for name in paths:
                if pathlib.Path(name).suffix.lower() in {'.ttf','.otf','.woff','.woff2','.ttc','.otc','.eot','.pfb','.pfa','.afm','.pcf','.bdf'}: raise ValueError('Font binary must not be redistributed: '+name)
                member=t.getmember(('' if repo=='GridWeb' else 'package/')+name)
                if not member.isfile() or member.size>60_000_000: raise ValueError('Invalid vendor entry: '+name)
                data=t.extractfile(member).read(); dest=safe_path(ROOT/entry['folder'],name)
                dest.parent.mkdir(parents=True,exist_ok=True); dest.write_bytes(data)
                records.append([name,hashlib.sha256(data).hexdigest()])
    print(f'{repo}: restored {len(records)} exact files from verified artifact',flush=True)
    return {'folder':entry['folder'],'files':records,'artifactSha256':entry['artifactArchiveSha256']}

def main():
    payload=b''.join(p.read_bytes() for p in sorted((ROOT/'.import').glob('source.*.xzpart')))
    if hashlib.sha256(payload).hexdigest()!=EXPECTED: raise ValueError('Delivered source digest mismatch')
    source=json.loads(lzma.decompress(payload,memlimit=256*1024*1024))
    for name,content in source.items():
        if name.startswith('.github/'): continue
        dest=safe_path(ROOT,name); dest.parent.mkdir(parents=True,exist_ok=True); dest.write_text(content,encoding='utf-8')
    print(f'Restored {len(source)} authored source records; source archive SHA-256 verified',flush=True)
    allowed=json.loads(lzma.decompress(base64.b64decode((ROOT/'.import/vendor-paths.b64').read_text()),memlimit=64*1024*1024))
    lock=json.loads((ROOT/'vendor-lock.json').read_text())
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        futures=[pool.submit(restore_vendor,e,allowed[pathlib.PurePosixPath(e['folder']).name]) for e in lock['components']]
        verified=[f.result() for f in futures]
    (ROOT/'docs/DELIVERY-INTEGRITY.json').write_text(json.dumps({'sourceSha256':EXPECTED,'components':verified},indent=2)+'\n')
    print('Delivery restoration complete: source, licenses and all ten pinned components.',flush=True)
if __name__=='__main__': main()
