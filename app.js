const $=id=>document.getElementById(id);
const screens=[...document.querySelectorAll('[data-screen]')];
const navButtons=[...document.querySelectorAll('.bottomNav [data-route]')];
const CONTENT_ROUTES={
  shabat:{url:'content/shabbat.json',root:'experience',status:'experienceStatus'},
  'beit-midrash':{url:'content/shabbat-raiz-bendicion.json',root:'deepExperience',status:'deepStatus'},
  sukkot:{url:'content/sukkot.json',root:'sukkotExperience',status:'sukkotStatus'},
  'sukkot-study':{url:'content/sukkot-beit-midrash.json',root:'sukkotDeepExperience',status:'sukkotDeepStatus'},
  'adam-adama':{url:'content/adam-adama.json',root:'adamExperience',status:'adamStatus'},
  'adam-adama-b1':{url:'content/adam-adama-practicas-b1.json',root:'adamB1Experience',status:'adamB1Status'}
};
const loaded=new Set();
const APARTADOS={
  'shabat-raiz':{
    title:'La Raíz de Toda Bendición',
    lead:'Un mapa ampliado para estudiar cese, descanso, presencia y práctica sin salir de Dérej.',
    url:'apartado-shabat-raiz.html',origin:'shabat',parent:'shabat'
  },
  'sukkot-sombra':{
    title:'El Secreto de la Sombra de Emuná',
    lead:'Fragilidad, hospitalidad, agua y alegría reunidas en un apartado de estudio.',
    url:'apartado-sukkot-sombra.html',origin:'sukkot',parent:'moed'
  },
  'adam-adama-ramak':{
    title:'ADAM–ADAMÁ · Mapa Ramak',
    lead:'Los ocho bloques y su colorimetría de fundamento, integrados como apartado visual de Dérej.',
    url:'apartado-adam-adama-ramak.html',origin:'adam-adama',parent:'camino'
  }
};
let APARTADO_ORIGIN='camino';
let APARTADO_PARENT='camino';
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined&&text!==null)n.textContent=text;return n}
function addText(p,t,c,v){if(!v)return null;const n=el(t,c,v);p.appendChild(n);return n}
function splitMeaning(value=''){const parts=String(value).split(' · ');return {translit:parts[0]||'',meaning:parts.slice(1).join(' · ')||''}}
const BOOK_ES={Bereshit:'Génesis',Shemot:'Éxodo','Vayikrá':'Levítico',Bamidbar:'Números',Devarim:'Deuteronomio',Yeshayahu:'Isaías',Hoshea:'Oseas',Tehilim:'Salmos',Kohelet:'Eclesiastés'};
function referenceEs(ref=''){let out=String(ref);Object.entries(BOOK_ES).forEach(([he,es])=>{out=out.replace(new RegExp(`\\b${he}\\b`,'g'),`${he} · ${es}`)});return out}
function hebrewCalendarLabel(date=new Date()){
  try{
    return new Intl.DateTimeFormat('es-CL-u-ca-hebrew',{timeZone:'Asia/Jerusalem',day:'numeric',month:'long',year:'numeric'}).format(date).replace(/\sAM$/,'');
  }catch(e){return ''}
}
function syncGlobalDate(){const node=$('hebrewDateGlobal');if(node){const label=hebrewCalendarLabel();node.textContent=label?`Israel · ${label}`:'Calendario hebreo'}}
const CAMINO_ICON_MAP={
  '◎':['◉','presencia','Presencia'],'⌁':['⌁','memoria','Memoria'],'💧':['','agua','Agua y recepción'],'⬡':['◇','piedra','Permanencia'],'◌':['◌','atencion','Atención'],'↶':['↶','retorno','Retorno'],'♫':['♪','escucha','Escucha'],'▯':['▱','umbral','Umbral'],'◐':['◐','reparacion','Reparación'],'↘':['↘','silencio','Descenso'],'□':['□','espacio','Espacio'],'🤝':['∞','vinculo','Vínculo'],'⌂':['⌂','fragilidad','Habitar'],'🌿':['⌁','vida','Vida'],'⊕':['⊕','unidad','Reunir'],'👁':['◉','atencion','Atención'],'↕':['↕','movimiento','Movimiento'],'○':['○','cierre','Permanecer'],'↻':['↻','inicio','Recomenzar'],'●':['●','origen','Origen'],'✦':['✦','luz','Luz'],'│':['│','distincion','Distinguir'],'✓':['✓','bien','Reconocer'],'?':['?','pregunta','Pregunta']
};
function caminoIconMeta(symbol){const [glyph,tone,label]=CAMINO_ICON_MAP[symbol]||[symbol||'·','fundamento','Fundamento'];return {glyph,tone,label}}
function caminoIconMarkup(meta){
  if(meta.tone==='agua')return '<svg class="ramakWaterIcon" viewBox="0 0 32 32" aria-hidden="true"><path class="ramakWaterDrop" d="M16 4c-3.8 5.2-6.4 8.3-6.4 12.1A6.4 6.4 0 0 0 16 22.5a6.4 6.4 0 0 0 6.4-6.4C22.4 12.3 19.8 9.2 16 4Z"/><path class="ramakWaterBowl" d="M7.2 23.5c2.2 2.6 5.2 4 8.8 4s6.6-1.4 8.8-4"/><path class="ramakWaterLine" d="M11 19.4c1.4 1 3 1.5 5 1.5s3.6-.5 5-1.5"/></svg>';
  return `<span aria-hidden="true">${meta.glyph}</span>`;
}
function setCaminoIcon(node,meta){if(!node)return;node.innerHTML=caminoIconMarkup(meta);node.dataset.tone=meta.tone;node.title=meta.label}
const DEREJ_GLOSSARY={
  'Havdalá':{he:'הבדלה',es:'Separación / distinción',body:'Ceremonia que marca la salida de Shabat y distingue entre el tiempo apartado y la semana que vuelve.'},
  'Shabat':{he:'שבת',es:'Descanso / cese',body:'El séptimo día de la semana en la tradición judía, asociado al cese de labor, santificación del tiempo y descanso.'},
  'Sukot':{he:'סֻכּוֹת',es:'Cabañas / moradas temporales',body:'Festividad judía de siete días vinculada a memoria, alegría, cosecha y la experiencia de habitar una suká.'},
  'Haftará':{he:'הפטרה',es:'Lectura profética',body:'Selección de los Profetas leída públicamente en conexión con la lectura semanal de la Torá y otras ocasiones.'},
  'Kiddush':{he:'קידוש',es:'Santificación',body:'Bendición que proclama la santidad de Shabat o de una festividad, tradicionalmente sobre vino o jugo de uva.'},
  'Menújá':{he:'מנוחה',es:'Descanso / reposo',body:'Palabra hebrea asociada al descanso y la quietud; en Dérej se presenta siempre distinguiendo fuente e interpretación.'},
  'Hitbodedut':{he:'התבודדות',es:'Retiro / conversación personal',body:'Práctica de conversación personal y retiro asociada especialmente a la tradición de Breslev.'}
};
function glossaryForTitle(title=''){return Object.entries(DEREJ_GLOSSARY).find(([k])=>String(title).toLowerCase().startsWith(k.toLowerCase()))?.[1]||null}
function renderBlockTitle(section,title){
  if(!title)return;const row=el('div','blockTitleRow');addText(row,'h2','',title);const g=glossaryForTitle(title);
  if(g){const btn=el('button','glossaryBtn','ⓘ');btn.type='button';btn.setAttribute('aria-label',`Ver significado de ${title}`);btn.setAttribute('aria-expanded','false');const pop=el('div','glossaryPop');pop.hidden=true;pop.innerHTML=`<b>${g.he} · ${g.es}</b><span>${g.body}</span>`;btn.addEventListener('click',()=>{const open=pop.hidden;pop.hidden=!open;btn.setAttribute('aria-expanded',String(open))});row.append(btn,pop)}section.appendChild(row)
}

