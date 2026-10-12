/* DÉREJ v2.3.6 · referencias limpias + glosario único */
(()=>{
  const STYLE_ID='derej-v236-reference-cleanup';
  const BERESHIT_PARASHOT=new Set([
    'Bereshit','Noaj','Lej Lejá','Vayera','Jaye Sara','Toldot',
    'Vayetze','Vayishlaj','Vayeshev','Miketz','Vayigash','Vayechi'
  ]);
  const SHEMOT_PARASHOT=new Set([
    'Shemot','Vaera','Bo','Beshalaj','Yitro','Mishpatim','Teruma','Tetzave'
  ]);

  function normalizeRefs(){
    if(typeof RAMAK_DATA==='undefined'||!RAMAK_DATA?.parashot) return;
    RAMAK_DATA.parashot.forEach(p=>{
      const book=BERESHIT_PARASHOT.has(p.parasha)
        ? 'Bereshit'
        : (SHEMOT_PARASHOT.has(p.parasha)?'Shemot':'');
      if(!book) return;
      (p.caminos||[]).forEach(c=>{
        if(c?.pasuk?.ref && /^\d/.test(String(c.pasuk.ref).trim())){
          c.pasuk.ref=`${book} ${String(c.pasuk.ref).trim()}`;
        }
      });
    });
  }

  function cleanOldGlossMarkup(root=document){
    root.querySelectorAll('.derejTermIcon,.derejPassageHelp,.ramakGlossBtn').forEach(el=>{
      el.remove();
    });
  }

  function addStyles(){
    if(document.getElementById(STYLE_ID)) return;
    const st=document.createElement('style');
    st.id=STYLE_ID;
    st.textContent=`
      /* Un solo sistema de ayuda: Glosario flotante */
      .derejTermIcon,
      .derejPassageHelp,
      .ramakGlossBtn{
        display:none!important;
      }

      /* Los términos anotados ya no alteran el diseño de la referencia */
      .ramakPasukMeta .derejTermWrap{
        display:inline!important;
        padding:0!important;
        margin:0!important;
        border:0!important;
        border-radius:0!important;
        background:none!important;
        box-shadow:none!important;
        color:inherit!important;
        font:inherit!important;
      }

      @media(max-width:600px){
        /* Bloque editorial limpio: sin cajas ni líneas repetidas */
        .ramakPasukMeta{
          display:grid!important;
          gap:13px!important;
          margin:18px 0 4px!important;
          padding:14px 0 0!important;
          border:0!important;
          border-top:1px solid rgba(151,128,91,.34)!important;
          background:none!important;
        }

        .ramakPasukMeta > span{
          display:block!important;
          padding:0!important;
          margin:0!important;
          border:0!important;
          background:none!important;
          border-radius:0!important;
          box-shadow:none!important;
          color:#5b5145!important;
          font:1rem/1.42 Georgia,serif!important;
        }

        .ramakPasukMeta > span b{
          display:block!important;
          margin:0 0 5px!important;
          padding:0!important;
          border:0!important;
          background:none!important;
          font:800 .56rem/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
          letter-spacing:.15em!important;
          text-transform:uppercase!important;
          color:#7b6b50!important;
        }
      }
    `;
    document.head.appendChild(st);
  }

  function apply(){
    normalizeRefs();
    addStyles();
    cleanOldGlossMarkup();
  }

  apply();

  if(typeof renderPanels==='function'){
    const prev=renderPanels;
    renderPanels=function(p,c){
      normalizeRefs();
      prev(p,c);
      requestAnimationFrame(()=>cleanOldGlossMarkup(caminoScreen||document));
    };
  }

  if(typeof renderRamak==='function'){
    const prev=renderRamak;
    renderRamak=function(scroll=false){
      normalizeRefs();
      prev(scroll);
      requestAnimationFrame(()=>cleanOldGlossMarkup(caminoScreen||document));
    };
  }

  new MutationObserver(()=>{
    requestAnimationFrame(()=>cleanOldGlossMarkup(document));
  }).observe(document.body,{subtree:true,childList:true});
})();
