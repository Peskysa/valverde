"""Conserva los avisos del Python y Tcl/Tk utilizados por el portable."""
from pathlib import Path
import importlib.util,importlib.metadata,shutil,sys
root=Path(__file__).resolve().parents[1]
out=root/'licenses/runtime';out.mkdir(parents=True,exist_ok=True)
base=Path(sys.base_prefix)
for name in ['LICENSE.txt','LICENSE']:
    p=base/name
    if p.is_file():shutil.copy2(p,out/('Python-'+name))
for p in (base/'tcl').rglob('*'):
    if p.is_file() and ('license' in p.name.lower() or 'copyright' in p.name.lower()):
        dest=out/'tcl'/p.relative_to(base/'tcl');dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
spec=importlib.util.find_spec('PyInstaller')
if spec:
    folder=Path(spec.origin).parent
    for p in folder.rglob('*'):
        if p.is_file() and p.name.lower() in ['copying.txt','license.txt','copying','license']:
            dest=out/'PyInstaller'/p.relative_to(folder);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
dist=importlib.metadata.distribution('pyinstaller')
for entry in dist.files or []:
    if any(word in str(entry).lower() for word in ['license','copying','copyright']):
        p=Path(dist.locate_file(entry))
        if p.is_file():
            dest=out/'PyInstaller'/Path(str(entry));dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
assert any(out.glob('Python-*')),'Falta la licencia de Python'
assert any((out/'PyInstaller').rglob('*')),'Falta la licencia de PyInstaller'
print('Avisos de Python, Tcl/Tk y PyInstaller recopilados.')
