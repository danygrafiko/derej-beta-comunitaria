/* DÉREJ v2.6 · Iom Kipur · integración editorial */
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

  const lead=document.createElement('div');
  lead.className='derejIomEditorialLead';
  lead.innerHTML=audit
    ? `<span>JESHBÓN HANÉFESH · חשבון הנפש</span><p>Un cuaderno de retorno: reconocer con honestidad, reparar lo que depende de nosotros y soltar lo que no.</p>`
    : `<span>MOED · TIEMPO DE RETORNO</span><p>Ocho puertas para detenerse, reconocer, reparar, soltar y volver. No como culpa acumulada, sino como responsabilidad y posibilidad de retorno.</p>`;
  root.insertAdjacentElement('beforebegin',lead);

  const footer=document.createElement('footer');
  footer.className='derejIomFooter';
  footer.innerHTML=`<b>DÉREJ · EL CAMINO · ACCESO LIBRE</b><p>Experiencia educativa y comunitaria en desarrollo sin fines de lucro. DÉREJ se acerca a las fuentes judías con respeto y distingue entre fuente, paráfrasis y lectura editorial.</p>`;
  document.body.appendChild(footer);

  const skin=()=>{
    const legacy=root.querySelector('header');
    if(legacy)legacy.classList.add('derejLegacyArtifactHeader');

    // Evita que el antiguo botón flotante duplique la navegación editorial.
    document.querySelectorAll('.derejReturnMoed').forEach(x=>x.setAttribute('aria-hidden','true'));

    // Mejora accesibilidad de los campos y tarjetas sin interferir con React.
    root.querySelectorAll('textarea').forEach(x=>x.setAttribute('spellcheck','true'));
  };
  skin();
  const observer=new MutationObserver(skin);
  observer.observe(root,{childList:true,subtree:true});
})();