function contextMessage(route){const day=new Intl.DateTimeFormat('es-CL',{weekday:'long'}).format(new Date());return({camino:`Hoy es ${day}. La Parashá continúa siendo el eje común de Dérej.`,shabat:'Shabat abre una experiencia de descanso; la profundidad queda disponible, nunca impuesta.','beit-midrash':'Beit Midrash es profundidad opcional: fuente, atribución y contexto antes de aplicación.',moed:'Moed acompaña el calendario sin desplazar la Parashá.',sukkot:'Sukot invita a habitar la fragilidad con alegría, memoria y hospitalidad.','sukkot-study':'El Beit Midrash de Sukot distingue fuente tradicional, lectura mística y adaptación Dérej.','adam-adama':'ADAM–ADAMÁ organiza estudio y práctica regenerativa como una colección, no como una sola página.','adam-adama-b1':'Bloque piloto de ADAM–ADAMÁ con checklist local persistente.','camino-week':'Cuatro semanas de RC2, ahora separadas del motor.','camino-encounter':'El encuentro guarda la elección sólo durante la experiencia; al cerrar sólo queda una huella local.','camino-root':'La raíz devuelve fuente, contexto y una pregunta para la vida.','source-reader':'La fuente permanece dentro de Dérej: hebreo, español, contexto y trazabilidad editorial.',haftara:'La Haftará conserva su contexto litúrgico antes de abrir una pregunta contemporánea.',community:'Comunidad transforma estudio en acción compartida, con consentimiento explícito y moderación.',radio:'Radio Dérej acompaña silencio, estudio y memoria.','camino-personal':'Mi Camino conserva memoria local; no crea puntuaciones ni perfiles espirituales.',frutos:'Frutos conserva memoria comunitaria de acciones vividas, siempre anónima y moderada.',guia:'Recorrido de orientación: entender Dérej antes de usarlo también forma parte del camino.',apartado:'Complemento editorial: una lectura ampliada en HTML que permanece dentro de Dérej.'})[route]||'Dérej · El Camino'}
function navParent(route){if(['camino-week','camino-encounter','camino-root','source-reader','haftara'].includes(route))return'camino';if(['beit-midrash'].includes(route))return'shabat';if(['sukkot','sukkot-study'].includes(route))return'moed';if(['adam-adama','adam-adama-b1','community','guia'].includes(route))return'camino';if(route==='frutos')return'camino-personal';if(route==='apartado')return APARTADO_PARENT||'camino';return route}
async function showRoute(route,{replace=false}={}){const target=screens.find(s=>s.dataset.screen===route)?route:'camino';screens.forEach(s=>s.hidden=s.dataset.screen!==target);const parent=navParent(target);navButtons.forEach(b=>b.classList.toggle('on',b.dataset.route===parent));$('contextBar').textContent=contextMessage(target);if(!replace)history.pushState({route:target},'',`#${target}`);window.scrollTo({top:0,behavior:'smooth'});if(CONTENT_ROUTES[target]&&!loaded.has(target))await loadContentRoute(target);if(['camino','camino-week','camino-encounter','camino-root','source-reader','haftara'].includes(target))await caminoEnsure(target);if(target==='radio')await radioInit();if(target==='community')await communityInit();if(target==='frutos')await fruitInit();if(target==='camino-personal')renderLocalMemory()}
function sanitizeApartadoHtml(html=''){
  const doc=new DOMParser().parseFromString(String(html),'text/html');
  doc.querySelectorAll('script,style,iframe,object,embed,link,meta,base,form').forEach(n=>n.remove());
  doc.querySelectorAll('*').forEach(node=>{
    [...node.attributes].forEach(attr=>{
      const name=attr.name.toLowerCase(),value=String(attr.value||'').trim();
      if(name.startsWith('on'))node.removeAttribute(attr.name);
      if((name==='href'||name==='src')&&/^javascript:/i.test(value))node.removeAttribute(attr.name);
    });
  });
  return doc.body.innerHTML;
}
function bindApartadoActions(host){
  host.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>showRoute(b.dataset.route)));
  host.querySelectorAll('[data-apartado]').forEach(b=>b.addEventListener('click',()=>openApartado(b.dataset.apartado)));
}
async function openApartado(id){
  const meta=APARTADOS[id];
  if(!meta)return;
  APARTADO_ORIGIN=meta.origin||'camino';
  APARTADO_PARENT=meta.parent||'camino';
  $('apartadoTitle').textContent=meta.title;
  $('apartadoLead').textContent=meta.lead;
  const status=$('apartadoStatus'),host=$('apartadoHost');
  status.hidden=false;status.textContent='Abriendo apartado…';host.replaceChildren();
  await showRoute('apartado');
  try{
    const res=await fetch(meta.url,{cache:'no-store'});
    if(!res.ok)throw new Error(`Apartado ${res.status}`);
    host.innerHTML=sanitizeApartadoHtml(await res.text());
    bindApartadoActions(host);
    status.hidden=true;
    requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'smooth'}));
  }catch(e){
    status.hidden=false;status.textContent='Este apartado no pudo abrirse. Intenta nuevamente.';
  }
}

function renderSources(parent,ids,sourceMap){if(!Array.isArray(ids)||!ids.length)return;const wrap=el('div','source-links');ids.forEach(id=>{const src=sourceMap.get(id);if(!src||src.tradition==='derej')return;const label=referenceEs(src.citation?`${src.label} · ${src.citation}`:src.label);wrap.appendChild(el('span','source-chip',label))});if(wrap.children.length)parent.appendChild(wrap)}
function saveLocalAction(content,block,selection=''){const key=`derej:content:${content.id}:actions`;let current=[];try{current=JSON.parse(localStorage.getItem(key)||'[]')}catch(e){}if(!Array.isArray(current))current=[];const entry={content_id:content.id,content_title:content.title?.es||content.id,block_id:block.id,block_title:block.title||block.id,selection:selection||'',at:new Date().toISOString()};const match=current.findIndex(x=>x.content_id===entry.content_id&&x.block_id===entry.block_id);if(match>=0)current[match]=entry;else current.push(entry);localStorage.setItem(key,JSON.stringify(current));renderLocalMemory()}
function renderMedia(parent,media){if(!media)return;let node;if(media.kind==='image'){node=el('img','media');node.src=media.src;node.alt=media.alt||''}else if(media.kind==='audio'){node=el('audio','media');node.src=media.src;node.controls=true}else if(media.kind==='video'){node=el('video','media');node.src=media.src;node.controls=true;if(media.poster)node.poster=media.poster}if(node)parent.appendChild(node);addText(parent,'p','small',media.caption)}
function renderBlock(content,block,sourceMap){if(block.kind==='separator')return el('hr');const section=el('section',`block ${block.kind}`);section.dataset.blockId=block.id;renderBlockTitle(section,block.title);addText(section,'div','he',block.he);addText(section,'div','translit',block.translit);addText(section,'p','',block.body);addText(section,'p','prompt',block.prompt);renderMedia(section,block.media);renderSources(section,block.source_ids,sourceMap);
if(block.kind==='checklist'&&Array.isArray(block.items)){const list=el('div','checklist');block.items.forEach(item=>{const row=el('label','checkRow');const box=document.createElement('input');box.type='checkbox';const key=`derej:check:${content.id}:${block.id}:${item.id}`;box.checked=localStorage.getItem(key)==='1';const copy=el('span','');addText(copy,'b','',item.label);addText(copy,'span','small',item.body);row.classList.toggle('checked',box.checked);box.addEventListener('change',()=>{localStorage.setItem(key,box.checked?'1':'0');row.classList.toggle('checked',box.checked)});row.append(box,copy);list.appendChild(row)});section.appendChild(list)}
if(block.kind==='layered_source'&&Array.isArray(block.layers)){const tabs=el('div','layerTabs'),body=el('div','layerBody');const activate=i=>{[...tabs.children].forEach((b,j)=>b.classList.toggle('on',j===i));const layer=block.layers[i];body.textContent=layer.body;body.replaceChildren(document.createTextNode(layer.body));renderSources(body,layer.source_ids,sourceMap)};block.layers.forEach((layer,i)=>{const b=el('button','layerTab',layer.label);b.addEventListener('click',()=>activate(i));tabs.appendChild(b)});section.append(tabs,body);activate(0)}
if(block.kind==='action'&&block.action){const btn=el('button','action-btn',block.action.label),note=el('div','notice');let selected='';if(Array.isArray(block.action.choices)&&block.action.choices.length){const chooser=el('div','carryChoices');addText(chooser,'div','eyebrow','Elige una práctica');block.action.choices.forEach(choice=>{const c=el('button','carryChoice',choice);c.type='button';c.addEventListener('click',()=>{selected=choice;chooser.querySelectorAll('.carryChoice').forEach(x=>x.classList.toggle('on',x===c));btn.disabled=false;note.textContent=`Elegiste: ${choice}`});chooser.appendChild(c)});section.appendChild(chooser);btn.disabled=true}if(block.action.mode==='local'){btn.addEventListener('click',()=>{saveLocalAction(content,block,selected);btn.textContent='Guardado en este dispositivo ✓';note.textContent=selected?`Guardado: ${selected}. No se envió nada fuera de este dispositivo.`:'No se envió nada fuera de este dispositivo.'})}else if(block.action.mode==='optional_community'){btn.addEventListener('click',()=>showRoute('community'));note.textContent='La participación comunitaria usa consentimiento explícito y moderación.'}else if(block.action.mode==='external'&&block.action.target){btn.addEventListener('click',()=>window.open(block.action.target,'_blank','noopener'))}else btn.disabled=true;section.append(btn,note)}return section}
function renderContentTo(content,root,statusNode){if(!['0.1','0.2'].includes(content.schema_version))throw new Error(`Schema no soportado: ${content.schema_version}`);root.replaceChildren();const sourceMap=new Map((content.source_refs||[]).map(s=>[s.id,s]));const hero=el('section','hero');addText(hero,'div','symbol',content.experience.entry.symbol);addText(hero,'div','eyebrow',content.experience.entry.eyebrow);addText(hero,'h1','',content.title.es);addText(hero,'div','he',content.title.he);addText(hero,'div','translit',content.title.translit);addText(hero,'p','',content.title.subtitle);addText(hero,'p','',content.experience.entry.intro);root.appendChild(hero);content.experience.blocks.forEach(block=>root.appendChild(renderBlock(content,block,sourceMap)));if((content.source_refs||[]).length){const box=el('section','sources');addText(box,'div','eyebrow','Fuentes consultadas');content.source_refs.filter(src=>src.tradition!=='derej').forEach(src=>{const label=referenceEs(src.citation?`${src.label} · ${src.citation}`:src.label);box.appendChild(el('p','small',label))});root.appendChild(box)}if(content.experience.closing){const closing=el('section','closing');addText(closing,'h2','',content.experience.closing.title);addText(closing,'p','',content.experience.closing.body);addText(closing,'p','prompt',content.experience.closing.prompt);root.appendChild(closing)}const local=content.privacy?.storage==='local';statusNode.textContent=local?'Edición Dérej · memoria privada en este dispositivo':'Edición Dérej · lectura y práctica'}
async function loadContentRoute(route){const cfg=CONTENT_ROUTES[route];try{const res=await fetch(cfg.url,{cache:'no-store'});if(!res.ok)throw new Error(`No se pudo cargar ${cfg.url}`);renderContentTo(await res.json(),$(cfg.root),$(cfg.status));loaded.add(route)}catch(err){$(cfg.status).textContent='Error cargando contenido';$(cfg.root).textContent=err.message}}




