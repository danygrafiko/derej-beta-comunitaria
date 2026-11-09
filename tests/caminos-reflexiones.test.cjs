'use strict';
const assert=require('node:assert/strict');
const data=require('../content/caminos-ramak-v25.json');
const changes=require('../content/curaduria-llevar-v27.cjs');
const rows=data.parashot.flatMap(p=>p.caminos.map(c=>({parasha:p.parasha,...c})));
const normalize=s=>s.normalize('NFC').trim().toLocaleLowerCase('es').replace(/\s+/gu,' ');
assert.equal(rows.length,140);
assert.equal(changes.length,47);
assert.equal(new Set(changes.map(([p,d])=>p+'|'+d)).size,47);
for(const [p,d,kavana,hitbodedut] of changes){
 const c=rows.find(c=>c.parasha===p&&c.dia===d);assert(c,p+'/'+d);
 assert.equal(c.paraLlevar.kavana,kavana);assert.equal(c.paraLlevar.hitbodedut,hitbodedut);
 assert(c.revision_llevar.includes('2026-11-09'));
}
for(const field of ['reflexion','avoda','kavana','hitbodedut']){
 const texts=rows.map(c=>normalize(field==='reflexion'?c.reflexion:c.paraLlevar[field]));
 assert.equal(new Set(texts).size,140,'Contenido diario repetido: '+field);
}
for(const c of rows){
 const key=c.parasha+'/'+c.dia;
 const daily=[c.reflexion,...Object.values(c.paraLlevar)].map(normalize);
 assert.equal(new Set(daily).size,daily.length,'Repetición entre etapas: '+key);
 for(const v of Object.values(c.voces)){
  const application=normalize(v.texto);
  for(const field of ['kavana','hitbodedut'])assert(!normalize(c.paraLlevar[field]).startsWith(application),'Llevar copia Profundizar: '+key+'/'+field);
 }
}
console.log('PASS: 140 preguntas, prácticas, intenciones y conversaciones distintas; Llevar no copia las voces; 47 revisiones editoriales reproducibles.');
