const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const data=require('../content/caminos-ramak-v25.json');
const reference=require('../content/aliyot-anuales-v26.json');
const changes=require('../content/curaduria-aliyot-v26.cjs');
const position=(c,v)=>Number(c)*1000+Number(v);
let count=0;
for(const p of data.parashot){
 const r=reference.parashot.find(x=>x.parasha===p.parasha);assert(r,p.parasha);
 assert.deepEqual(p.caminos.map(c=>c.dia),[1,2,3,4,5,6,7]);
 for(const c of p.caminos){
  count++;
  assert.equal(c.aliya,c.dia);assert.equal(c.aliyaRange,r.aliyot[c.dia]);
  const a=c.aliyaRange.match(/^(\S+) (\d+):(\d+)-(\d+):(\d+)$/);
  const v=c.pasuk.ref.match(/^(\S+) (\d+):(\d+)(?:[–-](\d+))?$/);
  assert(a&&v,`${p.parasha}/${c.dia}: referencia no analizable`);
  assert.equal(a[1],v[1]);
  assert(position(v[2],v[3])>=position(a[2],a[3])&&position(v[2],v[4]||v[3])<=position(a[4],a[5]),`${p.parasha}/${c.dia}: versículo fuera de aliyá`);
  for(const k of ['rambam','ramak','ramjal','rabiNajman']){assert(c.voces[k].fuente);assert(c.voces[k].tipo);assert(c.voces[k].texto);}
  for(const k of ['avoda','kavana','hitbodedut'])assert(c.paraLlevar[k]);
 }
}
assert.equal(count,140);assert.equal(data.total_caminos,count);assert.equal(changes.length,56);
for(const [p,d] of changes){const c=data.parashot.find(x=>x.parasha===p).caminos.find(x=>x.dia===d);assert(c.rootNote.includes('nuestras'));assert(/[\u05d0-\u05ea]/.test(c.pasuk.hebreo));assert.equal(c.pasuk.es_tipo,'PARÁFRASIS DÉREJ');for(const v of Object.values(c.voces)){assert(v.base&&v.url&&v.atribucion);}}
// Comprobar la selección real de la app en cada fecha del calendario y el
// rango de carga: dos funciones se ejecutan sin modificar su implementación.
const source=fs.readFileSync(path.join(root,'prelaunch-local.js'),'utf8');
const from=source.indexOf('  const CYCLE_START_LOCAL=');
const to=source.indexOf('\n  function scheduleOffset',from);
const selectStart=source.indexOf('  function selectLocalToday(){',to);
const selectEnd=source.indexOf('\n  }',selectStart)+4;
const dateCode=source.slice(from,to).replace("  const PROGRESS_KEY='derej-v23-camino-progress';",'');
for(let i=0;i<140;i++){
 const stamp=Date.UTC(2026,9,4+i,12);class FixedDate extends Date{constructor(...args){super(...(args.length?args:[stamp]));}}
 const context={RAMAK_DATA:data,Date:FixedDate,selectedDay:0,selectedParasha:'',selectedRamakStep:''};
 vm.createContext(context);vm.runInContext(dateCode+'\n'+source.slice(selectStart,selectEnd)+'\nselectLocalToday();',context);
 assert.equal(context.selectedDay,i%7+1);assert.equal(context.selectedParasha,data.parashot[Math.floor(i/7)].parasha);
}
console.log('PASS: 140 jornadas, siete días por parashá, versículos dentro de su aliyá, cuatro voces y prácticas presentes, 56 elaboraciones propias explícitas y 140 fechas seleccionadas correctamente.');
