const screens=[...document.querySelectorAll('[data-screen]')];
const DATA=window.DEREJ_ENCUENTROS_V21;
const stepOrder=['encuentro','raiz','profundizar','practica','llevar'];
let selectedEncounter=1;
let selectedChoiceId='';
const $=id=>document.getElementById(id);

function route(name){
  screens.forEach(s=>{const on=s.dataset.screen===name;s.hidden=!on;s.classList.toggle('active',on)});
  if(name==='camino') { renderEncounter(selectedEncounter,false); activateStep('encuentro',false); }
  window.scrollTo({top:0,behavior:'instant'});
}
function activateStep(step,scroll=true){
  document.querySelectorAll('.threshold').forEach(b=>b.classList.toggle('on',b.dataset.step===step));
  document.querySelectorAll('.stepPanel').forEach(p=>p.classList.toggle('on',p.dataset.panel===step));
  document.querySelector('.threshold.on')?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  if(scroll) document.querySelector('.thresholdRail')?.scrollIntoView({behavior:'smooth',block:'start'});
  if(step==='llevar') syncCarry();
}
function splitShoresh(value=''){
  const parts=value.split('·').map(s=>s.trim());
  return {he:parts[0]||value,tr:parts.slice(1).join(' · ')};
}
function encounterByNum(num){ return DATA.encounters.find(e=>e.num===Number(num)) || DATA.encounters[0]; }
function weekForEncounter(enc){ return DATA.weeks.find(w=>w.nombre===enc.parasha); }
function memoryKey(num){ return `derej-v21-encuentro-${num}`; }
function loadMemory(num){ try{return JSON.parse(localStorage.getItem(memoryKey(num))||'null')}catch{return null} }
function saveDraft(){
  const note=$('practiceNote')?.value.trim()||'';
  const existing=loadMemory(selectedEncounter)||{};
  const data={...existing,encounter:selectedEncounter,choiceId:selectedChoiceId,note,updatedAt:new Date().toISOString()};
  try{localStorage.setItem(memoryKey(selectedEncounter),JSON.stringify(data));}catch{}
}
function renderTabs(enc){
  const names=['Bereshit','Noaj','Lej Lejá'];
  $('parashaTabs').innerHTML=names.map(name=>{
    const week=DATA.weeks.find(w=>w.nombre===name);
    const on=name===enc.parasha;
    return `<button type="button" role="tab" class="parashaTab${on?' on':''}" data-parasha="${name}" aria-selected="${on}"><span>${week?.heb||''}</span><b>${name}</b></button>`;
  }).join('');
}
function renderStrip(enc){
  const list=DATA.encounters.filter(e=>e.parasha===enc.parasha);
  $('encounterStrip').innerHTML=list.map(e=>`<button type="button" class="encounterChip${e.num===enc.num?' on':''}" data-encounter="${e.num}"><small>${e.num}</small><b>${e.aliyah.split('·')[0].trim()}</b></button>`).join('');
}
function renderRoadmap(){
  $('roadmapGrid').innerHTML=DATA.roadmap.map(r=>`<article class="roadmapCard"><small>DÍAS ${r.dias}</small><b>${r.parasha}</b><em>${r.tema}</em><p>${r.preguntaMadre}</p></article>`).join('');
}
function renderEncounter(num,scrollToChooser=true){
  saveDraft();
  const enc=encounterByNum(num); selectedEncounter=enc.num;
  const week=weekForEncounter(enc); const sh=splitShoresh(enc.shoresh);
  const saved=loadMemory(enc.num); selectedChoiceId=saved?.choiceId||'';
  $('practiceNote').value=saved?.note||'';
  $('parashaHebHero').textContent=enc.parashaHeb||week?.heb||'';
  $('selectedEncounterMeta').textContent=`ENCUENTRO ${enc.num} · ${enc.parasha.toUpperCase()} · ${enc.aliyah.toUpperCase()}`;
  $('selectedEncounterQuestion').textContent=enc.pregunta;
  $('encounterMeta').textContent=`ENCUENTRO ${enc.num} · ${enc.parasha.toUpperCase()} · ${enc.aliyah.toUpperCase()}`;
  $('encounterShoresh').textContent=enc.shoresh;
  $('encounterGlyph').textContent=sh.he||'א';
  $('encounterQuestion').textContent=enc.pregunta;
  $('choiceList').innerHTML=enc.alternativas.map(a=>`<button class="choice${a.id===selectedChoiceId?' on':''}" type="button" data-choice="${a.id}"><span class="choiceLetter">${a.id}</span><span class="choiceCopy"><b>${a.texto}</b><small><i class="midah midah${a.mida}">${a.mida}</i>${a.midahDesc}</small></span></button>`).join('');
  $('rootHe').textContent=enc.raiz.pasukHeb;
  $('rootRef').textContent=enc.raiz.pasukEsp;
  $('rootText').textContent=`Shoresh: ${enc.shoresh}`;
  $('rootSourceLabel').textContent=enc.raiz.fuente;
  $('rootQuote').textContent=enc.raiz.cita;
  $('adamTitle').textContent=enc.adamAdama.titulo;
  $('adamText').textContent=enc.adamAdama.ficha;
  $('practiceTitle').textContent=enc.practica.titulo;
  $('practiceDuration').textContent=enc.practica.duracion;
  $('practiceAction').textContent=enc.practica.accion;
  $('kavanaText').textContent=`“${enc.kavana}”`;
  renderTabs(enc); renderStrip(enc);
  if(selectedChoiceId){ revealChoice(enc,selectedChoiceId); } else { $('deeperReveal').hidden=true; $('toRoot').disabled=true; }
  $('saveStatus').textContent=''; syncCarry();
  activateStep('encuentro',false);
  if(scrollToChooser) $('encounterChooser').scrollIntoView({behavior:'smooth',block:'start'});
}
function revealChoice(enc,id){
  const a=enc.alternativas.find(x=>x.id===id); if(!a) return;
  document.querySelectorAll('.choice').forEach(c=>c.classList.toggle('on',c.dataset.choice===id));
  $('selectionEcho').textContent=a.texto;
  $('selectionMidah').textContent=`${a.mida} · ${a.midahDesc}`;
  $('deeperReveal').hidden=false; $('toRoot').disabled=false;
}
function syncCarry(){
  const enc=encounterByNum(selectedEncounter);
  const a=enc.alternativas.find(x=>x.id===selectedChoiceId);
  $('carryChoice').textContent=a?`Tu espejo: ${a.texto} — ${a.mida} · ${a.midahDesc}.`:'';
  const note=$('practiceNote').value.trim();
  $('carryNote').textContent=note?`Tu nota: “${note}”`:'';
}

