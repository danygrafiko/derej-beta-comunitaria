/* CAMINO v2.2 · Caminos Diarios · Edición Ramak */
const screens=[...document.querySelectorAll('[data-screen]')];
const $=id=>document.getElementById(id);
const RAMAK_URL='content/caminos-ramak-v21.json';
const caminoScreen=document.querySelector('[data-screen="camino"]');

let RAMAK_DATA=null;
let selectedParasha='Bereshit';
let selectedDay=1;
let selectedRamakStep='encuentro';
let ramakLoadError='';

function route(name){
  screens.forEach(s=>{
    const on=s.dataset.screen===name;
    s.hidden=!on;
    s.classList.toggle('active',on);
  });
  if(name==='camino'){
    if(RAMAK_DATA) renderRamak(false);
    else if(ramakLoadError) renderRamakError();
  }
  window.scrollTo({top:0,behavior:'instant'});
}

function esc(v=''){
  return String(v??'').replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

function slug(v=''){
  return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function luminanceText(hex='#E8EAED'){
  const h=String(hex).replace('#','');
  if(!/^[0-9a-f]{6}$/i.test(h)) return '#1F2937';
  const [r,g,b]=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16));
  const y=(r*299+g*587+b*114)/1000;
  return y<145?'#FFFBEB':'#1F2937';
}

function memoryKey(parasha,day){
  return `derej-v21-encuentro-ramak-${slug(parasha)}-${day}`;
}

function loadRamakMemory(parasha,day){
  try{return JSON.parse(localStorage.getItem(memoryKey(parasha,day))||'null');}
  catch{return null;}
}

function currentParasha(){
  if(!RAMAK_DATA) return null;
  return RAMAK_DATA.parashot.find(p=>p.parasha===selectedParasha)||RAMAK_DATA.parashot[0];
}

function currentCamino(){
  const p=currentParasha();
  if(!p) return null;
  return p.caminos.find(c=>Number(c.dia)===Number(selectedDay))||p.caminos[0]||null;
}

function saveRamakDraft(){
  const p=currentParasha(), c=currentCamino();
  if(!p||!c) return;
  const note=$('ramakNote')?.value.trim()||'';
  const existing=loadRamakMemory(p.parasha,c.dia)||{};
  const draft={
    ...existing,
    schema:'ramak-v21',
    edition:'Edición Ramak',
    parasha:p.parasha,
    dia:c.dia,
    titulo:c.titulo,
    sefira:c.sefira,
    note,
    updatedAt:new Date().toISOString()
  };
  try{localStorage.setItem(memoryKey(p.parasha,c.dia),JSON.stringify(draft));}catch{}
}

function prepareCaminoShell(){
  if(!caminoScreen) return;
  caminoScreen.className='screen caminoScreen ramakCaminoScreen';
  caminoScreen.setAttribute('aria-labelledby','caminoTitle');
  caminoScreen.innerHTML=`
    <button class="backBtn floatingBack" data-route="home">← Patio</button>

    <section class="caminoPortalHero ramakHero">
      <div class="heroScrim"></div>
      <div class="heroCopy">
        <span class="eyebrow">CAMINO · EDICIÓN RAMAK</span>
        <span class="heroHebrew" aria-hidden="true">דרך</span>
        <h1 id="caminoTitle">Caminos Diarios</h1>
        <p class="weekTitle">Bereshit a Tetzavé</p>
        <p class="heroEditorial">Una voz antigua. Una pregunta para hoy. Una práctica para llevar.</p>
        <button class="heroEnter" type="button" data-ramak-scroll="ramakChooser">Elegir un Camino <span>↓</span></button>
      </div>
    </section>

    <section class="ramakChooser" id="ramakChooser" aria-labelledby="ramakChooserTitle">
      <header class="ramakChooserHead">
        <span>20 PARASHOT · 134 CAMINOS</span>
        <h2 id="ramakChooserTitle">Edición Ramak</h2>
        <p>Recorre una Parashá, elige un día y entra por cinco umbrales: Encuentro, Raíz, Profundizar, Práctica y Llevar.</p>
      </header>

      <div class="ramakParashaRail" id="ramakParashaRail" role="tablist" aria-label="Elegir Parashá"></div>

      <article class="ramakWeekCard">
        <div>
          <small id="ramakWeekIndex">PARASHÁ 01 DE 20</small>
          <h3 id="ramakParashaTitle">Bereshit</h3>
          <p id="ramakPrinciple"></p>
        </div>
        <div class="ramakRefs">
          <span id="ramakTorahRef"></span>
          <span id="ramakHaftarahRef"></span>
        </div>
      </article>

      <div class="ramakDayStrip" id="ramakDayStrip" aria-label="Elegir día"></div>

      <div class="ramakIncomplete" id="ramakIncomplete" hidden></div>

      <div class="ramakSelectedBanner">
        <span class="ramakColorOrb" id="ramakColorOrb" aria-hidden="true"></span>
        <div>
          <small id="ramakSelectedMeta">DÍA 1 · BERESHIT · CHESED</small>
          <b id="ramakSelectedTitle">OR</b>
        </div>
        <button type="button" data-ramak-step="encuentro">Entrar →</button>
      </div>
    </section>

    <nav class="ramakThresholdRail" aria-label="Recorrido del Camino">
      <button class="ramakThreshold on" type="button" data-ramak-step="encuentro"><span>01</span><b>Encuentro</b></button>
      <button class="ramakThreshold" type="button" data-ramak-step="raiz"><span>02</span><b>Raíz</b></button>
      <button class="ramakThreshold" type="button" data-ramak-step="profundizar"><span>03</span><b>Profundizar</b></button>
      <button class="ramakThreshold" type="button" data-ramak-step="practica"><span>04</span><b>Práctica</b></button>
      <button class="ramakThreshold" type="button" data-ramak-step="llevar"><span>05</span><b>Llevar</b></button>
    </nav>

    <div class="ramakPanels">
      <article class="ramakPanel on" data-ramak-panel="encuentro"></article>
      <article class="ramakPanel" data-ramak-panel="raiz"></article>
      <article class="ramakPanel" data-ramak-panel="profundizar"></article>
      <article class="ramakPanel" data-ramak-panel="practica"></article>
      <article class="ramakPanel" data-ramak-panel="llevar"></article>
    </div>
  `;

  if(!document.getElementById('ramakCaminoStyles')){
    const style=document.createElement('style');
    style.id='ramakCaminoStyles';
    style.textContent=`
      .ramakCaminoScreen{--ramak-accent:#E8EAED;--ramak-ink:#1F2937}
      .ramakHero:after{content:"";position:absolute;inset:auto 0 0;height:8px;background:var(--ramak-accent);opacity:.72}
      .ramakChooser{padding:31px 12px 18px;background:linear-gradient(180deg,#efe2ca,#f7ecda 48%,#ece0c8);scroll-margin-top:66px}
      .ramakChooserHead{text-align:center;max-width:42rem;margin:0 auto 21px}
      .ramakChooserHead>span{font-size:.58rem;letter-spacing:.2em;font-weight:900;color:#786847}
      .ramakChooserHead h2{font:clamp(2rem,8vw,3rem)/1 Georgia,serif;margin:.34em 0 .2em;color:#312b24}
      .ramakChooserHead p{margin:0 auto;max-width:36rem;color:#6d6253;font:.9rem/1.48 Georgia,serif}
      .ramakParashaRail{display:flex;gap:7px;overflow-x:auto;padding:3px 1px 11px;scrollbar-width:none;scroll-snap-type:x proximity}
      .ramakParashaRail::-webkit-scrollbar,.ramakThresholdRail::-webkit-scrollbar{display:none}
      .ramakParashaTab{scroll-snap-align:start;flex:0 0 auto;min-width:108px;border:1px solid #c8b99d;border-radius:17px;background:#fff5e3;color:#4d4337;padding:9px 10px;text-align:left}
      .ramakParashaTab small{display:block;font-size:.51rem;letter-spacing:.12em;color:#887655;margin-bottom:3px}
      .ramakParashaTab b{font:.92rem Georgia,serif}
      .ramakParashaTab.on{background:#354532;color:#fff;border-color:#354532;box-shadow:0 7px 18px rgba(53,69,50,.17)}
      .ramakParashaTab.on small{color:#ead39c}
      .ramakWeekCard{display:grid;gap:12px;padding:17px;border:1px solid #cdbd9f;border-left:6px solid var(--ramak-accent);border-radius:22px;background:#fff7e9;box-shadow:0 10px 26px rgba(58,45,28,.06)}
      .ramakWeekCard small{font-size:.56rem;letter-spacing:.16em;font-weight:900;color:#7c6b4b}
      .ramakWeekCard h3{font:clamp(1.85rem,7vw,2.5rem)/1 Georgia,serif;margin:.25em 0 .14em;color:#352e26}
      .ramakWeekCard p{margin:0;color:#6d6255;font:.9rem/1.4 Georgia,serif}
      .ramakRefs{display:flex;flex-wrap:wrap;gap:7px}
      .ramakRefs span{display:inline-flex;padding:7px 9px;border-radius:999px;background:#eee5d4;color:#6d604d;font-size:.61rem;font-weight:750}
      .ramakDayStrip{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px;margin:11px 0}
      .ramakDay{min-width:0;border:1px solid #c7b89d;border-radius:13px;background:#fff6e7;color:#4e4437;padding:9px 2px;font-size:.63rem;font-weight:900}
      .ramakDay.on{background:var(--ramak-accent);color:var(--ramak-ink);border-color:color-mix(in srgb,var(--ramak-accent),#56462f 28%);box-shadow:0 5px 14px color-mix(in srgb,var(--ramak-accent),transparent 65%)}
      .ramakDay.missing{opacity:.32;border-style:dashed}
      .ramakIncomplete{margin:4px 0 11px;padding:11px 12px;border:1px dashed #bba27a;border-radius:15px;background:#f5ead7;color:#756346;font:.76rem/1.42 Georgia,serif}
      .ramakSelectedBanner{display:grid;grid-template-columns:44px 1fr auto;gap:10px;align-items:center;padding:13px;border:1px solid #cdbd9f;border-radius:19px;background:#312f28;color:#f2e2c3}
      .ramakColorOrb{width:42px;height:42px;border-radius:50%;background:var(--ramak-accent);box-shadow:0 0 0 3px rgba(255,255,255,.08),0 0 24px color-mix(in srgb,var(--ramak-accent),transparent 52%)}
      .ramakSelectedBanner small{display:block;font-size:.52rem;letter-spacing:.11em;color:#d7c6a8;margin-bottom:4px}
      .ramakSelectedBanner b{display:block;font:1.02rem/1.16 Georgia,serif;color:#fff0d5}
      .ramakSelectedBanner button{border:1px solid #b9a27a;border-radius:999px;background:#f0e2c8;color:#352d24;padding:9px 11px;font-size:.66rem;font-weight:900}
      .ramakThresholdRail{position:sticky;top:58px;z-index:20;display:flex;gap:7px;overflow-x:auto;padding:10px 12px;background:linear-gradient(180deg,rgba(239,226,202,.97),rgba(239,226,202,.91));backdrop-filter:blur(12px);border-bottom:1px solid rgba(131,111,78,.18);scrollbar-width:none}
      .ramakThreshold{flex:0 0 auto;min-width:91px;border:1px solid #c6b99f;border-radius:18px;background:#f8edda;color:#4a4135;padding:8px 10px;display:grid;gap:2px;text-align:left}
      .ramakThreshold span{font-size:.54rem;color:#8a7452}.ramakThreshold b{font-size:.74rem}
      .ramakThreshold.on{background:#354532;color:#fff;border-color:#354532;box-shadow:0 5px 14px rgba(53,69,50,.18)}
      .ramakThreshold.on span{color:var(--ramak-accent)}
      .ramakPanels{padding:12px;background:linear-gradient(180deg,#eadcc3,#f1e5d0)}
      .ramakPanel{display:none;overflow:hidden;border:1px solid #d1c1a5;border-top:5px solid var(--ramak-accent);border-radius:29px;background:#fff7e8;box-shadow:0 14px 34px rgba(61,46,26,.09)}
      .ramakPanel.on{display:block}
      .ramakScene{position:relative;height:190px;padding:15px;background-image:linear-gradient(180deg,rgba(7,10,8,.08),rgba(7,10,8,.75)),url('assets/home-courtyard-v21.webp');background-size:cover;background-position:50% 56%;color:#fff1d5}
      .ramakScene:after{content:"";position:absolute;left:0;right:0;bottom:0;height:5px;background:var(--ramak-accent)}
      .ramakSceneTop{display:flex;justify-content:space-between;gap:10px}
      .ramakSceneBadge{display:inline-flex;align-items:center;min-height:38px;padding:7px 10px;border:1px solid rgba(255,234,198,.58);border-radius:999px;background:rgba(10,14,10,.46);font-size:.6rem;letter-spacing:.12em;font-weight:900;backdrop-filter:blur(4px)}
      .ramakSceneTitle{position:absolute;left:17px;right:17px;bottom:19px}
      .ramakSceneTitle small{font-size:.57rem;letter-spacing:.15em;color:#ead5aa;font-weight:900}
      .ramakSceneTitle h2{font:clamp(2rem,8.5vw,3rem)/.96 Georgia,serif;margin:.25em 0 0;color:#fff2d8;text-shadow:0 2px 16px #000}
      .ramakBody{padding:18px}
      .ramakBodyEyebrow{font-size:.58rem;letter-spacing:.15em;font-weight:900;color:#796947}
      .ramakReflection{margin:13px 0 0;padding:16px;border-left:5px solid var(--ramak-accent);border-radius:17px;background:color-mix(in srgb,var(--ramak-accent),#fff8e9 82%)}
      .ramakReflection small,.ramakCard small,.ramakVoice small{display:block;font-size:.55rem;letter-spacing:.14em;font-weight:900;color:#6d654f;margin-bottom:6px}
      .ramakReflection p{margin:0;font:1.14rem/1.48 Georgia,serif;color:#383129}
      .ramakHebrew{direction:rtl;text-align:center;font:clamp(1.8rem,8vw,2.7rem)/1.35 Georgia,serif;color:#33402f;margin:7px 0 15px}
      .ramakPasukMeta{display:grid;gap:7px;margin-bottom:14px}
      .ramakPasukMeta span{padding:10px 12px;border:1px solid #d3c3aa;border-radius:14px;background:#f7eedf;color:#5f5548;font:.84rem/1.35 Georgia,serif}
      .ramakVoices{display:grid;gap:9px}
      .ramakVoice{padding:14px;border:1px solid #d0c0a5;border-radius:17px;background:#faf1e2}
      .ramakVoice b{font:1.02rem Georgia,serif;color:#3b332a}
      .ramakVoice p{margin:.45rem 0 0;color:#665c4f;font:.86rem/1.48 Georgia,serif}
      .ramakCard{padding:16px;border:1px solid #d0c0a5;border-radius:18px;background:#f8efdf}
      .ramakCard strong{font:1.16rem/1.42 Georgia,serif;color:#393128}
      .ramakCard p{margin:.6rem 0 0;color:#655b4e;font:.88rem/1.5 Georgia,serif}
      .ramakPractice{background:color-mix(in srgb,var(--ramak-accent),#f8efdf 88%)}
      .ramakBody label{display:block;margin:15px 0 7px;font-size:.7rem;font-weight:850;color:#655b4c}
      .ramakBody textarea{width:100%;box-sizing:border-box;resize:vertical;border:1px solid #c7b89c;border-radius:15px;background:#fffdf7;color:#342e26;padding:12px;font:1rem/1.45 Georgia,serif;outline:none}
      .ramakBody textarea:focus{border-color:var(--ramak-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--ramak-accent),transparent 78%)}
      .ramakCarryGrid{display:grid;gap:9px}
      .ramakKavana{background:#302f29;color:#f1dfbc;border-color:#302f29}
      .ramakKavana small{color:#d6bd84}.ramakKavana strong,.ramakKavana p{color:#f2e1c0}
      .ramakNav{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:15px}
      .ramakNav button,.ramakSave{border:1px solid #9e8b6c;border-radius:14px;background:#fff5e6;color:#42392f;padding:11px 9px;font-size:.7rem;font-weight:900}
      .ramakSave{width:100%;margin-top:12px;background:#40523d;color:#fff;border-color:#40523d}
      .ramakSaveStatus{min-height:1rem;margin:8px 0 0;text-align:center;font-size:.64rem;color:#6b735d}
      .ramakLoading{padding:42px 18px;text-align:center;color:#6f6250;font:1rem/1.5 Georgia,serif}
      @media(min-width:760px){
        .ramakChooser{padding:38px 24px 24px}.ramakWeekCard{grid-template-columns:1fr auto;align-items:end}
        .ramakVoices{grid-template-columns:1fr 1fr}.ramakPanels{padding:18px}.ramakBody{padding:25px}
      }
      @media(max-width:390px){
        .ramakDayStrip{gap:3px}.ramakDay{padding:8px 1px;font-size:.58rem}
        .ramakSelectedBanner{grid-template-columns:38px 1fr}.ramakSelectedBanner button{grid-column:1/-1;width:100%}
        .ramakColorOrb{width:36px;height:36px}
      }
    `;
    document.head.appendChild(style);
  }
}

