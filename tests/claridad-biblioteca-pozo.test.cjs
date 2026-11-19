'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const load=(file,key)=>{const box={window:{}};vm.runInNewContext(read(file),box);return JSON.parse(JSON.stringify(box.window[key]));};
const single=q=>typeof q==='string'&&(q.match(/¿/gu)||[]).length===1&&(q.match(/\?/gu)||[]).length===1;
const names=load('nombres-content.js','DEREJ_NOMBRES');
assert.equal(names.sessions.length,7);
for(const item of names.sessions){assert(single(item.questions),item.title);assert(item.questions.length<=100,item.title);assert(item.action&&item.prayer);}
const autoestima=load('autoestima-content.js','DEREJ_AUTOESTIMA');
assert.equal(autoestima.chapters.length,19);
for(const chapter of autoestima.chapters)for(const block of chapter.blocks)if(typeof block.text==='string'&&block.type!=='link'){
 assert((block.text.match(/¿/gu)||[]).length<=1,'Preguntas encadenadas: Autoestima '+chapter.id);
}
const med=load('meditacion-content.js','DEREJ_MEDITACION');
const meditations=med.chapters.filter(c=>/^\d+$/.test(c.id));
assert.equal(meditations.length,10);
for(const chapter of meditations){
 const reflections=chapter.blocks.filter(b=>b.title==='Para reflexionar');
 assert.equal(reflections.length,1,chapter.id);
 assert(single(reflections[0].text),chapter.id);
 assert(reflections[0].text.length<=110,chapter.id);
 assert(chapter.blocks.some(b=>b.title==='Fundamento tradicional'||b.title==='La corriente de Abulafia'));
 assert(chapter.blocks.some(b=>b.title==='Alcance'));
}
const atlas=JSON.parse(read('content/tehilim/atlas-corporal.json'));
assert.equal(atlas.regions.length,13);
for(const r of atlas.regions){assert.equal(r.questions.length,2,r.name);r.questions.forEach(q=>assert(single(q),r.name));assert(r.sourceNote&&r.curaduria);}
assert(atlas.medical,'No se debe omitir el contexto clínico y simbólico');
const pozo=read('pozo-learning.js');
assert(pozo.includes('¿qué detalle te ayuda a distinguirlas?'));
assert(pozo.includes('¿qué fue lo que más te gustó descubrir?'));
assert(!pozo.includes('¿Qué fue claro y en qué momento necesitaste ayuda?'));
const primero=read('primeros-pasos.js');
assert(!primero.includes('¿Qué apareció al dejar un momento de hacer? ¿Quién más necesita descanso?'));
const midrash=read('midrash-es.js'),voces=read('voces.js'),lector=read('nombres.js');
assert(midrash.includes('Para comprender el Midrash: ')&&midrash.includes('Para tu vida: '));
assert(voces.includes('Comprender la enseñanza')&&voces.includes('Llevarla a tu vida'));
assert(lector.includes('Una pregunta para conversar'));
const index=read('index.html');
for(const src of ['nombres-content.js','nombres.js','pozo-learning.js','autoestima-content.js','meditacion-content.js','tehilim-atlas.js','midrash-es.js','voces.js','primeros-pasos.js'])assert(index.includes(src+'?v=claridad-biblioteca-20261118-2'),src);
console.log('PASS · Biblioteca y Pozo: 7 sesiones, 19 capítulos, 10 meditaciones, 13 regiones, preguntas diferenciadas y fuentes preservadas.');
