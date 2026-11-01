'use strict';
const {app,BrowserWindow,protocol,net,session,Menu,dialog,shell}=require('electron');
const fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url'),config=require('../project.json');
protocol.registerSchemesAsPrivileged([{scheme:'marco',privileges:{standard:true,secure:true,supportFetchAPI:true}}]);
if(process.env.PORTABLE_EXECUTABLE_DIR)app.setPath('userData',path.join(process.env.PORTABLE_EXECUTABLE_DIR,config.slug+'-Datos'));
if(process.env.MODERN_TEST_DATA)app.setPath('userData',process.env.MODERN_TEST_DATA);
const smoke=process.argv.includes('--smoke');
app.whenReady().then(()=>{
 const root=path.resolve(__dirname,'../dist/web');
 protocol.handle('marco',request=>{const url=new URL(request.url);let target;try{target=path.resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));}catch{return new Response('',{status:400});}if(url.host!=='app'||!target.startsWith(root+path.sep)||!['GET','HEAD'].includes(request.method))return new Response('',{status:403});return net.fetch(pathToFileURL(target).toString());});
 Menu.setApplicationMenu(null);
 const win=new BrowserWindow({width:1280,height:1000,minWidth:370,minHeight:600,title:config.name,icon:path.join(__dirname,'../assets/icon-512.png'),show:!smoke,webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true}});
 session.defaultSession.setPermissionRequestHandler((_w,_p,cb)=>cb(false));session.defaultSession.setPermissionCheckHandler(()=>false);
 function external(url){try{const u=new URL(url);if(u.protocol==='https:'&&u.hostname==='github.com'&&u.pathname.startsWith('/Peskysa'))shell.openExternal(url);}catch{}}
 win.webContents.setWindowOpenHandler(({url})=>{external(url);return{action:'deny'};});
 win.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith('marco://app/')){e.preventDefault();external(url);}});
 session.defaultSession.on('will-download',async(_e,item)=>{const result=await dialog.showSaveDialog(win,{title:'Guardar archivo',defaultPath:path.join(app.getPath('downloads'),path.basename(item.getFilename()))});if(result.canceled)item.cancel();else item.setSavePath(result.filePath);});
 win.loadURL('marco://app/');
 if(smoke)win.webContents.once('did-finish-load',async()=>{try{const report=await win.webContents.executeJavaScript('({title:document.title,ready:!!document.querySelector("main h2"),origin:location.origin})');fs.writeFileSync(process.argv[process.argv.indexOf('--smoke')+1],JSON.stringify(report));app.exit(report.ready?0:1);}catch{app.exit(1);}});
});app.on('window-all-closed',()=>app.quit());
