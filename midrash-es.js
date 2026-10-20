/* Una lectura curada para cada jornada, junto al pasaje bíblico. */
(()=>{
  const readings=window.DEREJ_MIDRASH_DIARIO_ES||{};
  function paragraph(parent,text,className){
    const p=document.createElement('p');p.textContent=text;
    if(className)p.className=className;
    parent.appendChild(p);return p;
  }
  function ensure(parasha,camino){
    const p=parasha||(typeof currentParasha==='function'?currentParasha():null);
    const c=camino||(typeof currentCamino==='function'?currentCamino():null);
    const key=p&&c?`${p.parasha}|${Number(c.dia)}`:'';
    const item=readings[key];
    document.getElementById('derejMidrashReader')?.remove();
    const rootBody=document.querySelector('[data-ramak-panel="raiz"] .ramakBody');
    const depthBody=document.querySelector('[data-ramak-panel="profundizar"] .ramakBody');
    if(!rootBody||!depthBody)return;
    const previous=document.getElementById('derejMidrashDaily');
    if(previous?.dataset.dayKey===key)return;
    previous?.remove();document.getElementById('derejMidrashQuestions')?.remove();
    // No sustituir una jornada sin lectura curada por otro texto o por un ciclo genérico.
    if(!item)return;
    const article=document.createElement('section');article.id='derejMidrashDaily';article.dataset.dayKey=key;
    article.setAttribute('aria-labelledby','derejMidrashTitle');
    paragraph(article,'MIDRASH DE HOY','midrashDailyEyebrow');
    const title=document.createElement('h3');title.id='derejMidrashTitle';title.textContent=item.title;article.appendChild(title);
    paragraph(article,`Leído junto a ${item.passage.label}`,'midrashDailyPassage');
    paragraph(article,item.source,'midrashDailySource');
    paragraph(article,'Adaptación al español de un pasaje seleccionado.','midrashDailyEditorial');
    item.text.split('\n\n').forEach(t=>paragraph(article,t));
    const bridge=document.createElement('div');bridge.className='midrashDailyBridge';
    const bridgeTitle=document.createElement('h4');bridgeTitle.textContent='Para leerlo con el estudio de hoy';bridge.appendChild(bridgeTitle);
    paragraph(bridge,item.connection);paragraph(bridge,'Lectura editorial de Dérej.','midrashDailyEditorial');article.appendChild(bridge);
    const rootNav=rootBody.querySelector('.ramakNav');if(rootNav)rootNav.before(article);else rootBody.appendChild(article);
    const questions=document.createElement('details');questions.id='derejMidrashQuestions';questions.dataset.dayKey=key;
    const summary=document.createElement('summary');summary.textContent='Preguntas para conversar';questions.appendChild(summary);
    const questionBody=document.createElement('div');questionBody.className='midrashQuestionsBody';
    paragraph(questionBody,`Sobre el estudio de hoy y «${item.title}».`,'midrashQuestionsIntro');
    const list=document.createElement('ol');item.questions.forEach(text=>{const li=document.createElement('li');li.textContent=text;list.appendChild(li);});
    questionBody.appendChild(list);questions.appendChild(questionBody);
    const depthNav=depthBody.querySelector('.ramakNav');if(depthNav)depthNav.before(questions);else depthBody.appendChild(questions);
  }
  if(typeof renderPanels==='function'){
    const previous=renderPanels;renderPanels=function(p,c){const result=previous.call(this,p,c);ensure(p,c);return result;};
  }
  if(typeof renderRamak==='function'){
    const previous=renderRamak;renderRamak=function(...args){const result=previous.apply(this,args);ensure();return result;};
  }
  ensure();
})();
