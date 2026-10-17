/* DÉREJ v2.6.1 · Iom Kipur · integración editorial corregida */
(()=>{
  'use strict';
  const audit=/auditoria/i.test(location.pathname);
  document.documentElement.classList.add(audit?'derejIomAudit':'derejIomPortal');
  document.body.classList.add('derejIomEditorial',audit?'derejIomAuditBody':'derejIomPortalBody');

  const root=document.getElementById('root');
  if(!root)return;

  const bar=document.createElement('header');
  bar.className='derejIomBar';
  bar.innerHTML=`
    <div class="derejIomBarMain">
      <button type="button" class="derejIomBrand" aria-label="DÉREJ · volver al Patio">
        <b>DÉREJ</b><small>EL CAMINO</small>
      </button>
      <button type="button" class="derejIomBack" aria-label="Volver a Moed">← MOED</button>
    </div>
    <div class="derejIomContext">
      <span>MOED · <strong>IOM KIPUR</strong></span>
      <span>${audit?'AUDITORÍA · 44 PUERTAS':'PORTAL · 8 PUERTAS'}</span>
    </div>`;
  document.body.insertBefore(bar,root);

  bar.querySelector('.derejIomBrand').addEventListener('click',()=>{ location.href='index.html'; });
  bar.querySelector('.derejIomBack').addEventListener('click',()=>{
    if(history.length>1) history.back();
    else location.href='index.html';
  });

  const footer=document.createElement('footer');
  footer.className='derejIomFooter';
  footer.innerHTML=`<b>DÉREJ · EL CAMINO · ACCESO LIBRE</b><p>Experiencia educativa y comunitaria en desarrollo sin fines de lucro. DÉREJ se acerca a las fuentes judías con respeto y distingue entre fuente, paráfrasis y lectura editorial.</p>`;
  document.body.appendChild(footer);

  const skin=()=>{
    const legacyHeader=root.querySelector('header');
    if(legacyHeader) legacyHeader.classList.add('derejLegacyArtifactHeader');

    const legacyNav=root.querySelector('nav.fixed.bottom-0');
    if(legacyNav) legacyNav.classList.add('derejLegacyBottomNav');

    document.querySelectorAll('.derejReturnMoed').forEach(x=>{
      x.classList.add('derejLegacyReturn');
      x.setAttribute('aria-hidden','true');
    });

    root.querySelectorAll('button').forEach(btn=>{
      if((btn.textContent||'').includes('Aquí estoy')) btn.classList.add('derejHineniLegacy');
    });

    root.querySelectorAll('textarea').forEach(x=>x.setAttribute('spellcheck','true'));
  };
  skin();
  new MutationObserver(skin).observe(root,{childList:true,subtree:true});
})();
