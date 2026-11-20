/* Regresión editorial de las voces de Vayishlaj. Ejecutar con node tests/voces-vayishlaj-editorial.test.cjs */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const data=JSON.parse(fs.readFileSync(path.join(__dirname,'..','content','caminos-ramak-v25.json'),'utf8'));
const week=data.parashot.find(p=>p.parasha==='Vayishlaj');
assert(week,'Falta Vayishlaj');
assert.equal(week.caminos.length,7);
const authors=['rambam','ramak','ramjal','rabiNajman'];
let voices=[];
for(const day of week.caminos){
 assert.equal(new Set(Object.keys(day.voces)).size,4,'Cuatro voces por jornada');
 assert.deepEqual(Object.keys(day.voces).sort(),authors.slice().sort());
 for(const [author,v] of Object.entries(day.voces)){
  assert(v.fuente&&v.base&&v.texto&&v.atribucion,day.dia+' '+author+' sin contenido completo');
  assert(v.texto.length>=210,day.dia+' '+author+' lectura telegráfica');
  assert.match(v.atribucion,/interpretación editorial de Dérej/i,day.dia+' '+author+' atribución confusa');
  assert.equal(v.tipo,'LECTURA DÉREJ');
  assert(!/sefaria\.org/i.test(v.url||''),'Sin URL de lectura no curada');
  voices.push({author,...v});
 }
}
assert.equal(voices.length,28);
assert.equal(new Set(voices.map(v=>v.texto)).size,28,'Lecturas literalmente repetidas');
for(const author of authors)assert(new Set(voices.filter(v=>v.author===author).map(v=>v.fuente)).size>=3,'La voz debe estudiar más de dos fuentes distintas: '+author);
const dina=week.caminos.find(c=>c.dia===5);
assert.match(dina.titulo,/DINA/i);
for(const voice of Object.values(dina.voces))assert.match(voice.texto,/Diná|agresi[oó]n|violencia|persona herida/i,'Lectura de Diná debe respetar contexto');
const rajel=week.caminos.find(c=>c.dia===6);
assert.match(rajel.pasuk.ref,/35:19/);
for(const voice of Object.values(rajel.voces))assert.match(voice.texto,/duelo|p[eé]rdida|ausencia|muerte|dolor|Rajel|sepultura/i);
console.log('PASS: Vayishlaj — 7 días, 28 voces; diferenciación y criterios de cuidado verificados.');