/* Camino semanal + Haftará · migración RC2 */
let CAMINO=null;
let caminoWeekIndex=0;
let caminoDayIndex=0;
let caminoBridgeStep=0;
let caminoOrigin='camino';
let caminoSelection='';
function localDateKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function caminoFindWeek(key=localDateKey()){
  const i=CAMINO.weeks.findIndex(w=>key>=w.start&&key<=w.end);
  if(i>=0)return i;if(key<CAMINO.weeks[0].start)return 0;return CAMINO.weeks.length-1;
}
function caminoTodayIndex(wi,key=localDateKey()){
  const days=CAMINO.weeks[wi].days;const i=days.findIndex(d=>d[0]===key);return i>=0?i:(key<days[0][0]?0:days.length-1);
}
function caminoDoneState(){try{return JSON.parse(localStorage.getItem('derej:camino:done')||'{}')}catch(e){return {}}}
function caminoSaveDone(date){const s=caminoDoneState();s[date]=new Date().toISOString();localStorage.setItem('derej:camino:done',JSON.stringify(s))}
function caminoToratUrl(weekId,haftara=false){if(haftara&&weekId==='bereshit')return CAMINO.torat_emet.haftara_bereshit;return CAMINO.torat_emet[weekId]||CAMINO.torat_emet.catalog}
async function caminoLoad(){if(CAMINO)return;const r=await fetch('content/camino-weeks.json',{cache:'no-store'});if(!r.ok)throw new Error('No se pudo cargar Camino');CAMINO=await r.json();caminoWeekIndex=caminoFindWeek();caminoDayIndex=caminoTodayIndex(caminoWeekIndex)}
function caminoRenderHome(){
  const w=CAMINO.weeks[caminoWeekIndex=caminoFindWeek()];caminoDayIndex=caminoTodayIndex(caminoWeekIndex);const d=w.days[caminoDayIndex],done=caminoDoneState(),meta=caminoIconMeta(d[1]);
  $('caminoDate').textContent=`${w.start} → ${w.end}`;$('caminoWeekHe').textContent=w.he;$('caminoWeekTitle').textContent=w.title;$('caminoWeekSymbolText').textContent=`${w.symbolName} · ${w.symbolText}`;
  setCaminoIcon($('caminoTodayIcon'),meta);$('caminoTodayTitle').textContent=d[2];$('caminoTodayQuestion').textContent=d[3];
  const n=w.days.filter(x=>done[x[0]]).length;$('caminoProgressText').textContent=n?`${n} de 7 encuentros vividos · memoria, no racha`:'Todavía no hay huellas en esta semana.';$('caminoProgressBar').style.width=`${n/7*100}%`;
}
function caminoRenderWeekList(){
  const box=$('caminoWeekList');box.replaceChildren();const done=caminoDoneState();
  CAMINO.weeks.forEach((w,wi)=>{const card=el('section','weekCard');const head=el('div','weekHead');const weekMeta=caminoIconMeta(w.days[0]?.[1]);const sym=el('div','weekSymbol');setCaminoIcon(sym,weekMeta);const copy=el('div');addText(copy,'div','eyebrow',`${w.start} → ${w.end}`);addText(copy,'h2','',w.title);addText(copy,'div','he weekHe',w.he);head.append(sym,copy);card.appendChild(head);const days=el('div','weekDays');w.days.forEach((d,di)=>{const meta=caminoIconMeta(d[1]);const b=el('button',`weekDay${done[d[0]]?' done':''}`);b.type='button';b.innerHTML=`<span class="weekDayIcon" data-tone="${meta.tone}" aria-hidden="true">${caminoIconMarkup(meta)}</span><span><b>${d[2]}</b><small>${d[3]}</small></span><span class="weekDayState">${done[d[0]]?'✓':'→'}</span>`;b.setAttribute('aria-label',`${d[2]}. ${meta.label}. ${d[3]}`);b.addEventListener('click',()=>caminoOpenEncounter(wi,di,'camino-week'));days.appendChild(b)});card.appendChild(days);box.appendChild(card)})
}
function choiceButton(text){const b=el('button','choice',text);b.type='button';return b}
function caminoRevealDepth(d,selection=''){
  caminoSelection=selection||'';
  const card=$('encounterDeeper'),echo=$('encounterSelectionEcho'),q=$('encounterFollowup');
  if(!card||!q)return;
  echo.textContent=selection?`Elegiste: ${selection}`:'Ya abriste la primera capa de la pregunta.';
  q.textContent=CAMINO.reflection_followups?.[d[0]]||'¿Qué hay detrás de esta elección y qué podría cambiar si la miras con más honestidad?';
  card.hidden=false;$('discoverRoot').disabled=false;
}
function caminoOpenEncounter(wi,di,origin='camino'){
  caminoWeekIndex=wi;caminoDayIndex=di;caminoOrigin=origin;caminoBridgeStep=0;caminoSelection='';const d=CAMINO.weeks[wi].days[di],meta=caminoIconMeta(d[1]);$('encounterDate').textContent=d[0];$('encounterHebrewDate').textContent=`Israel · ${hebrewCalendarLabel(new Date(`${d[0]}T12:00:00Z`))}`;setCaminoIcon($('encounterSymbol'),meta);$('encounterMotif').dataset.tone=meta.tone;$('encounterSymbolLabel').textContent=`${meta.label} · símbolo del encuentro`;$('encounterTitle').textContent=d[2];$('encounterQuestion').textContent=d[3];$('discoverRoot').disabled=true;$('encounterDeeper').hidden=true;$('encounterSelectionEcho').textContent='';$('encounterFollowup').textContent='';const box=$('encounterChoices');box.replaceChildren();
  if(d[11]==='bridge'){$('encounterInstruction').textContent='Construye la experiencia en orden.';const chosen=[];d[4].forEach((c,j)=>{const b=choiceButton(c);b.addEventListener('click',()=>{if(j!==caminoBridgeStep){$('encounterInstruction').textContent=`Sigue con la pieza ${caminoBridgeStep+1}.`;return}caminoBridgeStep++;chosen.push(c);b.classList.add('on');b.disabled=true;if(caminoBridgeStep===d[4].length)caminoRevealDepth(d,chosen.join(' → '))});box.appendChild(b)})}
  else if(d[11]==='recall'){$('encounterInstruction').textContent='Primero intenta recordar sin pistas.';const yes=choiceButton('Sí · algo volvió'),no=choiceButton('Todavía no aparece'),opts=el('div','choiceList');const reveal=()=>{yes.remove();no.remove();d[4].forEach(c=>{const b=choiceButton(c);b.addEventListener('click',()=>{opts.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));b.classList.add('on');caminoRevealDepth(d,c)});opts.appendChild(b)})};yes.addEventListener('click',reveal);no.addEventListener('click',reveal);box.append(yes,no,opts)}
  else {$('encounterInstruction').textContent='Elige la opción que más se acerque a lo que hoy reconoces. No necesitas justificarla.';d[4].forEach(c=>{const b=choiceButton(c);b.addEventListener('click',()=>{box.querySelectorAll('.choice').forEach(x=>x.classList.remove('on'));b.classList.add('on');caminoRevealDepth(d,c)});box.appendChild(b)})}
  showRoute('camino-encounter');
}
let SOURCE_READER_STATE=null;
function caminoRenderRoot(){const w=CAMINO.weeks[caminoWeekIndex],d=w.days[caminoDayIndex],lang=splitMeaning(d[6]),extra=CAMINO.root_editorial?.[d[0]]||{};$('rootHe').textContent=d[5];$('rootTranslit').textContent=lang.translit;$('rootMeaning').textContent=lang.meaning||'Traducción editorial en preparación';$('rootRef').textContent=`📜 ${referenceEs(d[7])}`;$('rootContext').textContent=d[8];$('rootContextExtra').textContent=extra.context_extra||'';$('rootDerejTitle').textContent=d[2].charAt(0)+d[2].slice(1).toLowerCase();$('rootDerej').textContent=d[9];$('rootDerejExtra').textContent=extra.reading_extra||'';$('rootClose').textContent=d[10];$('rootSourceLink').textContent='📖 Leer este pasaje en Dérej'}
function sourceReaderRender(entry,origin='camino-root'){
  SOURCE_READER_STATE={entry,origin};try{sessionStorage.setItem('derej:source-reader:last',JSON.stringify(SOURCE_READER_STATE))}catch(e){};
  $('sourceReaderKind').textContent=`${entry.category||'Fuente bíblica'} · lector Dérej`;
  $('sourceReaderRef').textContent=referenceEs(entry.reference_he||entry.reference_es||'Fuente');
  $('sourceReaderHe').textContent=entry.hebrew_excerpt||'';
  $('sourceReaderTranslit').textContent=entry.transliteration||'—';
  $('sourceReaderMeaning').textContent=entry.meaning_es||'Traducción editorial en preparación';
  $('sourceReaderText').textContent=entry.text_es||entry.meaning_es||'El fragmento completo está en preparación editorial.';
  $('sourceReaderTextNote').textContent=entry.text_es?'Traducción editorial Dérej · versión piloto para revisión.':'Esta versión piloto presenta el fragmento trabajado en el encuentro; el lector completo se incorporará progresivamente.';
  $('sourceReaderContext').textContent=entry.context||'';
  $('sourceReaderDerej').textContent=entry.derej_reading||'';
  const sources=$('sourceReaderSources');sources.replaceChildren();(entry.sources||[]).forEach(x=>sources.appendChild(el('p','small',x)));
}
async function openCurrentSourceReader(){const d=CAMINO.weeks[caminoWeekIndex].days[caminoDayIndex],entry=CAMINO.native_reader?.[d[0]];if(!entry)return;sourceReaderRender(entry,'camino-root');await showRoute('source-reader');requestAnimationFrame(()=>setTimeout(()=>{const card=$('sourceReaderTextCard');if(!card)return;card.classList.remove('flashPassage');card.scrollIntoView({behavior:'smooth',block:'start'});void card.offsetWidth;card.classList.add('flashPassage')},60))}
function caminoRenderHaftara(){const w=CAMINO.weeks[caminoFindWeek()],h=CAMINO.haftara_by_week[w.id]||CAMINO.haftara_by_week.haazinu,lang=splitMeaning(h.tr);$('haftaraTitle').textContent=h.title;$('haftaraHe').textContent=h.he;$('haftaraTranslit').textContent=lang.translit;$('haftaraMeaning').textContent=lang.meaning;$('haftaraRef').textContent=referenceEs(h.ref);$('haftaraText').textContent=h.text;$('haftaraQuestion').textContent=h.q}
async function caminoEnsure(route){try{await caminoLoad();if(route==='camino')caminoRenderHome();else if(route==='camino-week')caminoRenderWeekList();else if(route==='camino-root')caminoRenderRoot();else if(route==='source-reader'){if(!SOURCE_READER_STATE){try{SOURCE_READER_STATE=JSON.parse(sessionStorage.getItem('derej:source-reader:last')||'null')}catch(e){}if(!SOURCE_READER_STATE){const wi=caminoFindWeek(),di=caminoTodayIndex(wi),d=CAMINO.weeks[wi].days[di],entry=CAMINO.native_reader?.[d[0]];if(entry)SOURCE_READER_STATE={entry,origin:'camino-root'}}}if(SOURCE_READER_STATE)sourceReaderRender(SOURCE_READER_STATE.entry,SOURCE_READER_STATE.origin)}else if(route==='haftara')caminoRenderHaftara()}catch(e){if(route==='camino'){$('caminoWeekTitle').textContent='Camino no disponible';$('caminoTodayQuestion').textContent=e.message}}}
$('caminoStartToday').addEventListener('click',async()=>{await caminoLoad();caminoOpenEncounter(caminoFindWeek(),caminoTodayIndex(caminoFindWeek()),'camino')});
$('encounterBack').addEventListener('click',()=>showRoute(caminoOrigin));
$('discoverRoot').addEventListener('click',()=>{caminoRenderRoot();showRoute('camino-root')});
$('rootSourceLink').addEventListener('click',openCurrentSourceReader);
$('sourceReaderBack').addEventListener('click',()=>showRoute(SOURCE_READER_STATE?.origin||'camino-root'));
$('haftaraSource').addEventListener('click',()=>{const w=CAMINO.weeks[caminoFindWeek()],h=CAMINO.haftara_by_week[w.id]||CAMINO.haftara_by_week.haazinu,lang=splitMeaning(h.tr),first=String(h.ref).split(' ')[0],entry={category:'Profetas',reference_he:h.ref,reference_es:referenceEs(h.ref),hebrew_excerpt:h.he,transliteration:lang.translit,meaning_es:lang.meaning,text_es:lang.meaning,context:h.text,derej_reading:h.q,sources:['Sefaria · estructura y contraste editorial','Parashot · referencia litúrgica']};sourceReaderRender(entry,'haftara');showRoute('source-reader')});
$('finishEncounter').addEventListener('click',()=>{const d=CAMINO.weeks[caminoWeekIndex].days[caminoDayIndex];caminoSaveDone(d[0]);caminoRenderHome();renderLocalMemory();showRoute('camino')});