function renderParashaRail(){
  const host=$('ramakParashaRail');
  if(!host||!RAMAK_DATA) return;
  host.innerHTML=RAMAK_DATA.parashot.map((p,i)=>`
    <button type="button" role="tab" class="ramakParashaTab${p.parasha===selectedParasha?' on':''}"
      data-ramak-parasha="${esc(p.parasha)}" aria-selected="${p.parasha===selectedParasha}">
      <small>${String(i+1).padStart(2,'0')}</small><b>${esc(p.parasha)}</b>
    </button>
  `).join('');
}

function renderDayStrip(p,c){
  const host=$('ramakDayStrip');
  host.innerHTML=Array.from({length:7},(_,i)=>{
    const day=i+1, found=p.caminos.find(x=>Number(x.dia)===day);
    return `<button type="button" class="ramakDay${found&&day===Number(c.dia)?' on':''}${found?'':' missing'}"
      data-ramak-day="${day}" ${found?'':'disabled'} aria-label="${found?`Día ${day}: ${esc(found.titulo)}`:`Día ${day}: no disponible`}">D${day}</button>`;
  }).join('');
}

function activateRamakStep(step,scroll=true){
  selectedRamakStep=step;
  caminoScreen?.querySelectorAll('[data-ramak-step]').forEach(b=>{
    if(b.classList.contains('ramakThreshold')) b.classList.toggle('on',b.dataset.ramakStep===step);
  });
  caminoScreen?.querySelectorAll('[data-ramak-panel]').forEach(p=>p.classList.toggle('on',p.dataset.ramakPanel===step));
  if(scroll) caminoScreen?.querySelector('.ramakThresholdRail')?.scrollIntoView({behavior:'smooth',block:'start'});
}

function navButtons(step){
  const order=['encuentro','raiz','profundizar','practica','llevar'];
  const i=order.indexOf(step);
  const prev=i>0?`<button type="button" data-ramak-step="${order[i-1]}">← ${['Encuentro','Raíz','Profundizar','Práctica','Llevar'][i-1]}</button>`:'<span></span>';
  const next=i<order.length-1?`<button type="button" data-ramak-step="${order[i+1]}">${['Encuentro','Raíz','Profundizar','Práctica','Llevar'][i+1]} →</button>`:'<button type="button" data-route="personal">Ir a Mi Camino →</button>';
  return `<div class="ramakNav">${prev}${next}</div>`;
}

function scene(c,label){
  return `<div class="ramakScene">
    <div class="ramakSceneTop">
      <span class="ramakSceneBadge">DÍA ${esc(c.dia)}</span>
      <span class="ramakSceneBadge">${esc(c.sefira)}</span>
    </div>
    <div class="ramakSceneTitle"><small>${label}</small><h2>${esc(c.titulo)}</h2></div>
  </div>`;
}

function renderPanels(p,c){
  const rc=c.ramak_color||{};
  const saved=loadRamakMemory(p.parasha,c.dia)||{};
  const pasuk=c.pasuk||{};
  const voices=c.voces||{};
  const carry=c.paraLlevar||{};
  const colorName=rc.nombre?` · ${esc(rc.nombre)}`:'';

  caminoScreen.querySelector('[data-ramak-panel="encuentro"]').innerHTML=`
    ${scene(c,'01 · ENCUENTRO')}
    <div class="ramakBody">
      <span class="ramakBodyEyebrow">${esc(p.parasha)} · ${esc(c.sefira)}${colorName}</span>
      <div class="ramakReflection"><small>PREGUNTA PARA HOY</small><p>${esc(c.reflexion)}</p></div>
      ${navButtons('encuentro')}
    </div>`;

  caminoScreen.querySelector('[data-ramak-panel="raiz"]').innerHTML=`
    ${scene(c,'02 · RAÍZ')}
    <div class="ramakBody">
      <span class="ramakBodyEyebrow">PASUK · ${esc(p.parasha)}</span>
      <div class="ramakHebrew">${esc(pasuk.hebreo||'')}</div>
      <div class="ramakPasukMeta">
        ${pasuk.trans?`<span><b>Transliteración</b><br>${esc(pasuk.trans)}</span>`:''}
        ${pasuk.ref?`<span><b>Referencia</b><br>${esc(pasuk.ref)}</span>`:''}
      </div>
      <div class="ramakCard"><small>COLOR RAMAK</small><strong>${esc(c.sefira)}${colorName}</strong><p>${esc(rc.hex||'')}</p></div>
      ${navButtons('raiz')}
    </div>`;

  const voiceNames=[
    ['rambam','Rambam'],
    ['ramak','Ramak'],
    ['ramjal','Ramjal'],
    ['rabiNajman','Rabí Najman']
  ];
  caminoScreen.querySelector('[data-ramak-panel="profundizar"]').innerHTML=`
    ${scene(c,'03 · PROFUNDIZAR')}
    <div class="ramakBody">
      <span class="ramakBodyEyebrow">CUATRO VOCES · UNA MISMA RAÍZ</span>
      <div class="ramakVoices">
        ${voiceNames.map(([key,label])=>`<article class="ramakVoice"><small>${label.toUpperCase()}</small><b>${label}</b><p>${esc(voices[key]||'')}</p></article>`).join('')}
      </div>
      ${navButtons('profundizar')}
    </div>`;

  caminoScreen.querySelector('[data-ramak-panel="practica"]').innerHTML=`
    ${scene(c,'04 · PRÁCTICA')}
    <div class="ramakBody">
      <span class="ramakBodyEyebrow">AVODÁ · LLEVAR EL ESTUDIO A LA VIDA</span>
      <div class="ramakCard ramakPractice"><small>AVODÁ DE HOY</small><strong>${esc(carry.avoda||'')}</strong></div>
      <label for="ramakNote">Una nota privada para recordar</label>
      <textarea id="ramakNote" rows="4" maxlength="700" placeholder="¿Qué quieres llevar de esta práctica?">${esc(saved.note||'')}</textarea>
      ${navButtons('practica')}
    </div>`;

  caminoScreen.querySelector('[data-ramak-panel="llevar"]').innerHTML=`
    ${scene(c,'05 · LLEVAR')}
    <div class="ramakBody">
      <span class="ramakBodyEyebrow">KAVANÁ · HITBODEDUT · MEMORIA</span>
      <div class="ramakCarryGrid">
        <div class="ramakCard ramakKavana"><small>KAVANÁ</small><strong>${esc(carry.kavana||'')}</strong></div>
        <div class="ramakCard"><small>HITBODEDUT</small><strong>${esc(carry.hitbodedut||'')}</strong></div>
        ${saved.note?`<div class="ramakCard"><small>TU NOTA</small><p>“${esc(saved.note)}”</p></div>`:''}
      </div>
      <button class="ramakSave" type="button" id="ramakSaveMemory">Guardar este Camino en Mi Camino</button>
      <p class="ramakSaveStatus" id="ramakSaveStatus">${saved.savedAt?'Este Camino ya está guardado en este dispositivo.':''}</p>
      ${navButtons('llevar')}
    </div>`;
}

function renderRamak(scrollToChooser=false){
  if(!RAMAK_DATA||!caminoScreen) return;
  let p=currentParasha();
  if(!p){selectedParasha=RAMAK_DATA.parashot[0].parasha;p=currentParasha();}
  let c=currentCamino();
  if(!c){selectedDay=p.caminos[0]?.dia||1;c=currentCamino();}
  if(!c) return;

  const rc=c.ramak_color||{};
  const hex=rc.hex||'#E8EAED';
  caminoScreen.style.setProperty('--ramak-accent',hex);
  caminoScreen.style.setProperty('--ramak-ink',rc.texto||luminanceText(hex));

  const pi=RAMAK_DATA.parashot.findIndex(x=>x.parasha===p.parasha);
  $('ramakWeekIndex').textContent=`PARASHÁ ${String(pi+1).padStart(2,'0')} DE ${RAMAK_DATA.parashot.length}`;
  $('ramakParashaTitle').textContent=p.parasha;
  $('ramakPrinciple').textContent=p.principio||'Encuentros Diarios · Edición Ramak';
  $('ramakTorahRef').textContent=p.ref?`Torá · ${p.ref}`:'';
  $('ramakHaftarahRef').textContent=p.haftarah?`Haftará · ${p.haftarah}`:'';
  $('ramakSelectedMeta').textContent=`DÍA ${c.dia} · ${p.parasha.toUpperCase()} · ${String(c.sefira).toUpperCase()}`;
  $('ramakSelectedTitle').textContent=c.titulo;
  $('ramakColorOrb').style.background=hex;

  renderParashaRail();
  renderDayStrip(p,c);

  const incomplete=$('ramakIncomplete');
  if(p.caminos.length<7){
    incomplete.hidden=false;
    incomplete.textContent=`Esta edición contiene ${p.caminos.length} de 7 caminos para ${p.parasha}. Los caminos faltantes no fueron completados artificialmente.`;
  }else{
    incomplete.hidden=true;
    incomplete.textContent='';
  }

  renderPanels(p,c);
  activateRamakStep(selectedRamakStep,false);

  if(scrollToChooser) $('ramakChooser')?.scrollIntoView({behavior:'smooth',block:'start'});
}

function renderRamakError(){
  if(!caminoScreen) return;
  const chooser=$('ramakChooser');
  if(chooser) chooser.innerHTML=`<div class="ramakLoading">No fue posible cargar Caminos Diarios. Verifica que <b>content/caminos-ramak-v21.json</b> esté en la rama.</div>`;
}

