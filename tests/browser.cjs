'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),scenario=require('./scenario.cjs'),config=require('../project.json');
const root=path.resolve(__dirname,'..'),out=path.join(root,'test-output');fs.mkdirSync(out,{recursive:true});fs.mkdirSync(path.join(root,'docs/images'),{recursive:true});
(async()=>{
 const server=cp.spawn(process.execPath,['scripts/serve.cjs'],{cwd:root,env:{...process.env,PORT:'5190'},stdio:'pipe'});
 await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(Error('Servidor terminado: '+code)));});
 let browser;const errors=[],failed=[],external=[];let checks=0;
 try{
  browser=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
  const context=await browser.newContext({viewport:{width:1360,height:1000},acceptDownloads:true}),page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url()+': '+r.status());});page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:5190/')&&!r.url().startsWith('data:'))external.push(r.url());});
  await page.goto('http://127.0.0.1:5190/');await page.waitForSelector('main h2');
  await page.screenshot({path:path.join(root,'docs/images/escritorio.png'),fullPage:true});
  checks+=await scenario(page,config.slug);
  await page.screenshot({path:path.join(root,'docs/images/funcion.png'),fullPage:true});
  // Exportación real, cuando la aplicación la ofrece.
  if(['RETO-PARA-PAREJAS','valverde','Rutas-de-Leganes-3.0','Rutas-de-Leganes-4.0'].includes(config.slug)){
   const pending=page.waitForEvent('download');await page.click('#export');const d=await pending;const target=path.join(out,d.suggestedFilename());await d.saveAs(target);assert.ok(fs.statSync(target).size>10);checks++;
  }
  // Todos los enlaces internos visibles deben resolver a un fichero existente.
  const links=await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')).filter(h=>h&&!h.startsWith('#')&&!/^[a-z]+:/i.test(h)));
  for(const link of new Set(links)){const response=await page.request.get(new URL(link,page.url()).href);assert.ok(response.ok(),link);checks++;}
  await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await context.setOffline(true);await page.reload();assert.ok(await page.locator('main').isVisible());checks++;await context.setOffline(false);
  await page.setViewportSize({width:390,height:844});checks+=await scenario(page,config.slug);await page.screenshot({path:path.join(root,'docs/images/movil.png'),fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Desbordamiento en móvil');checks++;
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(external,[]);
  fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify({slug:config.slug,checks,desktop:true,mobile:true,offline:true,pageErrors:errors,failedRequests:failed,externalRequests:external},null,2));console.log(config.slug+': '+checks+' comprobaciones de navegador correctas.');
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