/* Comunidad LIVE · Supabase REST/Auth · v0.8 */
let COMMUNITY=null;
let communityInitialized=false;
let communityInitPromise=null;
let COMMUNITY_REPORT_TARGET=null;
let COMMUNITY_CAPTCHA_WIDGET_ID=null;
let COMMUNITY_CAPTCHA_PENDING=null;
let TURNSTILE_SCRIPT_PROMISE=null;
const COMMUNITY_SESSION_KEY='derej:community:session:v1';

function communityConfig(){
  const cfg=window.DEREJ_CONFIG||{};
  if(!cfg.supabaseUrl||!cfg.supabasePublishableKey) throw new Error('Configuración comunitaria incompleta.');
  return {
    base:String(cfg.supabaseUrl).replace(/\/$/,''),
    key:cfg.supabasePublishableKey,
    slug:cfg.communitySlug||'shabat-para-la-tierra',
    submitFunction:cfg.communitySubmitFunction||'submit-testimony',
    fruitSubmitFunction:cfg.fruitSubmitFunction||'submit-fruit',
    reportFunction:cfg.communityReportFunction||'report-testimony',
    captchaEnabled:cfg.communityCaptchaEnabled===true,
    captchaProvider:cfg.communityCaptchaProvider||'turnstile',
    turnstileSiteKey:String(cfg.turnstileSiteKey||'').trim()
  };
}
function communityLoadTurnstile(){
  if(window.turnstile?.render)return Promise.resolve(window.turnstile);
  if(TURNSTILE_SCRIPT_PROMISE)return TURNSTILE_SCRIPT_PROMISE;
  TURNSTILE_SCRIPT_PROMISE=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async=true;script.defer=true;
    script.onload=()=>window.turnstile?.render?resolve(window.turnstile):reject(new Error('Turnstile no quedó disponible.'));
    script.onerror=()=>reject(new Error('No fue posible cargar la verificación humana.'));
    document.head.appendChild(script);
  });
  return TURNSTILE_SCRIPT_PROMISE;
}
function communityCaptchaClose(){
  const dialog=$('communityCaptchaDialog');
  if(dialog?.open)dialog.close();
}
function communityCaptchaCancel(){
  if(COMMUNITY_CAPTCHA_PENDING){
    const {reject}=COMMUNITY_CAPTCHA_PENDING;
    COMMUNITY_CAPTCHA_PENDING=null;
    reject(Object.assign(new Error('Verificación cancelada.'),{code:'captcha_cancelled'}));
  }
  communityCaptchaClose();
}
async function communityRequestCaptchaToken(){
  const cfg=communityConfig();
  if(!cfg.captchaEnabled)return null;
  if(cfg.captchaProvider!=='turnstile')throw Object.assign(new Error('Proveedor CAPTCHA no compatible.'),{code:'captcha_config_error'});
  if(!cfg.turnstileSiteKey)throw Object.assign(new Error('Turnstile aún no tiene Site Key configurada.'),{code:'captcha_config_error'});
  const turnstile=await communityLoadTurnstile();
  if(COMMUNITY_CAPTCHA_PENDING)throw Object.assign(new Error('Ya existe una verificación en curso.'),{code:'captcha_busy'});
  const dialog=$('communityCaptchaDialog'),mount=$('communityTurnstileWidget'),status=$('communityCaptchaStatus');
  if(!dialog||!mount||!status)throw Object.assign(new Error('No se encontró el diálogo de verificación.'),{code:'captcha_ui_error'});
  mount.replaceChildren();status.textContent='Completa la verificación para continuar.';
  dialog.showModal();
  return new Promise((resolve,reject)=>{
    COMMUNITY_CAPTCHA_PENDING={resolve,reject};
    try{
      COMMUNITY_CAPTCHA_WIDGET_ID=turnstile.render(mount,{
        sitekey:cfg.turnstileSiteKey,
        theme:'auto',
        callback:(token)=>{
          const pending=COMMUNITY_CAPTCHA_PENDING;COMMUNITY_CAPTCHA_PENDING=null;
          status.textContent='Verificación completada ✓';communityCaptchaClose();
          if(pending)pending.resolve(token);
        },
        'expired-callback':()=>{status.textContent='La verificación expiró. Inténtalo nuevamente.';try{turnstile.reset(COMMUNITY_CAPTCHA_WIDGET_ID)}catch(e){}},
        'error-callback':()=>{status.textContent='No fue posible completar la verificación. Reintenta.';}
      });
    }catch(err){
      COMMUNITY_CAPTCHA_PENDING=null;communityCaptchaClose();reject(err);
    }
  });
}
function communityHeaders(token=null,json=false){
  const {key}=communityConfig();
  const h={apikey:key,Authorization:`Bearer ${token||key}`};
  if(json)h['Content-Type']='application/json';
  return h;
}
async function communityRest(table,params={},options={}){
  const {base}=communityConfig();
  const q=new URLSearchParams(params).toString();
  const headers=communityHeaders(options.token||null,Boolean(options.body));
  if(options.prefer)headers.Prefer=options.prefer;
  const res=await fetch(`${base}/rest/v1/${table}${q?'?'+q:''}`,{method:options.method||'GET',headers,body:options.body?JSON.stringify(options.body):undefined});
  const text=await res.text();
  let data=null;try{data=text?JSON.parse(text):null}catch(e){data=text}
  if(!res.ok){const err=new Error(data?.message||data?.error_description||`Supabase ${res.status}`);err.status=res.status;err.detail=data;throw err}
  return data;
}
async function communityAuthRequest(path,body){
  const {base}=communityConfig();
  const res=await fetch(`${base}/auth/v1/${path}`,{method:'POST',headers:communityHeaders(null,true),body:JSON.stringify(body||{})});
  const data=await res.json().catch(()=>({}));
  if(!res.ok){const err=new Error(data?.message||data?.msg||data?.error_description||`Auth ${res.status}`);err.status=res.status;err.code=data?.code||data?.error_code;err.detail=data;throw err}
  return data;
}
async function communityFunction(name,body,token){
  const {base,key}=communityConfig();
  const res=await fetch(`${base}/functions/v1/${name}`,{
    method:'POST',
    headers:{apikey:key,Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
    body:JSON.stringify(body||{})
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok){const err=new Error(data?.message||data?.error||`Function ${res.status}`);err.status=res.status;err.code=data?.error;err.detail=data;throw err}
  return data;
}
function communityNormalizeSession(raw){
  const session=raw?.session||raw||{};
  const user=raw?.user||session.user||{};
  const expiresAt=Number(session.expires_at)||Math.floor(Date.now()/1000)+Number(session.expires_in||3600);
  if(!session.access_token||!session.refresh_token||!user.id)throw new Error('Supabase no devolvió una sesión anónima utilizable.');
  return {access_token:session.access_token,refresh_token:session.refresh_token,expires_at:expiresAt,user_id:user.id,is_anonymous:user.is_anonymous!==false};
}
function communityReadSession(){try{return JSON.parse(localStorage.getItem(COMMUNITY_SESSION_KEY)||'null')}catch(e){return null}}
function communityStoreSession(s){localStorage.setItem(COMMUNITY_SESSION_KEY,JSON.stringify(s));return s}
function communitySessionValid(s){return Boolean(s?.access_token&&s?.user_id&&Number(s.expires_at)>Math.floor(Date.now()/1000)+90)}
async function communityEnsureSession(){
  let s=communityReadSession();
  if(communitySessionValid(s))return s;
  if(s?.refresh_token){
    try{s=communityStoreSession(communityNormalizeSession(await communityAuthRequest('token?grant_type=refresh_token',{refresh_token:s.refresh_token})));return s}catch(e){localStorage.removeItem(COMMUNITY_SESSION_KEY)}
  }
  const captchaToken=await communityRequestCaptchaToken();
  const body={data:{}};
  if(captchaToken)body.gotrue_meta_security={captcha_token:captchaToken};
  s=communityStoreSession(communityNormalizeSession(await communityAuthRequest('signup',body)));
  return s;
}
async function communityCheckAnonymousAvailability(){
  try{
    const {base}=communityConfig();
    const res=await fetch(`${base}/auth/v1/settings`,{headers:communityHeaders()});
    if(!res.ok)return null;
    const data=await res.json();
    return data?.external?.anonymous_users===true;
  }catch(e){return null}
}
function communityKindLabel(kind){return ({question:'Pregunta',torah:'Fuente / Torá',evidence:'Método',reflection:'Reflexión',interactive:'Mirar',action:'Acción'})[kind]||kind}
function communityKindIcon(kind){return ({question:'?',torah:'📜',evidence:'⌁',reflection:'◌',interactive:'👁',action:'👣'})[kind]||'•'}
function communityRenderSections(sections){
  const box=$('communitySections');box.replaceChildren();
  sections.forEach(sec=>{
    const card=el('section',`communitySection ${sec.kind||''}`);
    addText(card,'div','communityKind',`${communityKindIcon(sec.kind)} ${communityKindLabel(sec.kind)}`);
    addText(card,'h2','',sec.heading);addText(card,'p','',sec.body);
    const refs=Array.isArray(sec.metadata?.references)?sec.metadata.references:[];
    if(refs.length){const wrap=el('div','communityRefs');refs.forEach(r=>wrap.appendChild(el('span','communityRef',r)));card.appendChild(wrap)}
    box.appendChild(card);
  });
}
function communityRenderMission(mission){
  if(!mission){$('communityMissionCard').hidden=true;return}
  $('communityMissionCard').hidden=false;$('communityMissionTitle').textContent=mission.title;$('communityMissionDescription').textContent=mission.description||'';
  const steps=$('communityMissionSteps');steps.replaceChildren();
  (Array.isArray(mission.instructions)?mission.instructions:[]).forEach((step,i)=>{const row=el('div','missionStep');row.append(el('span','missionStepNum',String(i+1)));const copy=el('div');addText(copy,'b','',step.title);addText(copy,'p','',step.body);row.appendChild(copy);steps.appendChild(row)});
  const localKey=`derej:community:private:${mission.id}`;
  $('communityPrivateReflection').value=localStorage.getItem(localKey)||'';
  $('savePrivateReflection').onclick=()=>{localStorage.setItem(localKey,$('communityPrivateReflection').value);$('privateReflectionStatus').textContent='Guardado sólo en este dispositivo ✓'};
}
function communityRenderTestimonies(items){
  const box=$('communityTestimonies');box.replaceChildren();
  if(!items.length){box.appendChild(el('p','small','Todavía no hay testimonios publicados. La memoria comunitaria comienza con cuidado, no con cantidad.'));return}
  items.forEach(t=>{
    const item=el('article','testimonyItem');addText(item,'p','',t.body);
    const meta=el('div','testimonyMeta');
    const time=el('time','',new Intl.DateTimeFormat('es-CL',{dateStyle:'medium'}).format(new Date(t.created_at)));
    const report=el('button','testimonyReportBtn','Reportar');report.type='button';
    if(localStorage.getItem(`derej:community:reported:${t.id}`)==='1'){report.textContent='Reportado ✓';report.disabled=true}
    else report.addEventListener('click',()=>communityOpenReport(t.id));
    meta.append(time,report);item.appendChild(meta);box.appendChild(item)
  });
}
async function communityLoadData(){
  const cfg=communityConfig();
  const conversations=await communityRest('conversations',{select:'id,slug,title,subtitle,excerpt,published_at',slug:`eq.${cfg.slug}`,status:'eq.published',limit:'1'});
  const conversation=Array.isArray(conversations)?conversations[0]:null;if(!conversation)throw new Error('La conversación comunitaria no está disponible.');
  const [sections,missions,testimonies]=await Promise.all([
    communityRest('conversation_sections',{select:'id,section_order,kind,heading,body,metadata',conversation_id:`eq.${conversation.id}`,order:'section_order.asc'}),
    communityRest('missions',{select:'id,title,description,instructions,status',conversation_id:`eq.${conversation.id}`,status:'eq.published',limit:'1'}),
    communityRest('testimonies',{select:'id,body,created_at',conversation_id:`eq.${conversation.id}`,status:'eq.published',order:'created_at.desc',limit:'20'})
  ]);
  COMMUNITY={conversation,sections:Array.isArray(sections)?sections:[],mission:Array.isArray(missions)?missions[0]||null:null,testimonies:Array.isArray(testimonies)?testimonies:[]};
  return COMMUNITY;
}
async function communityRefreshMissionState(session=null){
  if(!COMMUNITY?.mission)return;
  const btn=$('completeCommunityMission');
  session=session||communityReadSession();
  if(!communitySessionValid(session)){btn.disabled=false;btn.textContent='Registrar que realicé la misión';return}
  try{
    const rows=await communityRest('mission_actions',{select:'id,completed_at',mission_id:`eq.${COMMUNITY.mission.id}`,user_id:`eq.${session.user_id}`,limit:'1'},{token:session.access_token});
    if(Array.isArray(rows)&&rows.length){btn.disabled=true;btn.textContent='Huella registrada ✓';$('communityMissionStatus').textContent='La comunidad conserva sólo la realización de esta misión, no tu reflexión privada.'}
  }catch(e){}
}
function communityAuthErrorMessage(err){
  const text=String(err?.message||'');
  if(err?.status===429||err?.code==='submission_limit_reached')return 'Alcanzaste el límite temporal de aportes. La conversación sigue disponible para leer y reflexionar.';
  if(err?.status===422&&err?.code==='invalid_length')return 'El aporte debe respetar la extensión solicitada antes de enviarse.';
  if(err?.code==='already_reported')return 'Ya enviaste un reporte sobre este testimonio.';
  if(err?.code==='report_limit_reached')return 'Alcanzaste temporalmente el límite de reportes. Intenta más tarde.';
  if(err?.code==='testimony_not_reportable')return 'Este testimonio ya no está disponible para reportar.';
  if(err?.code==='captcha_cancelled')return 'No se creó ninguna identidad. Puedes seguir leyendo y conservar tus notas privadas en este dispositivo.';
  if(err?.code==='captcha_config_error'||err?.code==='captcha_ui_error'||/captcha|turnstile/i.test(text))return 'La verificación humana todavía no está disponible correctamente. No se envió información.';
  if(err?.status===401||err?.code==='invalid_session'||err?.code==='authentication_required')return 'La sesión anónima no está disponible. Tu lectura y tus notas privadas permanecen en este dispositivo.';
  if(err?.status===422||/anonymous.*disabled|anonymous sign-ins are disabled/i.test(text))return 'La lectura comunitaria está activa, pero falta habilitar Anonymous Sign-Ins en Supabase para registrar aportes.';
  return 'No pudimos completar el envío en este momento. Tu lectura y tus notas locales siguen disponibles.';
}
async function communityCompleteMission(){
  if(!COMMUNITY?.mission)return;
  const btn=$('completeCommunityMission'),status=$('communityMissionStatus');btn.disabled=true;status.textContent='Protegiendo tu huella…';
  try{
    const s=await communityEnsureSession();
    const existing=await communityRest('mission_actions',{select:'id',mission_id:`eq.${COMMUNITY.mission.id}`,user_id:`eq.${s.user_id}`,limit:'1'},{token:s.access_token});
    if(!(Array.isArray(existing)&&existing.length)){await communityRest('mission_actions',{}, {method:'POST',token:s.access_token,prefer:'return=representation',body:{mission_id:COMMUNITY.mission.id,user_id:s.user_id,reflection:null}})}
    btn.textContent='Huella registrada ✓';btn.disabled=true;status.textContent='Guardamos sólo que realizaste la misión. Tu reflexión privada no fue enviada.';$('communityAuthState').textContent='Identidad anónima protegida por RLS · sin nombre ni correo.';
  }catch(err){btn.disabled=false;status.textContent=communityAuthErrorMessage(err)}
}
function communityOpenReport(testimonyId){
  COMMUNITY_REPORT_TARGET=testimonyId;
  $('communityReportForm').reset();
  $('communityReportStatus').textContent='';
  $('communityReportDialog').showModal();
}
async function communitySubmitReport(event){
  event.preventDefault();
  const status=$('communityReportStatus'),btn=$('communityReportSubmit');
  const reason=$('communityReportReason').value,details=$('communityReportDetails').value.trim();
  if(!COMMUNITY_REPORT_TARGET){status.textContent='No se encontró el testimonio.';return}
  if(!reason){status.textContent='Selecciona un motivo.';return}
  btn.disabled=true;status.textContent='Enviando reporte de forma privada…';
  try{
    const session=await communityEnsureSession();
    const {reportFunction}=communityConfig();
    await communityFunction(reportFunction,{testimony_id:COMMUNITY_REPORT_TARGET,reason,details:details||null},session.access_token);
    localStorage.setItem(`derej:community:reported:${COMMUNITY_REPORT_TARGET}`,'1');
    status.textContent='Reporte recibido ✓ Un moderador revisará el contexto.';
    setTimeout(()=>{if($('communityReportDialog').open)$('communityReportDialog').close();communityRenderTestimonies(COMMUNITY.testimonies)},500);
  }catch(err){status.textContent=communityAuthErrorMessage(err)}finally{btn.disabled=false}
}
async function communitySubmitTestimony(){
  const body=$('communityTestimonyBody').value.trim(),consent=$('communityTestimonyConsent').checked,status=$('communityTestimonyStatus'),btn=$('submitCommunityTestimony');
  if(body.length<10){status.textContent='Escribe al menos una frase breve antes de enviar.';return}
  if(body.length>1500){status.textContent='El testimonio no puede superar 1.500 caracteres.';return}
  if(!consent){status.textContent='Necesitamos tu consentimiento explícito antes de sacar este texto del dispositivo.';return}
  btn.disabled=true;status.textContent='Escudo Comunitario · revisando el envío…';
  try{
    const s=await communityEnsureSession();
    const {submitFunction}=communityConfig();
    await communityFunction(submitFunction,{conversation_id:COMMUNITY.conversation.id,body,consent:true},s.access_token);
    $('communityTestimonyBody').value='';$('communityTestimonyConsent').checked=false;status.textContent='Testimonio recibido ✓ Quedó pendiente de revisión humana; nunca se publica automáticamente.';$('communityAuthState').textContent='Identidad anónima protegida · el envío pasó por Escudo Comunitario.';
  }catch(err){status.textContent=communityAuthErrorMessage(err)}finally{btn.disabled=false}
}
async function communityInit(){
  if(communityInitialized){await communityRefreshMissionState();return}
  if(communityInitPromise)return communityInitPromise;
  communityInitPromise=(async()=>{
    try{
      const data=await communityLoadData();
      $('communityTitle').textContent=data.conversation.title;$('communitySubtitle').textContent=data.conversation.subtitle||'';$('communityExcerpt').textContent=data.conversation.excerpt||'';communityRenderSections(data.sections);communityRenderMission(data.mission);communityRenderTestimonies(data.testimonies);
      $('communityStatus').textContent='Comunidad disponible · participación protegida';
      const anon=await communityCheckAnonymousAvailability();
      $('communityAuthState').textContent=anon===true?'Participación anónima disponible · se activa sólo cuando tú decides aportar.':anon===false?'Lectura pública activa · Anonymous Sign-Ins aún debe habilitarse para participar.':'Lectura pública activa · la capacidad anónima se comprobará al participar.';
      await communityRefreshMissionState();communityInitialized=true;
    }catch(err){$('communityStatus').textContent='Comunidad necesita conexión';$('communitySections').replaceChildren(el('section','communitySection communityError',`No se pudo cargar Comunidad: ${err.message}`));communityInitPromise=null}
  })();
  return communityInitPromise;
}
$('completeCommunityMission').addEventListener('click',communityCompleteMission);
$('submitCommunityTestimony').addEventListener('click',communitySubmitTestimony);
$('communityReportForm').addEventListener('submit',communitySubmitReport);
$('communityReportCancel').addEventListener('click',()=>{COMMUNITY_REPORT_TARGET=null;$('communityReportDialog').close()});
$('communityReportDialog').addEventListener('close',()=>{COMMUNITY_REPORT_TARGET=null;$('communityReportStatus').textContent=''})
$('communityCaptchaCancel').addEventListener('click',communityCaptchaCancel);
$('communityCaptchaDialog').addEventListener('cancel',(event)=>{event.preventDefault();communityCaptchaCancel()});
$('communityCaptchaDialog').addEventListener('close',()=>{
  const status=$('communityCaptchaStatus');if(status)status.textContent='Preparando verificación…';
  const mount=$('communityTurnstileWidget');if(mount)mount.replaceChildren();
  COMMUNITY_CAPTCHA_WIDGET_ID=null;
});

/* Frutos · bitácora anónima · v1.8 */
let FRUITS_INITIALIZED=false;
let FRUIT_CONTEXT=null;
function fruitDefaultContext(type='camino'){
  if(type==='camino'&&CAMINO){const wi=caminoFindWeek(),di=caminoTodayIndex(wi),w=CAMINO.weeks[wi],d=w.days[di];return{type:'camino',ref:d[0],title:`${w.title} · ${d[2]}`}}
  const map={shabat:{type:'shabat',ref:'shabat',title:'Shabat'},moed:{type:'moed',ref:'moed',title:'Moed · calendario'},adam_adama:{type:'adam_adama',ref:'adam-adama',title:'ADAM–ADAMÁ'},community:{type:'community',ref:'shabat-para-la-tierra',title:'Comunidad · Shabat para la Tierra'},other:{type:'other',ref:'otro',title:'Otro aprendizaje Dérej'}};
  return map[type]||map.other;
}
function fruitSetContext(ctx=null){FRUIT_CONTEXT=ctx||FRUIT_CONTEXT;const select=$('fruitOrigin');if(!select)return;const type=FRUIT_CONTEXT?.type||select.value||'camino';select.value=type;const meta=FRUIT_CONTEXT&&FRUIT_CONTEXT.type===type?FRUIT_CONTEXT:fruitDefaultContext(type);$('fruitOriginHint').textContent=`Se vinculará con: ${meta.title}`}
function fruitOpenFromCurrent(){const w=CAMINO?.weeks?.[caminoWeekIndex],d=w?.days?.[caminoDayIndex];FRUIT_CONTEXT=d?{type:'camino',ref:d[0],title:`${w.title} · ${d[2]}`} : fruitDefaultContext('camino');showRoute('frutos')}
function fruitRender(items){const box=$('fruitList');if(!box)return;box.replaceChildren();if(!items.length){box.appendChild(el('div','fruitEmpty','La bitácora todavía está esperando sus primeros frutos aprobados. Cuando aparezcan, serán memoria compartida, no puntuación.'));return}items.forEach(f=>{const card=el('article','fruitCard');const head=el('div','fruitCardHead');addText(head,'div','eyebrow',f.origin_title||'Dérej');if(f.experienced_on)addText(head,'time','small',new Intl.DateTimeFormat('es-CL',{dateStyle:'medium'}).format(new Date(`${f.experienced_on}T12:00:00`)));card.appendChild(head);addText(card,'h2','',f.public_title||'Un fruto del camino');addText(card,'p','fruitBody',f.public_body);if(Array.isArray(f.tags)&&f.tags.length){const chips=el('div','fruitTags');f.tags.forEach(t=>chips.appendChild(el('span','fruitTag',t)));card.appendChild(chips)}box.appendChild(card)})}
async function fruitLoad(){try{const items=await communityRest('fruits',{select:'id,origin_type,origin_ref,origin_title,experienced_on,public_title,public_body,tags,published_at',status:'eq.published',order:'published_at.desc',limit:'50'});fruitRender(Array.isArray(items)?items:[])}catch(e){$('fruitList').replaceChildren(el('div','fruitEmpty','No fue posible cargar la bitácora en este momento.'))}}
async function fruitInit(){if(!CAMINO){try{await caminoLoad()}catch(e){}}if(!$('fruitDate').value)$('fruitDate').value=localDateKey();fruitSetContext(FRUIT_CONTEXT);await fruitLoad();FRUITS_INITIALIZED=true}
async function fruitSubmit(){const body=$('fruitBody').value.trim(),consent=$('fruitConsent').checked,status=$('fruitSubmitStatus'),btn=$('submitFruit');if(body.length<20){status.textContent='Cuenta al menos una experiencia breve y concreta (20 caracteres o más).';return}if(body.length>1500){status.textContent='El fruto no puede superar 1.500 caracteres.';return}if(!consent){status.textContent='Necesitamos tu autorización antes de sacar este relato del dispositivo.';return}const type=$('fruitOrigin').value,ctx=FRUIT_CONTEXT&&FRUIT_CONTEXT.type===type?FRUIT_CONTEXT:fruitDefaultContext(type);btn.disabled=true;status.textContent='Escudo Comunitario · preparando tu fruto para revisión…';try{const s=await communityEnsureSession(),{fruitSubmitFunction}=communityConfig();await communityFunction(fruitSubmitFunction,{origin_type:type,origin_ref:ctx.ref,origin_title:ctx.title,experienced_on:$('fruitDate').value||null,body,consent:true},s.access_token);$('fruitBody').value='';$('fruitConsent').checked=false;status.textContent='Fruto recibido ✓ Quedó pendiente de revisión editorial. Si se publica, será anónimo y podrá ser abreviado sin cambiar su sentido.';FRUIT_CONTEXT=null}catch(err){status.textContent=communityAuthErrorMessage(err)}finally{btn.disabled=false}}
$('fruitOrigin')?.addEventListener('change',()=>{FRUIT_CONTEXT=null;fruitSetContext()});
document.querySelectorAll('[data-route="frutos"]').forEach(b=>b.addEventListener('click',()=>{FRUIT_CONTEXT=null}));
$('submitFruit')?.addEventListener('click',fruitSubmit);
$('rootShareFruit')?.addEventListener('click',fruitOpenFromCurrent);
$('portalCaminoToday')?.addEventListener('click',()=>{const n=$('caminoHero');if(n)n.scrollIntoView({behavior:'smooth',block:'start'})});

/* Radio Dérej · migrado desde RC2 */
let RADIO_TRACKS=[];
let radioIndex=0;
let radioInitialized=false;
let radioInitPromise=null;
const radioAudio=$('radioAudio');

function radioFmt(sec){
  if(!Number.isFinite(sec)) return '0:00';
  sec=Math.max(0,Math.round(sec));
  return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
}
function radioResolveUrl(t){
  if(t?.url) return t.url;
  const cfg=window.DEREJ_CONFIG||{};
  const base=(cfg.audioBase||'').replace(/\/$/,'');
  return base&&t?.path?`${base}/${String(t.path).replace(/^\//,'')}`:'';
}
function radioRenderList(){
  const box=$('radioTrackList');
  box.replaceChildren();
  RADIO_TRACKS.forEach((t,i)=>{
    const b=el('button',`radioTrack${i===radioIndex?' on':''}`);
    b.type='button';
    b.dataset.radioIndex=String(i);
    const num=el('span','radioTrackNum',String(i+1));
    const copy=el('span','radioTrackCopy');
    addText(copy,'b','',t.title);
    addText(copy,'span','small',t.collection||'Radio Dérej · Meditación');
    const dur=el('span','radioTrackDur',t.duration||'');
    b.append(num,copy,dur);
    b.addEventListener('click',()=>radioLoad(i,true));
    box.appendChild(b);
  });
}
function radioArtwork(track){
  const cfg=window.DEREJ_CONFIG||{};
  return cfg.artworkUrl||track?.artwork||'radio-meditacion.png';
}
function radioSyncMediaSession(track){
  if(!('mediaSession' in navigator)||!track) return;
  try{
    navigator.mediaSession.metadata=new MediaMetadata({
      title:track.title,
      artist:track.artist||'Danygrafiko',
      album:track.collection||'Radio Dérej · Meditación',
      artwork:[{src:radioArtwork(track),sizes:'1254x1254',type:'image/png'}]
    });
  }catch(e){}
}
function radioLoad(i,autoplay=false){
  if(!RADIO_TRACKS.length) return;
  radioIndex=(i+RADIO_TRACKS.length)%RADIO_TRACKS.length;
  localStorage.setItem('derej:radio:index',String(radioIndex));
  const t=RADIO_TRACKS[radioIndex];
  const url=radioResolveUrl(t);
  $('radioTitle').textContent=t.title;
  $('radioSeek').value=0;
  $('radioCurrent').textContent='0:00';
  $('radioDuration').textContent=t.duration||'0:00';
  document.querySelectorAll('.radioTrack').forEach((b,j)=>b.classList.toggle('on',j===radioIndex));
  if(!url){
    radioAudio.removeAttribute('src');
    radioAudio.load();
    $('radioStatus').textContent='Audio pendiente de conexión al almacenamiento de producción.';
    $('radioPlay').disabled=true;
    return;
  }
  $('radioPlay').disabled=false;
  radioAudio.src=url;
  $('radioStatus').textContent='Lista para escuchar.';
  radioSyncMediaSession(t);
  if(autoplay) radioAudio.play().catch(()=>{$('radioStatus').textContent='Toca Reproducir para iniciar el audio.'});
}
function radioUpdateButton(){
  $('radioPlay').textContent=radioAudio.paused?'▶ Reproducir':'⏸ Pausar';
  $('radioStatus').textContent=radioAudio.paused?'En pausa.':'Reproduciendo dentro de Dérej.';
  if('mediaSession' in navigator){try{navigator.mediaSession.playbackState=radioAudio.paused?'paused':'playing'}catch(e){}}
}
function radioSetPositionState(){
  if(!('mediaSession' in navigator)||!Number.isFinite(radioAudio.duration)||radioAudio.duration<=0) return;
  try{navigator.mediaSession.setPositionState({duration:radioAudio.duration,playbackRate:radioAudio.playbackRate||1,position:Math.min(radioAudio.currentTime,radioAudio.duration)})}catch(e){}
}
async function radioInit(){
  if(radioInitialized) return;
  if(radioInitPromise) return radioInitPromise;
  radioInitPromise=(async()=>{
    try{
      const cfg=window.DEREJ_CONFIG||{};
      const catalogUrl=cfg.catalogUrl||'radio.json';
      const res=await fetch(catalogUrl,{cache:'no-store'});
      if(!res.ok) throw new Error(`Catálogo ${res.status}`);
      const data=await res.json();
      RADIO_TRACKS=Array.isArray(data.tracks)?data.tracks:[];const cover=$('radioNativeCover');if(cover){cover.src=radioArtwork(RADIO_TRACKS[0]);cover.onerror=()=>{cover.onerror=null;cover.src='icon-512.png'}};
      if(!RADIO_TRACKS.length) throw new Error('Catálogo vacío');
      const saved=Number(localStorage.getItem('derej:radio:index'));
      radioIndex=Number.isInteger(saved)&&saved>=0&&saved<RADIO_TRACKS.length?saved:0;
      radioRenderList();
      radioLoad(radioIndex,false);
      radioInitialized=true;
    }catch(e){
      $('radioTrackList').replaceChildren(el('div','memoryCard',''));
      $('radioTrackList').firstChild.append(el('b','', 'Radio Dérej está en preparación.'),el('p','small','El catálogo musical no pudo cargarse. El resto de Dérej continúa disponible.'));
      $('radioStatus').textContent='Catálogo temporalmente no disponible.';
      $('radioPlay').disabled=true;
      radioInitPromise=null;
    }
  })();
  return radioInitPromise;
}

$('radioPlay').addEventListener('click',()=>{
  if(!radioAudio.src) return;
  if(radioAudio.paused) radioAudio.play().catch(()=>{$('radioStatus').textContent='Toca nuevamente Reproducir para iniciar el audio.'});
  else radioAudio.pause();
});
$('radioPrev').addEventListener('click',()=>radioLoad(radioIndex-1,true));
$('radioNext').addEventListener('click',()=>radioLoad(radioIndex+1,true));
radioAudio.addEventListener('play',radioUpdateButton);
radioAudio.addEventListener('pause',radioUpdateButton);
radioAudio.addEventListener('loadedmetadata',()=>{$('radioDuration').textContent=radioFmt(radioAudio.duration);radioSetPositionState()});
radioAudio.addEventListener('timeupdate',()=>{
  $('radioCurrent').textContent=radioFmt(radioAudio.currentTime);
  if(Number.isFinite(radioAudio.duration)&&radioAudio.duration>0)$('radioSeek').value=String(Math.round((radioAudio.currentTime/radioAudio.duration)*1000));
  if(Math.round(radioAudio.currentTime)%5===0) radioSetPositionState();
});
$('radioSeek').addEventListener('input',()=>{if(Number.isFinite(radioAudio.duration))radioAudio.currentTime=(Number($('radioSeek').value)/1000)*radioAudio.duration});
radioAudio.addEventListener('ended',()=>radioLoad(radioIndex+1,true));
radioAudio.addEventListener('error',()=>{$('radioStatus').textContent='No se pudo reproducir esta pista. Puedes intentar la siguiente.'});
if('mediaSession' in navigator){
  try{
    navigator.mediaSession.setActionHandler('play',()=>radioAudio.play());
    navigator.mediaSession.setActionHandler('pause',()=>radioAudio.pause());
    navigator.mediaSession.setActionHandler('previoustrack',()=>radioLoad(radioIndex-1,true));
    navigator.mediaSession.setActionHandler('nexttrack',()=>radioLoad(radioIndex+1,true));
    navigator.mediaSession.setActionHandler('seekbackward',d=>{radioAudio.currentTime=Math.max(0,radioAudio.currentTime-(d.seekOffset||10))});
    navigator.mediaSession.setActionHandler('seekforward',d=>{radioAudio.currentTime=Math.min(radioAudio.duration||Infinity,radioAudio.currentTime+(d.seekOffset||10))});
    navigator.mediaSession.setActionHandler('seekto',d=>{if(Number.isFinite(d.seekTime))radioAudio.currentTime=d.seekTime});
  }catch(e){}
}

function getMasterActions(){const found=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key?.startsWith('derej:content:')||!key.endsWith(':actions'))continue;try{const arr=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(arr))found.push(...arr)}catch(e){}}const byKey=new Map();found.forEach(a=>{const k=`${a.content_id||''}:${a.block_id||''}`;const prev=byKey.get(k);if(!prev||String(a.at)>String(prev.at))byKey.set(k,a)});return [...byKey.values()].sort((a,b)=>String(b.at).localeCompare(String(a.at)))}
function getPrivateReflections(){const found=[];for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(!key?.startsWith('derej:community:private:'))continue;const body=(localStorage.getItem(key)||'').trim();if(body)found.push({key,body})}return found}
function renderLocalMemory(){const actions=getMasterActions(),reflections=getPrivateReflections(),done=caminoDoneState();const footprints=Object.entries(done).map(([date,at])=>({date,at})).sort((a,b)=>String(b.at).localeCompare(String(a.at)));$('localActionsCount').textContent=String(actions.length+footprints.length+reflections.length);const box=$('localActionsList');box.replaceChildren();if(!actions.length&&!footprints.length&&!reflections.length){box.appendChild(el('p','empty','Todavía no hay huellas guardadas en este dispositivo.'));return}footprints.slice(0,20).forEach(f=>{const item=el('div','memoryItem');addText(item,'b','',`Camino · ${new Intl.DateTimeFormat('es-CL',{dateStyle:'medium'}).format(new Date(`${f.date}T12:00:00`))}`);addText(item,'span','small','Encuentro vivido · memoria local');box.appendChild(item)});actions.slice(0,20).forEach(a=>{const item=el('div','memoryItem');addText(item,'b','',a.block_title||a.block_id);addText(item,'span','small',`${a.content_title||a.content_id} · ${new Intl.DateTimeFormat('es-CL',{dateStyle:'medium'}).format(new Date(a.at))}${a.selection?` · ${a.selection}`:''}`);box.appendChild(item)});reflections.slice(0,10).forEach(r=>{const item=el('div','memoryItem reflectionMemory');addText(item,'b','','Reflexión privada');addText(item,'span','small',r.body.length>140?`${r.body.slice(0,137)}…`:r.body);box.appendChild(item)})}
document.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>showRoute(b.dataset.route)));

