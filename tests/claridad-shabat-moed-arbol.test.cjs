'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const script=read('prelaunch-local.js');
const dataset=name=>{
  const prefix='const '+name+'=';
  const start=script.indexOf(prefix);
  assert(start>=0,'Conjunto no encontrado: '+name);
  const end=script.indexOf('];',start);
  assert(end>start,'No se localiza cierre: '+name);
  return JSON.parse(script.slice(start+prefix.length,end+1));
};
const shabat=dataset('SHABAT_DATA'),moed=dataset('MOED_DATA');
assert.equal(shabat.length,6);
assert.equal(moed.length,6);
for(const item of shabat){
 assert.equal(item.practica.dias.length,7);
 assert(item.abierta && item.profunda && item.profunda.fuentes.length>0);
}
const single=s=>((s.match(/¿/gu)||[]).length<=1)&&(s.match(/¿/gu)||[]).length===(s.match(/\?/gu)||[]).length);
for(const item of moed){
 assert(item.abierta && item.profunda && item.sources.length);
 if(item.id==='iom-kipur'){assert.equal(item.practica7.length,0);assert(item.experiences.length>=2);continue;}
 assert.equal(item.practica7.length,7);
 assert(item.practicaIntro.length>20);
 for(const day of item.practica7){
   assert(day.desc.length>18 && day.desc.length<190,item.id+'/'+day.day);
   assert(single(day.desc),'Más de una pregunta: '+item.id+'/'+day.day);
 }
}
assert(moed.find(x=>x.id==='januca-purim').abierta.includes('festividades judías diferentes'));
assert(moed.find(x=>x.id==='sucot').practica7.some(d=>d.desc.includes('No se reemplazan')));
assert(script.includes('DÉREJ · 7 IDEAS OPCIONALES'));
assert(script.includes('no sustituyen ni representan las observancias rituales judías'));
assert(script.includes('aria-pressed="\${selectedTab'));
assert(script.includes('aria-pressed="\${i===selectedDay}'));
for(const term of ['Conocer</button>','Profundizar</button>','Llevar</button>'])assert(script.includes(term),term);
const tree={window:{}};
vm.runInNewContext(read('arbol-content.js'),tree);
assert.equal(tree.window.DEREJ_ARBOL.sefirot.length,11);
assert(tree.window.DEREJ_ARBOL.sefirot.some(s=>s.id==='daat'));
assert(tree.window.DEREJ_ARBOL.sources.length>=3);
for(const s of tree.window.DEREJ_ARBOL.sefirot){assert(s.question && (s.question.match(/¿/gu)||[]).length===1 && s.refs?.length);}
const arbol=read('arbol.js'),home=read('index.html'),welcome=read('welcome.js');
assert(arbol.includes('no es una undécima sefirá'));
assert(welcome.includes('Moed</b><small>Significa «tiempo señalado»'));
assert(home.includes('aria-label="Explorar Moed, festividades y calendario judío"'));
for(const src of ['prelaunch-local.js?v=claridad-shabat-moed-20261118-1','arbol-content.js?v=claridad-arbol-20261118-1','arbol.js?v=claridad-arbol-20261118-1','welcome.js?v=claridad-navegacion-20261118-1'])assert(home.includes(src),src);
for(const file of ['prelaunch-local.js','arbol-content.js','arbol.js','welcome.js'])new vm.Script(read(file),{filename:file});
console.log('PASS: 6 Shabat, 6 Moed, 42 gestos Shabat, 35 propuestas Moed, 11 puntos gráficos y accesos claros.');
