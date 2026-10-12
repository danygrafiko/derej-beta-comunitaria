/* DÉREJ v2.3.4 · pulido móvil y lectura */
(()=>{
  const STYLE_ID='derej-v234-mobile-polish';
  const TODAY_START={year:2026,month:9,day:4}; // 4 oct 2026 · month 0-based
  const DAY_MS=86400000;

  function addStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const st=document.createElement('style');
    st.id=STYLE_ID;
    st.textContent=`
      .ramakHeroTerm{display:block}
      .ramakHeroSubtitle{display:block;margin-top:.14em;font:.48em/1.08 Georgia,serif;color:rgba(255,241,216,.92);letter-spacing:0;text-transform:none}
      .v234GoferNote{margin:9px auto 2px;padding:9px 11px;max-width:34rem;border-left:2px solid #ae8f5c;background:rgba(238,226,203,.55);color:#6e604d!important;font:.76rem/1.42 Georgia,serif;text-align:left}
      .v234GoferNote b{color:#493f32}
      .ramakDay.today{outline:2px solid rgba(143,112,64,.78);outline-offset:2px}
      .ramakDay.today small{color:inherit;font-size:.42rem;letter-spacing:.06em}

      @media(max-width:600px){
        .ramakScene{height:214px;padding:14px}
        .ramakSceneTop{align-items:flex-start;gap:8px}
        .ramakSceneBadge{min-height:34px;padding:6px 9px;font-size:.54rem;letter-spacing:.09em;max-width:62%;line-height:1.15;text-align:center}
        .ramakSceneTitle{left:16px;right:16px;bottom:18px}
        .ramakSceneTitle>small{display:none}
        .ramakSceneTitle h2{margin:0;font-size:clamp(2.05rem,10.6vw,3rem);line-height:.94;max-width:95%}
        .ramakInlineMeaning{margin-top:7px!important;font-size:.75rem!important}

        .ramakVerseCard{padding:8px 0 0!important;border:0!important;background:transparent!important;border-radius:0!important}
        .ramakVerseCard>small{margin-left:1px;color:#786a51!important}
        .ramakHebrew{margin:12px 0 8px!important;font-size:clamp(2rem,9.5vw,2.85rem)!important;line-height:1.28!important}
        .derejVerseTranslation{margin:8px auto 4px!important;padding:0 6px;font-size:1.02rem!important;line-height:1.42!important;color:#51483d!important}
        .ramakPasukMeta{display:block!important;margin:17px 0 0!important;border-top:1px solid #d5c5aa}
        .ramakPasukMeta span{display:block!important;padding:10px 2px!important;border:0!important;border-bottom:1px solid #dfd1ba!important;border-radius:0!important;background:transparent!important;font-size:.8rem!important;line-height:1.35!important}
        .ramakPasukMeta span b{display:block;margin-bottom:2px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:.55rem;letter-spacing:.12em;text-transform:uppercase;color:#7b6d55}

        .ramakBody{padding:18px 18px calc(92px + env(safe-area-inset-bottom))!important}
        .ramakNav{margin-top:16px!important}
        .ramakPanels{padding-bottom:calc(16px + env(safe-area-inset-bottom))!important}
        .derejGlossFloat{max-width:calc(58vw - 12px)}
        .derejGlossFloat>b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .derejRadioFloat{max-width:calc(42vw - 8px)}
        .derejRadioFloat:not(.compact){max-width:calc(100vw - 16px)}
        .derejRadioOrb{width:48px!important;height:48px!important}
      }

      @media(max-width:390px){
        .ramakScene{height:220px}
        .ramakSceneTitle h2{font-size:clamp(1.95rem,10.2vw,2.65rem)}
        .ramakSceneBadge{font-size:.51rem;padding:6px 8px}
        .ramakBody{padding-left:16px!important;padding-right:16px!important}
      }
    `;
    document.head.appendChild(st);
  }

  function splitSceneTitles(){
    document.querySelectorAll('.ramakSceneTitle h2').forEach(h=>{
      if(h.querySelector('.ramakHeroTerm')) return;
      const raw=(h.dataset.v234Raw||h.textContent||'').trim();
      if(!h.dataset.v234Raw) h.dataset.v234Raw=raw;
      const parts=raw.split(/\s+-\s+/,2);
      if(parts.length<2) return;
      h.innerHTML='';
      const term=document.createElement('span');
      term.className='ramakHeroTerm';
      term.textContent=parts[0];
      const sub=document.createElement('span');
      sub.className='ramakHeroSubtitle';
      sub.textContent=parts[1];
      h.append(term,sub);
    });
  }

  function addGoferContext(){
    const p=typeof currentParasha==='function'?currentParasha():null;
    const c=typeof currentCamino==='function'?currentCamino():null;
    if(!p||!c||p.parasha!=='Noaj'||Number(c.dia)!==2) return;
    const root=document.querySelector('[data-ramak-panel="raiz"] .ramakVerseCard');
    if(!root||root.querySelector('.v234GoferNote')) return;
    const trans=root.querySelector('.derejVerseTranslation')||root.querySelector('.ramakHebrew');
    const note=document.createElement('p');
    note.className='v234GoferNote';
    note.innerHTML='<b>Gófer</b> · madera de especie no identificada con certeza.';
    trans?.after(note);
  }

  function todayInfo(){
    if(typeof RAMAK_DATA==='undefined'||!RAMAK_DATA?.parashot) return null;
    const now=new Date();
    const local=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/DAY_MS);
    const start=Math.floor(Date.UTC(TODAY_START.year,TODAY_START.month,TODAY_START.day)/DAY_MS);
    const diff=local-start;
    if(diff<0) return null;
    const week=Math.floor(diff/7),day=(diff%7)+1;
    const p=RAMAK_DATA.parashot[week];
    return p?{parasha:p.parasha,day}:null;
  }

  function markToday(){
    const p=typeof currentParasha==='function'?currentParasha():null;
    const t=todayInfo();
    const buttons=[...document.querySelectorAll('#ramakDayStrip .ramakDay')];
    buttons.forEach(btn=>{
      const isToday=!!(p&&t&&p.parasha===t.parasha&&Number(btn.dataset.ramakDay)===Number(t.day)&&!btn.disabled);
      btn.classList.toggle('today',isToday);
      if(!isToday) return;
      const small=btn.querySelector('small');
      if(!btn.classList.contains('done')){
        if(small&&small.textContent!=='HOY') small.textContent='HOY';
        else if(!small) btn.insertAdjacentHTML('beforeend','<small>HOY</small>');
      }
      const wanted=btn.classList.contains('done')?'Hoy · realizado':'Hoy';
      if(btn.title!==wanted) btn.title=wanted;
    });
  }

  function improveFloatingSafety(){
    const active=document.querySelector('.ramakPanel.on .ramakBody');
    if(!active) return;
    active.style.scrollMarginBottom='110px';
  }

  function apply(){
    addStyles();
    splitSceneTitles();
    addGoferContext();
    markToday();
    improveFloatingSafety();
  }

  addStyles();
  apply();

  if(typeof renderPanels==='function'){
    const prev=renderPanels;
    renderPanels=function(p,c){prev(p,c);requestAnimationFrame(apply);};
  }
  if(typeof renderRamak==='function'){
    const prev=renderRamak;
    renderRamak=function(scroll=false){prev(scroll);requestAnimationFrame(apply);};
  }

  const obs=new MutationObserver(()=>requestAnimationFrame(apply));
  const host=document.querySelector('.ramakCaminoScreen')||document.body;
  obs.observe(host,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});
})();
