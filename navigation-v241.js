/* DÉREJ v2.5.3 · lectura externa sin interrumpir Radio
   Sustituye navigation-v241.js conservando el mismo nombre de archivo.
*/
(()=>{
  const STYLE_ID='derej-v241-parashot-aliyah';


  const SLUGS={
    'Bereshit':'bereshit',
    'Noaj':'noach',
    'Lej Lejá':'lech-lecha',
    'Vayera':'vayera',
    'Jaye Sara':'chayei-sara',
    'Toldot':'toledot',
    'Vayetze':'vayetzei',
    'Vayishlaj':'vayishlach',
    'Vayeshev':'vayeshev',
    'Miketz':'miketz',
    'Vayigash':'vayigash',
    'Vayechi':'vayechi',
    'Shemot':'shemot',
    'Vaera':'vaera',
    'Bo':'bo',
    'Beshalaj':'beshalach',
    'Yitro':'yitro',
    'Mishpatim':'mishpatim',
    'Teruma':'terumah',
    'Tetzave':'tetzaveh'
  };


  const ORDINAL={1:'1ª Aliyá',2:'2ª Aliyá',3:'3ª Aliyá',4:'4ª Aliyá',5:'5ª Aliyá',6:'6ª Aliyá',7:'7ª Aliyá'};
  const HEBREW_DAY={1:'Rishón',2:'Shení',3:'Shelishí',4:"Revi'í",5:'Jamishí',6:'Shishí',7:"Shevi'í"};


  function slugFor(parasha){
    return SLUGS[parasha]||String(parasha||'').toLowerCase();
  }


  function parashotUrl(parasha,aliya='all'){
    const slug=slugFor(parasha);
    return `https://parashot.com.ar/?section=parashot&parasha=${encodeURIComponent(slug)}&aliya=${encodeURIComponent(aliya)}`;
  }


  function parashaLandingUrl(parasha){
    return `https://parashot.com.ar/parashot/${encodeURIComponent(slugFor(parasha))}/`;
  }


  function addStyles(){
    let st=document.getElementById(STYLE_ID);
    if(!st){
      st=document.createElement('style');
      st.id=STYLE_ID;
      document.head.appendChild(st);
    }
    st.textContent=`
      .v241ParashotAccess{
        display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:34px;
        padding:7px 11px;border:1px solid rgba(112,93,61,.38);border-radius:12px;
        background:#354532;color:#fff7e8;font:800 .62rem/1 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        letter-spacing:.04em;white-space:nowrap;box-shadow:0 4px 14px rgba(53,69,50,.13)
      }
      .v241ParashotAccess small{color:#ead39c;font-size:.47rem;letter-spacing:.1em}
      .v241ParashotAccess strong{font:700 .78rem/1 Georgia,serif}
      .v241ParashotAccess span{font-size:.8rem;opacity:.9}
      .v241AliyahCard{margin:12px 0 16px;border:1px solid #bdaa88;border-radius:20px;overflow:hidden;background:linear-gradient(145deg,#f2e5cb,#fff8e9);box-shadow:0 8px 22px rgba(79,62,35,.07)}
      .v241AliyahHead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px 9px;border-bottom:1px solid rgba(174,151,111,.33)}
      .v241AliyahHead small{margin:0!important;color:#766348!important;font:900 .51rem/1.15 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;letter-spacing:.15em!important}
      .v241AliyahHead b{color:#374330;font:1.04rem/1.1 Georgia,serif}
      .v241AliyahBody{padding:13px 14px 14px}
      .v241AliyahBody h3{margin:0 0 5px;color:#352f27;font:1.28rem/1.15 Georgia,serif}
      .v241AliyahBody p{margin:0 0 11px;color:#675b4c;font:.84rem/1.5 Georgia,serif}
      .v241AliyahLink{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:12px;border:1px solid #927b54;border-radius:13px;background:#354532;color:#fff8e8;text-decoration:none;font-size:.72rem;font-weight:900;cursor:pointer}
      .v241AliyahLink strong{font:700 .94rem/1.1 Georgia,serif}
      .v241AliyahLink span{font-size:1rem;color:#ead39c}
      .v242AliyahFallback{display:block;margin:9px 2px 0;color:#75664e;font:.66rem/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      @media(min-width:601px){.ramakThresholdRail{align-items:center}.v241ParashotAccess{order:-1;margin-right:2px}}
      @media(max-width:600px){
        .ramakThresholdRail{grid-template-rows:auto auto!important}
        .v241ParashotAccess{grid-column:1/-1;width:100%;margin:0 0 2px}
        .v241AliyahCard{margin-top:11px}
        .v241AliyahBody h3{font-size:1.18rem}
      }
    `;
  }


  function ensureParashotAccess(){
    const rail=caminoScreen?.querySelector('.ramakThresholdRail');
    if(!rail) return;
    let btn=rail.querySelector('.v241ParashotAccess');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className='v241ParashotAccess';
      btn.setAttribute('aria-label','Abrir selector de Parashot');
      btn.innerHTML='<small>PARASHOT</small><strong></strong><span>↑</span>';
      btn.addEventListener('click',()=>{
        document.getElementById('ramakChooser')?.scrollIntoView({behavior:'smooth',block:'start'});
        setTimeout(()=>document.querySelector('#ramakParashaRail .ramakParashaTab.on')?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}),260);
      });
      rail.prepend(btn);
    }
    const p=typeof currentParasha==='function'?currentParasha():null;
    const strong=btn.querySelector('strong');
    if(strong) strong.textContent=p?.parasha||'Elegir';
  }


  function restoreWeeklyReading(p){
    const card=document.getElementById('ramakReadingCard');
    if(!card||!p) return;
    const signature=`${p.parasha}|${p.ref||''}`;
    if(card.dataset.v242Signature===signature) return;


    card.dataset.v242Signature=signature;
    card.hidden=false;
    card.href=parashaLandingUrl(p.parasha);
    card.target='_blank';
    card.rel='noopener noreferrer';


    const title=document.getElementById('ramakReadingTitle');
    const ref=document.getElementById('ramakReadingRef');
    const detail=card.querySelector('.ramakReadingCopy>span');


    if(title) title.textContent=`Leer ${p.parasha}`;
    if(ref){
      const full=typeof biblicalRefEs==='function'?biblicalRefEs(p.ref||''):(p.ref||'');
      ref.textContent=full||p.parasha;
    }
    if(detail) detail.textContent='Parashá completa · siete Aliyot · Haftará';
  }


  function ensureDailyAliyah(p,c){
    const panel=caminoScreen?.querySelector('[data-ramak-panel="profundizar"]');
    const body=panel?.querySelector('.ramakBody');
    const voices=body?.querySelector('.ramakVoices');
    if(!body||!voices||!p||!c) return;


    const day=Math.max(1,Math.min(7,Number(c.dia)||1));
    const signature=`${p.parasha}|${day}`;


    let card=body.querySelector('.v241AliyahCard');
    if(!card){
      card=document.createElement('section');
      card.className='v241AliyahCard';
      voices.before(card);
    }


    // FIX: no reconstruir la tarjeta si sigue siendo la misma Aliyá.
    if(card.dataset.v242Signature===signature) return;
    card.dataset.v242Signature=signature;


    const aliyah=ORDINAL[day]||`${day}ª Aliyá`;
    const heb=HEBREW_DAY[day]||`Día ${day}`;
    const url=parashotUrl(p.parasha,day);
    const range=c.aliyaRange
      ? `Lectura diaria · ${c.aliyaRange}.`
      : `Lectura de Torá correspondiente al Día ${day} de este Camino.`;


    card.innerHTML=`
      <div class="v241AliyahHead">
        <small>ALIYÁ DIARIA · TORÁ</small>
        <b>${aliyah}</b>
      </div>
      <div class="v241AliyahBody">
        <h3>${p.parasha} · ${heb}</h3>
        <p>${range} Léela antes o junto a las cuatro voces para mantener Profundizar unido al texto semanal.</p>
        <a class="v241AliyahLink" href="${url}" target="_blank" rel="noopener noreferrer">
          <strong>Abrir ${aliyah} completa</strong>
          <span>→</span>
        </a>
        <small class="v242AliyahFallback">La lectura se abre aparte para mantener DÉREJ, tu Camino y Radio activos.</small>
      </div>
    `;
  }


  function apply(){
    addStyles();
    const p=typeof currentParasha==='function'?currentParasha():null;
    const c=typeof currentCamino==='function'?currentCamino():null;
    ensureParashotAccess();
    restoreWeeklyReading(p);
    ensureDailyAliyah(p,c);
  }


  addStyles();
  apply();


  if(typeof renderPanels==='function'){
    const prev=renderPanels;
    renderPanels=function(p,c){
      prev(p,c);
      requestAnimationFrame(()=>{
        ensureDailyAliyah(p,c);
        ensureParashotAccess();
      });
    };
  }


  if(typeof renderRamak==='function'){
    const prev=renderRamak;
    renderRamak=function(scroll=false){
      prev(scroll);
      requestAnimationFrame(apply);
    };
  }


  let scheduled=false;
  new MutationObserver(()=>{
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      apply();
    });
  }).observe(document.body,{subtree:true,childList:true});
})();
