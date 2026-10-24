/* Árbol de la Vida · Integración local sin transmisión de reflexiones. */
(()=>{
 'use strict';
 const D=window.DEREJ_ARBOL,root=document.getElementById('arbolRoot'),screen=root?.closest('[data-screen]');
 if(!root||!screen||!D?.sefirot)return;
 const KEY='derej.arbol.v1',byId=id=>D.sefirot.find(s=>s.id===id);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const button=(action,label,alt=false)=>`<button type="button" class="avButton${alt?' avAlt':''}" data-av-action="${action}">${label}</button>`;
 let selected='jesed',mode='learn',duration=5,chosenRoute='dar',returnPoint=null,run=null,interval=null,introSeen=false,storageOK=true;
 let notes={},drafts={},saveMessage='';
 try{
  const saved=JSON.parse(localStorage.getItem(KEY)||'null');
  if(saved&&typeof saved==='object'){
   if(byId(saved.selected))selected=saved.selected;
   if([3,5,8].includes(saved.duration))duration=saved.duration;
   introSeen=saved.introSeen===true;
   if(saved.notes&&typeof saved.notes==='object')for(const s of D.sefirot){const n=saved.notes[s.id];if(n&&typeof n==='object')notes[s.id]={idea:typeof n.idea==='string'?n.idea.slice(0,6000):'',action:typeof n.action==='string'?n.action.slice(0,6000):''};}
  }
 }catch{storageOK=false;}
 function persist(){try{localStorage.setItem(KEY,JSON.stringify({version:1,selected,duration,introSeen,notes}));storageOK=true;return true;}catch{storageOK=false;return false;}}
 const links=ids=>`<ul>${D.sources.filter(s=>!ids||ids.includes(s.id)).filter(s=>s.lang==='es'&&s.url.startsWith('https://')).map(s=>`<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer" hreflang="es">${esc(s.label)} ↗</a></li>`).join('')}</ul>`;
 const connections=[['keter','jojma'],['keter','bina'],['jojma','bina'],['jojma','jesed'],['bina','guevura'],['jesed','guevura'],['jesed','tiferet'],['guevura','tiferet'],['tiferet','netzaj'],['tiferet','hod'],['netzaj','hod'],['netzaj','iesod'],['hod','iesod'],['iesod','maljut']];
 function map(){
  const routeIds=D.routes.find(r=>r.id===chosenRoute)?.ids||[];
  return `<div class="avMapHead"><span>DIEZ SEFIROT</span><button type="button" class="avText" data-av-action="guide">Cómo leer el árbol ↓</button></div><div class="avTree"><svg viewBox="0 0 470 640" aria-hidden="true" focusable="false">${connections.map(([a,b])=>{const p=byId(a),q=byId(b);return `<path class="avLine ${[a,b].includes(selected)?'on':''}" d="M ${p.x*4.7} ${p.y*6.4} L ${q.x*4.7} ${q.y*6.4}"/>`;}).join('')}</svg>${D.sefirot.map(s=>`<button type="button" class="avNode ${routeIds.includes(s.id)?'inRoute':''}" style="left:${s.x}%;top:${s.y}%" data-av-node="${s.id}" aria-pressed="${s.id===selected}" aria-label="${esc(s.name+' · '+s.meaning+' · '+s.practice)}"><span lang="he" dir="rtl">${s.he}</span><b>${s.name}</b><small>${s.meaning}</small></button>`).join('')}</div><p class="avMapNote">Toca una sefirá para acercarte.<br>El árbol muestra relaciones; cada práctica abre una pregunta.</p><div class="avRoutes" role="group" aria-label="Recorridos sugeridos por Dérej">${D.routes.map(r=>`<button type="button" class="avRoute" data-av-route="${r.id}" aria-pressed="${r.id===chosenRoute}">${r.title}<small>${r.text}</small></button>`).join('')}</div><p class="avNote">Los recorridos, las líneas de enlace y el color de esta visualización son una selección pedagógica Dérej. Puedes explorar las diez sefirot en cualquier orden.</p>`;
 }
 function render(){
  root.innerHTML=`<div class="avTop"><button type="button" class="avText" data-av-action="back">← ${returnPoint?.name==='camino'?'Volver al estudio':returnPoint?.name==='pozo'?'Volver al Pozo':returnPoint?.name==='nombres'?'Nombres y presencia':'Patio'}</button><span class="avEyebrow">DÉREJ · CULTIVAR EL INTERIOR</span></div><header class="avHero"><span class="avEyebrow">ESTUDIO · CONTEMPLACIÓN · VIDA COTIDIANA</span><h1 id="arbolTitle">Árbol de la Vida</h1><p>Un espacio para comprender las sefirot, hacer silencio y llevar una intención al mundo.</p></header>${!introSeen?`<section class="avWelcome"><h2>Una primera orientación</h2><p>En la Cabalá judía, las sefirot expresan modalidades de manifestación divina. La plegaria se dirige al Creador. Aquí encontrarás fuentes de la tradición y prácticas originales de Dérej, abiertas a distintas trayectorias.</p><p>Comienza por «Dar y cuidar» o explora una sefirá. Puedes leer la guía completa al pie del árbol.</p>${button('intro','Comenzar a explorar →')}</section>`:''}<div class="avLayout"><div class="avMap" id="avMap">${map()}</div><article class="avCard" id="avPanel" aria-labelledby="avTitle"></article></div><details class="avDetails" id="avGuide"><summary>Cómo leer este Árbol de la Vida</summary><p>Este mapa sigue el esquema de diez sefirot que incluye Kéter: Kéter, Jojmá, Biná, Jésed, Guevurá, Tiféret, Nétzaj, Hod, Iesod y Maljut. Se conservan las posiciones relativas de tres ejes: Biná, Guevurá y Hod a la izquierda de la pantalla; Jojmá, Jésed y Nétzaj a la derecha; Kéter, Tiféret, Iesod y Maljut en el centro.</p><p>Las sefirot se estudian en la tradición como modos de manifestación del Dios único. El dibujo ayuda a estudiar relaciones y no representa un cuerpo ni una imagen del Creador.</p><h3>¿Y Dáat?</h3><p>Dáat significa conocimiento. En ciertas enumeraciones se cuenta cuando Kéter no se incluye. Por eso aparece aquí en una nota y no como una esfera adicional. En el Tania, Jojmá, Biná y Dáat se estudian como facultades intelectuales relacionadas con las cualidades emocionales.</p><h3>Estudiar, contemplar, actuar</h3><p>La enseñanza tradicional se identifica como síntesis y conserva sus referencias. Las imágenes, preguntas, plegarias y acciones son elaboraciones originales Dérej. La contemplación propone detenerse en una idea y examinar cómo vivirla. Puedes mantener los ojos abiertos, respirar a tu ritmo y hacer silencio en lugar de imaginar.</p><p>La iluminación de una esfera señala tu selección. El orden de los recorridos responde a una decisión editorial. Puedes volver y detenerte sin completar una secuencia.</p>${links(['mapa','tania','daat'])}</details><details class="avDetails"><summary>Fuentes en español y criterio editorial</summary><p>Las definiciones y el esquema se apoyan en Gal Einai. Para el vínculo entre reflexión y cualidades del alma se consulta el Tania, capítulo 3. La guía de Simon Jacobson para el Ómer ofrece un antecedente de trabajo práctico con las siete cualidades. Estas sesiones breves son una propuesta propia de Dérej para todo el año y no constituyen la cuenta ritual del Ómer.</p>${links()}<p>El color y los enlaces del gráfico sirven a esta interfaz: no se asignan letras, planetas o correspondencias a los senderos. Las prácticas se ofrecen sin puntuaciones ni niveles espirituales.</p></details><p class="avNote">La pantalla abre una puerta. El cuidado se vuelve vida fuera de ella.</p><div class="avHidden" id="avStatus" role="status" aria-live="polite"></div>`;
  panel();
 }
 function modes(){return `<div class="avModes" role="group" aria-label="Maneras de acercarse">${[['learn','Aprender'],['practice','Contemplar'],['carry','Llevar a la vida']].map(([id,label])=>`<button type="button" data-av-mode="${id}" aria-pressed="${mode===id}">${label}</button>`).join('')}</div>`;}
 function nextInRoute(){const r=D.routes.find(r=>r.id===chosenRoute),i=r?.ids.indexOf(selected);return i>=0?r.ids[i+1]:null;}
 function panel(focus=false){
  const s=byId(selected),p=root.querySelector('#avPanel');if(!p)return;
  const next=nextInRoute(),header=`<button type="button" class="avBackTree" data-av-action="map">↑ Volver al árbol</button><span class="avEyebrow">${s.meaning}</span><h2 id="avTitle" tabindex="-1">${s.name} <span lang="he" dir="rtl">${s.he}</span></h2><div class="avSubtitle">${s.practice}</div>${modes()}`;
  let body='';
  if(mode==='learn')body=`<span class="avEyebrow">TRADICIÓN · SÍNTESIS</span><p>${s.tradition}</p><span class="avEyebrow">LECTURA DÉREJ</span><p>${s.reflection}</p><div class="avQuote"><p>${s.question}</p></div><div class="avExample"><span class="avEyebrow">UNA ESCENA COTIDIANA · DÉREJ</span><p>${s.example}</p></div><details><summary>Fuentes de esta lectura</summary>${links(s.refs)}</details><div class="avActions">${button('prepare','Contemplar esta idea →')}</div>`;
  else if(mode==='practice'){
   if(run)body=practiceBody(s);
   else body=`<span class="avEyebrow">CONTEMPLACIÓN GUIADA · DÉREJ</span><h3>Un momento con ${s.name}</h3><p>Lee con calma, detente en una imagen o una idea y encuentra una acción posible. La guía escrita recorre cinco momentos: llegar, visualizar, contemplar, dirigirte al Creador y volver a la vida.</p><label for="avDuration">Tiempo total de la práctica</label><select id="avDuration">${[3,5,8].map(n=>`<option value="${n}" ${duration===n?'selected':''}>${n} minutos</option>`).join('')}</select><p class="avNote">El tiempo orienta la pausa. Puedes avanzar, retroceder o detenerte cuando lo necesites. Mantén tu respiración natural; imaginar es opcional.</p><div class="avActions">${button('start','Comenzar la práctica')}</div>`;
  }else{
   const n=drafts[selected]||notes[selected]||{idea:'',action:''};
   body=`<span class="avEyebrow">PRÁCTICA ORIGINAL · DÉREJ</span><h3>Una acción posible</h3><p>${s.action}</p><div class="avExample"><span class="avEyebrow">CUIDAR LA MEDIDA</span><p>${s.balance}</p></div><details id="avNotes"><summary>Mi reflexión · Opcional</summary><p class="avNote">Al pulsar Guardar, estas palabras quedan sólo en este navegador, accesibles a quien use este perfil. No se envían a Dérej ni se sincronizan; se perderán si borras los datos del navegador.</p><label for="avIdea">Lo que quiero recordar</label><textarea id="avIdea" data-av-note="idea" maxlength="6000" rows="3">${esc(n.idea)}</textarea><label for="avAction">Mi próximo paso y cuándo lo haré</label><textarea id="avAction" data-av-note="action" maxlength="6000" rows="3">${esc(n.action)}</textarea><div class="avActions">${button('save','Guardar en este navegador')}${button('delete','Borrar esta reflexión',true)}</div><p class="avNote" id="avSaveStatus" role="status">${esc(saveMessage||(storageOK?'Puedes guardar una reflexión si lo deseas.':'Este navegador no permite guardar. Conserva una copia de tus palabras.'))}</p></details><div class="avActions">${next?`<button type="button" class="avButton" data-av-node="${next}">Seguir con ${byId(next).name} →</button>`:button('learn','Volver a la enseñanza',true)}${button('home','Volver al patio',true)}</div>`;
  }
  p.innerHTML=header+body;
  if(focus){p.querySelector('#avTitle')?.focus({preventScroll:true});if(window.matchMedia('(max-width:720px)').matches)p.scrollIntoView({behavior:'auto',block:'start'});}
 }
 function steps(s){return [
  {title:'Llegar',text:'Apoya los pies y reconoce el lugar donde estás. Deja que tu respiración siga su ritmo. No necesitas producir una emoción. Dedica este momento a prestar atención.'},
  {title:'Visualizar',text:s.image+' Si prefieres, contempla la frase sin formar una imagen. Esta visualización es una metáfora creada por Dérej.'},
  {title:'Contemplar',text:s.question+' Acoge lo que aparece y distingue una situación concreta de tu vida. Puedes quedarte con la pregunta.'},
  {title:'Dirigirte al Creador',text:s.prayer+' Puedes usar tus palabras o permanecer en silencio. Esta plegaria es una elaboración Dérej.'},
  {title:'Volver a la vida',text:s.action+' Tómate un momento para decidir qué está a tu alcance. Al terminar podrás anotar tu próximo paso.'}
 ];}
 function practiceBody(s){const step=steps(s)[run.step];return `<span class="avEyebrow">GUÍA ESCRITA · ${duration} MINUTOS</span><div class="avStepMeta"><span>Momento ${run.step+1} de 5</span><span id="avRunState">${run.running?'En curso':'En pausa'}</span></div><div class="avProgress" aria-hidden="true"><span id="avProgressFill" style="width:${run.step/5*100}%"></span></div><div class="avSteps" aria-hidden="true">${steps(s).map((_,i)=>`<span class="${i<=run.step?'on':''}"></span>`).join('')}</div><h3 id="avStepTitle" tabindex="-1">${step.title}</h3><p class="avReading">${esc(step.text)}</p><div class="avTimer" id="avTimer" role="timer" aria-label="Tiempo restante de este momento"></div><div class="avActions">${button('toggle',run.running?'Pausar':'Continuar')}${button('next',run.step===4?'Terminar y elegir una acción':'Momento siguiente →',true)}${run.step>0?button('previous','← Anterior',true):''}</div><div class="avActions">${button('stop','Salir de la práctica',true)}</div><p class="avNote">Puedes tomarte tu tiempo. La guía se pausa al ocultar la página o salir de esta sección.</p>`;}
 function clearClock(){if(interval!==null){clearInterval(interval);interval=null;}}
 function remaining(){return run?Math.max(0,run.left-(run.running?Date.now()-run.startedAt:0)):0;}
 function updateClock(){if(!run)return;const left=remaining(),timer=root.querySelector('#avTimer'),fill=root.querySelector('#avProgressFill');if(timer){const t=Math.ceil(left/1000);timer.textContent=String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');}if(fill)fill.style.width=((run.step+(1-left/run.stepMs))/5*100)+'%';}
 function announce(text){const el=root.querySelector('#avStatus');if(el)el.textContent=text;}
 function tick(){if(!run||!run.running)return;if(screen.hidden||document.hidden){pause();return;}if(remaining()<=0){advance();return;}updateClock();}
 function startClock(){clearClock();if(run?.running)interval=setInterval(tick,250);updateClock();}
 function pause(){if(!run||!run.running)return;run.left=remaining();run.running=false;clearClock();if(!screen.hidden&&mode==='practice'){panel();updateClock();announce('Práctica en pausa.');}}
 function stop(){clearClock();run=null;}
 function advance(back=false){
  if(!run)return;
  if(!back&&run.step===4){stop();mode='carry';panel(true);announce('Elige una acción para llevar a tu vida.');return;}
  run.step=Math.max(0,run.step+(back?-1:1));run.left=run.stepMs;run.startedAt=Date.now();panel();startClock();root.querySelector('#avStepTitle')?.focus({preventScroll:true});announce('Momento '+(run.step+1)+': '+steps(byId(selected))[run.step].title);
 }
 function select(id){if(!byId(id))return;stop();selected=id;mode='learn';saveMessage='';persist();root.querySelector('#avMap').innerHTML=map();panel(true);}
 function open(trigger=null){
  const active=document.querySelector('.screen.active:not([hidden])');
  if(active!==screen){returnPoint={name:active?.dataset.screen||'home',y:window.scrollY,focus:trigger};route('arbol');}
  render();root.querySelector('#arbolTitle')?.setAttribute('tabindex','-1');root.querySelector('#arbolTitle')?.focus({preventScroll:true});
 }
 function back(home=false){
  pause();const point=home?{name:'home',y:0}:returnPoint||{name:'home',y:0};
  // Return without rerendering Camino: retain current study, unsaved text and Radio.
  document.querySelectorAll('.screen[data-screen]').forEach(el=>{const on=el.dataset.screen===point.name;el.hidden=!on;el.classList.toggle('active',on);});
  point.focus?.isConnected&&point.focus.focus({preventScroll:true});window.scrollTo({top:point.y,behavior:'instant'});returnPoint=null;
 }
 document.addEventListener('click',event=>{
  const entry=event.target.closest('[data-arbol-open]');if(entry){event.preventDefault();open(entry);return;}
  if(!screen.contains(event.target))return;
  const node=event.target.closest('[data-av-node]');if(node){select(node.dataset.avNode);return;}
  const r=event.target.closest('[data-av-route]');if(r){const chosen=D.routes.find(x=>x.id===r.dataset.avRoute);if(chosen){chosenRoute=chosen.id;select(chosen.ids[0]);}return;}
  const m=event.target.closest('[data-av-mode]');if(m){pause();mode=m.dataset.avMode;panel(true);if(run&&mode==='practice')updateClock();return;}
  const action=event.target.closest('[data-av-action]')?.dataset.avAction;if(!action)return;
  if(action==='back'||action==='home'){back(action==='home');return;}
  if(action==='map'){root.querySelector('#avMap').scrollIntoView({behavior:'auto',block:'start'});root.querySelector('.avTree [aria-pressed="true"]')?.focus({preventScroll:true});return;}
  if(action==='intro'){introSeen=true;persist();render();root.querySelector('[data-av-node="'+selected+'"]')?.focus({preventScroll:true});return;}
  if(action==='guide'){const el=root.querySelector('#avGuide');el.open=true;el.querySelector('summary').focus();el.scrollIntoView({behavior:'auto',block:'start'});return;}
  if(action==='prepare'||action==='learn'){pause();mode=action==='learn'?'learn':'practice';panel(true);return;}
  if(action==='start'){stop();const stepMs=duration*60000/5;run={step:0,stepMs,left:stepMs,running:true,startedAt:Date.now()};panel(true);startClock();return;}
  if(action==='toggle'&&run){if(run.running)pause();else{run.running=true;run.startedAt=Date.now();panel();startClock();}root.querySelector('[data-av-action="toggle"]')?.focus({preventScroll:true});return;}
  if(action==='next'||action==='previous'){advance(action==='previous');return;}
  if(action==='stop'){stop();mode='practice';panel(true);return;}
  if(action==='save'){notes[selected]={...(drafts[selected]||notes[selected]||{idea:'',action:''})};const ok=persist();saveMessage=ok?'Guardado sólo en este navegador.':'No se pudo guardar. Conserva una copia antes de salir.';root.querySelector('#avSaveStatus').textContent=saveMessage;return;}
  if(action==='delete'){delete notes[selected];delete drafts[selected];const ok=persist();saveMessage=ok?'Reflexión borrada de este navegador.':'No se pudo borrar el registro guardado. Inténtalo de nuevo.';panel();root.querySelector('#avNotes').open=true;root.querySelector('#avSaveStatus').focus();}
 });
 root.addEventListener('change',event=>{if(event.target.id==='avDuration'&&[3,5,8].includes(Number(event.target.value))){duration=Number(event.target.value);persist();}});
 root.addEventListener('input',event=>{const k=event.target.dataset.avNote;if(!['idea','action'].includes(k))return;drafts[selected]||={...(notes[selected]||{idea:'',action:''})};drafts[selected][k]=event.target.value.slice(0,6000);saveMessage='Cambios sin guardar.';root.querySelector('#avSaveStatus').textContent=saveMessage;});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
 const previousRoute=route;route=function(name){if(name!=='arbol')pause();previousRoute(name);};
 new MutationObserver(()=>{if(screen.hidden)pause();}).observe(screen,{attributes:true,attributeFilter:['hidden']});
 function entries(){
  const study=document.querySelector('[data-ramak-panel="profundizar"] .ramakSourceNote');
  if(study&&!study.parentElement.querySelector('.avStudyEntry'))study.insertAdjacentHTML('afterend','<section class="avStudyEntry"><h3>Árbol de la Vida</h3><p>Comprender las sefirot y cultivar una intención en la vida diaria.</p><button type="button" class="avButton" data-arbol-open>Explorar el árbol →</button></section>');
  const pozo=document.querySelector('#pozoRoot [data-pz="welcome"]')?document.querySelector('#pozoRoot .pzGrid'):null;
  if(pozo&&!pozo.parentElement.querySelector('.avPozoEntry'))pozo.insertAdjacentHTML('afterend','<section class="avStudyEntry avPozoEntry"><h3>Árbol de la Vida</h3><p>Una rama de Dérej para aprender, contemplar y llevar una intención al mundo.</p><button type="button" class="avButton" data-arbol-open>Acercarme al árbol →</button></section>');
  const names=document.querySelector('#nombresRoot .npHero');
  if(names&&!names.parentElement.querySelector('.avStudyEntry'))names.insertAdjacentHTML('afterend','<section class="avStudyEntry"><h3>Árbol de la Vida</h3><p>Continúa con un mapa interactivo de las sefirot y prácticas guiadas.</p><button type="button" class="avButton" data-arbol-open>Explorar el árbol →</button></section>');
 }
 for(const id of ['ramakContent','pozoRoot','nombresRoot']){const el=document.getElementById(id);if(el)new MutationObserver(entries).observe(el,{childList:true,subtree:true});}
 // Camino is rendered asynchronously and may replace its complete study container.
 if(typeof renderRamak==='function'){const previous=renderRamak;renderRamak=function(...args){const result=previous.apply(this,args);entries();return result;};}
 entries();render();
 const query=new URLSearchParams(location.search);
 if(query.get('estudio')==='arbol'){
  if(byId(query.get('sefira')))selected=query.get('sefira');
  const welcome=document.querySelector('#derejWelcome');
  if(welcome?.open)welcome.addEventListener('close',()=>queueMicrotask(()=>open()),{once:true});else open();
 }
})();