document.addEventListener('click',e=>{
  const r=e.target.closest('[data-route]'); if(r){route(r.dataset.route);return;}
  const sc=e.target.closest('[data-scroll]'); if(sc){$(sc.dataset.scroll)?.scrollIntoView({behavior:'smooth',block:'start'});return;}
  const n=e.target.closest('[data-next]'); if(n){saveDraft();activateStep(n.dataset.next);return;}
  const t=e.target.closest('[data-step]'); if(t){activateStep(t.dataset.step);return;}
  const p=e.target.closest('[data-parasha]'); if(p){const first=DATA.encounters.find(x=>x.parasha===p.dataset.parasha);if(first)renderEncounter(first.num);return;}
  const chip=e.target.closest('[data-encounter]'); if(chip){renderEncounter(Number(chip.dataset.encounter));return;}
  const choice=e.target.closest('[data-choice]'); if(choice){selectedChoiceId=choice.dataset.choice; const enc=encounterByNum(selectedEncounter);revealChoice(enc,selectedChoiceId);saveDraft();return;}
  if(e.target.closest('#studyLink')){const box=$('studyPreview'),btn=$('studyLink'),open=box.hidden;box.hidden=!open;btn.setAttribute('aria-expanded',String(open));btn.querySelector('span').textContent=open?'↑':'↓';return;}
  if(e.target.closest('#roadmapToggle')){const box=$('roadmapGrid'),btn=$('roadmapToggle'),open=box.hidden;box.hidden=!open;btn.setAttribute('aria-expanded',String(open));btn.querySelector('span').textContent=open?'↑':'↓';return;}
  if(e.target.closest('#saveMemory')){
    const enc=encounterByNum(selectedEncounter); const a=enc.alternativas.find(x=>x.id===selectedChoiceId);
    const memory={encounter:enc.num,parasha:enc.parasha,choiceId:selectedChoiceId,choice:a?.texto||'',midah:a?`${a.mida} · ${a.midahDesc}`:'',note:$('practiceNote').value.trim(),kavana:enc.kavana,savedAt:new Date().toISOString()};
    try{localStorage.setItem(memoryKey(enc.num),JSON.stringify(memory));$('saveStatus').textContent='Guardado sólo en este dispositivo.';}catch{$('saveStatus').textContent='No fue posible guardar en este navegador.';}
  }
});
$('practiceNote')?.addEventListener('input',()=>{saveDraft();syncCarry()});
renderRoadmap(); renderEncounter(1,false);
