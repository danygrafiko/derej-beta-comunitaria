/* DÉREJ v2.3.5 · navegación continua */
(()=>{
  const STYLE_ID='derej-v235-continuous-navigation';

  function addStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const st=document.createElement('style');
    st.id=STYLE_ID;
    st.textContent=`
      /* La banda oscura queda como orientación, no como una segunda puerta de entrada */
      .ramakSelectedBanner{
        grid-template-columns:44px minmax(0,1fr)!important;
      }
      .ramakSelectedBanner>button{
        display:none!important;
      }

      /* "Retomar pendientes" permanece disponible pero en segundo plano visual */
      .ramakProgressPrivate>button{
        background:transparent!important;
        color:#40523d!important;
        border:1px solid rgba(64,82,61,.48)!important;
      }

      .ramakThresholdRail{
        scroll-margin-top:calc(58px + env(safe-area-inset-top));
      }

      @media(max-width:600px){
        /* Los cinco umbrales siempre visibles: no hay que descubrir "Llevar" deslizando */
        .ramakThresholdRail{
          display:grid!important;
          grid-template-columns:repeat(5,minmax(0,1fr))!important;
          gap:5px!important;
          overflow:visible!important;
          padding:9px 8px!important;
        }
        .ramakThreshold{
          width:100%!important;
          min-width:0!important;
          padding:8px 3px!important;
          border-radius:15px!important;
          text-align:center!important;
          justify-items:center!important;
        }
        .ramakThreshold span{
          font-size:.45rem!important;
          line-height:1!important;
        }
        .ramakThreshold b{
          font-size:.61rem!important;
          line-height:1.12!important;
          letter-spacing:-.025em!important;
          white-space:nowrap!important;
        }
      }

      @media(max-width:390px){
        .ramakThresholdRail{gap:4px!important;padding-left:6px!important;padding-right:6px!important}
        .ramakThreshold{padding-left:2px!important;padding-right:2px!important}
        .ramakThreshold b{font-size:.57rem!important}
      }
    `;
    document.head.appendChild(st);
  }

  function focusEncounter(){
    selectedRamakStep='encuentro';
    if(typeof activateRamakStep==='function') activateRamakStep('encuentro',false);

    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        const rail=caminoScreen?.querySelector('.ramakThresholdRail');
        rail?.scrollIntoView({behavior:'smooth',block:'start'});
      });
    });
  }

  function selectDayDirect(btn){
    if(!btn || btn.disabled || typeof RAMAK_DATA==='undefined' || !RAMAK_DATA) return;
    try{ if(typeof saveRamakDraft==='function') saveRamakDraft(); }catch{}
    selectedDay=Number(btn.dataset.ramakDay);
    selectedRamakStep='encuentro';
    renderRamak(false);
    focusEncounter();
  }

  function selectParashaDirect(btn){
    if(!btn || typeof RAMAK_DATA==='undefined' || !RAMAK_DATA) return;
    try{ if(typeof saveRamakDraft==='function') saveRamakDraft(); }catch{}
    selectedParasha=btn.dataset.ramakParasha;

    const p=RAMAK_DATA.parashot.find(x=>x.parasha===selectedParasha);
    const sameDay=p?.caminos?.find(x=>Number(x.dia)===Number(selectedDay));
    selectedDay=sameDay?.dia ?? p?.caminos?.[0]?.dia ?? 1;

    selectedRamakStep='encuentro';
    renderRamak(false);
    focusEncounter();
  }

  /*
    Interceptamos únicamente selectores de Parashá y Día.
    El listener original hacía renderRamak(true), que devolvía al usuario al selector
    y hacía necesario el botón "Entrar". Ahora la selección abre directamente el contenido.
  */
  document.addEventListener('click',e=>{
    const day=e.target.closest('#ramakDayStrip [data-ramak-day]');
    if(day){
      e.preventDefault();
      e.stopImmediatePropagation();
      selectDayDirect(day);
      return;
    }

    const parasha=e.target.closest('#ramakParashaRail [data-ramak-parasha]');
    if(parasha){
      e.preventDefault();
      e.stopImmediatePropagation();
      selectParashaDirect(parasha);
    }
  },true);

  addStyles();

  /* Refuerza el comportamiento al entrar desde la portada: hoy → Encuentro */
  const previousRoute=route;
  route=function(name){
    previousRoute(name);
    if(name==='camino' && typeof RAMAK_DATA!=='undefined' && RAMAK_DATA){
      setTimeout(focusEncounter,110);
    }
  };
})();