/* v1.8 · orientación, puertas y primera visita */
const WELCOME_KEY='derej:onboarding:v1.8';
const welcomeDialog=$('welcomeDialog');
function closeWelcome(mark=true){try{welcomeDialog?.close()}catch(e){}if(mark)localStorage.setItem(WELCOME_KEY,'1')}
$('helpBtn')?.addEventListener('click',()=>showRoute('guia'));
$('welcomeGuide')?.addEventListener('click',()=>{closeWelcome();showRoute('guia')});
$('welcomeEnter')?.addEventListener('click',()=>{closeWelcome();showRoute('camino')});
$('welcomeCloseX')?.addEventListener('click',()=>closeWelcome());
welcomeDialog?.addEventListener('cancel',event=>{event.preventDefault();closeWelcome()});
function maybeWelcome(){if(!welcomeDialog)return;if(localStorage.getItem(WELCOME_KEY)==='1')return;if(location.hash&&location.hash!=='#camino')return;setTimeout(()=>{try{welcomeDialog.showModal()}catch(e){}},450)};
document.querySelectorAll('[data-apartado]').forEach(b=>b.addEventListener('click',()=>openApartado(b.dataset.apartado)));
$('apartadoBack')?.addEventListener('click',()=>showRoute(APARTADO_ORIGIN));
document.querySelectorAll('[data-action="placeholder"]').forEach(b=>b.addEventListener('click',()=>{$('placeholderTitle').textContent=b.dataset.title||'Módulo';$('placeholderDialog').showModal()}));
$('fontBtn').addEventListener('click',()=>{const vals=[1,1.12,1.25],current=Number(localStorage.getItem('derej:master:font')||1),i=vals.indexOf(current),next=vals[(i+1)%vals.length];localStorage.setItem('derej:master:font',String(next));applyFont(next)});
$('clearLocalMemory').addEventListener('click',()=>{const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if((k?.startsWith('derej:content:')&&k.endsWith(':actions'))||k?.startsWith('derej:community:private:'))keys.push(k)}keys.forEach(k=>localStorage.removeItem(k));localStorage.removeItem('derej:camino:done');renderLocalMemory();caminoRenderHome?.()});
window.addEventListener('popstate',()=>showRoute(location.hash.slice(1)||'camino',{replace:true}));function applyFont(v){document.documentElement.style.setProperty('--scale',v);$('fontBtn').textContent=v===1?'Aa':v<1.2?'Aa+':'Aa++'}
syncGlobalDate();applyFont(Number(localStorage.getItem('derej:master:font')||1));showRoute(location.hash.slice(1)||'camino',{replace:true});maybeWelcome();

