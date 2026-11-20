/* Regresión editorial de las 28 voces de Vayetzé. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'..','content','caminos-ramak-v25.json'),'utf8'));
const week=data.parashot.find(p=>p.parasha==='Vayetze');
assert(week,'Falta Vayetzé');
assert.equal(week.caminos.length,7);
const authors=['rambam','ramak','ramjal','rabiNajman'];
const voices=[];
for(const day of week.caminos){
 assert(day.dia>=1&&day.dia<=7);
 assert.deepEqual(Object.keys(day.voces).sort(),authors.slice().sort());
 for(const [author,v] of Object.entries(day.voces)){
  assert(v.fuente && v.base && v.texto && v.atribucion,day.dia+' '+author+' sin contenido completo');
  assert(v.texto.length>=190,day.dia+' '+author+' texto demasiado breve');
  assert.match(v.atribucion,/interpretación editorial de Dérej/i);
  assert.equal(v.tipo,'LECTURA DÉREJ');
  assert(!/sefaria\.org/i.test(v.url||''),'No añadir enlace no curado');
  voices.push({author,...v});
 }
}
assert.equal(voices.length,28);
assert(new Set(voices.map(v=>v.texto)).size===28,'Lecturas duplicadas');
assert(new Set(voices.map(v=>v.fuente)).size>=15,'No volver a una sola fuente para todas las voces');
console.log('PASS: Vayetzé — 7 días, 28 voces completas, diferenciadas y señaladas como lectura Dérej.');
