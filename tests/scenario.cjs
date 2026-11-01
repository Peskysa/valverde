'use strict';
const assert=require('node:assert/strict');
module.exports=async function scenario(page,slug){
 let checks=0;
 async function includes(selector,text){assert.ok((await page.textContent(selector)).includes(text));checks++;}
 if(slug==='inicio-js'){
  await page.fill('#input_1','12,5');await page.fill('#input_3','7,5');await page.click('#calcular');await includes('#resultado','20');
  await page.selectOption('#input_2','-');await page.click('#calcular');await includes('#resultado','5');
  await page.selectOption('#input_2','/');await page.fill('#input_3','0');await page.click('#calcular');await includes('#resultado','cero');
  await page.selectOption('#input_2','*');await page.fill('#input_1','-4');await page.fill('#input_3','3');await page.click('#calcular');await includes('#resultado','-12');
 }else if(slug==='RETO-PARA-PAREJAS'){
  await page.click('#sample');assert.equal(await page.locator('#proposals li').count(),2);checks++;
  await page.fill('#proposal-name','<img src=x onerror=alert(1)>');await page.check('#agreed');await page.click('#proposal button');assert.equal(await page.locator('#proposals li').count(),3);assert.equal(await page.locator('#proposals img').count(),0);checks+=2;
  await page.click('#clear');assert.equal(await page.locator('#proposals li').count(),0);checks++;await page.click('#sample');
 }else if(slug.startsWith('Rutas-')){
  await page.click('#plan');assert.equal(await page.locator('#result li').count(),6);assert.equal(await page.locator('#result h3').count(),2);checks+=2;
  await page.fill('#points','nombre,lat,lon\n<img src=x>,40,-3\nB,41,-4');await page.fill('#route-count','1');await page.click('#plan');assert.equal(await page.locator('#result img').count(),0);await includes('#result','<img src=x>');
  await page.fill('#points','lat,lon\nNaN,0');await page.click('#plan');await includes('#status','no válidas');assert.equal(await page.locator('#result li').count(),0);checks++;
  await page.click('#sample');await page.fill('#route-count','2');await page.click('#plan');
 }else if(slug==='valverde'){
  await page.click('#analyze');await includes('#summary','780');assert.equal(await page.locator('#rows tr').count(),7);checks++;
  await page.fill('#series','date,unidad\n2026-01-02,4\n2026-01-01,3\n2026-01-01,2');await page.click('#analyze');await includes('#summary','9 unidades');assert.equal(await page.locator('#rows tr').first().textContent(),'2026-01-015');checks++;
  await page.fill('#series','date,unidad\n2026-02-30,4');await page.click('#analyze');await includes('#status','Fecha no válida');
  await page.fill('#series','date,unidad\n2026-01-01,100\n2026-01-02,120\n2026-01-03,80');await page.click('#analyze');
 }else if(slug==='web'){
  await page.getByText('Todos los temas',{exact:true}).click();await page.getByRole('link',{name:'Redes 2',exact:false}).click();await includes('main','DNS');await page.getByRole('link',{name:'Inicio',exact:true}).first().click();
 }else if(slug==='tuto_api_flask'){await includes('main','/api/sumar');}
 else if(slug==='tuto1'){await includes('main','venv');}
 else if(slug==='Peskysa'){assert.equal(await page.locator('article').count(),7);checks++;}
 else if(slug==='Guia_Pesca'){await includes('main','Archivo privado');}
 return checks;
};
