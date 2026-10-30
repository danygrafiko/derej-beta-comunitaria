/* Dérej · Tehilim · Atlas contemplativo del cuerpo v2.0
   No persiste datos de salud ni ofrece recomendaciones clínicas. */
(()=>{
'use strict';
const root=document.getElementById('tehilimExplorer');
const panel=document.getElementById('thAtlas');
if(!root||!panel)return;
const $=id=>panel.querySelector('#'+id);
const el=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;return n;};
const safeLink=(text,url)=>{const a=el('a',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;};
let data=null,regionId='rodillas',timeId='libre',minutes=10,clock='',day=1,checked=new Set();
function selectedRegion(){return data.regions.find(x=>x.id===regionId)||data.regions[0];}
function selectedTime(){return data.times.find(x=>x.id===timeId)||data.times[0];}
function render(){
 if(!data)return;
 const r=selectedRegion(),t=selectedTime();
 $('thAtlasRegion').value=regionId;$('thAtlasTime').value=timeId;$('thAtlasDuration').value=String(minutes);
 panel.querySelectorAll('[data-th-region]').forEach(b=>{const active=b.dataset.thRegion===regionId;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 $('thAtlasTheme').textContent=r.symbol;
 $('thAtlasAnchor').textContent=r.anchor;
 $('thAtlasPassage').textContent=r.passage;
 $('thAtlasSourceNote').textContent=r.sourceNote;
 $('thAtlasTimeNote').textContent=t.note;
 $('thAtlasMethod').replaceChildren();
 for(const m of data.method){const d=el('div',undefined,'thAtlasMethodItem');d.append(el('h4',m.title),el('p',m.body));$('thAtlasMethod').append(d);}
 const ps=$('thAtlasPsalms');ps.replaceChildren();
 for(const n of r.psalms){
   const card=el('article',undefined,'thAtlasPsalmCard');
   card.append(el('strong','Salmo '+n));
   const b=el('button','Explorar en Dérej →');b.type='button';b.addEventListener('click',()=>window.DerejTehilimOpenPsalm?.(n));
   const a=safeLink('Leer texto bíblico ↗','https://www.sefaria.org/Psalms.'+n);
   card.append(b,a);
   ps.append(card);
 }
 const q=$('thAtlasQuestions');q.replaceChildren(...r.questions.map(x=>el('li',x)));
 $('thAtlasAction').textContent=r.action;
 const guide=$('thAtlasGuide');guide.replaceChildren();
 const steps=data.durations.find(x=>x.minutes===minutes)?.steps||[];
 guide.append(el('h4','Tu lectura de '+minutes+' minutos · '+t.name+(clock?' · '+clock:'')));
 const ul=el('ol');for(const s of steps)ul.append(el('li',s));guide.append(ul);
 guide.append(el('p','Este horario es una sugerencia de organización personal, no una indicación tradicional de sanación.','thAtlasFine'));
 const plan=$('thAtlasPlan');plan.replaceChildren();
 for(let i=1;i<=7;i++){
   const psalm=r.psalms[(i-1)%r.psalms.length];
   const label=el('label',undefined,'thAtlasDay'+(day===i?' selected':''));
   const radio=document.createElement('input');radio.type='radio';radio.name='thAtlasDay';radio.value=String(i);radio.checked=day===i;radio.addEventListener('change',()=>{day=i;render();});
   label.append(radio,el('span','Día '+i),el('small','Salmo '+psalm));plan.append(label);
 }
 $('thAtlasDayTitle').textContent='Día '+day+' · Salmo '+r.psalms[(day-1)%r.psalms.length];
 $('thAtlasDayTask').textContent=data.sevenDaySequence[day-1];
 const check=$('thAtlasDone');check.checked=checked.has(day);
 $('thAtlasProgress').textContent=checked.size+' de 7 días marcados en esta sesión';
 const source=$('thAtlasSources');source.replaceChildren();
 for(const s of data.traditionalSources){if(!s.url.startsWith('https://www.sefaria.org/'))continue;const li=el('li');li.append(safeLink(s.label,s.url));source.append(li);}
}
async function open(){
 panel.querySelector('#thAtlasLoad').textContent='Cargando atlas…';
 try{
  if(!data){const res=await fetch('content/tehilim/atlas-corporal.json',{cache:'no-store'});if(!res.ok)throw Error('Atlas no disponible');data=await res.json();if(!Array.isArray(data.regions)||data.regions.length<10)throw Error('Atlas incompleto');
   const select=$('thAtlasRegion');select.replaceChildren(...data.regions.map(x=>{const o=document.createElement('option');o.value=x.id;o.textContent=x.name;return o;}));
   const times=$('thAtlasTime');times.replaceChildren(...data.times.map(x=>{const o=document.createElement('option');o.value=x.id;o.textContent=x.name;return o;}));
   $('thAtlasIntro').textContent=data.intro;
   $('thAtlasSafety').textContent=data.medical;
   $('thAtlasTimesEditorial').textContent=data.timesEditorial;
  }
  $('thAtlasLoad').hidden=true;
  $('thAtlasContent').hidden=false;
  render();
 }catch(e){$('thAtlasLoad').textContent='No se pudo cargar el atlas. Cierra y vuelve a abrir la colección para reintentar.';}
}
$('thAtlasRegion').addEventListener('change',e=>{regionId=e.target.value;day=1;checked.clear();render();});
panel.querySelectorAll('[data-th-region]').forEach(b=>b.addEventListener('click',()=>{regionId=b.dataset.thRegion;day=1;checked.clear();render();}));
$('thAtlasTime').addEventListener('change',e=>{timeId=e.target.value;render();});
$('thAtlasDuration').addEventListener('change',e=>{minutes=Number(e.target.value);render();});
$('thAtlasClock').addEventListener('change',e=>{clock=e.target.value;render();});
$('thAtlasDone').addEventListener('change',e=>{if(e.target.checked)checked.add(day);else checked.delete(day);render();});
$('thAtlasClear').addEventListener('click',()=>{checked.clear();day=1;render();});
window.DerejTehilimAtlas={open};
})();