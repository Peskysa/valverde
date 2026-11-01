/* SPDX-License-Identifier: AGPL-3.0-only */
'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),config=require('../project.json'),out=path.join(root,'dist/web');
fs.mkdirSync(out,{recursive:true});
if(config.slug==='web'){
 for(const name of fs.readdirSync(root))if(name.endsWith('.html')||name==='styles.css')fs.copyFileSync(path.join(root,name),path.join(out,name));
}else fs.cpSync(path.join(root,'public'),out,{recursive:true});
fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
for(const name of ['LICENSE','NOTICE','THIRD_PARTY.md'])fs.copyFileSync(path.join(root,name),path.join(out,name));
if(fs.existsSync(path.join(root,'licenses')))fs.cpSync(path.join(root,'licenses'),path.join(out,'licenses'),{recursive:true});
fs.copyFileSync(path.join(root,'docs/MANUAL.md'),path.join(out,'MANUAL.md'));
let commit='local';try{commit=cp.execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();}catch{}
const cache=config.slug+'-'+config.version+'-'+commit.slice(0,12);
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.relative(out,path.join(dir,e.name)).replaceAll('\\','/')]);}
const files=['./',...walk(out).filter(n=>!['sw.js','Source.zip','register.js'].includes(n))];
fs.writeFileSync(path.join(out,'sw.js'),`const CACHE=${JSON.stringify(cache)},PREFIX=${JSON.stringify(config.slug+'-')};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(${JSON.stringify(files)})).then(()=>self.skipWaiting())));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});`);
for(const name of fs.readdirSync(out).filter(n=>n.endsWith('.html'))){const p=path.join(out,name);let html=fs.readFileSync(p,'utf8');if(!html.includes('register.js'))html=html.replace('</body>','<script src="register.js" defer></script></body>');fs.writeFileSync(p,html);}
fs.writeFileSync(path.join(out,'register.js'),`if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('sw.js').catch(()=>{});`);
// register.js must be cached for offline reload, too.
const sw=path.join(out,'sw.js');fs.writeFileSync(sw,fs.readFileSync(sw,'utf8').replace('c.addAll([','c.addAll(["register.js",'));
if(fs.existsSync(path.join(root,'.git')))cp.execFileSync('git',['archive','--format=zip','--prefix='+config.slug+'/','--output=dist/web/Source.zip','HEAD'],{cwd:root});
console.log('Web preparada: '+config.name+' '+config.version);
