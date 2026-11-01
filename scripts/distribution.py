"""Contrato de entrega y verificación de paquetes. AGPL-3.0-only."""
from pathlib import Path
import argparse,hashlib,json,subprocess,zipfile,tarfile,shutil,sys
ROOT=Path(__file__).resolve().parents[1]
C=json.loads((ROOT/'project.json').read_text(encoding='utf-8'))
APP=bool(C['modalities'])
SUFFIXES=['-Windows-Instalador.exe','-Portable.exe','-Web-Portable.exe','-Linux-amd64.deb','-Linux-Portable.tar.gz','-Web.zip','-Android.apk','-Documentacion.zip','-Source.zip'] if APP else ['-Web.zip','-Documentacion.zip','-Source.zip']
def check():
    for name in ['README.md','LICENSE','NOTICE','THIRD_PARTY.md','CHANGELOG.md','CONTRIBUTING.md','SECURITY.md','project.json','docs/README.md','docs/INSTALACION.md','docs/MANUAL.md','docs/DESARROLLO.md','docs/PRIVACIDAD.md','docs/CAPTURAS.md','docs/LICENCIA.md','docs/DISTRIBUCION.md']+['docs/images/'+n+'.png' for n in ['escritorio','funcion','movil']]:
        assert (ROOT/name).is_file() and (ROOT/name).stat().st_size,name
    assert C['license']=='AGPL-3.0-only'
    assert json.loads((ROOT/'package.json').read_text())['version']==C['version']
    print('Contrato y documentación correctos.')
def web():
    target=ROOT/'dist'/(C['prefix']+'-Web.zip')
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
        for p in (ROOT/'dist/web').rglob('*'):
            if p.is_file():z.write(p,p.relative_to(ROOT/'dist/web'))
    with zipfile.ZipFile(target) as z:
        assert z.testzip() is None
        for name in ['index.html','LICENSE','NOTICE','THIRD_PARTY.md','MANUAL.md','assets/icon-512.png']:assert name in z.namelist(),name
    print('ZIP web verificado.')
def desktop():
    folder=ROOT/'dist/desktop'
    if sys.platform=='win32':
        for suffix in ['-Windows-Instalador.exe','-Portable.exe','-Web-Portable.exe']:
            p=folder/(C['prefix']+suffix)
            with p.open('rb') as f:assert f.read(2)==b'MZ' and p.stat().st_size>1_000_000
    else:
        listing=subprocess.check_output(['dpkg-deb','-c',str(folder/(C['prefix']+'-Linux-amd64.deb'))],text=True)
        assert 'app.asar' in listing
        with tarfile.open(folder/(C['prefix']+'-Linux-Portable.tar.gz')) as z:assert any(n.endswith('/app.asar') for n in z.getnames())
    print('Formatos de escritorio correctos.')
def android():
    with zipfile.ZipFile(ROOT/'dist'/(C['prefix']+'-Android.apk')) as z:
        assert z.testzip() is None
        for n in ['assets/index.html','assets/LICENSE','classes.dex','AndroidManifest.xml']:assert n in z.namelist(),n
    print('Contenido APK correcto.')
def finalize(folder):
    if C['visibility']!='public':raise SystemExit('Archivo privado: no se publica ni distribuye automáticamente.')
    check();folder=Path(folder);folder.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(folder/(C['prefix']+'-Documentacion.zip'),'w',zipfile.ZIP_DEFLATED) as z:
        for p in [ROOT/n for n in ['README.md','LICENSE','NOTICE','THIRD_PARTY.md','CHANGELOG.md','CONTRIBUTING.md','SECURITY.md','project.json']]+[p for d in ['docs','assets','licenses'] for p in (ROOT/d).rglob('*') if p.is_file()]:z.write(p,p.relative_to(ROOT))
    source=folder/(C['prefix']+'-Source.zip')
    subprocess.run(['git','archive','--format=zip','--prefix='+C['slug']+'/','--output='+str(source.resolve()),'HEAD'],cwd=ROOT,check=True)
    for suffix in SUFFIXES:assert (folder/(C['prefix']+suffix)).stat().st_size>0,suffix
    sha=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    with zipfile.ZipFile(source) as z:
        assert z.comment.decode()==sha
        assert json.loads(z.read(C['slug']+'/project.json'))['version']==C['version']
        assert not any(n.endswith(('.p12','.jks','.keystore','.env')) or '/.signing/' in n for n in z.namelist())
    (folder/'SHA256SUMS.txt').write_text(''.join(hashlib.file_digest(p.open('rb'),'sha256').hexdigest()+'  '+p.name+'\n' for p in sorted(folder.iterdir()) if p.is_file() and p.name!='SHA256SUMS.txt'),encoding='utf-8')
    print('Entrega completa: '+str(len(SUFFIXES))+' paquetes y sumas SHA-256.')
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('action',choices=['check','web','desktop','android','finalize']);p.add_argument('folder',nargs='?',default='artifacts');a=p.parse_args()
    if a.action=='finalize':finalize(a.folder)
    else:globals()[a.action]()
