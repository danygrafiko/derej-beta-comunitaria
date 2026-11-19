'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'..');
const camino=require(path.join(base,'content/caminos-ramak-v25.json'));
const encuentros=require(path.join(base,'content/encuentros-v21.json'));
const rows=camino.parashot.flatMap(p=>p.caminos.map(c=>({parasha:p.parasha,...c})));
const norm=s=>s.normalize('NFC').toLocaleLowerCase('es').replace(/[\s¿?.,;:]/gu,'');
const once=q=>(q.match(/¿/gu)||[]).length===1&&(q.match(/\?/gu)||[]).length===1;
assert.equal(camino.parashot.length,20);
assert.equal(rows.length,140);
assert.equal(new Set(rows.map(r=>norm(r.reflexion))).size,140);
for(const row of rows){
 assert(once(row.reflexion),row.parasha+'/'+row.dia+' debe tener una pregunta');
 assert(row.reflexion.length<=120,row.parasha+'/'+row.dia+' es demasiado larga');
 assert(row.pasuk?.ref,'Falta referencia bíblica: '+row.parasha+'/'+row.dia);
 assert(Object.keys(row.voces||{}).length>=4,'Faltan voces: '+row.parasha+'/'+row.dia);
 const h=row.paraLlevar?.hitbodedut||'';
 assert(!/[¿?]/u.test(h),'Hitbodedut no debe ser cuestionario: '+row.parasha+'/'+row.dia);
}
assert.equal(encuentros.encounters.length,21);
assert.equal(encuentros.weeks.length,12);
assert.equal(encuentros.roadmap.length,10);
for(const e of encuentros.encounters){
 assert(once(e.pregunta),'Pregunta confusa en encuentro '+e.num);
 assert(e.pregunta.length<=120);
 assert.equal(e.alternativas.length,4);
 for(const alt of e.alternativas){
  assert(alt.texto.length<=110);
  assert(alt.texto.trim().length>12);
 }
 assert(e.raiz?.pasukHeb&&e.practica?.accion&&e.kavana);
}
for(const q of [...encuentros.weeks.map(w=>w.pregunta),...encuentros.roadmap.map(w=>w.preguntaMadre)])assert(once(q));
const js=fs.readFileSync(path.join(base,'encuentros-v21.js'),'utf8');
const vm=require('node:vm');
const sandbox={window:{}};vm.runInNewContext(js,sandbox);
assert.equal(JSON.stringify(sandbox.window.DEREJ_ENCUENTROS_V21),JSON.stringify(encuentros));
const pre=fs.readFileSync(path.join(base,'prelaunch-local.js'),'utf8');
assert(pre.includes('PARA REFLEXIONAR HOY'));
assert(pre.includes('Conocer el pasaje'));
assert(pre.includes('Este es el pasaje que inspira la reflexión de hoy.'));
console.log('PASS: 140 Caminos, 21 Encuentros, 84 alternativas, fuentes y UX de reflexión claras.');
