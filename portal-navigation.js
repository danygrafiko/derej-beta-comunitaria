/* Navegación del portal: pantalla, enlace compartible e historial del navegador.
   Los estados de historial contienen referencias de lectura; nunca notas privadas. */
(()=>{
 'use strict';
 const screenList=[...document.querySelectorAll('.screen[data-screen]')];
 const exists=name=>screenList.some(el=>el.dataset.screen===name);
 const active=()=>screenList.find(el=>!el.hidden)?.dataset.screen||'home';
 const steps=['encuentro','raiz','profundizar','practica','llevar'];
 const originalRoute=route;
 let restoring=false,pending=null,syncQueued=false,lastStudyPoint=null;
 let legacyPending=new URLSearchParams(location.search).has('estudio')&&active()==='home';
 const status=document.createElement('p');status.id='portalRouteStatus';status.hidden=true;status.setAttribute('role','status');
 document.querySelector('.brandBar')?.after(status);
 function notice(text=''){status.textContent=text;status.hidden=!text;}
 function study(){
  if(typeof RAMAK_DATA==='undefined'||!RAMAK_DATA)return null;
  const p=RAMAK_DATA.parashot.find(p=>p.parasha===selectedParasha),day=Number(selectedDay);
  if(!p?.caminos.some(c=>Number(c.dia)===day))return null;
  return {parasha:p.parasha,day,step:steps.includes(selectedRamakStep)?selectedRamakStep:'encuentro'};
 }
 function validStudy(value){
  return value&&typeof RAMAK_DATA!=='undefined'&&RAMAK_DATA?.parashot.some(p=>p.parasha===value.parasha&&p.caminos.some(c=>Number(c.dia)===value.day))&&steps.includes(value.step);
 }
 function capture(name=active()){
  return {version:1,name,y:Math.max(0,window.scrollY||0),study:name==='camino'?study():null};
 }
 function remember(value){
  if(!value)return;
  try{localStorage.setItem('derej-welcome-resume-v1',JSON.stringify({...value,updatedAt:new Date().toISOString()}));}catch{}
 }
 function targetURL(name,selection){
  const url=new URL(location.href),q=url.searchParams;
  const legacy=q.get('estudio');
  const compatible=legacy===name;
  if(!compatible){q.delete('estudio');q.delete('persona');q.delete('sefira');}
  q.delete('conexion');q.delete('recordatorio');
  if(name==='home')q.delete('puerta');else q.set('puerta',name);
  if(name==='camino'&&selection){q.set('parasha',selection.parasha);q.set('dia',selection.day);q.set('etapa',selection.step);}
  else{q.delete('parasha');q.delete('dia');q.delete('etapa');}
  // Anclas de una lectura anterior no pertenecen a otra pantalla.
  if(name!==active())url.hash='';
  return url;
 }
 function saveCurrent(){
  if(typeof document==='undefined'||!document.defaultView)return;
  if(restoring||pending||(legacyPending&&active()==='home'))return;
  const point=capture();
  const next={...(history.state||{}),derejPortal:point};
  const url=targetURL(point.name,point.study);
  if(JSON.stringify(history.state?.derejPortal)!==JSON.stringify(point)||url.href!==location.href)history.replaceState(next,'',url);
  if(point.name==='camino')remember(point.study);
 }
 function signal(name){document.dispatchEvent(new CustomEvent('derej-route-change',{detail:{name}}));}
 function focus(name){const heading=document.querySelector(`[data-screen="${name}"] h1,[data-screen="${name}"] h2`);if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
 function expose(name){screenList.forEach(el=>{const on=el.dataset.screen===name;el.hidden=!on;el.classList.toggle('active',on);});}
 function closeOverlays(){
  document.querySelectorAll('dialog[open]').forEach(d=>{if(d.id!=='derejWelcome')d.close();});
  for(const id of ['ramakProgressModal','derejFeedbackModal','derejGlossSheet','ramakGlossSheet','ramakGlossBackdrop']){const el=document.getElementById(id);if(el)el.hidden=true;}
  document.body.style.overflow='';
 }
 function show(point,{preserveDOM=false,focusHeading=true}={}){
  const name=exists(point.name)?point.name:'home';
  closeOverlays();
  const currentStudy=study();
  expose(name);
  if(name==='camino'&&point.study&&validStudy(point.study)){
   const value=point.study;
   if(!preserveDOM||currentStudy?.parasha!==value.parasha||currentStudy?.day!==value.day){
    if(typeof saveRamakDraft==='function')saveRamakDraft();
    selectedParasha=value.parasha;selectedDay=value.day;selectedRamakStep=value.step;renderRamak(false);
   }
   activateRamakStep(value.step,false);remember(value);
  }
  signal(name);if(focusHeading)focus(name);window.scrollTo({top:point.y||0,behavior:'instant'});
 }
 route=function(name,...args){
  if(restoring)return originalRoute.call(this,name,...args);
  if(legacyPending&&name==='home')return originalRoute.call(this,name,...args);
  const openingLegacy=legacyPending&&name!=='home';
  const previous=active();saveCurrent();
  if(previous==='camino')lastStudyPoint=capture('camino');
  if(openingLegacy)legacyPending=false;
  const valid=exists(name);name=valid?name:'home';
  notice(valid?'':'Ese espacio no está disponible. Puedes elegir una puerta del patio.');
  if(previous==='personal'&&name==='camino'&&lastStudyPoint){
   restoring=true;try{show(lastStudyPoint,{preserveDOM:true});}finally{restoring=false;}
   history.replaceState({...(history.state||{}),derejPortal:capture('camino')},'',targetURL('camino',study()));
   return;
  }
  if(name==='camino'&&typeof RAMAK_DATA!=='undefined'&&!RAMAK_DATA)pending={name,y:0,study:null,today:true};
  const result=originalRoute.call(this,name,...args);
  const point=capture(name),url=targetURL(name,point.study);
  if(previous!==name)url.hash='';
  if(previous!==name&&!openingLegacy)history.pushState({derejPortal:point},'',url);else history.replaceState({...(history.state||{}),derejPortal:point},'',url);
  signal(name);focus(name);return result;
 };
 function syncSoon(){
  if(syncQueued||restoring)return;syncQueued=true;
  queueMicrotask(()=>{syncQueued=false;if(pending)applyPending();else saveCurrent();});
 }
 const previousRender=renderRamak;
 renderRamak=function(...args){const result=previousRender.apply(this,args);syncSoon();return result;};
 const previousStep=activateRamakStep;
 activateRamakStep=function(...args){const result=previousStep.apply(this,args);syncSoon();return result;};
 window.DEREJ_NAVIGATION={
  restore(name){
   saveCurrent();const point={...capture(name),name};
   if(name==='camino')point.study=study();
   restoring=true;try{show(point,{preserveDOM:true,focusHeading:false});}finally{restoring=false;}
   const url=targetURL(name,point.study);url.hash='';
   history.replaceState({...(history.state||{}),derejPortal:capture(name)},'',url);
  }
 };
 window.addEventListener('popstate',()=>{
  const saved=history.state?.derejPortal;
  if(!saved||!exists(saved.name))return;
  restoring=true;
  try{
   show(saved,{preserveDOM:true});
   if(saved.name==='genealogias'){
    const tree=document.getElementById('derej-raices-v2'),reader=document.getElementById('genealogyStudy'),person=new URLSearchParams(location.search).get('persona');
    if(person&&tree?.genealogy?.people[person])tree.genealogy.openStudy(person);
    else if(tree&&reader){tree.hidden=false;reader.hidden=true;}
   }
  }finally{restoring=false;}
 });
 function applyPending(){
  if(typeof document==='undefined'||!document.defaultView)return;
  if(!pending||document.querySelector('#derejWelcome')?.open)return;
  if(pending.name==='camino'&&typeof RAMAK_DATA!=='undefined'&&!RAMAK_DATA)return;
  const point=pending;pending=null;
  if(point.study&&!validStudy(point.study)){notice('Esa lectura no está disponible. Puedes elegir otra desde Camino.');point.name='home';point.study=null;}
  restoring=true;
  try{
   if(point.today){originalRoute('camino');point.study=study();}
   show(point,{preserveDOM:!!point.today});
  }finally{restoring=false;}
  history.replaceState({...(history.state||{}),derejPortal:capture()},'',targetURL(active(),study()));
 }
 const query=new URLSearchParams(location.search),requested=query.get('puerta');
 // Los enlaces editoriales anteriores mantienen sus aperturas de personaje o sefirá.
 if(requested&&!query.get('estudio')){
  const name=exists(requested)?requested:'home';
  pending={name,y:0,today:name==='camino'&&!query.has('parasha'),study:name==='camino'&&query.has('parasha')?{parasha:query.get('parasha'),day:Number(query.get('dia')),step:query.get('etapa')||'encuentro'}:null};
  document.querySelector('#derejWelcome')?.addEventListener('close',()=>queueMicrotask(applyPending));
  applyPending();
 }else if(!query.has('estudio'))saveCurrent();
 // Actualizar referencias tras acciones internas sin crear entradas por cada clic.
 document.addEventListener('click',()=>queueMicrotask(()=>{if(!pending)saveCurrent();}));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)saveCurrent();});
 window.addEventListener('pagehide',saveCurrent);
})();
