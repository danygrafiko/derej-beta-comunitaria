/* Dérej · ciclo temático independiente de las siete lecturas semanales. */
(()=>{
  const readings=window.DEREJ_MIDRASH_ES;
  if(!Array.isArray(readings)||!readings.length)return;
  let selected=0;
  let expanded=false;

  function paragraph(parent,text,className){
    const p=document.createElement('p');
    p.textContent=text;
    if(className)p.className=className;
    parent.appendChild(p);
    return p;
  }

  function render(reader){
    const item=readings[selected];
    const article=reader.querySelector('[data-midrash-article]');
    article.replaceChildren();
    const title=document.createElement('h3');
    title.id='derejMidrashTitle';
    title.textContent=item.title;
    article.appendChild(title);
    paragraph(article,item.source,'midrashSource');
    paragraph(article,'Adaptación editorial de un pasaje seleccionado.','midrashEditorial');
    item.text.split('\n\n').forEach(t=>paragraph(article,t));
    const more=document.createElement('details');
    more.className='midrashMore';
    const summary=document.createElement('summary');
    summary.textContent='Contexto, preguntas y práctica';
    more.appendChild(summary);
    const sections=[['Contexto bíblico',item.root],['Para comprender',item.context],['Nuestra lectura para hoy',item.reflection],['Preguntas para conversar',item.questions],['Práctica del encuentro',item.practice],['Intención opcional',item.intention]];
    for(const [label,content] of sections){
      const h=document.createElement('h4');h.textContent=label;more.appendChild(h);
      (Array.isArray(content)?content:[content]).forEach(t=>paragraph(more,t));
    }
    article.appendChild(more);
    reader.querySelector('select').value=String(selected);
    reader.querySelector('[data-midrash-prev]').disabled=selected===0;
    reader.querySelector('[data-midrash-next]').disabled=selected===readings.length-1;
  }

  function ensure(){
    const body=document.querySelector('[data-ramak-panel="profundizar"] .ramakBody');
    if(!body||body.querySelector('#derejMidrashReader'))return;
    const reader=document.createElement('details');
    reader.id='derejMidrashReader';
    reader.open=expanded;
    reader.innerHTML=`<summary><span>Leer Midrash en español<small>Ciclo temático de siete encuentros</small></span></summary>
      <div class="midrashContent"><label for="derejMidrashSelect">Elegir encuentro</label>
      <select id="derejMidrashSelect"></select>
      <p class="midrashCycleNote">Puedes recorrer este ciclo a tu ritmo. Sus encuentros son independientes del día de la lectura semanal.</p>
      <article data-midrash-article aria-labelledby="derejMidrashTitle" aria-live="polite"></article>
      <nav class="midrashNav" aria-label="Recorrer los encuentros del Midrash"><button type="button" data-midrash-prev>← Anterior</button><button type="button" data-midrash-next>Siguiente →</button></nav></div>`;
    const select=reader.querySelector('select');
    readings.forEach((item,index)=>{
      const option=document.createElement('option');option.value=String(index);option.textContent=`${index+1}. ${item.title}`;select.appendChild(option);
    });
    select.addEventListener('change',()=>{selected=Number(select.value);render(reader);});
    reader.addEventListener('toggle',event=>{if(event.target===reader)expanded=reader.open;});
    for(const [attr,delta] of [['prev',-1],['next',1]]){
      reader.querySelector(`[data-midrash-${attr}]`).addEventListener('click',()=>{
        selected=Math.max(0,Math.min(readings.length-1,selected+delta));render(reader);
        reader.querySelector('select').focus({preventScroll:true});
      });
    }
    body.appendChild(reader);
    render(reader);
  }

  if(typeof renderPanels==='function'){
    const previous=renderPanels;
    renderPanels=function(...args){const result=previous.apply(this,args);ensure();return result;};
  }
  if(typeof renderRamak==='function'){
    const previous=renderRamak;
    renderRamak=function(...args){const result=previous.apply(this,args);ensure();return result;};
  }
  ensure();
})();
