/* Referencias de autoría y adaptación fuera del cuerpo de la lectura. */
(()=>{
 'use strict';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const markers=['El español del versículo es una paráfrasis','El texto español es una paráfrasis','El hebreo mostrado es el fragmento inicial;','El fragmento hebreo es una selección continua'];
 function splitRoot(text){
  text=String(text||'');
  const positions=markers.map(s=>text.indexOf(s)).filter(n=>n>=0);
  if(positions.length){const i=Math.min(...positions);return {context:text.slice(0,i).trim(),note:text.slice(i).trim()};}
  if(/^(?:DÉREJ |La traducción de |La lectura «)/.test(text))return {context:'',note:text};
  return {context:text,note:''};
 }
 function reference(text,title='Fuentes y notas editoriales'){
  return text?'<details class="derejEditorialReference"><summary>'+esc(title)+'</summary><div><p>'+esc(text)+'</p></div></details>':'';
 }
 window.DEREJ_EDITORIAL={splitRoot,reference};
})();
