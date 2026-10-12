/* DÉREJ v2.3.3 · revisión editorial */
(()=>{
const S={Chesed:'Bondad',Gevurah:'Fortaleza · límite',Tiferet:'Armonía · belleza',Netzach:'Perseverancia',Hod:'Reconocimiento · humildad',Yesod:'Fundamento',Malchut:'Reino · presencia'};
const M={OR:'Luz',RAKIA:'Firmamento · espacio que separa',YABASHA:'Tierra seca',MEOROT:'Luminarias','NEFESH JAYA':'Ser viviente · alma viviente','NAASE ADAM':'Hagamos al ser humano','TZADIK TAMIM':'Justo e íntegro',TEVA:'Arca · refugio',MABUL:'Diluvio',YAYIN:'Vino','MIGDAL BAVEL':'Torre de Babel',BRIT:'Pacto','VATANAJ HATEVA':'El arca reposó','LEJ LEJA':'Vete hacia ti'};
const P={
'Noaj|1':['נֹחַ אִישׁ צַדִּיק תָּמִים הָיָה בְּדֹרֹתָיו','Noaj ish tzadik tamim haya bedorotav','Bereshit 6:9','Noaj era un hombre justo e íntegro en sus generaciones.'],
'Noaj|2':['עֲשֵׂה לְךָ תֵּבַת עֲצֵי־גֹפֶר','Aseh lejá tevat atzei gofer','Bereshit 6:14','Hazte un arca de madera de gófer.','גֹפֶר · Gófer: especie de madera no identificada con certeza. Algunas traducciones proponen ciprés, pero el hebreo no permite afirmarlo con seguridad.'],
'Noaj|3':['וַיְהִי הַמַּבּוּל אַרְבָּעִים יוֹם עַל הָאָרֶץ',"Vayehi hamabul arba'im yom al ha'aretz",'Bereshit 7:17','Y hubo diluvio sobre la tierra durante cuarenta días.'],
'Noaj|4':['וַיָּחֶל נֹחַ אִישׁ הָאֲדָמָה וַיִּטַּע כָּרֶם','Vayájel Noaj ish haadamá vayitá kárem','Bereshit 9:20','Noaj, hombre de la tierra, comenzó y plantó una viña.'],
'Noaj|5':['הָבָה נִבְנֶה־לָּנוּ עִיר וּמִגְדָּל','Havá nivné lanu ir umigdal','Bereshit 11:4','Construyámonos una ciudad y una torre.'],
'Noaj|6':['אֶת־קַשְׁתִּי נָתַתִּי בֶּעָנָן','Et kashti natati beanan','Bereshit 9:13','He puesto mi arco en la nube.'],
'Noaj|7':['וַתָּנַח הַתֵּבָה','Vatánaj hatevá','Bereshit 8:4','Y el arca reposó.'],
'Lej Lejá|1':['לֶךְ־לְךָ מֵאַרְצְךָ',"Lej lejá me'artzeja",'Bereshit 12:1','Vete de tu tierra; emprende el camino hacia ti.']
};
const base=c=>String(c?.titulo||'').split(' - ')[0].trim();
function patch(){
try{
if(typeof RAMAK_DATA==='undefined'||!RAMAK_DATA?.parashot)return;
const n=RAMAK_DATA.parashot.find(p=>p.parasha==='Noaj');
if(n){
n.principio='Del mabul al brit · De la destrucción al arcoíris';
n.caminos.forEach(c=>{const q=P['Noaj|'+c.dia];if(q)c.pasuk={hebreo:q[0],trans:q[1],ref:q[2]};});
const d2=n.caminos.find(c=>c.dia==2);if(d2)d2.titulo='TEVA - El arca que protege';
const d6=n.caminos.find(c=>c.dia==6);if(d6)d6.titulo='BRIT - Pacto del arcoíris';
const d7=n.caminos.find(c=>c.dia==7);if(d7){d7.titulo='VATANAJ HATEVA - El arca reposó';d7.reflexion='Después del mabul, ¿dónde necesitas permitir que algo repose?';d7.paraLlevar={avoda:'Regálate 10 minutos de reposo consciente, sin pantalla ni tarea.',kavana:'Vatánaj hatevá · También puedo reposar.',hitbodedut:'Agradece por aquello que te sostuvo durante la semana.'};}
}
const l=RAMAK_DATA.parashot.find(p=>p.parasha==='Lej Lejá');
if(l){l.principio='Salir para encontrar · Caminar hacia ti';const c=l.caminos.find(x=>x.dia==1),q=P['Lej Lejá|1'];if(c&&q){c.pasuk={hebreo:q[0],trans:q[1],ref:q[2]};c.titulo='LEJ LEJA - Vete hacia ti';}}
if(typeof RAMAK_GLOSS!=='undefined')Object.assign(RAMAK_GLOSS,M);
}catch(e){console.warn('DÉREJ editorial',e);}
}
function clean(){
document.title='DÉREJ · El Camino';
const b=document.querySelector('.preBadge');if(b)b.textContent='EDICIÓN COMUNITARIA';
document.querySelectorAll('.studyBoundary,p').forEach(n=>{const t=n.textContent.trim();
if(t.startsWith('En la integración RC2'))n.textContent='El Estudio completo se conserva íntegro y puede abrirse desde aquí cuando quieras profundizar.';
if(t.startsWith('La lógica RC2'))n.textContent=n.closest('[data-screen]')?.dataset.screen==='shabat'?'Una pausa para recibir, encender, compartir, descansar y volver a mirar la semana.':'Tiempos señalados para detenerse, recordar y volver a mirar el Camino.';
if(t.startsWith('Una sola puerta. Futuras colecciones'))n.textContent='Meditación · Parashá · Hitbodedut. Escucha sin salir del Camino.';
});}
function enhance(p,c){
const k=p.parasha+'|'+c.dia,q=P[k],m=M[base(c)]||'',sm=S[c.sefira]||'';
caminoScreen?.querySelectorAll('[data-ramak-panel] .ramakScene').forEach(sc=>{const bs=sc.querySelectorAll('.ramakSceneBadge');if(bs[1]&&sm)bs[1].textContent=c.sefira+' · '+sm;const h=sc.querySelector('.ramakSceneTitle'),ln=sc.querySelector('.ramakTitleLine');if(h&&m&&!h.querySelector('.ramakInlineMeaning')){const x=document.createElement('p');x.className='ramakInlineMeaning';x.textContent=m;ln?.after(x);}const g=sc.querySelector('.ramakGlossBtn');if(g&&m)g.dataset.ramakMeaning=m;});
const root=caminoScreen?.querySelector('[data-ramak-panel="raiz"]');
if(root&&q){const h=root.querySelector('.derejPassageHelp');if(h){h.dataset.derejGlossMeaning=q[3];h.dataset.derejGlossExtra=q[4]||('Referencia: '+q[2]);h.dataset.derejGlossKind='TRADUCCIÓN · CONTEXTO';}const card=root.querySelector('.ramakVerseCard');if(card&&!card.querySelector('.derejVerseTranslation')){const x=document.createElement('p');x.className='derejVerseTranslation';x.textContent=q[3];(h||card.querySelector('.ramakHebrew'))?.after(x);}}
const v=caminoScreen?.querySelector('[data-ramak-panel="profundizar"] .ramakVoices');if(v&&!v.parentElement.querySelector('.ramakSourceNote')){const x=document.createElement('p');x.className='ramakSourceNote';x.textContent='Las cuatro voces son una síntesis editorial de DÉREJ inspirada en las fuentes señaladas; no reproducen citas textuales.';v.after(x);}
}
const st=document.createElement('style');st.textContent='.ramakInlineMeaning{margin:5px 0 0;color:rgba(255,244,218,.9);font:.78rem/1.35 Georgia,serif}.derejVerseTranslation{margin:10px auto 2px;max-width:34rem;text-align:center;color:#594f42;font:1rem/1.5 Georgia,serif}.ramakSourceNote{margin:10px 0 0;padding:10px 12px;border-left:2px solid #b6a27d;color:#756957;background:rgba(248,239,223,.58);font:.72rem/1.45 Georgia,serif}';document.head.appendChild(st);
patch();clean();
if(typeof renderPanels==='function'){const f=renderPanels;renderPanels=function(p,c){patch();f(p,c);enhance(p,c);};}
if(typeof renderRamak==='function'){const f=renderRamak;renderRamak=function(s=false){patch();f(s);clean();const p=currentParasha?.(),n=document.getElementById('ramakIncomplete');if(p?.caminos?.length<7&&n){n.hidden=false;n.textContent='Los próximos encuentros de '+p.parasha+' se abrirán a medida que avance el Camino.';}};}
if(typeof RAMAK_DATA!=='undefined'&&RAMAK_DATA)renderRamak(false);
})();
