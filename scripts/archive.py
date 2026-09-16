"""Build portable archives without symlinks, caches, fixture fonts or generated recursion."""
from pathlib import Path
import zipfile, hashlib, json
root=Path(__file__).resolve().parents[1]
out=root.parent
fonts={'.ttf','.otf','.woff','.woff2','.ttc','.otc','.eot','.pfb','.pfa','.afm','.pcf','.bdf'}
def make(name,base,prefix,exclude):
    target=out/name
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for file in sorted(base.rglob('*')):
            if not file.is_file() or file.is_symlink():continue
            rel=file.relative_to(base)
            if rel.parts[0] in exclude or any(part in {'node_modules','.git','__pycache__'} for part in rel.parts) or file.suffix.lower() in fonts or file.suffix=='.map':continue
            if file.name=='failure.png' or file.name=='first.png':continue
            z.write(file,str(Path(prefix)/rel))
    return {'file':name,'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()}
records=[make('CounterformStudio-source.zip',root,'CounterformStudio',{'node_modules','.git','dist','artifacts','.types','__pycache__'}),make('CounterformStudio-web.zip',root/'dist','',set()),make('CounterformStudio-npm-packages.zip',root/'artifacts/npm','npm',set())]
(out/'CounterformStudio-checksums.json').write_text(json.dumps(records,indent=2)+'\n')
for r in records:print(r['file'],round(r['bytes']/1024/1024,2),'MiB',r['sha256'])