async function loadRamak(){
  try{
    const res=await fetch(RAMAK_URL,{cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data=await res.json();
    if(!Array.isArray(data.parashot)||!data.parashot.length) throw new Error('Datos vacíos');
    RAMAK_DATA=data;
    window.DEREJ_RAMAK_V21=data;
    selectedParasha=data.parashot.some(p=>p.parasha===selectedParasha)?selectedParasha:data.parashot[0].parasha;
    selectedDay=data.parashot.find(p=>p.parasha===selectedParasha)?.caminos?.[0]?.dia||1;
    renderRamak(false);
  }catch(err){
    ramakLoadError=String(err?.message||err);
    renderRamakError();
  }
}

document.addEventListener('click',e=>{
  const r=e.target.closest('[data-route]');
  if(r){route(r.dataset.route);return;}

  const sc=e.target.closest('[data-ramak-scroll]');
  if(sc){$(sc.dataset.ramakScroll)?.scrollIntoView({behavior:'smooth',block:'start'});return;}

  const p=e.target.closest('[data-ramak-parasha]');
  if(p&&RAMAK_DATA){
    saveRamakDraft();
    selectedParasha=p.dataset.ramakParasha;
    selectedDay=currentParasha()?.caminos?.[0]?.dia||1;
    selectedRamakStep='encuentro';
    renderRamak(true);
    return;
  }

  const d=e.target.closest('[data-ramak-day]');
  if(d&&!d.disabled&&RAMAK_DATA){
    saveRamakDraft();
    selectedDay=Number(d.dataset.ramakDay);
    selectedRamakStep='encuentro';
    renderRamak(true);
    return;
  }

  const step=e.target.closest('[data-ramak-step]');
  if(step){
    saveRamakDraft();
    activateRamakStep(step.dataset.ramakStep,true);
    return;
  }

  if(e.target.closest('#ramakSaveMemory')){
    const p=currentParasha(),c=currentCamino();
    if(!p||!c) return;
    const carry=c.paraLlevar||{},rc=c.ramak_color||{};
    const memory={
      schema:'ramak-v21',
      edition:'Edición Ramak',
      encounter:`${p.parasha}-${c.dia}`,
      parasha:p.parasha,
      dia:c.dia,
      titulo:c.titulo,
      sefira:c.sefira,
      ramakColor:rc.hex||'',
      reflexion:c.reflexion||'',
      avoda:carry.avoda||'',
      kavana:carry.kavana||'',
      hitbodedut:carry.hitbodedut||'',
      note:$('ramakNote')?.value.trim()||'',
      savedAt:new Date().toISOString()
    };
    try{
      localStorage.setItem(memoryKey(p.parasha,c.dia),JSON.stringify(memory));
      $('ramakSaveStatus').textContent='Guardado sólo en este dispositivo.';
    }catch{
      $('ramakSaveStatus').textContent='No fue posible guardar en este navegador.';
    }
    return;
  }
});

caminoScreen?.addEventListener('input',e=>{
  if(e.target?.id==='ramakNote') saveRamakDraft();
});

prepareCaminoShell();
loadRamak();

/* SHABAT v2.1 · Prelanzamiento · seis caminos RC2 */
(()=>{
  const SHABAT_DATA=[{"id":1,"num":"01","hebreo":"לכה דודי","hebreoNikud":"לְכָה דוֹדִי","translit":"Kabalat Shabat","titulo":"Recibir","tituloHeb":"Kabalat Shabat","tagline":"Llegar es un arte. No entras a Shabat, lo recibes como a una novia.","abierta":"Llegar es un arte. No entras a Shabat, lo recibes como a una novia. Sales a buscarla, te vistes distinto, preparas la casa. Kabalat Shabat no es una oración más: es un cortejo. Se hace de pie, cantando, girándote hacia la puerta. Porque lo sagrado no se fuerza. Se recibe. Cuando entiendes eso, dejas de perseguir el descanso y aprendes a darle la bienvenida.","profunda":{"texto":"Lejá Dodi, de Shlomo Alkabetz (Safed, siglo XVI), toma el versículo de Shir HaShirim y lo convierte en liturgia erótica y mística. Cada estrofa termina en \"Boí beshalom ateret baalá\" — entra en paz, corona de tu marido. En el Zohar, Shabat es Malká, la Reina, y también Kalá, la Novia. Shamor y Zajor: los dos verbos del Decálogo. Zajor (recordar) es positivo, masculino, santificar. Shamor (guardar) es negativo, femenino, no hacer. Según Rambam en Hiljot Shabat 29, recibir a Shabat con alegría, ropa limpia y luz encendida es parte de la mitzvá misma. No es preparación, es Shabat ya empezando.","fuentes":["Shlomo Alkabetz – Lejá Dodi","Zohar II, 88b – Shabat Malká","Rambam, Hiljot Shabat 29:2 – Kabod y Oneg"],"hebreoFuente":"שָׁמוֹר וְזָכוֹר בְּדִבּוּר אֶחָד\nהִשְׁמִיעָנוּ אֵל הַמְּיֻחָד"},"practica":{"titulo":"Pausa de atardecer","dias":[{"dia":"Día 1","accion":"2 min de pie frente a la ventana. Sin celular. Solo mirar cómo cae la luz."},{"dia":"Día 2","accion":"Pregunta: ¿Qué del día que se va quiero recibir, no resolver?"},{"dia":"Día 3","accion":"Vístete 5 min distinto para cenar. Camisa limpia. Gesto de novia/novio."},{"dia":"Día 4","accion":"Canta Lejá Dodi en voz baja, aunque no sepas la melodía."},{"dia":"Día 5","accion":"Sal a caminar 10 min sin destino. Estás saliendo a recibir."},{"dia":"Día 6","accion":"Prepara tu espacio como si viniera alguien amado. Flores, luz."},{"dia":"Día 7","accion":"Kabalat completa: de pie, vuelta hacia el oeste, 4 minutos de silencio."}]}},{"id":2,"num":"02","hebreo":"נרות","hebreoNikud":"נֵרוֹת","translit":"Nerot","titulo":"Encender","tituloHeb":"Nerot","tagline":"Antes de que oscurezca, haces luz. No esperas luz, la enciendes.","abierta":"Antes de que oscurezca, haces luz. No esperas luz, la enciendes. Este es un acto femenino por excelencia: crear hogar con las manos. Dos velas, no una. No por simetría, sino porque la luz siempre necesita compañía para quedarse. Cuando las enciendes, cubres tus ojos. No ves la luz al nacer. La ves después, reflejada en tu casa. Así se aprende a encender: sin ver el resultado inmediato.","profunda":{"texto":"Berajá: Baruj Atá A-donai, Eloheinu Mélej Haolam, Asher Kideshanu Bemitzvotav Vetzivanu Lehadlik Ner Shel Shabat. Rashi sobre Bereshit 1:3 dice que la primera creación no fue el sol, sino la luz que permite ver. Por eso encender es la primera melajá separadora: Or y Joshej. ¿Por qué dos velas? Shamor y Zajor otra vez. También Isha y Ish. Cielo y tierra. Lo que recuerda y lo que guarda. La llama, dice el Sfat Emet, es el único elemento que no puedes partir sin multiplicarlo.","fuentes":["Berajá – Lehadlik ner shel Shabat","Rashi Bereshit 1:3 – Yehi Or","Sfat Emet, Parashat Bereshit"],"hebreoFuente":"בָּרוּךְ אַתָּה יְיָ\nאֲשֶׁר קִדְּשָׁנוּ לְהַדְלִיק נֵר שֶׁל שַׁבָּת"},"practica":{"titulo":"Luz con cavaná","dias":[{"dia":"Día 1","accion":"Compra velas de cera de abeja. Tócalas. Huele."},{"dia":"Día 2","accion":"18 minutos antes de la puesta de sol, apaga todas las luces eléctricas."},{"dia":"Día 3","accion":"Enciende 2 velas. Cubre tus ojos 20 segundos. Pide en silencio 3 deseos."},{"dia":"Día 4","accion":"Enciende aunque estés solo/sola. Di la berajá aunque tiembles."},{"dia":"Día 5","accion":"Deja que las velas se consuman sin apagarlas. Mira cómo cambia tu cara."},{"dia":"Día 6","accion":"Viernes: invita a alguien a encender contigo. Luz compartida."},{"dia":"Día 7","accion":"Escribe qué luz encendiste esta semana que no existía antes."}]}},{"id":3,"num":"03","hebreo":"קידוש","hebreoNikud":"קִדּוּשׁ","translit":"Kiddush","titulo":"Santificar","tituloHeb":"Kiddush","tagline":"Santificar es separar con palabra y vino. Decir: este tiempo es distinto.","abierta":"Santificar es separar con palabra y vino. Decir: este tiempo es distinto. No es mejor ni peor. Es otro. El Kiddush no bendice el vino: usa el vino para bendecir el tiempo. Lo tomas con la mano derecha, lleno hasta derramar. Porque la alegría, para guardar el tiempo, tiene que desbordar un poco. De noche es deoraitá, de día es derabanán. Pero los dos dicen lo mismo: hoy no es continuación de ayer.","profunda":{"texto":"Zajor et Yom HaShabat Lekadshó – Shemot 20:8. Recuerda. El verbo zajor es activo. No es memoria pasiva, es hacer memorable. El vino es alegría que guarda, no que olvida. Por eso Kiddush de noche incluye Vayejulu – testimonio de la creación. Y Kiddush de día incluye Veshamru – testimonio de la salida de Egipto. Un Shabat guarda el mundo, el otro te guarda a ti. Beber sin bendecir es tomar. Bendecir y luego beber es santificar. La diferencia es una palabra en medio.","fuentes":["Shemot 20:8 – Zajor et Yom HaShabat","Pesajim 106a – Kiddush Hayom","Rambam, Hiljot Shabat 29:1"],"hebreoFuente":"זָכוֹר אֶת יוֹם הַשַּׁבָּת לְקַדְּשׁוֹ\nוַיְכֻלּוּ הַשָּׁמַיִם וְהָאָרֶץ"},"practica":{"titulo":"Copa, pan, tiempo","dias":[{"dia":"Día 1","accion":"Consigue una copa que solo uses para Kiddush. Que tenga peso."},{"dia":"Día 2","accion":"Llena la copa hasta que casi derrame. Mira el borde."},{"dia":"Día 3","accion":"Di Vayejulu en voz alta, de pie. Aunque estés solo."},{"dia":"Día 4","accion":"Kiddush con pan delante cubierto. Dos panes. Lechem Mishné."},{"dia":"Día 5","accion":"Bebe sentado. De un trago pequeño. No a sorbos."},{"dia":"Día 6","accion":"Viernes noche: Kiddush completo con alguien, compartiendo la misma copa."},{"dia":"Día 7","accion":"Kiddush de día: más corto, más dulce. ¿Qué tiempo distinto estás marcando?"}]}},{"id":4,"num":"04","hebreo":"סעודה ועונג","hebreoNikud":"סְעוּדָּה וְעֹנֶג","translit":"Seudá veOneg","titulo":"Mesa","tituloHeb":"Seudá y Oneg","tagline":"Comer sin apuro. Shabat tiene 3 seudot. El placer es mitzvá, no culpa.","abierta":"Comer sin apuro. Shabat tiene tres seudot, no por hambre, sino por ritmo. Viernes noche, Shabat mañana, Seudá Shlishit al atardecer. Cada una con su luz distinta. El placer es mitzvá, no culpa. Oneg no es lujo, es atención. Partir el pan despacio, cantar zemirot aunque desafines, dejar que la comida sea oración sin palabras. Aquí el estómago también reza.","profunda":{"texto":"VeKarata LaShabat Oneg – Yeshaya 58:13. Y llamarás al Shabat deleite. El Talmud (Shabat 118a) dice: todo el que deleita el Shabat recibe herencia sin límites. Lechem Mishné: dos panes en recuerdo del doble maná que caía viernes. No es magia, es memoria encarnada. Zemirot no son canciones de sobremesa, son Tikún para la seudá, para que no sea solo ingesta. Comer en Shabat es avodá – servicio. El Arizal decía que las chispas más altas están en la comida de Shabat porque se comen sin ansiedad.","fuentes":["Yeshaya 58:13 – Oneg Shabat","Shabat 118a – Kol Hameoneg","Arizal – Shaar HaKavanot, Seudot Shabat"],"hebreoFuente":"וְקָרָאתָ לַשַּׁבָּת עֹנֶג\nלֶחֶם מִשְׁנֶה – זֵכֶר לַמָּן"},"practica":{"titulo":"Mesa sin prisa","dias":[{"dia":"Día 1","accion":"Compra jalá trenzada. Si no hay, trenza pan común."},{"dia":"Día 2","accion":"Una comida sin celular a la vista. Celular en otro cuarto."},{"dia":"Día 3","accion":"Canta un zemer. Shalom Alejem. Aunque solo tararees."},{"dia":"Día 4","accion":"Sirve 3 platos pequeños en lugar de 1 grande. Ritmo."},{"dia":"Día 5","accion":"Come con la mano no dominante 2 minutos. Atención."},{"dia":"Día 6","accion":"Viernes noche: mesa con mantel blanco, invita."},{"dia":"Día 7","accion":"Seudá Shlishit: al atardecer, solo pan, aceituna y silencio."}]}},{"id":5,"num":"05","hebreo":"מנוחה","hebreoNikud":"מְנוּחָה","translit":"Menujá","titulo":"Descanso radical","tituloHeb":"Menujá","tagline":"Descanso no es no hacer nada. Es dejar de producir.","abierta":"Descanso no es no hacer nada. Es dejar de producir. Las 39 melajot no son prohibiciones: son 39 formas de no intervenir el mundo. No sembrar, no cosechar, no escribir, no encender fuego. No porque el trabajo sea malo, sino porque necesitas un día donde el mundo siga sin ti. Aquí Shabat toca directamente el Bloque 6 de Adam Adamá – Trabajo. Si no paras, el trabajo te define. Si paras, te recuerdas.","profunda":{"texto":"Shemot 20:10 – Lemaán Yanúaj Avdejaj Vaamatejá... Kaamoja. Para que descanse tu siervo, tu buey y tu extranjero como tú. No es privilegio, es derecho. El descanso es la primera ley laboral de la Torá. Rambam dice: Menujá no es ausencia de trabajo, es presencia de sistema que se mantiene solo. Por eso Shabat no es vacaciones. Vacaciones cambian de lugar. Shabat cambia de modo. De hacer a ser. De crear a contemplar. En tiempos de burnout, Menujá es desobediencia sagrada.","fuentes":["Shemot 20:10 – Kaamoja","Rambam, More Nevujim II:31 – Taamei HaShabat","Abraham J. Heschel – The Sabbath, Menujá como arquitectura del tiempo"],"hebreoFuente":"לְמַעַן יָנוּחַ עַבְדְּךָ וַאֲמָתְךָ כָּמוֹךָ\nשֵׁשֶׁת יָמִים תַּעֲבֹד – וּבַיּוֹם הַשְּׁבִיעִי תִּשְׁבֹּת"},"practica":{"titulo":"25 horas sin crear","dias":[{"dia":"Día 1","accion":"Haz lista de lo que NO harás: comprar, crear, producir, optimizar."},{"dia":"Día 2","accion":"Haz lista de lo que SÍ harás: caminar, leer por placer, amar, dormir."},{"dia":"Día 3","accion":"Deja el celular cargando en otra habitación de puesta de sol a puesta de sol."},{"dia":"Día 4","accion":"Camina sin audífonos 30 min. Sin contar pasos."},{"dia":"Día 5","accion":"Lee un libro de papel que no te sirva para nada."},{"dia":"Día 6","accion":"25 horas reales: de viernes atardecer a sábado noche. Sin comprar."},{"dia":"Día 7","accion":"Escribe: ¿Qué parte de ti descansa cuando no produces?"}]}},{"id":6,"num":"06","hebreo":"הבדלה","hebreoNikud":"הַבְדָּלָה","translit":"Havdalá","titulo":"Separar","tituloHeb":"Havdalá","tagline":"Salir también es sagrado. Vino, especias y fuego para llevarte el aroma.","abierta":"Salir también es sagrado. Havdalá no es cierre, es costura. Vino, especias y fuego para llevarte el aroma de Shabat a la semana. Hueles las besamim porque se va el alma extra – neshamá yeterá – y necesitas consuelo. Miras la llama entre tus dedos para aprender de nuevo a crear fuego. Separar es también un arte. No todo lo sagrado dura para siempre. Algunas cosas hay que despedirlas con belleza para que vuelvan.","profunda":{"texto":"Berajá: Hamavdil Ben Kodesh Lejol, Ben Or Lejoshej, Ben Israel Laamim, Ben Yom Hashevií Lesheshet Yemei Hamaasé. El que separa. Cinco separaciones en una. Besamim para el alma extra que se va – según Talmud Betzá 16a, en Shabat recibes una neshamá adicional que te hace ver más claro. Cuando se va, quedas triste, por eso olemos perfume. Ner: vuelves a crear fuego, vuelves a ser socio de la creación. Después de 25 horas de no crear, encender la mecha es volver a decir: el mundo te necesita otra vez.","fuentes":["Talmud Betzá 16a – Neshamá Yeterá","Berajot 8a – Hamavdil","Rav Kook – Olat Reiyá, Havdalá como esperanza"],"hebreoFuente":"הַמַּבְדִּיל בֵּין קֹדֶשׁ לְחוֹל\nבֵּין אוֹר לְחֹשֶׁךְ – בְּשָׂמִים לִנְשָׁמָה יְתֵרָה"},"practica":{"titulo":"Aroma para la semana","dias":[{"dia":"Día 1","accion":"Consigue besamim: clavo, canela, romero. Guárdalos en cajita."},{"dia":"Día 2","accion":"Sábado noche: copa de vino, especias, vela trenzada con 2 mechas."},{"dia":"Día 3","accion":"Mira la sombra de tus dedos a la luz de Havdalá. Cuenta tus líneas."},{"dia":"Día 4","accion":"Huele las besamim 3 veces profundo. ¿A qué te recuerda?"},{"dia":"Día 5","accion":"Di: \"Que esta semana tenga algo del perfume de Shabat\"."},{"dia":"Día 6","accion":"Havdalá con alguien. Compartan deseos para la semana."},{"dia":"Día 7","accion":"Guarda un resto de cera de la vela Havdalá en tu bolsillo toda la semana."}]}}];
  const screen=document.querySelector('[data-screen="shabat"]');
  if(!screen) return;

  screen.className='screen shabatScreen';
  screen.setAttribute('aria-labelledby','shabatTitle');
  screen.innerHTML=`
    <section class="shabatHero">
      <div class="shabatHeroShade" aria-hidden="true"></div>
      <button class="backBtn shabatBack" data-route="home">← Patio</button>
      <div class="shabatHeroCopy">
        <span class="shabatEyebrow">SHABAT · שבת</span>
        <h1 id="shabatTitle">Detener<br>y escuchar.</h1>
        <p>Un portal para aprender a parar. 6 caminos de bendición para recibir, habitar y despedir el tiempo sagrado.</p>
        <button class="shabatEnter" data-shabat-scroll="shabatJourney">Recorrer los seis caminos <span>↓</span></button>
      </div>
    </section>

    <section class="shabatJourney" id="shabatJourney" aria-labelledby="shabatJourneyTitle">
      <header class="shabatJourneyHead">
        <span>SEIS GESTOS · UN MISMO SHABAT</span>
        <h2 id="shabatJourneyTitle">De recibir la luz<br>a despedirla con belleza.</h2>
      </header>
      <div class="shabatJourneyLine" aria-hidden="true"></div>
      <div id="shabatGates"></div>
    </section>

    <section class="shabatDetail" id="shabatDetail" aria-live="polite"></section>
  `;

  if(!document.getElementById('shabatV21Styles')){
    const style=document.createElement('style');
    style.id='shabatV21Styles';
    style.textContent=`
      .shabatScreen{background:#efe2ca;color:#312b23;padding-bottom:calc(36px + env(safe-area-inset-bottom))}
      .shabatHero{position:relative;min-height:70dvh;overflow:hidden;background:url('assets/shabat-evening-v21.webp') 11% 34%/cover no-repeat;border-bottom:1px solid rgba(217,184,111,.25)}
      .shabatHeroShade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,10,8,.18),rgba(8,11,8,.10) 28%,rgba(8,10,7,.38) 62%,rgba(7,9,7,.92) 100%),radial-gradient(circle at 18% 36%,rgba(222,153,61,.20),transparent 38%)}
      .shabatBack{position:absolute;top:12px;left:12px;z-index:4}
      .shabatHeroCopy{position:absolute;z-index:3;left:20px;right:20px;bottom:24px;color:#fff1d4;text-shadow:0 2px 16px #000}
      .shabatEyebrow{font-size:.62rem;letter-spacing:.22em;font-weight:900;color:#e4c67f}
      .shabatHero h1{font:clamp(2.8rem,12vw,4.7rem)/.88 Georgia,serif;margin:.22em 0 .24em;letter-spacing:-.025em}
      .shabatHero p{max-width:31rem;margin:0 0 18px;font:1rem/1.42 Georgia,serif;color:#eadfcb}
      .shabatEnter{display:flex;align-items:center;justify-content:center;gap:18px;width:min(100%,430px);border:1px solid rgba(248,226,183,.72);border-radius:999px;background:#f1e4ca;color:#30291f;padding:14px 18px;font-weight:850}
      .shabatJourney{position:relative;padding:31px 16px 28px;background:linear-gradient(180deg,#efe2ca,#f7ecd8 58%,#efe2ca)}
      .shabatJourneyHead{position:relative;z-index:2;text-align:center;margin:0 auto 24px;max-width:35rem}
      .shabatJourneyHead>span{font-size:.58rem;letter-spacing:.2em;font-weight:900;color:#7a684a}
      .shabatJourneyHead h2{font:clamp(2rem,8.4vw,3rem)/1 Georgia,serif;margin:.35em 0 0;color:#302a23;text-wrap:balance}
      #shabatGates{position:relative;z-index:2;display:grid;gap:13px;padding:4px 0}
      .shabatJourneyLine{position:absolute;z-index:1;top:150px;bottom:34px;left:50%;width:1px;background:linear-gradient(180deg,rgba(167,130,64,.1),rgba(167,130,64,.65),rgba(167,130,64,.1))}
      .shabatGate{position:relative;width:88%;border:1px solid #cbb99c;border-radius:24px;background:rgba(255,247,232,.86);color:#352e26;padding:14px 16px;text-align:left;box-shadow:0 8px 24px rgba(64,49,28,.06);backdrop-filter:blur(5px)}
      .shabatGate:nth-child(odd){justify-self:start}
      .shabatGate:nth-child(even){justify-self:end}
      .shabatGate:before{content:"";position:absolute;top:50%;width:10px;height:10px;border:2px solid #a98850;border-radius:50%;background:#f4e7d0;transform:translateY(-50%)}
      .shabatGate:nth-child(odd):before{right:-9.4%}
      .shabatGate:nth-child(even):before{left:-9.4%}
      .shabatGateTop{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .shabatGateNum{font-size:.58rem;letter-spacing:.16em;font-weight:900;color:#8a744f}
      .shabatGateHeb{direction:rtl;font:1.2rem Georgia,serif;color:#5b664f}
      .shabatGate h3{font:1.65rem/1 Georgia,serif;margin:.28em 0 .12em}
      .shabatGate small{font-size:.6rem;letter-spacing:.12em;font-weight:850;color:#7b705f}
      .shabatGate p{font:.79rem/1.38 Georgia,serif;color:#6d6255;margin:.55em 0 0}
      .shabatGate.on{background:#354532;color:#fff;border-color:#354532;box-shadow:0 12px 30px rgba(53,69,50,.18)}
      .shabatGate.on .shabatGateNum,.shabatGate.on .shabatGateHeb,.shabatGate.on small,.shabatGate.on p{color:#f0dfbb}
      .shabatDetail{margin:0 12px 12px;border:1px solid #d1c1a5;border-radius:30px;overflow:hidden;background:#fff7e8;box-shadow:0 16px 38px rgba(61,46,26,.09)}
      .shabatDetailScene{position:relative;height:220px;background-image:linear-gradient(180deg,rgba(7,10,8,.08),rgba(7,10,8,.76)),url('assets/shabat-evening-v21.webp');background-size:cover;background-position:var(--shabat-pos,18% 40%);color:#fff0d3;padding:16px}
      .shabatDetailScene .num{display:grid;place-items:center;width:46px;height:46px;border:1px solid rgba(255,232,190,.7);border-radius:50%;background:rgba(10,14,10,.42);font:1rem Georgia,serif}
      .shabatDetailHeb{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);direction:rtl;font:2.5rem Georgia,serif;color:#f5ddb0;text-shadow:0 2px 14px #000;white-space:nowrap}
      .shabatDetailBody{padding:19px}
      .shabatDetailMeta{font-size:.59rem;letter-spacing:.16em;font-weight:900;color:#7d6b4a}
      .shabatDetailBody h2{font:clamp(2.15rem,9vw,3rem)/.98 Georgia,serif;margin:.28em 0 .08em;color:#332c25;letter-spacing:-.02em}
      .shabatTranslit{font:.9rem/1.35 Georgia,serif;color:#65705b;margin:0 0 7px}
      .shabatTagline{font:1.05rem/1.45 Georgia,serif;color:#655d52;margin:0 0 16px}
      .shabatTabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:10px 0 15px}
      .shabatTab{border:1px solid #c8b99e;border-radius:16px;background:#f7ecd9;color:#463d31;padding:10px 6px;font-size:.68rem;font-weight:850}
      .shabatTab.on{background:#354532;color:#fff;border-color:#354532}
      .shabatReading{padding:17px;border:1px solid #d3c4aa;border-radius:20px;background:#fffaf0}
      .shabatReading p{margin:0;font:1rem/1.62 Georgia,serif;color:#4f473d}
      .shabatDeepHeb{direction:rtl;text-align:center;white-space:pre-line;font:1.55rem/1.55 Georgia,serif;color:#3e4a38;padding:15px;margin-bottom:14px;border-radius:18px;background:#e7eadb}
      .shabatSources{display:grid;gap:7px;margin-top:15px}
      .shabatSource{font-size:.72rem;line-height:1.4;color:#6d6253;padding-left:15px;position:relative}
      .shabatSource:before{content:"↳";position:absolute;left:0;color:#9b8357}
      .shabatPracticeTitle{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
      .shabatPracticeTitle b{font:1.2rem Georgia,serif}
      .shabatPracticeTitle span{font-size:.58rem;letter-spacing:.15em;font-weight:900;color:#6c795c}
      .shabatDays{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 0 9px}
      .shabatDays::-webkit-scrollbar{display:none}
      .shabatDay{flex:0 0 54px;border:1px solid #c7b89c;border-radius:14px;background:#fffaf1;color:#5b5041;padding:8px 5px;text-align:center;font-size:.62rem;font-weight:850}
      .shabatDay.on{background:#786c54;color:#fff;border-color:#786c54}
      .shabatAction{padding:16px;border-left:4px solid #73805b;border-radius:0 18px 18px 0;background:#e7eadb;font:1rem/1.5 Georgia,serif;color:#484139}
      .shabatKavana{margin-top:14px;padding:14px 15px;border-radius:18px;background:#302d27;color:#f2e3c5}
      .shabatKavana small{display:block;font-size:.55rem;letter-spacing:.15em;font-weight:900;opacity:.65;margin-bottom:6px}
      .shabatKavana p{margin:0;font:italic 1rem/1.45 Georgia,serif}
      .shabatNav{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:15px}
      .shabatNav button{border:1px solid #9d8b70;border-radius:14px;background:#f6ecda;color:#443c32;padding:10px;font-size:.73rem;font-weight:850}
      @media(min-width:700px){
        .shabatHero{min-height:720px;border-radius:0 0 34px 34px}
        .shabatJourney{padding:42px 70px}
        #shabatGates{max-width:760px;margin:auto}
        .shabatDetail{margin:20px 18px}
        .shabatDetail{display:grid;grid-template-columns:40% 60%}
        .shabatDetailScene{height:auto;min-height:590px}
        .shabatDetailBody{padding:30px}
      }
      @media(max-width:390px){
        .shabatHero{min-height:66dvh}
        .shabatHero h1{font-size:2.7rem}
        .shabatJourney{padding-left:11px;padding-right:11px}
        .shabatGate{width:90%;padding:13px}
        .shabatGate h3{font-size:1.5rem}
        .shabatDetail{margin-left:8px;margin-right:8px}
        .shabatDetailScene{height:190px}
        .shabatDetailHeb{font-size:2.15rem}
        .shabatDetailBody{padding:16px}
      }
    `;
    document.head.appendChild(style);
  }



  if(!document.getElementById('shabatV21Polish')){
    const style2=document.createElement('style');
    style2.id='shabatV21Polish';
    style2.textContent=`
      .shabatHero{background-position:56% 48%}
      .shabatHeroShade{background:linear-gradient(180deg,rgba(7,10,8,.16),rgba(8,11,8,.10) 28%,rgba(8,10,7,.34) 62%,rgba(7,9,7,.9) 100%),radial-gradient(circle at 16% 35%,rgba(229,167,73,.28),transparent 34%),radial-gradient(circle at 68% 42%,rgba(255,220,140,.08),transparent 28%)}
      .shabatDetailScene:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,10,8,.08),rgba(8,10,8,.46) 54%,rgba(8,10,8,.78) 100%)}
      .shabatDetailScene > *{position:relative;z-index:1}
      .shabatAction{background:#eef0e6;color:#332d25;border:1px solid #d7dbc8}
      .shabatKavana{background:#2f2a24;border-left:4px solid #cfa95f;box-shadow:inset 0 0 0 1px rgba(241,220,180,.08)}
      .shabatKavana small{color:#e4c891;opacity:1}
      .shabatKavana p{color:#f5e8cf;opacity:1;text-shadow:none}
      .shabatNav button{background:#fff5e7}
      @media(max-width:699px){
        .shabatHero{min-height:64dvh;background-position:58% 50%}
        .shabatHeroCopy{left:18px;right:18px;bottom:20px}
        .shabatHero h1{font-size:clamp(2.45rem,12vw,3.9rem);line-height:.9}
        .shabatHero p{font-size:.95rem;line-height:1.36;margin-bottom:14px;max-width:20rem}
        .shabatEnter{padding:13px 16px}
        .shabatJourneyHead h2{text-wrap:balance}
        .shabatPracticeTitle{display:block}
        .shabatPracticeTitle b{display:block;margin-bottom:4px}
        .shabatPracticeTitle span{display:block}
        .shabatDays{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;overflow:visible;padding:2px 0 10px}
        .shabatDay{min-width:0;flex:unset;padding:9px 4px;font-size:.7rem}
        .shabatAction{font-size:1.02rem;line-height:1.58;padding:15px}
        .shabatKavana p{font-size:1.02rem;line-height:1.48}
      }
      @media(max-width:390px){
        .shabatHero{min-height:61dvh}
        .shabatDays{grid-template-columns:repeat(3,minmax(0,1fr))}
      }
    `;
    document.head.appendChild(style2);
  }

  let selectedId=1;
  let selectedTab='abierta';
  let selectedDay=0;
  const positions=['22% 36%','72% 64%','65% 72%','76% 80%','38% 46%','80% 58%'];

  function selected(){return SHABAT_DATA.find(x=>x.id===selectedId)||SHABAT_DATA[0];}

  function renderGates(){
    const host=document.getElementById('shabatGates');
    host.innerHTML=SHABAT_DATA.map(x=>`
      <button class="shabatGate${x.id===selectedId?' on':''}" type="button" data-shabat-id="${x.id}">
        <div class="shabatGateTop">
          <span class="shabatGateNum">${x.num}</span>
          <span class="shabatGateHeb">${x.hebreoNikud}</span>
        </div>
        <h3>${x.titulo}</h3>
        <small>${x.translit}</small>
        <p>${x.tagline}</p>
      </button>
    `).join('');
  }

  function tabContent(x){
    if(selectedTab==='abierta'){
      return `<div class="shabatReading"><p>${x.abierta}</p></div>`;
    }
    if(selectedTab==='profunda'){
      return `
        <div class="shabatReading">
          <div class="shabatDeepHeb">${x.profunda.hebreoFuente}</div>
          <p>${x.profunda.texto}</p>
          <div class="shabatSources">${x.profunda.fuentes.map(f=>`<div class="shabatSource">${f}</div>`).join('')}</div>
        </div>`;
    }
    const item=x.practica.dias[selectedDay]||x.practica.dias[0];
    return `
      <div class="shabatReading">
        <div class="shabatPracticeTitle"><b>${x.practica.titulo}</b><span>PRÁCTICA 7 DÍAS</span></div>
        <div class="shabatDays" aria-label="Elegir día">${x.practica.dias.map((d,i)=>`<button type="button" class="shabatDay${i===selectedDay?' on':''}" data-shabat-day="${i}">${d.dia.replace('Día ','D')}</button>`).join('')}</div>
        <div class="shabatAction">${item.accion}</div>
        <div class="shabatKavana"><small>CAVANÁ DE LA SEMANA</small><p>“${x.tagline}”</p></div>
      </div>`;
  }

  function renderDetail(scroll=false){
    const x=selected();
    const host=document.getElementById('shabatDetail');
    host.innerHTML=`
      <div class="shabatDetailScene" style="--shabat-pos:${positions[x.id-1]||'18% 40%'}">
        <span class="num">${x.num}</span>
        <span class="shabatDetailHeb">${x.hebreoNikud}</span>
      </div>
      <div class="shabatDetailBody">
        <div class="shabatDetailMeta">SHABAT · CAMINO ${x.num} DE 06</div>
        <h2>${x.titulo}</h2>
        <p class="shabatTranslit">${x.tituloHeb} · ${x.translit}</p>
        <p class="shabatTagline">${x.tagline}</p>
        <div class="shabatTabs" role="tablist" aria-label="Profundidad de lectura">
          <button type="button" class="shabatTab${selectedTab==='abierta'?' on':''}" data-shabat-tab="abierta">Abierta</button>
          <button type="button" class="shabatTab${selectedTab==='profunda'?' on':''}" data-shabat-tab="profunda">Profunda</button>
          <button type="button" class="shabatTab${selectedTab==='practica'?' on':''}" data-shabat-tab="practica">Práctica</button>
        </div>
        <div id="shabatTabContent">${tabContent(x)}</div>
        <div class="shabatNav">
          <button type="button" data-shabat-prev>← ${SHABAT_DATA[(x.id+4)%6].titulo}</button>
          <button type="button" data-shabat-next>${SHABAT_DATA[x.id%6].titulo} →</button>
        </div>
      </div>`;
    renderGates();
    if(scroll) host.scrollIntoView({behavior:'smooth',block:'start'});
  }

  screen.addEventListener('click',e=>{
    const scroll=e.target.closest('[data-shabat-scroll]');
    if(scroll){document.getElementById(scroll.dataset.shabatScroll)?.scrollIntoView({behavior:'smooth',block:'start'});return;}

    const gate=e.target.closest('[data-shabat-id]');
    if(gate){selectedId=Number(gate.dataset.shabatId);selectedTab='abierta';selectedDay=0;renderDetail(true);return;}

    const tab=e.target.closest('[data-shabat-tab]');
    if(tab){selectedTab=tab.dataset.shabatTab;selectedDay=0;renderDetail(false);return;}

    const day=e.target.closest('[data-shabat-day]');
    if(day){selectedDay=Number(day.dataset.shabatDay);renderDetail(false);return;}

    if(e.target.closest('[data-shabat-prev]')){selectedId=selectedId===1?6:selectedId-1;selectedTab='abierta';selectedDay=0;renderDetail(true);return;}
    if(e.target.closest('[data-shabat-next]')){selectedId=selectedId===6?1:selectedId+1;selectedTab='abierta';selectedDay=0;renderDetail(true);return;}
  });

  renderGates();
  renderDetail(false);
})();

/* MOED v2.1 · Prelanzamiento · seis tiempos RC2 */
(()=>{
  const MOED_DATA=[{"id":"rosh-jodesh","num":1,"titleEs":"Rosh Jodesh","titleHeLatin":"Luna nueva","hebrew":"חדש","hebrewFull":"ראש חודש","tag":"Renacer","abierta":"El tiempo judío no es solar, es lunar. Empieza en oscuridad y crece. Cada mes nace de nuevo. No mides el tiempo que pasa, habitas el tiempo que vuelve.","profunda":"Kiddush HaJodesh es la primera mitzvá dada al pueblo en Egipto, antes de salir. Shemot 12:2 - HaJodesh hazé lajem, rosh jodashim. Rambam en Hiljot Kiddush HaJodesh explica que santificar la luna es santificar el tiempo mismo. El Talmud (Rosh Hashaná 22a) dice que Israel es como la luna: desaparece, parece que no está, y vuelve a brillar. La luna no tiene luz propia; recibe y refleja. Así también, cada mes.","sources":["Shemot 12:1-2 — HaJodesh hazé lajem","Rambam, Hiljot Kiddush HaJodesh 1:1-3","Talmud Rosh Hashaná 22a — mekadeshin al hareiyah","Midrash — David melej Israel jai vekayam, como la luna"],"practicaIntro":"Cada Rosh Jodesh, 5 minutos para preguntar qué renace este mes en ti.","practica7":[{"day":1,"title":"Mirar","desc":"Sal a ver la luna esta noche. ¿En qué fase está? ¿Qué fase estás tú?"},{"day":2,"title":"Nombrar el mes","desc":"Di en voz alta el nombre del mes hebreo. Nisán, Iyar, Siván... cada nombre es un clima interior."},{"day":3,"title":"Oscuridad fértil","desc":"Escribe 3 cosas que terminaron. Agradéceles. La luna empieza en negro."},{"day":4,"title":"Hilel menor","desc":"Recita Hallel abreviado o un salmo 113. Canta lo pequeño que crece."},{"day":5,"title":"Mujeres y luna","desc":"Tradición: Rosh Jodesh es fiesta de las mujeres. Pregunta a una mujer de tu vida qué quiere renovar."},{"day":6,"title":"Kiddush Levana","desc":"Si puedes, di Kidush Levaná bajo la luna. Si no, escribe: 'Renuevo mi alianza con el tiempo'."},{"day":7,"title":"Semilla del mes","desc":"Una sola kavaná para este mes. Una frase. Ej: Este mes de Elul, escucho antes de responder."}]},{"id":"pesaj","num":2,"titleEs":"Pesaj","titleHeLatin":"Libertad","hebrew":"פסח","hebrewFull":"פסח","tag":"Salir","abierta":"Salir de lo estrecho. Mitzrayim es meitzar - angostura. No es historia, es ahora. Cada uno debe verse como si él mismo salió de Egipto hoy.","profunda":"Devarim 16: La Torá ordena recordar que fuiste esclavo. El Seder no es cena, es teatro de la memoria: 4 copas, Matzá - lejem oni, pan de la pobreza y de la fe, Maror - amargura que no se endulza. Rambam dice que Jirut es poder hacer lo que tu mente decide, no lo que tu miedo ordena. Seforno: la libertad judía es libertad con memoria, no olvido. Si olvidas de dónde saliste, vuelves a esclavizarte.","sources":["Devarim 16:1-8 — Shamor et jodesh haaviv","Hagadá — Bejol dor vador","Rambam, Hiljot Jametz uMatzá","Seforno sobre Shemot 12 — Jirut hanefesh"],"practicaIntro":"Limpieza de jametz interno, contar tu propio éxodo.","practica7":[{"day":1,"title":"Bedikat jametz","desc":"Busca tu jametz: ¿Qué relato inflado te cuentas? Escríbelo y dóblalo."},{"day":2,"title":"Biur","desc":"Quema simbólicamente una de esas historias. No la niegues, transfórmala."},{"day":3,"title":"4 preguntas","desc":"Formula tus 4 Ma Nishtaná personales: ¿Qué es diferente esta noche en mi vida?"},{"day":4,"title":"Matzá","desc":"Come algo simple y lento. Sin apuro. La libertad no tiene levadura."},{"day":5,"title":"Maguid","desc":"Cuenta tu éxodo a alguien: ¿De qué saliste este año?"},{"day":6,"title":"Dayenu","desc":"Lista 10 dayenus: hubiera sido suficiente con... Entrena gratitud desmedida."},{"day":7,"title":"Shir","desc":"Canta Shirat HaYam. La libertad termina en canto, no en discurso."}]},{"id":"shavuot","num":3,"titleEs":"Shavuot","titleHeLatin":"Entrega","hebrew":"שבוע","hebrewFull":"שבועות","tag":"Cosechar adentro","abierta":"49 días contando, del grano a la Torá. De cosechar afuera a cosechar adentro. En Pesaj cosechas cebada, en Shavuot traes tu primer fruto humano.","profunda":"Vayikra 23:15 — Usefartem lajem mimajarat haShabat. Sefirat HaOmer es contar la distancia entre salir y recibir. No basta con salir de Egipto, hay que llegar a Sinaí. Kabalat HaTorá no es pasado, es presente continuo. El libro de Rut se lee en Shavuot: una moabita elige pertenecer. Bikurim - traer primicias - es decir: esto primero no es mío, es ofrenda. La Torá es como agua, dicen Jajamim: va hacia lo bajo, hacia el humilde.","sources":["Vayikra 23:15-21 — Sefirat HaOmer","Talmud Shabat 88a — Kabalat HaTorá","Meguilat Rut — bikurim y jesed","Midrash — Ein mayim ela Torá"],"practicaIntro":"Estudio nocturno, traer primeros frutos.","practica7":[{"day":1,"title":"Omer diario","desc":"Cuenta hoy: hoy son X días del Omer. No cuentes automático. Detente."},{"day":2,"title":"Rut","desc":"Lee un capítulo de Rut. ¿A quién eliges acompañar: Adonde vayas iré?"},{"day":3,"title":"Agua","desc":"Estudia 15 minutos de Torá como quien bebe agua. Sin meta de terminar."},{"day":4,"title":"Bikurim","desc":"Trae un primer fruto: algo que hiciste por primera vez este año. Ofrécelo."},{"day":5,"title":"Naasé Venishmá","desc":"Haz antes de entender. Una mitzvá sin entenderla del todo hoy."},{"day":6,"title":"Tikkun Leil Shavuot","desc":"Noche en vela: estudia 3 textos cortos con alguien. Que la noche sostenga."},{"day":7,"title":"Matán","desc":"Escribe tu propio Aseret HaDibrot: 10 frases que quieres recibir como ley interior."}]},{"id":"sucot","num":4,"titleEs":"Sucot","titleHeLatin":"Fragilidad","hebrew":"סכה","hebrewFull":"סוכות","tag":"Abrazo frágil","abierta":"Vivir 7 días en una cabaña frágil para recordar que lo frágil te cuida. Conecta con Adam Adamá - tierra que te sostiene. La sucá no protege del viento, te enseña a confiar en el viento.","profunda":"Vayikra 23:42 — Basukot teshvu shivat yamim. Zohar dice que la Sucá es el abrazo de Dios, jibuka. 7 Ushpizin: Avraham, Yitzjak, Yaakov, Moshe, Aharon, Yosef, David - invitas ancestros a tu fragilidad. Arba Minim: etrog, lulav, hadas, aravá - cuatro tipos de judíos, cuatro partes del cuerpo, cuatro caracteres, todos atados juntos. Sin uno, no hay mitzvá. La sucá debe tener más sombra que sol, y ver estrellas por el sjaj.","sources":["Vayikra 23:42-43 — Lemaán yedu doroteijem","Zohar Emor — Sucá como abrazo","Talmud Sucá 11b — Ushpizin","Midrash sobre Arba Minim"],"practicaIntro":"Comer en Sucá, invitar, mirar estrellas por el techo.","practica7":[{"day":1,"title":"Construir","desc":"Levanta algo frágil hoy: una mesa simple, un techo de ramas. Que no sea perfecto."},{"day":2,"title":"Leshev","desc":"Come una comida completa en la sucá o cerca de una ventana mirando cielo. Sin celular."},{"day":3,"title":"Ushpizin","desc":"Invita hoy a un huésped real y a uno ancestral. ¿Qué le preguntarías a Avraham en tu sucá?"},{"day":4,"title":"Arba Minim","desc":"Toma 4 objetos distintos (fruta, rama, hoja, vara) y átalos. ¿Qué partes tuyas necesitan estar juntas?"},{"day":5,"title":"Noche estrellada","desc":"Mira estrellas por el sjaj o techo. Cuenta 3 que veas. Recuerda: Avraham contó estrellas."},{"day":6,"title":"Fragilidad que cuida","desc":"Escribe: ¿Qué estructura frágil de tu vida te cuida más que las sólidas?"},{"day":7,"title":"Simjá","desc":"Sucot es Zman Simjatenu. Baila 2 minutos sin motivo. La alegría como mitzvá."}]},{"id":"yamim-noraim","num":5,"titleEs":"Yamim Noraim","titleHeLatin":"Días temibles y dulces","hebrew":"ימים","hebrewFull":"ימים נוראים","tag":"Retorno","abierta":"Rosh Hashaná no es fin de año, es cabeza de año. Yom Kippur no es culpa, es limpieza. Teshuvá no es arrepentimiento, es volver. Volver a tu lugar.","profunda":"Shofar: 100 sonidos. Tekiá - entero, Shevarim - quebrado, Teruá - sollozo. Rambam en Hiljot Teshuvá dice que el Shofar dice: despierten dormidos. Kol Nidrei no anula promesas a personas, anula votos precipitados con lo divino. Vidui es confesión en plural: ashamnu, bagadnu - porque mi error es parte de un cuerpo. El Libro de la Vida no es amenaza, es recordatorio: tu vida escribe. El juicio es dulce si te atreves a nombrarte.","sources":["Rambam, Hiljot Teshuvá 1-2 — Teshuvá como retorno","Talmud Rosh Hashaná 16b — 100 kolot shofar","Majzor — Kol Nidrei y Vidui","Bereshit Rabá — Sefer HaJaim"],"practicaIntro":"10 días de retorno, pedir perdón concreto.","practica7":[{"day":1,"title":"Shofar","desc":"Escucha un shofar grabado. 30 segundos de silencio después. ¿Qué despertó?"},{"day":2,"title":"Jeshbón","desc":"Balance no financiero: ¿A quién le debes una palabra? ¿A quién le debes un límite?"},{"day":3,"title":"Slijá concreta","desc":"Pide perdón a una persona específica, sin justificarte. Frase corta: te lastimé cuando..."},{"day":4,"title":"Vidui personal","desc":"Escribe tu propio vidui en plural: nos equivocamos cuando..."},{"day":5,"title":"Tashlij","desc":"Ve a agua corriente. Tira migas o piedritas. Nombra lo que arrojas."},{"day":6,"title":"Erev Kippur","desc":"Come con dulzura antes del ayuno. La mesa previa es mitzvá. Pide bendición a alguien."},{"day":7,"title":"Neila","desc":"Al cerrar, escribe una puerta que quieres que permanezca abierta este año."}]},{"id":"januca-purim","num":6,"titleEs":"Janucá y Purim","titleHeLatin":"Luz oculta y alegría","hebrew":"אור","hebrewFull":"חנוכה ופורים","tag":"Milagro pequeño","abierta":"Dos fiestas rabínicas: una de luz que resiste, otra de máscara que revela. Milagros pequeños. No mar abierto, aceite que dura. No profeta, risa que rompe decreto.","profunda":"Ner Ish UBeito - cada persona y su casa debe encender. No el templo, tu casa. Janucá es jinuja - inauguración: volver a inaugurar lo profanado. Meguilat Ester no nombra a Dios ni una vez: Dios oculto en intriga palaciega. Al HaNisim dice: bimeihem bazmán hazé - en sus días, en este tiempo. La luz de Janucá no se apaga porque es luz de lo poco que alcanza. Purim: ad delo yada - hasta no saber diferencia entre bendito Mordejai y maldito Haman, porque la alegría rompe categorías.","sources":["Shabat 21b — Ner Janucá","Meguilat Ester — hester panim","Al HaNisim — janucá y purim","Rambam Hiljot Meguilá 2:15 — Mishloaj Manot y Matanot"],"practicaIntro":"Encender janukiá 8 días, dar Mishloaj Manot.","practica7":[{"day":1,"title":"Ner 1","desc":"Enciende 1 vela hoy, aunque no sea Janucá. Di: pongo luz donde había costumbre."},{"day":2,"title":"Shemen","desc":"Busca tu aceite pequeño que aún dura: ¿Qué te queda cuando todo falta?"},{"day":3,"title":"Jalon","desc":"Pon tu janukiá en la ventana. Que tu luz sea vista. No escondas tu milagro."},{"day":4,"title":"Máscara","desc":"En Purim nos disfrazamos para revelar. ¿Qué máscara te permite decir la verdad?"},{"day":5,"title":"Mishloaj","desc":"Envía comida a alguien hoy. Dos porciones, a una persona. Sin motivo."},{"day":6,"title":"Matanot","desc":"Da a quien no puede devolverte. Ese es el corazón de Purim."},{"day":7,"title":"Hallel y risa","desc":"Lee Al HaNisim. Luego ríe 60 segundos a propósito. La risa rompe decretos."}]}];
  const screen=document.querySelector('[data-screen="moed"]');
  if(!screen) return;

  const icons={
    "rosh-jodesh":"◔",
    "pesaj":"⌁",
    "shavuot":"♾",
    "sucot":"⌂",
    "yamim-noraim":"◉",
    "januca-purim":"✦"
  };

  screen.className='screen moedScreen';
  screen.setAttribute('aria-labelledby','moedTitle');
  screen.innerHTML=`
    <section class="moedHero">
      <div class="moedHeroShade" aria-hidden="true"></div>
      <button class="backBtn moedBack" data-route="home">← Patio</button>
      <div class="moedHeroCopy">
        <span class="moedEyebrow">MOED · מועד</span>
        <h1 id="moedTitle">El tiempo<br>respira por<br>estaciones.</h1>
        <p>Un portal para vivir los tiempos sagrados como señales en el Camino.</p>
        <button class="moedEnter" data-moed-scroll="moedJourney">Recorrer los tiempos <span>↓</span></button>
      </div>
    </section>

    <section class="moedJourney" id="moedJourney" aria-labelledby="moedJourneyTitle">
      <header class="moedJourneyHead">
        <span>CICLOS · ENCUENTROS · SEÑALES</span>
        <h2 id="moedJourneyTitle">Cada tiempo<br>tiene un propósito.</h2>
      </header>
      <div id="moedGates" class="moedGates"></div>
    </section>

    <section class="moedDetail" id="moedDetail" aria-live="polite"></section>
  `;

  if(!document.getElementById('moedV21Styles')){
    const style=document.createElement('style');
    style.id='moedV21Styles';
    style.textContent=`
      .moedScreen{background:#eee1c7;color:#312b23;padding-bottom:calc(38px + env(safe-area-inset-bottom))}
      .moedHero{position:relative;min-height:68dvh;overflow:hidden;background:url('assets/moed-seasons-v21.webp') 50% 45%/cover no-repeat;border-bottom:1px solid rgba(217,184,111,.28)}
      .moedHeroShade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,10,8,.10),rgba(7,10,8,.08) 24%,rgba(7,10,8,.22) 50%,rgba(7,10,8,.88) 100%),linear-gradient(90deg,rgba(6,9,7,.56),transparent 60%)}
      .moedBack{position:absolute;top:12px;left:12px;z-index:4}
      .moedHeroCopy{position:absolute;z-index:3;left:20px;right:20px;bottom:23px;color:#fff1d4;text-shadow:0 2px 18px #000}
      .moedEyebrow{font-size:.62rem;letter-spacing:.23em;font-weight:900;color:#e5c77f}
      .moedHero h1{font:clamp(2.75rem,12vw,4.7rem)/.89 Georgia,serif;margin:.22em 0 .24em;letter-spacing:-.03em;max-width:560px}
      .moedHero p{max-width:29rem;margin:0 0 17px;font:1rem/1.42 Georgia,serif;color:#eee1cb}
      .moedEnter{display:flex;align-items:center;justify-content:center;gap:18px;width:min(100%,430px);border:1px solid rgba(248,226,183,.72);border-radius:999px;background:#f1e4ca;color:#30291f;padding:14px 18px;font-weight:850}
      .moedJourney{padding:31px 14px 27px;background:linear-gradient(180deg,#efe2ca,#f8efdf 58%,#efe2ca)}
      .moedJourneyHead{text-align:center;margin:0 auto 24px;max-width:38rem}
      .moedJourneyHead>span{font-size:.58rem;letter-spacing:.2em;font-weight:900;color:#786845}
      .moedJourneyHead h2{font:clamp(2rem,8.4vw,3rem)/1 Georgia,serif;margin:.35em 0 0;color:#302a23;text-wrap:balance}
      .moedGates{display:grid;grid-template-columns:1fr 1fr;gap:10px}
      .moedGate{position:relative;min-height:170px;overflow:hidden;border:1px solid #c7b697;border-radius:22px;padding:14px;text-align:left;color:#fff;background-image:linear-gradient(180deg,rgba(6,8,6,.06),rgba(6,8,6,.78)),url('assets/moed-seasons-v21.webp');background-size:cover;background-position:var(--moed-card-pos,50% 50%);box-shadow:0 8px 24px rgba(58,45,26,.09);text-shadow:0 2px 12px #000}
      .moedGate:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(4,6,4,.48) 100%);pointer-events:none}
      .moedGate>*{position:relative;z-index:1}
      .moedGateTop{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .moedGateIcon{display:grid;place-items:center;width:35px;height:35px;border:1px solid rgba(255,226,172,.72);border-radius:50%;background:rgba(10,14,10,.5);color:#ffe5a8;font:1.05rem Georgia,serif}
      .moedGateHeb{direction:rtl;font:1.05rem Georgia,serif;color:#f4ddb0}
      .moedGate h3{font:1.38rem/1.02 Georgia,serif;margin:2.9rem 0 .18rem;color:#fff3da}
      .moedGate small{display:block;font-size:.57rem;letter-spacing:.11em;font-weight:850;color:#ead6aa}
      .moedGate p{margin:.45rem 0 0;font:.74rem/1.35 Georgia,serif;color:#f1e7d3}
      .moedGate.on{box-shadow:inset 0 0 0 2px #d8b96e,0 12px 28px rgba(44,56,40,.18)}
      .moedDetail{margin:0 12px 14px;border:1px solid #d0bfa2;border-radius:30px;overflow:hidden;background:#fff8e9;box-shadow:0 16px 38px rgba(61,46,26,.09)}
      .moedDetailScene{position:relative;height:245px;background-image:linear-gradient(180deg,rgba(7,10,8,.08),rgba(7,10,8,.74)),var(--moed-detail-image);background-size:cover;background-position:var(--moed-detail-pos,50% 50%);color:#fff0d3;padding:16px}
      .moedDetailScene .num{display:grid;place-items:center;width:46px;height:46px;border:1px solid rgba(255,232,190,.74);border-radius:50%;background:rgba(10,14,10,.42);font:1rem Georgia,serif}
      .moedDetailHeb{position:absolute;left:50%;bottom:20px;transform:translateX(-50%);direction:rtl;font:2.3rem Georgia,serif;color:#f6dfad;text-shadow:0 2px 14px #000;white-space:nowrap}
      .moedDetailBody{padding:19px}
      .moedDetailMeta{font-size:.59rem;letter-spacing:.16em;font-weight:900;color:#7c6a47}
      .moedDetailBody h2{font:clamp(2.05rem,8.6vw,3rem)/.98 Georgia,serif;margin:.28em 0 .08em;color:#332c25;letter-spacing:-.02em;text-wrap:balance}
      .moedSub{font:.95rem/1.35 Georgia,serif;color:#647058;margin:0 0 7px}
      .moedTagline{font:1.08rem/1.42 Georgia,serif;color:#62594e;margin:0 0 15px}
      .moedTabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:10px 0 15px}
      .moedTab{border:1px solid #c8b99e;border-radius:16px;background:#f7ecd9;color:#463d31;padding:10px 5px;font-size:.68rem;font-weight:850}
      .moedTab.on{background:#3f5437;color:#fff;border-color:#3f5437}
      .moedReading{padding:17px;border:1px solid #d3c4aa;border-radius:20px;background:#fffaf0}
      .moedReading p{margin:0;font:1rem/1.62 Georgia,serif;color:#4d463d}
      .moedSources{display:grid;gap:7px;margin-top:15px;padding-top:13px;border-top:1px solid #ded0b9}
      .moedSource{font-size:.72rem;line-height:1.4;color:#6d6253;padding-left:15px;position:relative}
      .moedSource:before{content:"↳";position:absolute;left:0;color:#9b8357}
      .moedPracticeHead{margin-bottom:13px}
      .moedPracticeHead small{display:block;font-size:.56rem;letter-spacing:.17em;font-weight:900;color:#6d785c;margin-bottom:5px}
      .moedPracticeHead b{font:1.34rem/1.18 Georgia,serif}
      .moedDays{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:2px 0 12px}
      .moedDay{border:1px solid #c7b89c;border-radius:14px;background:#fffaf1;color:#5b5041;padding:9px 4px;text-align:center;font-size:.69rem;font-weight:850}
      .moedDay.on{background:#667250;color:#fff;border-color:#667250}
      .moedAction{padding:15px;border-left:4px solid #73805b;border-radius:0 18px 18px 0;background:#edf0e4;color:#332d25}
      .moedAction b{display:block;font:1.08rem Georgia,serif;margin-bottom:6px}
      .moedAction p{font:.98rem/1.55 Georgia,serif!important;color:#3e392f!important}
      .moedPracticeIntro{margin-top:14px;padding:15px;border-radius:18px;background:#2e3028;color:#f5e6c7}
      .moedPracticeIntro small{display:block;font-size:.55rem;letter-spacing:.15em;font-weight:900;color:#dfc581;margin-bottom:6px}
      .moedPracticeIntro p{margin:0;color:#f5e6c7!important;font:italic 1rem/1.48 Georgia,serif!important}
      .moedNav{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:15px}
      .moedNav button{border:1px solid #9d8b70;border-radius:14px;background:#fff5e7;color:#443c32;padding:10px;font-size:.73rem;font-weight:850}
      @media(min-width:700px){
        .moedHero{min-height:720px;border-radius:0 0 34px 34px}
        .moedJourney{padding:42px 54px}
        .moedGates{grid-template-columns:repeat(3,1fr)}
        .moedGate{min-height:220px}
        .moedDetail{margin:20px 18px;display:grid;grid-template-columns:40% 60%}
        .moedDetailScene{height:auto;min-height:610px}
        .moedDetailBody{padding:30px}
      }
      @media(max-width:390px){
        .moedHero{min-height:64dvh}
        .moedHero h1{font-size:2.55rem}
        .moedJourney{padding-left:10px;padding-right:10px}
        .moedGates{gap:8px}
        .moedGate{min-height:158px;padding:12px}
        .moedGate h3{font-size:1.24rem;margin-top:2.5rem}
        .moedGate p{font-size:.7rem}
        .moedDetail{margin-left:8px;margin-right:8px}
        .moedDetailScene{height:215px}
        .moedDetailHeb{font-size:2rem}
        .moedDetailBody{padding:16px}
        .moedDays{grid-template-columns:repeat(3,minmax(0,1fr))}
      }
    `;
    document.head.appendChild(style);
  }

  let selectedId='rosh-jodesh';
  let selectedTab='abierta';
  let selectedDay=0;

  const cardPositions={
    "rosh-jodesh":"28% 42%",
    "pesaj":"52% 62%",
    "shavuot":"34% 48%",
    "sucot":"70% 66%",
    "yamim-noraim":"64% 46%",
    "januca-purim":"78% 62%"
  };
  const detailPositions={
    "rosh-jodesh":"50% 45%",
    "pesaj":"32% 50%",
    "shavuot":"58% 50%",
    "sucot":"76% 64%",
    "yamim-noraim":"40% 46%",
    "januca-purim":"82% 56%"
  };

  function selected(){return MOED_DATA.find(x=>x.id===selectedId)||MOED_DATA[0];}
  function detailImage(x){return x.id==='rosh-jodesh' ? "url('assets/moed-rosh-jodesh-v21.webp')" : "url('assets/moed-seasons-v21.webp')";}

  function renderGates(){
    const host=document.getElementById('moedGates');
    host.innerHTML=MOED_DATA.map(x=>`
      <button class="moedGate${x.id===selectedId?' on':''}" type="button" data-moed-id="${x.id}" style="--moed-card-pos:${cardPositions[x.id]||'50% 50%'}">
        <div class="moedGateTop">
          <span class="moedGateIcon">${icons[x.id]||'•'}</span>
          <span class="moedGateHeb">${x.hebrewFull}</span>
        </div>
        <h3>${x.titleEs}</h3>
        <small>${x.titleHeLatin.toUpperCase()}</small>
        <p>${x.tag}</p>
      </button>
    `).join('');
  }

  function tabContent(x){
    if(selectedTab==='abierta'){
      return `<div class="moedReading"><p>${x.abierta}</p></div>`;
    }
    if(selectedTab==='profunda'){
      return `
        <div class="moedReading">
          <p>${x.profunda}</p>
          <div class="moedSources">${x.sources.map(f=>`<div class="moedSource">${f}</div>`).join('')}</div>
        </div>`;
    }
    const item=x.practica7[selectedDay]||x.practica7[0];
    return `
      <div class="moedReading">
        <div class="moedPracticeHead">
          <small>PRÁCTICA 7 DÍAS</small>
          <b>${x.practicaIntro}</b>
        </div>
        <div class="moedDays" aria-label="Elegir día">${x.practica7.map((d,i)=>`<button type="button" class="moedDay${i===selectedDay?' on':''}" data-moed-day="${i}">D${d.day}</button>`).join('')}</div>
        <div class="moedAction"><b>${item.title}</b><p>${item.desc}</p></div>
        <div class="moedPracticeIntro"><small>ORIENTACIÓN DEL CICLO</small><p>${x.practicaIntro}</p></div>
      </div>`;
  }

  function renderDetail(scroll=false){
    const x=selected();
    const host=document.getElementById('moedDetail');
    host.innerHTML=`
      <div class="moedDetailScene" style="--moed-detail-image:${detailImage(x)};--moed-detail-pos:${detailPositions[x.id]||'50% 50%'}">
        <span class="num">0${x.num}</span>
        <span class="moedDetailHeb">${x.hebrewFull}</span>
      </div>
      <div class="moedDetailBody">
        <div class="moedDetailMeta">MOED · TIEMPO 0${x.num} DE 06</div>
        <h2>${x.titleEs}</h2>
        <p class="moedSub">${x.titleHeLatin} · ${x.hebrewFull}</p>
        <p class="moedTagline">${x.tag}</p>
        <div class="moedTabs" role="tablist" aria-label="Profundidad de lectura">
          <button type="button" class="moedTab${selectedTab==='abierta'?' on':''}" data-moed-tab="abierta">Abierta</button>
          <button type="button" class="moedTab${selectedTab==='profunda'?' on':''}" data-moed-tab="profunda">Profunda</button>
          <button type="button" class="moedTab${selectedTab==='practica'?' on':''}" data-moed-tab="practica">Práctica</button>
        </div>
        <div id="moedTabContent">${tabContent(x)}</div>
        <div class="moedNav">
          <button type="button" data-moed-prev>← ${MOED_DATA[(x.num+4)%6].titleEs}</button>
          <button type="button" data-moed-next>${MOED_DATA[x.num%6].titleEs} →</button>
        </div>
      </div>`;
    renderGates();
    if(scroll) host.scrollIntoView({behavior:'smooth',block:'start'});
  }

  screen.addEventListener('click',e=>{
    const scroll=e.target.closest('[data-moed-scroll]');
    if(scroll){document.getElementById(scroll.dataset.moedScroll)?.scrollIntoView({behavior:'smooth',block:'start'});return;}

    const gate=e.target.closest('[data-moed-id]');
    if(gate){selectedId=gate.dataset.moedId;selectedTab='abierta';selectedDay=0;renderDetail(true);return;}

    const tab=e.target.closest('[data-moed-tab]');
    if(tab){selectedTab=tab.dataset.moedTab;selectedDay=0;renderDetail(false);return;}

    const day=e.target.closest('[data-moed-day]');
    if(day){selectedDay=Number(day.dataset.moedDay);renderDetail(false);return;}

    if(e.target.closest('[data-moed-prev]')){
      const x=selected(); selectedId=MOED_DATA[(x.num+4)%6].id;selectedTab='abierta';selectedDay=0;renderDetail(true);return;
    }
    if(e.target.closest('[data-moed-next]')){
      const x=selected(); selectedId=MOED_DATA[x.num%6].id;selectedTab='abierta';selectedDay=0;renderDetail(true);return;
    }
  });

  renderGates();
  renderDetail(false);
})();

/* RADIO DÉREJ v2.1 · Meditación RC2 · 13 pistas */
(()=>{
  const screen=document.querySelector('[data-screen="radio"]');
  if(!screen) return;

  const AUDIO_BASE='https://ryeztkcyopbmwwaacpxl.supabase.co/storage/v1/object/public/radio-derej';
  let tracks=[];
  let index=0;
  let ready=false;
  let loading=null;

  screen.className='screen radioScreen';
  screen.setAttribute('aria-labelledby','radioV21Title');
  screen.innerHTML=`
    <section class="radioHero">
      <div class="radioHeroShade" aria-hidden="true"></div>
      <button class="backBtn radioBack" data-route="home">← Patio</button>
      <div class="radioHeroCopy">
        <span class="radioEyebrow">RADIO DÉREJ · רדיו</span>
        <h1 id="radioV21Title">Escuchar<br>también es<br>caminar.</h1>
        <p>Música contemplativa para acompañar silencio, reflexión y camino interior.</p>
        <button class="radioEnter" type="button" data-radio-scroll="radioPlayer">Entrar a Meditación <span>↓</span></button>
      </div>
    </section>

    <section class="radioIntro">
      <span>MÚSICA · SILENCIO · PRESENCIA</span>
      <h2>Hay caminos<br>que se escuchan.</h2>
      <p>Radio Dérej no interrumpe el Camino. Lo acompaña.</p>
    </section>

    <section class="radioPlayerShell" id="radioPlayer">
      <div class="radioCollectionTabs" aria-label="Colecciones de Radio Dérej">
        <button class="radioCollection on" type="button">Meditación</button>
        <button class="radioCollection future" type="button" disabled>Parashá <small>Próximamente</small></button>
        <button class="radioCollection future" type="button" disabled>Hitbodedut <small>Próximamente</small></button>
      </div>

      <article class="radioNow">
        <div class="radioNowArtwork" aria-hidden="true"></div>
        <div class="radioNowBody">
          <div class="radioNowMeta">RADIO DÉREJ · MEDITACIÓN</div>
          <h2 id="radioV21TrackTitle">Preparando la escucha…</h2>
          <p id="radioV21TrackMeta">13 piezas contemplativas</p>

          <div class="radioProgressRow">
            <span id="radioV21Current">0:00</span>
            <input id="radioV21Seek" type="range" min="0" max="1000" value="0" aria-label="Posición de reproducción">
            <span id="radioV21Duration">0:00</span>
          </div>

          <div class="radioControls">
            <button type="button" id="radioV21Prev" aria-label="Pista anterior">←</button>
            <button type="button" id="radioV21Play" class="radioMainControl" aria-label="Reproducir">▶</button>
            <button type="button" id="radioV21Next" aria-label="Pista siguiente">→</button>
          </div>
          <p class="radioStatus" id="radioV21Status" role="status">Cargando catálogo…</p>
          <audio id="radioV21Audio" preload="metadata"></audio>
        </div>
      </article>

      <div class="radioQuote">
        <small>ESCUCHA</small>
        <p>“La música abre un espacio. El silencio decide qué hacer con él.”</p>
      </div>

      <section class="radioTracksSection">
        <header>
          <span>COLECCIÓN ACTUAL</span>
          <h3>Meditación</h3>
          <p>13 piezas para acompañar pausa, estudio y presencia.</p>
        </header>
        <div class="radioTrackList" id="radioV21TrackList"></div>
      </section>
    </section>
  `;

  if(!document.getElementById('radioV21Styles')){
    const style=document.createElement('style');
    style.id='radioV21Styles';
    style.textContent=`
      .radioScreen{background:#0c130f;color:#f8ecd6;padding-bottom:calc(38px + env(safe-area-inset-bottom))}
      .radioHero{position:relative;min-height:69dvh;overflow:hidden;background:url('assets/radio-night-v21.webp') 50% 47%/cover no-repeat;border-bottom:1px solid rgba(217,184,111,.22)}
      .radioHeroShade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,8,7,.18),rgba(5,8,7,.10) 28%,rgba(5,8,7,.33) 58%,rgba(5,8,7,.94) 100%),linear-gradient(90deg,rgba(4,7,6,.55),transparent 68%)}
      .radioBack{position:absolute;top:12px;left:12px;z-index:4}
      .radioHeroCopy{position:absolute;z-index:3;left:20px;right:20px;bottom:23px;text-shadow:0 2px 18px #000}
      .radioEyebrow{font-size:.62rem;letter-spacing:.23em;font-weight:900;color:#d9bb75}
      .radioHero h1{font:clamp(2.8rem,12vw,4.8rem)/.88 Georgia,serif;margin:.22em 0 .24em;letter-spacing:-.03em;color:#fff0d5;max-width:620px}
      .radioHero p{max-width:29rem;margin:0 0 17px;font:1rem/1.43 Georgia,serif;color:#e8dbc4}
      .radioEnter{display:flex;align-items:center;justify-content:center;gap:18px;width:min(100%,430px);border:1px solid rgba(248,226,183,.72);border-radius:999px;background:#f1e4ca;color:#30291f;padding:14px 18px;font-weight:850}
      .radioIntro{text-align:center;padding:30px 17px 27px;background:#efe2ca;color:#312b23}
      .radioIntro>span,.radioTracksSection header>span{font-size:.58rem;letter-spacing:.2em;font-weight:900;color:#786845}
      .radioIntro h2{font:clamp(2rem,8.4vw,3rem)/1 Georgia,serif;margin:.35em 0 .25em;text-wrap:balance}
      .radioIntro p{margin:0;color:#706556;font:italic .92rem/1.45 Georgia,serif}
      .radioPlayerShell{padding:14px 12px 28px;background:radial-gradient(circle at 50% 0,#202b25,#0b100e 58%);scroll-margin-top:70px}
      .radioCollectionTabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:2px 0 12px}
      .radioCollection{border:1px solid rgba(218,191,132,.38);border-radius:15px;background:rgba(24,31,26,.75);color:#eadabc;padding:10px 5px;font-size:.68rem;font-weight:850}
      .radioCollection.on{background:#efe2ca;color:#332d25;border-color:#efe2ca}
      .radioCollection small{display:block;margin-top:2px;font-size:.45rem;letter-spacing:.05em;font-weight:700;opacity:.68}
      .radioCollection.future{opacity:.65}
      .radioNow{overflow:hidden;border:1px solid rgba(218,191,132,.32);border-radius:28px;background:#151c18;box-shadow:0 18px 42px rgba(0,0,0,.28)}
      .radioNowArtwork{height:210px;background-image:linear-gradient(180deg,rgba(4,7,6,.04),rgba(4,7,6,.68)),url('assets/radio-night-v21.webp');background-size:cover;background-position:48% 68%}
      .radioNowBody{padding:18px}
      .radioNowMeta{font-size:.56rem;letter-spacing:.17em;font-weight:900;color:#c9a967}
      .radioNow h2{font:clamp(1.75rem,7.8vw,2.4rem)/1.04 Georgia,serif;margin:.35em 0 .16em;color:#fff0d5;text-wrap:balance}
      .radioNowBody>p{color:#c9beaa;margin:.3rem 0}
      .radioProgressRow{display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center;margin:16px 0 12px;font-size:.62rem;color:#bfb39e}
      .radioProgressRow input{width:100%;accent-color:#d9b86f}
      .radioControls{display:grid;grid-template-columns:1fr 1.35fr 1fr;gap:8px;align-items:center}
      .radioControls button{height:48px;border:1px solid rgba(222,195,140,.36);border-radius:15px;background:#202922;color:#f1dfbd;font-size:1rem;font-weight:900}
      .radioControls .radioMainControl{height:56px;border-radius:999px;background:#efe2ca;color:#2f2921;font-size:1.15rem}
      .radioStatus{text-align:center;font-size:.68rem!important;line-height:1.4!important;color:#a9a08f!important;min-height:1.1rem;margin-top:10px!important}
      .radioQuote{margin:13px 0;padding:17px;border-left:4px solid #a8894f;border-radius:0 18px 18px 0;background:#2b2923}
      .radioQuote small{display:block;font-size:.54rem;letter-spacing:.16em;color:#d9bb75;font-weight:900;margin-bottom:7px}
      .radioQuote p{margin:0;font:italic 1.08rem/1.48 Georgia,serif;color:#f1e0bf}
      .radioTracksSection{margin-top:15px;padding:18px;border:1px solid rgba(217,184,111,.25);border-radius:25px;background:#f5ead8;color:#332d25}
      .radioTracksSection header h3{font:2rem/1 Georgia,serif;margin:.35em 0 .18em}
      .radioTracksSection header p{margin:0 0 14px;color:#726657;font-size:.78rem;line-height:1.42}
      .radioTrackList{display:grid;gap:7px}
      .radioTrackV21{width:100%;display:grid;grid-template-columns:34px 1fr auto;gap:10px;align-items:center;border:1px solid #d1c1a6;border-radius:15px;background:#fff8eb;color:#3b332a;padding:10px;text-align:left}
      .radioTrackV21.on{background:#3f513b;color:#fff;border-color:#3f513b}
      .radioTrackV21 .num{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:#e7dbc7;color:#685a45;font:700 .7rem Georgia,serif}
      .radioTrackV21.on .num{background:#e9d7aa;color:#31402e}
      .radioTrackV21 .copy{display:grid;gap:2px;min-width:0}
      .radioTrackV21 .copy b{font:.88rem/1.15 Georgia,serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .radioTrackV21 .copy small{font-size:.55rem;letter-spacing:.06em;opacity:.72}
      .radioTrackV21 .dur{font-size:.62rem;opacity:.72}
      @media(min-width:700px){
        .radioHero{min-height:720px;border-radius:0 0 34px 34px}
        .radioPlayerShell{padding:20px 18px 38px}
        .radioNow{display:grid;grid-template-columns:42% 58%}
        .radioNowArtwork{height:auto;min-height:470px}
        .radioNowBody{padding:30px}
        .radioTracksSection{padding:26px}
        .radioTrackList{grid-template-columns:1fr 1fr}
      }
      @media(max-width:390px){
        .radioHero{min-height:64dvh}
        .radioHero h1{font-size:2.55rem}
        .radioHero p{font-size:.93rem}
        .radioPlayerShell{padding-left:8px;padding-right:8px}
        .radioCollection{font-size:.61rem}
        .radioNowArtwork{height:190px}
        .radioNowBody{padding:16px}
        .radioTracksSection{padding:14px}
      }
    `;
    document.head.appendChild(style);
  }

  const audio=document.getElementById('radioV21Audio');
  const title=document.getElementById('radioV21TrackTitle');
  const meta=document.getElementById('radioV21TrackMeta');
  const seek=document.getElementById('radioV21Seek');
  const current=document.getElementById('radioV21Current');
  const duration=document.getElementById('radioV21Duration');
  const play=document.getElementById('radioV21Play');
  const status=document.getElementById('radioV21Status');
  const list=document.getElementById('radioV21TrackList');

  function fmt(sec){
    if(!Number.isFinite(sec)) return '0:00';
    sec=Math.max(0,Math.round(sec));
    return Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');
  }
  function urlFor(t){return `${AUDIO_BASE}/${String(t.path||'').replace(/^\//,'')}`;}
  function syncList(){
    list.innerHTML=tracks.map((t,i)=>`
      <button type="button" class="radioTrackV21${i===index?' on':''}" data-radio-track="${i}">
        <span class="num">${String(i+1).padStart(2,'0')}</span>
        <span class="copy"><b>${t.title}</b><small>${t.artist||'Danygrafiko'}</small></span>
        <span class="dur">${t.duration||''}</span>
      </button>
    `).join('');
  }
  function mediaSession(t){
    if(!('mediaSession' in navigator)||!t) return;
    try{
      navigator.mediaSession.metadata=new MediaMetadata({
        title:t.title,
        artist:t.artist||'Danygrafiko',
        album:t.collection||'Radio Dérej · Meditación',
        artwork:[{src:'assets/radio-night-v21.webp',sizes:'800x1200',type:'image/webp'}]
      });
    }catch{}
  }
  function load(i,autoplay=false){
    if(!tracks.length) return;
    index=(i+tracks.length)%tracks.length;
    try{localStorage.setItem('derej-v21-radio-index',String(index));}catch{}
    const t=tracks[index];
    title.textContent=t.title;
    meta.textContent=`${t.artist||'Danygrafiko'} · ${t.collection||'Radio Dérej · Meditación'}`;
    duration.textContent=t.duration||'0:00';
    current.textContent='0:00';
    seek.value='0';
    audio.src=urlFor(t);
    status.textContent='Lista para escuchar.';
    syncList();
    mediaSession(t);
    if(autoplay) audio.play().catch(()=>{status.textContent='Toca Reproducir para iniciar el audio.';});
  }
  async function ensure(){
    if(ready) return;
    if(loading) return loading;
    loading=(async()=>{
      try{
        const res=await fetch('radio.json',{cache:'no-store'});
        if(!res.ok) throw new Error(`Catálogo ${res.status}`);
        const data=await res.json();
        tracks=Array.isArray(data.tracks)?data.tracks:[];
        if(!tracks.length) throw new Error('Catálogo vacío');
        const saved=Number(localStorage.getItem('derej-v21-radio-index'));
        index=Number.isInteger(saved)&&saved>=0&&saved<tracks.length?saved:0;
        ready=true;
        load(index,false);
      }catch{
        status.textContent='El catálogo musical no pudo cargarse. El resto de Dérej continúa disponible.';
        title.textContent='Radio Dérej';
        meta.textContent='Meditación temporalmente no disponible';
        play.disabled=true;
      }
    })();
    return loading;
  }

  play.addEventListener('click',async()=>{
    await ensure();
    if(!audio.src) return;
    if(audio.paused) audio.play().catch(()=>{status.textContent='Toca nuevamente Reproducir para iniciar.';});
    else audio.pause();
  });
  document.getElementById('radioV21Prev').addEventListener('click',async()=>{await ensure();load(index-1,true);});
  document.getElementById('radioV21Next').addEventListener('click',async()=>{await ensure();load(index+1,true);});
  seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=(Number(seek.value)/1000)*audio.duration;});
  audio.addEventListener('play',()=>{play.textContent='⏸';play.setAttribute('aria-label','Pausar');status.textContent='Reproduciendo dentro de Dérej.';});
  audio.addEventListener('pause',()=>{play.textContent='▶';play.setAttribute('aria-label','Reproducir');if(audio.currentTime>0)status.textContent='En pausa.';});
  audio.addEventListener('loadedmetadata',()=>{duration.textContent=fmt(audio.duration);});
  audio.addEventListener('timeupdate',()=>{
    current.textContent=fmt(audio.currentTime);
    if(Number.isFinite(audio.duration)&&audio.duration>0)seek.value=String(Math.round((audio.currentTime/audio.duration)*1000));
  });
  audio.addEventListener('ended',()=>load(index+1,true));
  audio.addEventListener('error',()=>{status.textContent='No se pudo reproducir esta pista. Prueba la siguiente.';});

  list.addEventListener('click',async e=>{
    const b=e.target.closest('[data-radio-track]');
    if(!b) return;
    await ensure();
    load(Number(b.dataset.radioTrack),true);
  });
  screen.addEventListener('click',e=>{
    const scroll=e.target.closest('[data-radio-scroll]');
    if(scroll){
      document.getElementById(scroll.dataset.radioScroll)?.scrollIntoView({behavior:'smooth',block:'start'});
      ensure();
    }
  });
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-route="radio"]')) ensure();
  });

  if('mediaSession' in navigator){
    try{
      navigator.mediaSession.setActionHandler('play',()=>audio.play());
      navigator.mediaSession.setActionHandler('pause',()=>audio.pause());
      navigator.mediaSession.setActionHandler('previoustrack',()=>load(index-1,true));
      navigator.mediaSession.setActionHandler('nexttrack',()=>load(index+1,true));
    }catch{}
  }
})();

