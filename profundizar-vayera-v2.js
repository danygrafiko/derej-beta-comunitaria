/* Recursos del pasaje: piloto Vayerá. Redacción y conexiones editoriales Dérej.
   Reutiliza la edición vigente y su memoria local; no importa traducciones externas. */
(()=>{
 'use strict';
 const KEY='derej-passage-bookmarks-v1',RESUME='derej-welcome-resume-v1';
 const STEPS=['encuentro','raiz','profundizar','practica','llevar'];

 const STUDY={
  "1": {
    "title": "El movimiento de la hospitalidad",
    "detail": "וַיָּרָץ · Vayaratz · «corrió»",
    "ref": "Génesis 18:2–8",
    "insight": "La narración no se limita a decir que Abraham recibió visitantes: detalla movimiento, agua, descanso y alimento. El relato convierte la disposición interior en gestos observables.",
    "connection": "Génesis 18:1–8 y Shabat 127a",
    "meaning": "La tradición talmúdica atribuye un peso singular a la recepción de huéspedes. Es una lectura rabínica de la escena; no es una traducción de la palabra hebrea.",
    "question": "¿Por qué el texto dedica tantos verbos y acciones concretas a recibir a los visitantes?",
    "voices": [
      "baalshemtov",
      "rambam"
    ]
  },
  "2": {
    "title": "La justicia que se atreve a preguntar",
    "detail": "הֲשֹׁפֵט · Hashofet · «¿el juez?»",
    "ref": "Génesis 18:23–33",
    "insight": "Abraham no se limita a observar el destino de Sodoma: formula preguntas sobre la justicia y discute números decrecientes de personas justas. El diálogo mismo ocupa un lugar central.",
    "connection": "Génesis 18:25 y 18:32",
    "meaning": "La pregunta sobre el juez de toda la tierra abre un problema ético: cómo juzgar colectivamente sin borrar a las personas inocentes. La aplicación contemporánea es editorial.",
    "question": "¿Qué revela del personaje de Abraham que su respuesta al juicio sea preguntar y argumentar?",
    "voices": [
      "rambam",
      "rabiNajman"
    ]
  },
  "3": {
    "title": "La demora frente al peligro",
    "detail": "וַיִּתְמַהְמָהּ · Vayitmahmah · «se demoró»",
    "ref": "Génesis 19:15–17",
    "insight": "En medio de la urgencia, Lot tarda. Los mensajeros lo toman de la mano junto con su familia. El relato contrapone la lentitud humana y la intervención que permite salir.",
    "connection": "Génesis 19:16–17",
    "meaning": "La vacilación forma parte de la escena, pero el texto no ofrece un diagnóstico psicológico de Lot. Leer cuidadosamente exige distinguir hechos narrados y motivos supuestos.",
    "question": "¿Qué cambia en la narración cuando la salida ocurre por una mano que acompaña y no por una decisión inmediata de Lot?",
    "voices": [
      "ramjal"
    ]
  },
  "4": {
    "title": "Dos madrugadas, dos contextos",
    "detail": "וַיַּשְׁכֵּם · Vayashkem · «madrugó»",
    "ref": "Génesis 19:27 y 22:3",
    "insight": "El verbo madrugar aparece cuando Abraham vuelve a mirar hacia Sodoma y también al emprender el viaje de la Akedá. La repetición permite comparar acciones semejantes ante situaciones muy distintas.",
    "connection": "Génesis 19:27 y 22:3",
    "meaning": "Una conexión textual no significa que ambos episodios tengan la misma enseñanza. La fuerza del estudio está en observar el contraste entre ellos.",
    "question": "¿Qué aporta repetir el gesto de levantarse temprano en escenas tan diferentes?",
    "voices": [
      "rambam",
      "ramjal"
    ]
  },
  "5": {
    "title": "Los ojos que se abren",
    "detail": "וַיִּפְקַח · Vayifkaj · «abrió»",
    "ref": "Génesis 21:19",
    "insight": "El relato dice que a Hagar se le abren los ojos y ve un pozo. La frase destaca el acto de percibir una posibilidad de vida en un escenario de extrema vulnerabilidad.",
    "connection": "Génesis 16:7–14 y 21:14–19",
    "meaning": "Hagar ya había vivido un encuentro significativo en el desierto en Génesis 16. Las dos escenas se pueden comparar sin suponer que representan exactamente la misma experiencia.",
    "question": "¿Por qué el narrador presenta primero un cambio de mirada y después el agua?",
    "voices": [
      "rabiNajman"
    ]
  },
  "6": {
    "title": "El pozo y la palabra pública",
    "detail": "לְעֵדָה · Leedá · «por testimonio»",
    "ref": "Génesis 21:25–31",
    "insight": "El acuerdo entre Abraham y Abimélej incorpora un gesto material: siete corderas sirven como testimonio de quién cavó el pozo. La narración vincula recurso, memoria y palabra.",
    "connection": "Génesis 21:30–31 y 26:15–33",
    "meaning": "Más adelante, la generación de Isaac vuelve a enfrentarse con disputas y acuerdos en torno a pozos. Es una conexión narrativa entre generaciones, no un símbolo obligatorio.",
    "question": "¿Por qué necesita el acuerdo una señal pública y un lugar que conserve su memoria?",
    "voices": [
      "ramak"
    ]
  },
  "7": {
    "title": "El límite dentro de la prueba",
    "detail": "אַל־תִּשְׁלַח יָדְךָ · Al tishlaj yadja · «no extiendas tu mano»",
    "ref": "Génesis 22:1–12",
    "insight": "Génesis 22 comienza llamando al episodio una prueba y contiene la orden explícita de detener la mano de Abraham. Leer solo la disposición a obedecer dejaría fuera un momento decisivo del relato.",
    "connection": "Génesis 22:1, 22:11–12 y Moreh Nevujim III:24",
    "meaning": "La Akedá ha recibido diversas interpretaciones judías. Dérej distingue el texto, las lecturas clásicas y las preguntas éticas abiertas; no transforma este episodio en un modelo de daño o sacrificio humano.",
    "question": "¿Qué papel tiene en el sentido del episodio la orden final de no hacer daño al muchacho?",
    "voices": [
      "rambam",
      "rabiNajman"
    ]
  }
};
 const PEOPLE={1:['abraham','sara','itzjak'],2:['abraham','lot'],3:['lot'],4:['abraham','sara','itzjak','lot','moab','benami'],5:['hagar','ismael','abraham','sara','itzjak'],6:['abraham'],7:['abraham','itzjak','nahor','milca','betuel','rivka']};
 const TITLES=['Una tienda abierta','Escuchar el clamor','Una mano en la urgencia','Volver por la mañana','Agua en el desierto','La claridad de un acuerdo','La vida y la promesa'];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
 const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
 const pilot=()=>typeof RAMAK_DATA!=='undefined'?RAMAK_DATA?.parashot?.find(p=>p.parasha==='Vayera'):null;
 const dayData=n=>pilot()?.caminos.find(c=>Number(c.dia)===Number(n));
 const validDay=n=>Number.isInteger(Number(n))&&Number(n)>=1&&Number(n)<=7&&!!dayData(n);
 const id=n=>'Vayera|'+Number(n);
 const bookmarks=()=>{const raw=read(KEY);return Array.isArray(raw)?[...new Set(raw.filter(n=>Number.isInteger(n)&&n>=1&&n<=7))]:[];};
 const ref=s=>typeof biblicalRefEs==='function'?biblicalRefEs(s):s;
 const names={rambam:'Rambam',ramak:'Ramak',ramjal:'Ramjal',rabiNajman:'Rabí Najman',baalshemtov:'Baal Shem Tov'};
 let tab='contexto',openedDay=1,origin=null,returnPoint=null,pendingDeep=false;
 const dialog=document.createElement('dialog');
 dialog.id='passageResources';dialog.className='prDialog';dialog.setAttribute('aria-labelledby','prTitle');
 document.body.appendChild(dialog);
 const status=document.createElement('p');status.className='prSrOnly';status.setAttribute('role','status');document.body.appendChild(status);
 function announce(text){status.textContent=text;}
 function remember(){
  if(typeof currentParasha!=='function'||currentParasha()?.parasha!=='Vayera'||document.querySelector('[data-screen="camino"]')?.hidden)return;
  write(RESUME,{parasha:'Vayera',day:Number(selectedDay),step:STEPS.includes(selectedRamakStep)?selectedRamakStep:'encuentro',updatedAt:new Date().toISOString()});
 }
 function urlForDay(n){return 'https://parashot.com.ar/?section=parashot&parasha=vayera&aliya='+Number(n);}
 function verse(c){return `<section class="prVerse"><p class="prEyebrow">PASAJE · ${esc(ref(c.pasuk.ref))}</p><p lang="he" dir="rtl" class="prHebrew">${esc(normalizeHebrewText(c.pasuk.hebreo))}</p><p>${esc(c.pasuk.es)}</p><small>Paráfrasis Dérej · redacción propia en español. No es una traducción literal.</small></section>`;}
 function context(c){return `${verse(c)}<section><p class="prEyebrow">CONTEXTO · SÍNTESIS DÉREJ</p><h3>Volver a la escena</h3><p>${esc(c.rootNote)}</p><a class="prPrimary" href="${urlForDay(c.dia)}" target="_blank" rel="noopener noreferrer" hreflang="es">Leer la ${c.dia}ª aliyá completa ↗</a><p class="prSmall">Lectura en español en Parashot.com.ar. Se abre aparte para conservar tu lugar y la música.</p></section>`;}
 function voices(c){return `<p class="prIntro">Estas fuentes ofrecen un marco de estudio. La conexión con el pasaje y su aplicación cotidiana son elaboraciones de Dérej.</p>${Object.entries(c.voces).map(([key,v])=>`<article class="prVoice"><p class="prEyebrow">${esc(names[key]||key)}</p><h3>${esc(v.fuente)}</h3><p class="prSmall">MARCO DE LA FUENTE · SÍNTESIS DÉREJ</p><p>${esc(v.base)}</p><details><summary>Leer la aplicación de Dérej</summary><p>${esc(v.texto)}</p><p class="prSmall">${esc(v.atribucion)}</p></details></article>`).join('')}<p class="prSmall">Las referencias permiten contrastar estas síntesis con tu edición de las obras. No se reproducen aquí traducciones de terceros.</p>${c.voces.baalshemtov?.url?`<a href="${esc(c.voces.baalshemtov.url)}" target="_blank" rel="noopener noreferrer" hreflang="es">Consultar la exposición de Gal Einai en español ↗</a>`:''}`;}
 function people(c){
  const api=document.getElementById('derej-raices-v2')?.genealogy;
  return `<p class="prIntro">Conoce a las personas de esta aliyá y su lugar en las familias del relato.</p><div class="prPeople">${PEOPLE[c.dia].filter(pid=>api?.people[pid]).map(pid=>`<button type="button" data-pr-person="${pid}"><b>${esc(api.people[pid].name)}</b><span>${esc(api.people[pid].alias||'Estudio en Biblioteca')}</span><small>Leer su historia →</small></button>`).join('')}</div><p class="prSmall">La selección sigue el pasaje del día; las fichas pueden recorrer otros episodios de la vida del personaje. La genealogía registra parentescos, sin establecer una jerarquía entre personas.</p>`;
 }
function mine(c){
  const saved=bookmarks();
  return '<section><p class="prEyebrow">LECTURAS GUARDADAS · PRIVADAS</p><h3>Mis pasajes de Vayerá</h3>'
  + (saved.length ? '<div class="prSaved">'+saved.map(n=>'<button type="button" data-pr-day="'+n+'">'+n+'ª aliyá · '+esc(TITLES[n-1])+' →</button>').join('')+'</div>' : '<p>Aún no has guardado una lectura. Puedes hacerlo desde Profundizar.</p>')
  + '<p class="prPrivacy">Los marcadores se guardan únicamente en este navegador. Las reflexiones y el avance se consultan en Mi Camino, sin duplicarlos aquí.</p>'
  + '<button type="button" class="prSecondary" data-pr-go-personal>Ver Mi Camino →</button></section>';
}
 function voiceBlock(c,keys){
  const namesLocal={rambam:'Rambam',ramak:'Ramak',ramjal:'Ramjal',rabiNajman:'Rabí Najmán',baalshemtov:'Baal Shem Tov'};
  return keys.map(key=>{
    const v=c.voces?.[key];if(!v)return '';
    const desc=v.base?'<p>'+esc(v.base)+'</p>':'';
    const reading=v.texto?'<details><summary>Interpretación y aplicación de Dérej</summary><p>'+esc(v.texto)+'</p></details>':'';
    return '<article class="prSelectedVoice"><small>'+esc(namesLocal[key]||key)+'</small><h4>'+esc(v.fuente||'Fuente tradicional')+'</h4>'+desc+reading+'</article>';
  }).join('');
}
function deepStudy(c){
  const t=STUDY[Number(c.dia)];if(!t)return '';
  const saved=bookmarks().includes(Number(c.dia));
  return '<div class="prDeep" aria-label="Estudio profundo de la aliyá">'
   + '<p class="prDeepIntro">Esta etapa no repite la lectura de Raíz: observa un detalle nuevo, consulta fuentes seleccionadas y abre una pregunta de interpretación.</p>'
   + '<section class="prDeepSection"><small>01 · LO QUE EL TEXTO DEJA VER</small><h3>'+esc(t.title)+'</h3>'
   + '<p class="prDeepWord" lang="he">'+esc(t.detail)+'</p><p class="prDeepRef">'+esc(t.ref)+'</p><p>'+esc(t.insight)+'</p></section>'
   + '<section class="prDeepSection"><small>02 · TRADICIÓN EN CONTEXTO</small>'
   + '<div class="prDeepVoices">'+voiceBlock(c,t.voices)+'</div>'
   + '<p class="prDeepFootnote">Fuentes identificadas, síntesis y aplicaciones editoriales. No son citas literales atribuidas a los maestros.</p></section>'
   + '<section class="prDeepSection"><small>03 · CONEXIONES Y MATICES</small><h3>'+esc(t.connection)+'</h3><p>'+esc(t.meaning)+'</p></section>'
   + '<section class="prDeepSection prDeepQuestion"><small>04 · PREGUNTA PARA EL ESTUDIO</small><h3>'+esc(t.question)+'</h3>'
   + '<p>Para pensar y conversar. Las acciones personales corresponden a la etapa Práctica.</p></section>'
   + '<div class="prDeepTools"><a href="'+urlForDay(c.dia)+'" target="_blank" rel="noopener noreferrer" hreflang="es">Leer la aliyá completa ↗</a>'
   + '<button type="button" data-pr-people>Conocer personajes →</button>'
   + '<button type="button" data-pr-save aria-pressed="'+saved+'">'+(saved?'✓ Lectura guardada · Quitar':'Guardar esta lectura')+'</button></div>'
   + '<p class="prDeepSaveStatus" role="status" aria-live="polite"></p></div>';
}
function draw(focus=false){
  const c=dayData(openedDay);if(!c)return;
  if(tab!=='personas'&&tab!=='mi')tab='personas';
  dialog.innerHTML='<header class="prHeader"><div><p class="prEyebrow">DÉREJ · RECURSOS COMPLEMENTARIOS</p>'
   +'<h2 id="prTitle" tabindex="-1">Vayerá · '+c.dia+'ª aliyá</h2><p>'+esc(ref(c.aliyaRange))+'</p></div>'
   +'<button type="button" class="prClose" data-pr-close aria-label="Cerrar y volver al estudio">×</button></header>'
   +'<nav class="prDays" aria-label="Explorar las siete aliyot de Vayerá">'
   +[1,2,3,4,5,6,7].map(n=>'<button type="button" data-pr-day="'+n+'" aria-label="'+n+'ª aliyá: '+esc(TITLES[n-1])+'" aria-pressed="'+(Number(c.dia)===n)+'">'+n+'</button>').join('')+'</nav>'
   +'<nav class="prTabs" aria-label="Complementos del estudio">'
   +[['personas','Personajes'],['mi','Mi lectura']].map(([key,label])=>'<button type="button" data-pr-tab="'+key+'" aria-controls="prContent" aria-pressed="'+(tab===key)+'">'+label+'</button>').join('')+'</nav>'
   +'<div id="prContent" class="prContent">'+(tab==='mi'?mine(c):people(c))+'</div>'
   +'<footer class="prFooter"><button type="button" class="prSecondary" data-pr-close>Volver al estudio</button></footer>';
  if(focus){dialog.scrollTop=0;dialog.querySelector('#prTitle').focus({preventScroll:true});}
}
  function open(n,trigger,section='personas'){
  if(!validDay(n)){announce('El estudio está cargando. Vuelve a intentarlo en un momento.');return;}
  origin={trigger,y:window.scrollY};openedDay=Number(n);tab=section;draw();
  dialog.showModal();dialog.querySelector('#prTitle').focus({preventScroll:true});remember();
 }
 function close(){if(dialog.open)dialog.close();}
 function select(n,step=selectedRamakStep){
  if(!validDay(n))return;
  if(typeof saveRamakDraft==='function'&&currentParasha()?.parasha==='Vayera')saveRamakDraft();
  selectedParasha='Vayera';selectedDay=Number(n);selectedRamakStep=STEPS.includes(step)?step:'profundizar';
  renderRamak(false);remember();
 }
 function enter(n=1){
  if(!validDay(n)){announce('El estudio está cargando. Vuelve a intentarlo en un momento.');return;}
  openCamino(n,'profundizar');
 }
 function openCamino(day,step){
  const resuming=window.DEREJ_INTRO_RESUMING;
  window.DEREJ_INTRO_RESUMING=true;
  try{route('camino');select(day,step);}finally{window.DEREJ_INTRO_RESUMING=resuming;}
 }
function attach(){
  const p=typeof currentParasha==='function'?currentParasha():null,c=typeof currentCamino==='function'?currentCamino():null;
  if(p?.parasha!=='Vayera'||!c)return;
  const body=document.querySelector('[data-ramak-panel="profundizar"] .ramakBody');
  if(!body)return;
  body.innerHTML=deepStudy(c)+navButtons('profundizar');
}
  function deepLink(){
  if(!pendingDeep||!pilot())return;
  const welcome=document.querySelector('#derejWelcome');if(welcome?.open)return;
  pendingDeep=false;const day=Number(new URLSearchParams(location.search).get('dia')||1);
  if(!validDay(day)){announce('No existe esa aliyá. Elige una de las siete lecturas de Vayerá.');return;}
  enter(day);
 }
 const prev=renderRamak;
 renderRamak=function(...args){const value=prev.apply(this,args);attach();queueMicrotask(deepLink);return value;};
 const previousStep=activateRamakStep;
 activateRamakStep=function(...args){const value=previousStep.apply(this,args);remember();return value;};
 dialog.addEventListener('close',()=>{
  document.querySelectorAll('[data-pr-open]').forEach(b=>b.setAttribute('aria-expanded','false'));
  const trigger=origin?.trigger?.isConnected?origin.trigger:document.querySelector('.ramakPanel.on [data-pr-people]');
  if(trigger&&!document.querySelector('[data-screen="camino"]').hidden)trigger.focus({preventScroll:true});
  if(origin&&!document.querySelector('[data-screen="camino"]').hidden)window.scrollTo({top:origin.y,behavior:'instant'});
 });
 dialog.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-pr-close')){close();return;}
  if(button.dataset.prTab){tab=button.dataset.prTab;draw();dialog.querySelector(`[data-pr-tab="${tab}"]`).focus({preventScroll:true});return;}
  if(button.dataset.prDay){openedDay=Number(button.dataset.prDay);close();openCamino(openedDay,'profundizar');return;}
  if(button.hasAttribute('data-pr-bookmark')){
   const saved=bookmarks(),n=openedDay,next=saved.includes(n)?saved.filter(x=>x!==n):[...saved,n].sort((a,b)=>a-b);
   if(!write(KEY,next)){document.getElementById('prSaveStatus').textContent='No pudimos guardar en este navegador. Revisa si permite almacenamiento local.';return;}
   draw();dialog.querySelector('[data-pr-bookmark]').focus({preventScroll:true});document.getElementById('prSaveStatus').textContent=next.includes(n)?'Lectura guardada en este navegador.':'Lectura retirada de tus guardadas.';return;
  }
  if(button.hasAttribute('data-pr-go-personal')){origin=null;close();route('personal');return;}
  if(button.dataset.prPerson){
   const api=document.getElementById('derej-raices-v2')?.genealogy,pid=button.dataset.prPerson;
   if(!api?.people[pid]||!api.openStudy)return;
   returnPoint={day:openedDay,step:selectedRamakStep,y:origin?.y||0,url:location.href};
   close();route('genealogias');api.openStudy(pid);
   let back=document.getElementById('prReturnToPassage');
   if(!back){back=document.createElement('button');back.id='prReturnToPassage';back.type='button';back.className='prReturn';document.querySelector('.genealogyInner').prepend(back);}
   back.hidden=false;back.textContent=`← Volver a Vayerá · ${openedDay}ª aliyá`;
  }
 });
 document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-pr-people]');
  if(trigger){open(selectedDay,trigger,'personas');return;}
  const save=event.target.closest('[data-pr-save]');
  if(save){
    const n=Number(selectedDay),old=bookmarks(),next=old.includes(n)?old.filter(d=>d!==n):[...old,n].sort((a,b)=>a-b);
    const status=document.querySelector('.ramakPanel.on .prDeepSaveStatus');
    if(!write(KEY,next)){if(status)status.textContent='No pudimos guardar en este navegador.';return;}
    save.setAttribute('aria-pressed',String(next.includes(n)));
    save.textContent=next.includes(n)?'✓ Lectura guardada · Quitar':'Guardar esta lectura';
    if(status)status.textContent=next.includes(n)?'Lectura guardada en este dispositivo.':'Lectura retirada de tus guardadas.';
    return;
  }
  if(event.target.closest('[data-pr-pilot]')){event.preventDefault();enter(1);return;}
  if(event.target.closest('[data-pr-saved]')){event.preventDefault();open(bookmarks()[0]||1,event.target.closest('[data-pr-saved]'),'mi');return;}
  if(event.target.closest('#prReturnToPassage')&&returnPoint){
   const point=returnPoint;returnPoint=null;event.target.closest('button').hidden=true;
   history.replaceState(history.state,'',point.url);openCamino(point.day,point.step);window.scrollTo({top:point.y,behavior:'instant'});
   open(point.day,document.querySelector('.ramakPanel.on [data-pr-people]'),'personas');
  }
 });
 const originalRoute=route;
 route=function(name,...args){
  if(dialog.open)close();
  if(name!=='genealogias'&&name!=='camino'){returnPoint=null;const back=document.getElementById('prReturnToPassage');if(back)back.hidden=true;}
  return originalRoute.call(this,name,...args);
 };
 pendingDeep=new URLSearchParams(location.search).get('estudio')==='profundizar';
 document.querySelector('#derejWelcome')?.addEventListener('close',()=>queueMicrotask(deepLink));
 attach();deepLink();
})();