/* PWA / Release Shell v0.7 */
let deferredInstallPrompt=null;
let refreshingFromServiceWorker=false;
const installCard=$('installCard');
const installBtn=$('installAppBtn');
const installHint=$('installHint');
const installDialog=$('installDialog');
const updateBar=$('updateBar');
const applyUpdateBtn=$('applyUpdate');
let waitingServiceWorker=null;

function isStandalone(){
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone===true;
}
function syncInstallUI(){
  if(!installCard||!installBtn) return;
  if(isStandalone()){
    installCard.hidden=true;
    return;
  }
  installCard.hidden=false;
  if(deferredInstallPrompt){
    installBtn.textContent='Instalar Dérej';
    installHint.textContent='Tu navegador permite instalar Dérej como aplicación.';
  }else{
    installBtn.textContent='Cómo instalar';
    installHint.textContent='Puedes agregar Dérej a tu pantalla de inicio desde las opciones del navegador.';
  }
}
window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  deferredInstallPrompt=event;
  syncInstallUI();
});
window.addEventListener('appinstalled',()=>{
  deferredInstallPrompt=null;
  syncInstallUI();
});
installBtn?.addEventListener('click',async()=>{
  if(deferredInstallPrompt){
    const prompt=deferredInstallPrompt;
    deferredInstallPrompt=null;
    await prompt.prompt();
    try{await prompt.userChoice}catch(e){}
    syncInstallUI();
    return;
  }
  const isiOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  if($('installDialogText')) $('installDialogText').textContent=isiOS
    ? 'En iPhone o iPad, abre Compartir y elige “Agregar a pantalla de inicio”.'
    : 'Abre el menú del navegador y elige “Instalar app” o “Agregar a pantalla de inicio”, según la opción disponible.';
  installDialog?.showModal();
});
syncInstallUI();

function showUpdate(registration){
  waitingServiceWorker=registration.waiting;
  if(updateBar&&waitingServiceWorker) updateBar.hidden=false;
}
applyUpdateBtn?.addEventListener('click',()=>{
  if(waitingServiceWorker) waitingServiceWorker.postMessage({type:'SKIP_WAITING'});
});
if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    try{
      const registration=await navigator.serviceWorker.register('./sw.js',{scope:'./'});
      if(registration.waiting) showUpdate(registration);
      registration.addEventListener('updatefound',()=>{
        const installing=registration.installing;
        if(!installing) return;
        installing.addEventListener('statechange',()=>{
          if(installing.state==='installed'&&navigator.serviceWorker.controller) showUpdate(registration);
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange',()=>{
        if(refreshingFromServiceWorker) return;
        refreshingFromServiceWorker=true;
        location.reload();
      });
    }catch(e){
      console.warn('Dérej PWA: no se pudo registrar el service worker.',e);
    }
  });
}