/* MI CAMINO v2.1 · memoria local · sin puntuación */
(()=>{
  const screen=document.querySelector('[data-screen="personal"]');
  if(!screen) return;

  const BROTE_KEY='derej-v21-mi-camino-brote';
  let activeTab='huellas';

  screen.className='screen personalScreen';
  screen.setAttribute('aria-labelledby','personalV21Title');
  screen.innerHTML=`
    <section class="personalHero">
      <div class="personalHeroShade" aria-hidden="true"></div>
      <button class="backBtn personalBack" data-route="home">← Patio</button>
      <div class="personalHeroCopy">
        <span class="personalEyebrow">MI CAMINO · זיכרון</span>
        <h1 id="personalV21Title">Huellas<br>que florecen.</h1>
        <p>Un espacio privado para reconocer lo vivido, cuidar lo que nace y recordar lo que quieres llevar contigo.</p>
        <button class="personalEnter" type="button" data-personal-scroll="personalGarden">Entrar a mi jardín <span>↓</span></button>
      </div>
    </section>

    <section class="personalIntro">
      <span>MEMORIA · NO PUNTUACIÓN</span>
      <h2>Lo vivido<br>también deja raíz.</h2>
      <p>No hay niveles, rachas ni comparación. Sólo memoria local para volver a mirar.</p>
    </section>

    <section class="personalGarden" id="personalGarden">
      <div class="personalPrivacy">
        <span class="personalPrivacyIcon">⌁</span>
        <div><b id="personalMemoryCount">Tu jardín está vacío.</b><small>Nada de esta memoria sale de este dispositivo.</small></div>
      </div>

      <div class="personalTabs" role="tablist" aria-label="Mi Camino">
        <button type="button" class="personalTab on" data-personal-tab="huellas">Huellas</button>
        <button type="button" class="personalTab" data-personal-tab="brotes">Brotes</button>
        <button type="button" class="personalTab" data-personal-tab="memoria">Memoria</button>
      </div>

      <section class="personalPanel on" data-personal-panel="huellas">
        <header class="personalPanelHead">
          <small>HUELLAS</small>
          <h3>Lo que ya caminaste.</h3>
          <p>Encuentros que elegiste guardar deliberadamente en Mi Camino.</p>
        </header>
        <div id="personalFootprints" class="personalMemoryList"></div>
      </section>

      <section class="personalPanel" data-personal-panel="brotes">
        <header class="personalPanelHead">
          <small>BROTES</small>
          <h3>¿Qué está naciendo?</h3>
          <p>Una frase privada para reconocer algo pequeño que comienza a crecer.</p>
        </header>
        <div class="personalSproutCard">
          <label for="personalSproutNote">Hoy noto que…</label>
          <textarea id="personalSproutNote" rows="5" maxlength="420" placeholder="Escribe sólo para ti."></textarea>
          <button type="button" class="personalSave" id="personalSaveSprout">Guardar este brote</button>
          <p id="personalSproutStatus" class="personalStatus" role="status"></p>
        </div>
      </section>

      <section class="personalPanel" data-personal-panel="memoria">
        <header class="personalPanelHead">
          <small>MEMORIA</small>
          <h3>Frases para volver.</h3>
          <p>Kavanot, notas privadas y memoria local de tus recorridos.</p>
        </header>
        <div id="personalMemories" class="personalMemoryList"></div>
      </section>

      <div class="personalClosing">
        <span>⌁</span>
        <p>La memoria no te dice cuánto avanzaste. Sólo te ayuda a reconocer por dónde has pasado.</p>
      </div>

      <div class="personalNav">
        <button type="button" data-route="camino">Volver a Camino</button>
        <button type="button" data-route="home">Volver al patio</button>
      </div>
    </section>
  `;

  if(!document.getElementById('personalV21Styles')){
    const style=document.createElement('style');
    style.id='personalV21Styles';
    style.textContent=`
      .personalScreen{background:#eee1c7;color:#312b23;padding-bottom:calc(38px + env(safe-area-inset-bottom))}
      .personalHero{position:relative;min-height:67dvh;overflow:hidden;background:url('assets/mi-camino-garden-v21.webp') 50% 48%/cover no-repeat;border-bottom:1px solid rgba(217,184,111,.25)}
      .personalHeroShade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,10,7,.09),rgba(8,10,7,.08) 26%,rgba(8,10,7,.26) 56%,rgba(8,10,7,.88) 100%),linear-gradient(90deg,rgba(7,9,6,.45),transparent 64%)}
      .personalBack{position:absolute;top:12px;left:12px;z-index:4}
      .personalHeroCopy{position:absolute;z-index:3;left:20px;right:20px;bottom:23px;color:#fff0d4;text-shadow:0 2px 18px #000}
      .personalEyebrow{font-size:.62rem;letter-spacing:.23em;font-weight:900;color:#e0c47e}
      .personalHero h1{font:clamp(2.85rem,12vw,4.7rem)/.89 Georgia,serif;margin:.22em 0 .24em;letter-spacing:-.03em;max-width:580px}
      .personalHero p{max-width:30rem;margin:0 0 17px;font:1rem/1.43 Georgia,serif;color:#eee1ca}
      .personalEnter{display:flex;align-items:center;justify-content:center;gap:18px;width:min(100%,430px);border:1px solid rgba(248,226,183,.72);border-radius:999px;background:#f1e4ca;color:#30291f;padding:14px 18px;font-weight:850}
      .personalIntro{text-align:center;padding:30px 17px 27px;background:#efe2ca;color:#312b23}
      .personalIntro>span,.personalPanelHead small{font-size:.58rem;letter-spacing:.2em;font-weight:900;color:#786845}
      .personalIntro h2{font:clamp(2rem,8.4vw,3rem)/1 Georgia,serif;margin:.35em 0 .25em;text-wrap:balance}
      .personalIntro p{margin:0 auto;max-width:31rem;color:#706556;font:italic .92rem/1.45 Georgia,serif}
      .personalGarden{padding:14px 12px 28px;background:linear-gradient(180deg,#e9ddc7,#f7eddd 45%,#e9dcc3);scroll-margin-top:70px}
      .personalPrivacy{display:flex;gap:12px;align-items:center;padding:14px;border:1px solid #c9b99d;border-radius:20px;background:#fff7e8;margin-bottom:11px}
      .personalPrivacyIcon{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:#40523d;color:#f6e5bf;font-size:1.25rem;flex:0 0 auto}
      .personalPrivacy div{display:grid;gap:3px}
      .personalPrivacy b{font:1rem/1.2 Georgia,serif;color:#393126}
      .personalPrivacy small{font-size:.65rem;line-height:1.35;color:#756a5b}
      .personalTabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-bottom:11px}
      .personalTab{border:1px solid #c7b79c;border-radius:15px;background:#f7ecd9;color:#493f32;padding:11px 5px;font-size:.72rem;font-weight:850}
      .personalTab.on{background:#40523d;color:#fff;border-color:#40523d}
      .personalPanel{display:none;padding:18px;border:1px solid #cfbea1;border-radius:27px;background:#fff8e9;box-shadow:0 13px 32px rgba(65,49,27,.08)}
      .personalPanel.on{display:block}
      .personalPanelHead{margin-bottom:14px}
      .personalPanelHead h3{font:clamp(1.9rem,7.7vw,2.6rem)/1 Georgia,serif;margin:.3em 0 .18em;color:#332c24}
      .personalPanelHead p{margin:0;color:#74695a;font-size:.82rem;line-height:1.45}
      .personalMemoryList{display:grid;gap:9px}
      .personalMemoryCard{position:relative;padding:15px;border:1px solid #d2c3aa;border-radius:19px;background:#fbf3e5}
      .personalMemoryCard:before{content:"";position:absolute;left:0;top:16px;bottom:16px;width:4px;border-radius:0 4px 4px 0;background:#7b8563}
      .personalMemoryCard small{display:block;font-size:.55rem;letter-spacing:.13em;font-weight:900;color:#7c6b4c;margin-bottom:7px}
      .personalMemoryCard h4{font:1.18rem/1.15 Georgia,serif;margin:0 0 7px;color:#3a3229}
      .personalMemoryCard p{margin:4px 0;color:#655c50;font:.86rem/1.48 Georgia,serif}
      .personalMemoryCard blockquote{margin:10px 0 0;padding:10px 12px;border-radius:13px;background:#323129;color:#f0dfbd;font:italic .9rem/1.48 Georgia,serif}
      .personalMemoryCard time{display:block;margin-top:8px;font-size:.56rem;color:#8b7d6a}
      .personalEmpty{padding:18px;border:1px dashed #c9b99d;border-radius:18px;background:#f8efdf;color:#706657;font:italic .9rem/1.5 Georgia,serif;text-align:center}
      .personalSproutCard{padding:16px;border-radius:20px;background:#edf0e4;border:1px solid #c7cdb9}
      .personalSproutCard label{display:block;font:1.18rem Georgia,serif;margin-bottom:9px;color:#3a4434}
      .personalSproutCard textarea{width:100%;box-sizing:border-box;border:1px solid #aeb99f;border-radius:15px;background:#fffdf7;color:#332d25;padding:13px;font:1rem/1.5 Georgia,serif;resize:vertical}
      .personalSave{width:100%;margin-top:10px;border:0;border-radius:15px;background:#40523d;color:#fff;padding:13px 15px;font-weight:850}
      .personalStatus{min-height:1rem;margin:8px 0 0;font-size:.66rem;color:#68705d}
      .personalClosing{display:flex;gap:12px;align-items:flex-start;margin:13px 0 0;padding:16px;border-radius:20px;background:#2e3028;color:#f0dfbd}
      .personalClosing span{font-size:1.5rem;color:#d7bb76}
      .personalClosing p{margin:0;font:italic .93rem/1.5 Georgia,serif}
      .personalNav{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:12px}
      .personalNav button{border:1px solid #9c8b70;border-radius:15px;background:#fff5e7;color:#443c32;padding:11px 8px;font-size:.72rem;font-weight:850}
      @media(min-width:700px){
        .personalHero{min-height:720px;border-radius:0 0 34px 34px}
        .personalGarden{padding:20px 18px 38px}
        .personalPanel{padding:28px}
        .personalMemoryList{grid-template-columns:1fr 1fr}
      }
      @media(max-width:390px){
        .personalHero{min-height:63dvh}
        .personalHero h1{font-size:2.55rem}
        .personalHero p{font-size:.93rem}
        .personalGarden{padding-left:8px;padding-right:8px}
        .personalPanel{padding:15px}
      }
    `;
    document.head.appendChild(style);
  }

  const countNode=document.getElementById('personalMemoryCount');
  const footprintsNode=document.getElementById('personalFootprints');
  const memoriesNode=document.getElementById('personalMemories');
  const sprout=document.getElementById('personalSproutNote');
  const sproutStatus=document.getElementById('personalSproutStatus');

  function formatDate(value){
    if(!value) return '';
    try{return new Intl.DateTimeFormat('es-CL',{dateStyle:'medium'}).format(new Date(value));}
    catch{return '';}
  }

  function encounterMemories(){
    const out=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key?.startsWith('derej-v21-encuentro-')) continue;
      try{
        const x=JSON.parse(localStorage.getItem(key)||'null');
        if(x&&x.savedAt) out.push(x);
      }catch{}
    }
    return out.sort((a,b)=>String(b.savedAt||'').localeCompare(String(a.savedAt||'')));
  }

  function legacyActions(){
    const out=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key?.startsWith('derej:content:')||!key.endsWith(':actions')) continue;
      try{
        const arr=JSON.parse(localStorage.getItem(key)||'[]');
        if(Array.isArray(arr)) out.push(...arr);
      }catch{}
    }
    return out.sort((a,b)=>String(b.at||'').localeCompare(String(a.at||'')));
  }

  function legacyReflections(){
    const out=[];
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key?.startsWith('derej:community:private:')) continue;
      const body=(localStorage.getItem(key)||'').trim();
      if(body) out.push({key,body});
    }
    return out;
  }

  function legacyFootprints(){
    try{
      const done=JSON.parse(localStorage.getItem('derej:camino:done')||'{}');
      return Object.entries(done||{}).map(([date,at])=>({date,at})).sort((a,b)=>String(b.at).localeCompare(String(a.at)));
    }catch{return [];}
  }

  function loadSprout(){
    try{
      const value=JSON.parse(localStorage.getItem(BROTE_KEY)||'null');
      sprout.value=value?.body||'';
      return value;
    }catch{
      sprout.value='';
      return null;
    }
  }

  function render(){
    const encounters=encounterMemories();
    const actions=legacyActions();
    const reflections=legacyReflections();
    const oldFootprints=legacyFootprints();
    const brote=loadSprout();
    const total=encounters.length+actions.length+reflections.length+oldFootprints.length+(brote?.body?1:0);

    countNode.textContent=total
      ? `Este jardín guarda ${total} ${total===1?'memoria local':'memorias locales'}.`
      : 'Tu jardín está vacío.';

    const footprintCards=[];
    encounters.forEach(x=>{
      const isRamak=x.schema==='ramak-v21';
      const enc=!isRamak?window.DEREJ_ENCUENTROS_V21?.encounters?.find?.(e=>e.num===Number(x.encounter)):null;
      const title=isRamak
        ? `${x.parasha||'Camino'} · Día ${x.dia||''}${x.titulo?` · ${x.titulo}`:''}`
        : (enc?`Encuentro ${enc.num} · ${enc.parasha}`:`Encuentro ${x.encounter||''}`);
      footprintCards.push(`
        <article class="personalMemoryCard">
          <small>${isRamak?'CAMINO DIARIO · EDICIÓN RAMAK':'CAMINO · ENCUENTRO GUARDADO'}</small>
          <h4>${title}</h4>
          ${isRamak&&x.sefira?`<p>${x.sefira}${x.avoda?` · ${x.avoda}`:''}</p>`:''}
          ${!isRamak&&x.choice?`<p>${x.choice}${x.midah?` — ${x.midah}`:''}</p>`:''}
          ${x.kavana?`<blockquote>“${x.kavana}”</blockquote>`:''}
          ${x.savedAt?`<time>${formatDate(x.savedAt)}</time>`:''}
        </article>`);
    });
    oldFootprints.slice(0,12).forEach(x=>{
      footprintCards.push(`
        <article class="personalMemoryCard">
          <small>CAMINO · HUELLA RC2</small>
          <h4>Encuentro vivido</h4>
          <p>${x.date}</p>
          ${x.at?`<time>${formatDate(x.at)}</time>`:''}
        </article>`);
    });
    footprintsNode.innerHTML=footprintCards.length
      ? footprintCards.join('')
      : `<div class="personalEmpty">Todavía no hay huellas guardadas. Cuando guardes un Camino en “Mi Camino”, aparecerá aquí.</div>`;

    const memoryCards=[];
    encounters.forEach(x=>{
      if(!x.note&&!x.kavana&&!x.hitbodedut) return;
      const isRamak=x.schema==='ramak-v21';
      memoryCards.push(`
        <article class="personalMemoryCard">
          <small>${isRamak?'MEMORIA · EDICIÓN RAMAK':'MEMORIA DE CAMINO'}</small>
          <h4>${isRamak?`${x.parasha||'Camino'} · Día ${x.dia||''}`:`${x.parasha||'Encuentro'}${x.encounter?` · ${x.encounter}`:''}`}</h4>
          ${x.note?`<p>“${x.note}”</p>`:''}
          ${x.kavana?`<blockquote>“${x.kavana}”</blockquote>`:''}
          ${isRamak&&x.hitbodedut?`<p><b>Hitbodedut:</b> ${x.hitbodedut}</p>`:''}
          ${x.savedAt?`<time>${formatDate(x.savedAt)}</time>`:''}
        </article>`);
    });
    actions.slice(0,15).forEach(a=>{
      memoryCards.push(`
        <article class="personalMemoryCard">
          <small>PRÁCTICA GUARDADA · RC2</small>
          <h4>${a.block_title||a.block_id||'Práctica'}</h4>
          <p>${a.content_title||a.content_id||''}${a.selection?` · ${a.selection}`:''}</p>
          ${a.at?`<time>${formatDate(a.at)}</time>`:''}
        </article>`);
    });
    reflections.slice(0,10).forEach(r=>{
      memoryCards.push(`
        <article class="personalMemoryCard">
          <small>REFLEXIÓN PRIVADA · RC2</small>
          <h4>Una frase que guardaste</h4>
          <p>“${r.body.length>220?r.body.slice(0,217)+'…':r.body}”</p>
        </article>`);
    });
    if(brote?.body){
      memoryCards.unshift(`
        <article class="personalMemoryCard">
          <small>BROTE ACTUAL</small>
          <h4>Lo que está naciendo</h4>
          <p>“${brote.body}”</p>
          ${brote.updatedAt?`<time>${formatDate(brote.updatedAt)}</time>`:''}
        </article>`);
    }
    memoriesNode.innerHTML=memoryCards.length
      ? memoryCards.join('')
      : `<div class="personalEmpty">Aquí aparecerán las kavanot, notas y prácticas que decidas conservar.</div>`;
  }

  function activate(tab){
    activeTab=tab;
    screen.querySelectorAll('[data-personal-tab]').forEach(b=>b.classList.toggle('on',b.dataset.personalTab===tab));
    screen.querySelectorAll('[data-personal-panel]').forEach(p=>p.classList.toggle('on',p.dataset.personalPanel===tab));
  }

  screen.addEventListener('click',e=>{
    const scroll=e.target.closest('[data-personal-scroll]');
    if(scroll){document.getElementById(scroll.dataset.personalScroll)?.scrollIntoView({behavior:'smooth',block:'start'});return;}

    const tab=e.target.closest('[data-personal-tab]');
    if(tab){activate(tab.dataset.personalTab);return;}

    if(e.target.closest('#personalSaveSprout')){
      const body=sprout.value.trim();
      try{
        if(body){
          localStorage.setItem(BROTE_KEY,JSON.stringify({body,updatedAt:new Date().toISOString()}));
          sproutStatus.textContent='Brote guardado sólo en este dispositivo.';
        }else{
          localStorage.removeItem(BROTE_KEY);
          sproutStatus.textContent='El brote quedó vacío.';
        }
        render();
      }catch{
        sproutStatus.textContent='No fue posible guardar en este navegador.';
      }
    }
  });

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-route="personal"]')) setTimeout(render,0);
  });

  activate('huellas');
  render();
})();
