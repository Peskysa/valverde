'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),c=require('../project.json');
const core=fs.existsSync(path.join(__dirname,'../public/core.js'))?require('../public/core.js'):null;
if(c.slug==='inicio-js'){
 test('Operaciones numéricas, negativos y coma decimal',()=>{assert.equal(core.calculate('2','+','3'),5);assert.equal(core.calculate('2','-','3'),-1);assert.equal(core.calculate('-4','*','3'),-12);assert.equal(core.calculate('1,5','/','0,5'),3);});
 test('Rechaza texto, vacío, cero y operadores ajenos',()=>{for(const a of ['',' ','x','NaN','Infinity','0x10'])assert.throws(()=>core.calculate(a,'+','1'));assert.throws(()=>core.calculate(1,'/',0));assert.throws(()=>core.calculate(1,'eval',2));});
}else if(c.slug==='RETO-PARA-PAREJAS'){
 test('Valoraciones válidas y orden por interés mínimo',()=>{const a=core.validate('Paseo',80,90,true),b=core.validate('Receta',90,60,true);assert.equal(a.score,80);assert.equal(core.rank([b,a])[0].name,'Paseo');});
 test('Rechaza rangos y falta de acuerdo',()=>{for(const v of [0,101,1.5,'nan',true])assert.throws(()=>core.validate('Paseo',v,80,true));assert.throws(()=>core.validate('Paseo',60,80,false));assert.throws(()=>core.validate('',60,80,true));});
}else if(c.slug.startsWith('Rutas-')){
 test('Reparto conserva cada parada una sola vez',()=>{const points=core.parse('nombre,lat,lon\nA,40,-3\nB,41,-4\nC,42,-5');const routes=core.plan(points,2);assert.deepEqual(routes.map(r=>r.stops.length),[2,1]);assert.deepEqual(routes.flatMap(r=>r.stops.map(p=>p.id)).sort(),[0,1,2]);assert.ok(routes[0].km>0);assert.equal(core.distance(points[0],points[0]),0);});
 test('Valida filas, rangos y rutas',()=>{for(const text of ['lat,lon\nNaN,1','lat,lon\n91,0','lat,lon\n,0','a,b\n1,2','lat,lon\n"40,2'])assert.throws(()=>core.parse(text));for(const n of [0,9,2.5])assert.throws(()=>core.plan(core.parse('lat,lon\n40,-3'),n));});
 test('CSV con comillas y exportación sin fórmulas ejecutables',()=>{const p=core.parse('nombre;lat;lon\n"A;B";40,2;-3,5');assert.equal(p[0].lat,40.2);assert.equal(p[0].name,'A;B');const csv=core.exportCSV([{stops:[{name:'=SUM(1)',lat:0,lon:0}]}]);assert.ok(csv.includes("'=SUM(1)"));});
}else if(c.slug==='valverde'){
 test('Agrupa fechas repetidas y ordena cronológicamente',()=>{const r=core.aggregate('date,unidad\n2026-01-02,4\n2026-01-01,3\n2026-01-01,2');assert.deepEqual(r,[{date:'2026-01-01',unidad:5},{date:'2026-01-02',unidad:4}]);assert.equal(core.summary(r).total,9);});
 test('Rechaza fechas irreales y unidades inválidas',()=>{for(const text of ['date,unidad\n2026-02-30,1','date,unidad\n2026-01-01,-1','date,unidad\n2026-01-01,','date,unidad\n2026-01-01,NaN'])assert.throws(()=>core.aggregate(text));});
}else test('Entrada con contenido propio y documentación',()=>{const file=path.join(__dirname,'..',c.entry);const html=fs.readFileSync(file,'utf8');assert.ok(html.includes(c.name));assert.ok(html.includes('lang="es"'));assert.ok(!html.includes('Lorem ipsum'));});
test('Documentación y autoría completas',()=>{for(const p of ['LICENSE','NOTICE','THIRD_PARTY.md','CHANGELOG.md','CONTRIBUTING.md','SECURITY.md','docs/MANUAL.md','docs/INSTALACION.md','docs/DESARROLLO.md','docs/PRIVACIDAD.md','docs/DISTRIBUCION.md'])assert.ok(fs.statSync(path.join(__dirname,'..',p)).size>20,p);assert.equal(c.author,'Marco Pescador');assert.equal(c.license,'AGPL-3.0-only');});
