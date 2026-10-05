const screens=[...document.querySelectorAll('[data-screen]')];
const DATA=window.DEREJ_ENCUENTROS_V21;
const stepOrder=['encuentro','raiz','profundizar','practica','llevar'];
let selectedEncounter=1;
let selectedChoiceId='';
const $=id=>document.getElementById(id);

function route(name){
  screens.forEach(s=>{const on=s.dataset.screen===name;s.hidden=!on;s.classList.toggle('active',on)});
  if(name==='camino') { renderEncounter(selectedEncounter,false); activateStep('encuentro',false); }
  window.scrollTo({top:0,behavior:'instant'});
}
function activateStep(step,scroll=true){
  document.querySelectorAll('.threshold').forEach(b=>b.classList.toggle('on',b.dataset.step===step));
  document.querySelectorAll('.stepPanel').forEach(p=>p.classList.toggle('on',p.dataset.panel===step));
  document.querySelector('.threshold.on')?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
  if(scroll) document.querySelector('.thresholdRail')?.scrollIntoView({behavior:'smooth',block:'start'});
  if(step==='llevar') syncCarry();
}
function splitShoresh(value=''){
  const parts=value.split('·').map(s=>s.trim());
  return {he:parts[0]||value,tr:parts.slice(1).join(' · ')};
}
function encounterByNum(num){ return DATA.encounters.find(e=>e.num===Number(num)) || DATA.encounters[0]; }
function weekForEncounter(enc){ return DATA.weeks.find(w=>w.nombre===enc.parasha); }
function memoryKey(num){ return `derej-v21-encuentro-${num}`; }
function loadMemory(num){ try{return JSON.parse(localStorage.getItem(memoryKey(num))||'null')}catch{return null} }
function saveDraft(){
  const note=$('practiceNote')?.value.trim()||'';
  const existing=loadMemory(selectedEncounter)||{};
  const data={...existing,encounter:selectedEncounter,choiceId:selectedChoiceId,note,updatedAt:new Date().toISOString()};
  try{localStorage.setItem(memoryKey(selectedEncounter),JSON.stringify(data));}catch{}
}
function renderTabs(enc){
  const names=['Bereshit','Noaj','Lej Lejá'];
  $('parashaTabs').innerHTML=names.map(name=>{
    const week=DATA.weeks.find(w=>w.nombre===name);
    const on=name===enc.parasha;
    return `<button type="button" role="tab" class="parashaTab${on?' on':''}" data-parasha="${name}" aria-selected="${on}"><span>${week?.heb||''}</span><b>${name}</b></button>`;
  }).join('');
}
function renderStrip(enc){
  const list=DATA.encounters.filter(e=>e.parasha===enc.parasha);
  $('encounterStrip').innerHTML=list.map(e=>`<button type="button" class="encounterChip${e.num===enc.num?' on':''}" data-encounter="${e.num}"><small>${e.num}</small><b>${e.aliyah.split('·')[0].trim()}</b></button>`).join('');
}
function renderRoadmap(){
  $('roadmapGrid').innerHTML=DATA.roadmap.map(r=>`<article class="roadmapCard"><small>DÍAS ${r.dias}</small><b>${r.parasha}</b><em>${r.tema}</em><p>${r.preguntaMadre}</p></article>`).join('');
}
function renderEncounter(num,scrollToChooser=true){
  saveDraft();
  const enc=encounterByNum(num); selectedEncounter=enc.num;
  const week=weekForEncounter(enc); const sh=splitShoresh(enc.shoresh);
  const saved=loadMemory(enc.num); selectedChoiceId=saved?.choiceId||'';
  $('practiceNote').value=saved?.note||'';
  $('parashaHebHero').textContent=enc.parashaHeb||week?.heb||'';
  $('selectedEncounterMeta').textContent=`ENCUENTRO ${enc.num} · ${enc.parasha.toUpperCase()} · ${enc.aliyah.toUpperCase()}`;
  $('selectedEncounterQuestion').textContent=enc.pregunta;
  $('encounterMeta').textContent=`ENCUENTRO ${enc.num} · ${enc.parasha.toUpperCase()} · ${enc.aliyah.toUpperCase()}`;
  $('encounterShoresh').textContent=enc.shoresh;
  $('encounterGlyph').textContent=sh.he||'א';
  $('encounterQuestion').textContent=enc.pregunta;
  $('choiceList').innerHTML=enc.alternativas.map(a=>`<button class="choice${a.id===selectedChoiceId?' on':''}" type="button" data-choice="${a.id}"><span class="choiceLetter">${a.id}</span><span class="choiceCopy"><b>${a.texto}</b><small><i class="midah midah${a.mida}">${a.mida}</i>${a.midahDesc}</small></span></button>`).join('');
  $('rootHe').textContent=enc.raiz.pasukHeb;
  $('rootRef').textContent=enc.raiz.pasukEsp;
  $('rootText').textContent=`Shoresh: ${enc.shoresh}`;
  $('rootSourceLabel').textContent=enc.raiz.fuente;
  $('rootQuote').textContent=enc.raiz.cita;
  $('adamTitle').textContent=enc.adamAdama.titulo;
  $('adamText').textContent=enc.adamAdama.ficha;
  $('practiceTitle').textContent=enc.practica.titulo;
  $('practiceDuration').textContent=enc.practica.duracion;
  $('practiceAction').textContent=enc.practica.accion;
  $('kavanaText').textContent=`“${enc.kavana}”`;
  renderTabs(enc); renderStrip(enc);
  if(selectedChoiceId){ revealChoice(enc,selectedChoiceId); } else { $('deeperReveal').hidden=true; $('toRoot').disabled=true; }
  $('saveStatus').textContent=''; syncCarry();
  activateStep('encuentro',false);
  if(scrollToChooser) $('encounterChooser').scrollIntoView({behavior:'smooth',block:'start'});
}
function revealChoice(enc,id){
  const a=enc.alternativas.find(x=>x.id===id); if(!a) return;
  document.querySelectorAll('.choice').forEach(c=>c.classList.toggle('on',c.dataset.choice===id));
  $('selectionEcho').textContent=a.texto;
  $('selectionMidah').textContent=`${a.mida} · ${a.midahDesc}`;
  $('deeperReveal').hidden=false; $('toRoot').disabled=false;
}
function syncCarry(){
  const enc=encounterByNum(selectedEncounter);
  const a=enc.alternativas.find(x=>x.id===selectedChoiceId);
  $('carryChoice').textContent=a?`Tu espejo: ${a.texto} — ${a.mida} · ${a.midahDesc}.`:'';
  const note=$('practiceNote').value.trim();
  $('carryNote').textContent=note?`Tu nota: “${note}”`:'';
}

document.addEventListener('click',e=>{
  const r=e.target.closest('[data-route]'); if(r){route(r.dataset.route);return;}
  const sc=e.target.closest('[data-scroll]'); if(sc){$(sc.dataset.scroll)?.scrollIntoView({behavior:'smooth',block:'start'});return;}
  const n=e.target.closest('[data-next]'); if(n){saveDraft();activateStep(n.dataset.next);return;}
  const t=e.target.closest('[data-step]'); if(t){activateStep(t.dataset.step);return;}
  const p=e.target.closest('[data-parasha]'); if(p){const first=DATA.encounters.find(x=>x.parasha===p.dataset.parasha);if(first)renderEncounter(first.num);return;}
  const chip=e.target.closest('[data-encounter]'); if(chip){renderEncounter(Number(chip.dataset.encounter));return;}
  const choice=e.target.closest('[data-choice]'); if(choice){selectedChoiceId=choice.dataset.choice; const enc=encounterByNum(selectedEncounter);revealChoice(enc,selectedChoiceId);saveDraft();return;}
  if(e.target.closest('#studyLink')){const box=$('studyPreview'),btn=$('studyLink'),open=box.hidden;box.hidden=!open;btn.setAttribute('aria-expanded',String(open));btn.querySelector('span').textContent=open?'↑':'↓';return;}
  if(e.target.closest('#roadmapToggle')){const box=$('roadmapGrid'),btn=$('roadmapToggle'),open=box.hidden;box.hidden=!open;btn.setAttribute('aria-expanded',String(open));btn.querySelector('span').textContent=open?'↑':'↓';return;}
  if(e.target.closest('#saveMemory')){
    const enc=encounterByNum(selectedEncounter); const a=enc.alternativas.find(x=>x.id===selectedChoiceId);
    const memory={encounter:enc.num,parasha:enc.parasha,choiceId:selectedChoiceId,choice:a?.texto||'',midah:a?`${a.mida} · ${a.midahDesc}`:'',note:$('practiceNote').value.trim(),kavana:enc.kavana,savedAt:new Date().toISOString()};
    try{localStorage.setItem(memoryKey(enc.num),JSON.stringify(memory));$('saveStatus').textContent='Guardado sólo en este dispositivo.';}catch{$('saveStatus').textContent='No fue posible guardar en este navegador.';}
  }
});
$('practiceNote')?.addEventListener('input',()=>{saveDraft();syncCarry()});
renderRoadmap(); renderEncounter(1,false);

/* SHABAT v2.1 · Prelanzamiento · seis caminos RC2 */
(()=>{
  const SHABAT_DATA=[{"id":1,"num":"01","hebreo":"לכה דודי","hebreoNikud":"לְכָה דוֹדִי","translit":"Kabalat Shabat","titulo":"Recibir","tituloHeb":"Kabalat Shabat","tagline":"Llegar es un arte. No entras a Shabat, lo recibes como a una novia.","abierta":"Llegar es un arte. No entras a Shabat, lo recibes como a una novia. Sales a buscarla, te vistes distinto, preparas la casa. Kabalat Shabat no es una oración más: es un cortejo. Se hace de pie, cantando, girándote hacia la puerta. Porque lo sagrado no se fuerza. Se recibe. Cuando entiendes eso, dejas de perseguir el descanso y aprendes a darle la bienvenida.","profunda":{"texto":"Lejá Dodi, de Shlomo Alkabetz (Safed, siglo XVI), toma el versículo de Shir HaShirim y lo convierte en liturgia erótica y mística. Cada estrofa termina en \"Boí beshalom ateret baalá\" — entra en paz, corona de tu marido. En el Zohar, Shabat es Malká, la Reina, y también Kalá, la Novia. Shamor y Zajor: los dos verbos del Decálogo. Zajor (recordar) es positivo, masculino, santificar. Shamor (guardar) es negativo, femenino, no hacer. Según Rambam en Hiljot Shabat 29, recibir a Shabat con alegría, ropa limpia y luz encendida es parte de la mitzvá misma. No es preparación, es Shabat ya empezando.","fuentes":["Shlomo Alkabetz – Lejá Dodi","Zohar II, 88b – Shabat Malká","Rambam, Hiljot Shabat 29:2 – Kabod y Oneg"],"hebreoFuente":"שָׁמוֹר וְזָכוֹר בְּדִבּוּר אֶחָד\nהִשְׁמִיעָנוּ אֵל הַמְּיֻחָד"},"practica":{"titulo":"Pausa de atardecer","dias":[{"dia":"Día 1","accion":"2 min de pie frente a la ventana. Sin celular. Solo mirar cómo cae la luz."},{"dia":"Día 2","accion":"Pregunta: ¿Qué del día que se va quiero recibir, no resolver?"},{"dia":"Día 3","accion":"Vístete 5 min distinto para cenar. Camisa limpia. Gesto de novia/novio."},{"dia":"Día 4","accion":"Canta Lejá Dodi en voz baja, aunque no sepas la melodía."},{"dia":"Día 5","accion":"Sal a caminar 10 min sin destino. Estás saliendo a recibir."},{"dia":"Día 6","accion":"Prepara tu espacio como si viniera alguien amado. Flores, luz."},{"dia":"Día 7","accion":"Kabalat completa: de pie, vuelta hacia el oeste, 4 minutos de silencio."}]}},{"id":2,"num":"02","hebreo":"נרות","hebreoNikud":"נֵרוֹת","translit":"Nerot","titulo":"Encender","tituloHeb":"Nerot","tagline":"Antes de que oscurezca, haces luz. No esperas luz, la enciendes.","abierta":"Antes de que oscurezca, haces luz. No esperas luz, la enciendes. Este es un acto femenino por excelencia: crear hogar con las manos. Dos velas, no una. No por simetría, sino porque la luz siempre necesita compañía para quedarse. Cuando las enciendes, cubres tus ojos. No ves la luz al nacer. La ves después, reflejada en tu casa. Así se aprende a encender: sin ver el resultado inmediato.","profunda":{"texto":"Berajá: Baruj Atá A-donai, Eloheinu Mélej Haolam, Asher Kideshanu Bemitzvotav Vetzivanu Lehadlik Ner Shel Shabat. Rashi sobre Bereshit 1:3 dice que la primera creación no fue el sol, sino la luz que permite ver. Por eso encender es la primera melajá separadora: Or y Joshej. ¿Por qué dos velas? Shamor y Zajor otra vez. También Isha y Ish. Cielo y tierra. Lo que recuerda y lo que guarda. La llama, dice el Sfat Emet, es el único elemento que no puedes partir sin multiplicarlo.","fuentes":["Berajá – Lehadlik ner shel Shabat","Rashi Bereshit 1:3 – Yehi Or","Sfat Emet, Parashat Bereshit"],"hebreoFuente":"בָּרוּךְ אַתָּה יְיָ\nאֲשֶׁר קִדְּשָׁנוּ לְהַדְלִיק נֵר שֶׁל שַׁבָּת"},"practica":{"titulo":"Luz con cavaná","dias":[{"dia":"Día 1","accion":"Compra velas de cera de abeja. Tócalas. Huele."},{"dia":"Día 2","accion":"18 minutos antes de la puesta de sol, apaga todas las luces eléctricas."},{"dia":"Día 3","accion":"Enciende 2 velas. Cubre tus ojos 20 segundos. Pide en silencio 3 deseos."},{"dia":"Día 4","accion":"Enciende aunque estés solo/sola. Di la berajá aunque tiembles."},{"dia":"Día 5","accion":"Deja que las velas se consuman sin apagarlas. Mira cómo cambia tu cara."},{"dia":"Día 6","accion":"Viernes: invita a alguien a encender contigo. Luz compartida."},{"dia":"Día 7","accion":"Escribe qué luz encendiste esta semana que no existía antes."}]}},{"id":3,"num":"03","hebreo":"קידוש","hebreoNikud":"קִדּוּשׁ","translit":"Kiddush","titulo":"Santificar","tituloHeb":"Kiddush","tagline":"Santificar es separar con palabra y vino. Decir: este tiempo es distinto.","abierta":"Santificar es separar con palabra y vino. Decir: este tiempo es distinto. No es mejor ni peor. Es otro. El Kiddush no bendice el vino: usa el vino para bendecir el tiempo. Lo tomas con la mano derecha, lleno hasta derramar. Porque la alegría, para guardar el tiempo, tiene que desbordar un poco. De noche es deoraitá, de día es derabanán. Pero los dos dicen lo mismo: hoy no es continuación de ayer.","profunda":{"texto":"Zajor et Yom HaShabat Lekadshó – Shemot 20:8. Recuerda. El verbo zajor es activo. No es memoria pasiva, es hacer memorable. El vino es alegría que guarda, no que olvida. Por eso Kiddush de noche incluye Vayejulu – testimonio de la creación. Y Kiddush de día incluye Veshamru – testimonio de la salida de Egipto. Un Shabat guarda el mundo, el otro te guarda a ti. Beber sin bendecir es tomar. Bendecir y luego beber es santificar. La diferencia es una palabra en medio.","fuentes":["Shemot 20:8 – Zajor et Yom HaShabat","Pesajim 106a – Kiddush Hayom","Rambam, Hiljot Shabat 29:1"],"hebreoFuente":"זָכוֹר אֶת יוֹם הַשַּׁבָּת לְקַדְּשׁוֹ\nוַיְכֻלּוּ הַשָּׁמַיִם וְהָאָרֶץ"},"practica":{"titulo":"Copa, pan, tiempo","dias":[{"dia":"Día 1","accion":"Consigue una copa que solo uses para Kiddush. Que tenga peso."},{"dia":"Día 2","accion":"Llena la copa hasta que casi derrame. Mira el borde."},{"dia":"Día 3","accion":"Di Vayejulu en voz alta, de pie. Aunque estés solo."},{"dia":"Día 4","accion":"Kiddush con pan delante cubierto. Dos panes. Lechem Mishné."},{"dia":"Día 5","accion":"Bebe sentado. De un trago pequeño. No a sorbos."},{"dia":"Día 6","accion":"Viernes noche: Kiddush completo con alguien, compartiendo la misma copa."},{"dia":"Día 7","accion":"Kiddush de día: más corto, más dulce. ¿Qué tiempo distinto estás marcando?"}]}},{"id":4,"num":"04","hebreo":"סעודה ועונג","hebreoNikud":"סְעוּדָּה וְעֹנֶג","translit":"Seudá veOneg","titulo":"Mesa","tituloHeb":"Seudá y Oneg","tagline":"Comer sin apuro. Shabat tiene 3 seudot. El placer es mitzvá, no culpa.","abierta":"Comer sin apuro. Shabat tiene tres seudot, no por hambre, sino por ritmo. Viernes noche, Shabat mañana, Seudá Shlishit al atardecer. Cada una con su luz distinta. El placer es mitzvá, no culpa. Oneg no es lujo, es atención. Partir el pan despacio, cantar zemirot aunque desafines, dejar que la comida sea oración sin palabras. Aquí el estómago también reza.","profunda":{"texto":"VeKarata LaShabat Oneg – Yeshaya 58:13. Y llamarás al Shabat deleite. El Talmud (Shabat 118a) dice: todo el que deleita el Shabat recibe herencia sin límites. Lechem Mishné: dos panes en recuerdo del doble maná que caía viernes. No es magia, es memoria encarnada. Zemirot no son canciones de sobremesa, son Tikún para la seudá, para que no sea solo ingesta. Comer en Shabat es avodá – servicio. El Arizal decía que las chispas más altas están en la comida de Shabat porque se comen sin ansiedad.","fuentes":["Yeshaya 58:13 – Oneg Shabat","Shabat 118a – Kol Hameoneg","Arizal – Shaar HaKavanot, Seudot Shabat"],"hebreoFuente":"וְקָרָאתָ לַשַּׁבָּת עֹנֶג\nלֶחֶם מִשְׁנֶה – זֵכֶר לַמָּן"},"practica":{"titulo":"Mesa sin prisa","dias":[{"dia":"Día 1","accion":"Compra jalá trenzada. Si no hay, trenza pan común."},{"dia":"Día 2","accion":"Una comida sin celular a la vista. Celular en otro cuarto."},{"dia":"Día 3","accion":"Canta un zemer. Shalom Alejem. Aunque solo tararees."},{"dia":"Día 4","accion":"Sirve 3 platos pequeños en lugar de 1 grande. Ritmo."},{"dia":"Día 5","accion":"Come con la mano no dominante 2 minutos. Atención."},{"dia":"Día 6","accion":"Viernes noche: mesa con mantel blanco, invita."},{"dia":"Día 7","accion":"Seudá Shlishit: al atardecer, solo pan, aceituna y silencio."}]}},{"id":5,"num":"05","hebreo":"מנוחה","hebreoNikud":"מְנוּחָה","translit":"Menujá","titulo":"Descanso radical","tituloHeb":"Menujá","tagline":"Descanso no es no hacer nada. Es dejar de producir.","abierta":"Descanso no es no hacer nada. Es dejar de producir. Las 39 melajot no son prohibiciones: son 39 formas de no intervenir el mundo. No sembrar, no cosechar, no escribir, no encender fuego. No porque el trabajo sea malo, sino porque necesitas un día donde el mundo siga sin ti. Aquí Shabat toca directamente el Bloque 6 de Adam Adamá – Trabajo. Si no paras, el trabajo te define. Si paras, te recuerdas.","profunda":{"texto":"Shemot 20:10 – Lemaán Yanúaj Avdejaj Vaamatejá... Kaamoja. Para que descanse tu siervo, tu buey y tu extranjero como tú. No es privilegio, es derecho. El descanso es la primera ley laboral de la Torá. Rambam dice: Menujá no es ausencia de trabajo, es presencia de sistema que se mantiene solo. Por eso Shabat no es vacaciones. Vacaciones cambian de lugar. Shabat cambia de modo. De hacer a ser. De crear a contemplar. En tiempos de burnout, Menujá es desobediencia sagrada.","fuentes":["Shemot 20:10 – Kaamoja","Rambam, More Nevujim II:31 – Taamei HaShabat","Abraham J. Heschel – The Sabbath, Menujá como arquitectura del tiempo"],"hebreoFuente":"לְמַעַן יָנוּחַ עַבְדְּךָ וַאֲמָתְךָ כָּמוֹךָ\nשֵׁשֶׁת יָמִים תַּעֲבֹד – וּבַיּוֹם הַשְּׁבִיעִי תִּשְׁבֹּת"},"practica":{"titulo":"25 horas sin crear","dias":[{"dia":"Día 1","accion":"Haz lista de lo que NO harás: comprar, crear, producir, optimizar."},{"dia":"Día 2","accion":"Haz lista de lo que SÍ harás: caminar, leer por placer, amar, dormir."},{"dia":"Día 3","accion":"Deja el celular cargando en otra habitación de puesta de sol a puesta de sol."},{"dia":"Día 4","accion":"Camina sin audífonos 30 min. Sin contar pasos."},{"dia":"Día 5","accion":"Lee un libro de papel que no te sirva para nada."},{"dia":"Día 6","accion":"25 horas reales: de viernes atardecer a sábado noche. Sin comprar."},{"dia":"Día 7","accion":"Escribe: ¿Qué parte de ti descansa cuando no produces?"}]}},{"id":6,"num":"06","hebreo":"הבדלה","hebreoNikud":"הַבְדָּלָה","translit":"Havdalá","titulo":"Separar","tituloHeb":"Havdalá","tagline":"Salir también es sagrado. Vino, especias y fuego para llevarte el aroma.","abierta":"Salir también es sagrado. Havdalá no es cierre, es costura. Vino, especias y fuego para llevarte el aroma de Shabat a la semana. Hueles las besamim porque se va el alma extra – neshamá yeterá – y necesitas consuelo. Miras la llama entre tus dedos para aprender de nuevo a crear fuego. Separar es también un arte. No todo lo sagrado dura para siempre. Algunas cosas hay que despedirlas con belleza para que vuelvan.","profunda":{"texto":"Berajá: Hamavdil Ben Kodesh Lejol, Ben Or Lejoshej, Ben Israel Laamim, Ben Yom Hashevií Lesheshet Yemei Hamaasé. El que separa. Cinco separaciones en una. Besamim para el alma extra que se va – según Talmud Betzá 16a, en Shabat recibes una neshamá adicional que te hace ver más claro. Cuando se va, quedas triste, por eso olemos perfume. Ner: vuelves a crear fuego, vuelves a ser socio de la creación. Después de 25 horas de no crear, encender la mecha es volver a decir: el mundo te necesita otra vez.","fuentes":["Talmud Betzá 16a – Neshamá Yeterá","Berajot 8a – Hamavdil","Rav Kook – Olat Reiyá, Havdalá como esperanza"],"hebreoFuente":"הַמַּבְדִּיל בֵּין קֹדֶשׁ לְחוֹל\nבֵּין אוֹר לְחֹשֶׁךְ – בְּשָׂמִים לִנְשָׁמָה יְתֵרָה"},"practica":{"titulo":"Aroma para la semana","dias":[{"dia":"Día 1","accion":"Consigue besamim: clavo, canela, romero. Guárdalos en cajita."},{"dia":"Día 2","accion":"Sábado noche: copa de vino, especias, vela trenzada con 2 mechas."},{"dia":"Día 3","accion":"Mira la sombra de tus dedos a la luz de Havdalá. Cuenta tus líneas."},{"dia":"Día 4","accion":"Huele las besamim 3 veces profundo. ¿A qué te recuerda?"},{"dia":"Día 5","accion":"Di: \"Que esta semana tenga algo del perfume de Shabat\"."},{"dia":"Día 6","accion":"Havdalá con alguien. Compartan deseos para la semana."},{"dia":"Día 7","accion":"Guarda un resto de cera de la vela Havdalá en tu bolsillo toda la semana."}]}}];
  const screen=document.querySelector('[data-screen="shabat"]');
  if(!screen) return;

  screen.className='screen shabatScreen';
  screen.setAttribute('aria-labelledby','shabatTitle');
  screen.innerHTML=`
    <section class="shabatHero">
      <div class="shabatHeroShade" aria-hidden="true"></div>
      <button class="backBtn shabatBack" data-route="home">← Patio</button>
      <div class="shabatHeroCopy">
        <span class="shabatEyebrow">SHABAT · שבת</span>
        <h1 id="shabatTitle">Detener<br>y escuchar.</h1>
        <p>Un portal para aprender a parar. 6 caminos de bendición para recibir, habitar y despedir el tiempo sagrado.</p>
        <button class="shabatEnter" data-shabat-scroll="shabatJourney">Recorrer los seis caminos <span>↓</span></button>
      </div>
    </section>

    <section class="shabatJourney" id="shabatJourney" aria-labelledby="shabatJourneyTitle">
      <header class="shabatJourneyHead">
        <span>SEIS GESTOS · UN MISMO SHABAT</span>
        <h2 id="shabatJourneyTitle">De recibir la luz<br>a despedirla con belleza.</h2>
      </header>
      <div class="shabatJourneyLine" aria-hidden="true"></div>
      <div id="shabatGates"></div>
    </section>

    <section class="shabatDetail" id="shabatDetail" aria-live="polite"></section>
  `;

  if(!document.getElementById('shabatV21Styles')){
    const style=document.createElement('style');
    style.id='shabatV21Styles';
    style.textContent=`
      .shabatScreen{background:#efe2ca;color:#312b23;padding-bottom:calc(36px + env(safe-area-inset-bottom))}
      .shabatHero{position:relative;min-height:70dvh;overflow:hidden;background:url('assets/home-courtyard-v21.webp') 11% 34%/cover no-repeat;border-bottom:1px solid rgba(217,184,111,.25)}
      .shabatHeroShade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,10,8,.18),rgba(8,11,8,.10) 28%,rgba(8,10,7,.38) 62%,rgba(7,9,7,.92) 100%),radial-gradient(circle at 18% 36%,rgba(222,153,61,.20),transparent 38%)}
      .shabatBack{position:absolute;top:12px;left:12px;z-index:4}
      .shabatHeroCopy{position:absolute;z-index:3;left:20px;right:20px;bottom:24px;color:#fff1d4;text-shadow:0 2px 16px #000}
      .shabatEyebrow{font-size:.62rem;letter-spacing:.22em;font-weight:900;color:#e4c67f}
      .shabatHero h1{font:clamp(2.8rem,12vw,4.7rem)/.88 Georgia,serif;margin:.22em 0 .24em;letter-spacing:-.025em}
      .shabatHero p{max-width:31rem;margin:0 0 18px;font:1rem/1.42 Georgia,serif;color:#eadfcb}
      .shabatEnter{display:flex;align-items:center;justify-content:center;gap:18px;width:min(100%,430px);border:1px solid rgba(248,226,183,.72);border-radius:999px;background:#f1e4ca;color:#30291f;padding:14px 18px;font-weight:850}
      .shabatJourney{position:relative;padding:31px 16px 28px;background:linear-gradient(180deg,#efe2ca,#f7ecd8 58%,#efe2ca)}
      .shabatJourneyHead{position:relative;z-index:2;text-align:center;margin:0 auto 24px;max-width:35rem}
      .shabatJourneyHead>span{font-size:.58rem;letter-spacing:.2em;font-weight:900;color:#7a684a}
      .shabatJourneyHead h2{font:clamp(2rem,8.4vw,3rem)/1 Georgia,serif;margin:.35em 0 0;color:#302a23;text-wrap:balance}
      #shabatGates{position:relative;z-index:2;display:grid;gap:13px;padding:4px 0}
      .shabatJourneyLine{position:absolute;z-index:1;top:150px;bottom:34px;left:50%;width:1px;background:linear-gradient(180deg,rgba(167,130,64,.1),rgba(167,130,64,.65),rgba(167,130,64,.1))}
      .shabatGate{position:relative;width:88%;border:1px solid #cbb99c;border-radius:24px;background:rgba(255,247,232,.86);color:#352e26;padding:14px 16px;text-align:left;box-shadow:0 8px 24px rgba(64,49,28,.06);backdrop-filter:blur(5px)}
      .shabatGate:nth-child(odd){justify-self:start}
      .shabatGate:nth-child(even){justify-self:end}
      .shabatGate:before{content:"";position:absolute;top:50%;width:10px;height:10px;border:2px solid #a98850;border-radius:50%;background:#f4e7d0;transform:translateY(-50%)}
      .shabatGate:nth-child(odd):before{right:-9.4%}
      .shabatGate:nth-child(even):before{left:-9.4%}
      .shabatGateTop{display:flex;align-items:center;justify-content:space-between;gap:10px}
      .shabatGateNum{font-size:.58rem;letter-spacing:.16em;font-weight:900;color:#8a744f}
      .shabatGateHeb{direction:rtl;font:1.2rem Georgia,serif;color:#5b664f}
      .shabatGate h3{font:1.65rem/1 Georgia,serif;margin:.28em 0 .12em}
      .shabatGate small{font-size:.6rem;letter-spacing:.12em;font-weight:850;color:#7b705f}
      .shabatGate p{font:.79rem/1.38 Georgia,serif;color:#6d6255;margin:.55em 0 0}
      .shabatGate.on{background:#354532;color:#fff;border-color:#354532;box-shadow:0 12px 30px rgba(53,69,50,.18)}
      .shabatGate.on .shabatGateNum,.shabatGate.on .shabatGateHeb,.shabatGate.on small,.shabatGate.on p{color:#f0dfbb}
      .shabatDetail{margin:0 12px 12px;border:1px solid #d1c1a5;border-radius:30px;overflow:hidden;background:#fff7e8;box-shadow:0 16px 38px rgba(61,46,26,.09)}
      .shabatDetailScene{position:relative;height:220px;background-image:linear-gradient(180deg,rgba(7,10,8,.08),rgba(7,10,8,.76)),url('assets/home-courtyard-v21.webp');background-size:cover;background-position:var(--shabat-pos,18% 40%);color:#fff0d3;padding:16px}
      .shabatDetailScene .num{display:grid;place-items:center;width:46px;height:46px;border:1px solid rgba(255,232,190,.7);border-radius:50%;background:rgba(10,14,10,.42);font:1rem Georgia,serif}
      .shabatDetailHeb{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);direction:rtl;font:2.5rem Georgia,serif;color:#f5ddb0;text-shadow:0 2px 14px #000;white-space:nowrap}
      .shabatDetailBody{padding:19px}
      .shabatDetailMeta{font-size:.59rem;letter-spacing:.16em;font-weight:900;color:#7d6b4a}
      .shabatDetailBody h2{font:clamp(2.15rem,9vw,3rem)/.98 Georgia,serif;margin:.28em 0 .08em;color:#332c25;letter-spacing:-.02em}
      .shabatTranslit{font:.9rem/1.35 Georgia,serif;color:#65705b;margin:0 0 7px}
      .shabatTagline{font:1.05rem/1.45 Georgia,serif;color:#655d52;margin:0 0 16px}
      .shabatTabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:10px 0 15px}
      .shabatTab{border:1px solid #c8b99e;border-radius:16px;background:#f7ecd9;color:#463d31;padding:10px 6px;font-size:.68rem;font-weight:850}
      .shabatTab.on{background:#354532;color:#fff;border-color:#354532}
      .shabatReading{padding:17px;border:1px solid #d3c4aa;border-radius:20px;background:#fffaf0}
      .shabatReading p{margin:0;font:1rem/1.62 Georgia,serif;color:#4f473d}
      .shabatDeepHeb{direction:rtl;text-align:center;white-space:pre-line;font:1.55rem/1.55 Georgia,serif;color:#3e4a38;padding:15px;margin-bottom:14px;border-radius:18px;background:#e7eadb}
      .shabatSources{display:grid;gap:7px;margin-top:15px}
      .shabatSource{font-size:.72rem;line-height:1.4;color:#6d6253;padding-left:15px;position:relative}
      .shabatSource:before{content:"↳";position:absolute;left:0;color:#9b8357}
      .shabatPracticeTitle{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
      .shabatPracticeTitle b{font:1.2rem Georgia,serif}
      .shabatPracticeTitle span{font-size:.58rem;letter-spacing:.15em;font-weight:900;color:#6c795c}
      .shabatDays{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px 0 9px}
      .shabatDays::-webkit-scrollbar{display:none}
      .shabatDay{flex:0 0 54px;border:1px solid #c7b89c;border-radius:14px;background:#fffaf1;color:#5b5041;padding:8px 5px;text-align:center;font-size:.62rem;font-weight:850}
      .shabatDay.on{background:#786c54;color:#fff;border-color:#786c54}
      .shabatAction{padding:16px;border-left:4px solid #73805b;border-radius:0 18px 18px 0;background:#e7eadb;font:1rem/1.5 Georgia,serif;color:#484139}
      .shabatKavana{margin-top:14px;padding:14px 15px;border-radius:18px;background:#302d27;color:#f2e3c5}
      .shabatKavana small{display:block;font-size:.55rem;letter-spacing:.15em;font-weight:900;opacity:.65;margin-bottom:6px}
      .shabatKavana p{margin:0;font:italic 1rem/1.45 Georgia,serif}
      .shabatNav{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:15px}
      .shabatNav button{border:1px solid #9d8b70;border-radius:14px;background:#f6ecda;color:#443c32;padding:10px;font-size:.73rem;font-weight:850}
      @media(min-width:700px){
        .shabatHero{min-height:720px;border-radius:0 0 34px 34px}
        .shabatJourney{padding:42px 70px}
        #shabatGates{max-width:760px;margin:auto}
        .shabatDetail{margin:20px 18px}
        .shabatDetail{display:grid;grid-template-columns:40% 60%}
        .shabatDetailScene{height:auto;min-height:590px}
        .shabatDetailBody{padding:30px}
      }
      @media(max-width:390px){
        .shabatHero{min-height:66dvh}
        .shabatHero h1{font-size:2.7rem}
        .shabatJourney{padding-left:11px;padding-right:11px}
        .shabatGate{width:90%;padding:13px}
        .shabatGate h3{font-size:1.5rem}
        .shabatDetail{margin-left:8px;margin-right:8px}
        .shabatDetailScene{height:190px}
        .shabatDetailHeb{font-size:2.15rem}
        .shabatDetailBody{padding:16px}
      }
    `;
    document.head.appendChild(style);
  }

  let selectedId=1;
  let selectedTab='abierta';
  let selectedDay=0;
  const positions=['15% 37%','12% 31%','24% 44%','18% 39%','51% 48%','72% 46%'];

  function selected(){return SHABAT_DATA.find(x=>x.id===selectedId)||SHABAT_DATA[0];}

  function renderGates(){
    const host=document.getElementById('shabatGates');
    host.innerHTML=SHABAT_DATA.map(x=>`
      <button class="shabatGate${x.id===selectedId?' on':''}" type="button" data-shabat-id="${x.id}">
        <div class="shabatGateTop">
          <span class="shabatGateNum">${x.num}</span>
          <span class="shabatGateHeb">${x.hebreoNikud}</span>
        </div>
        <h3>${x.titulo}</h3>
        <small>${x.translit}</small>
        <p>${x.tagline}</p>
      </button>
    `).join('');
  }

  function tabContent(x){
    if(selectedTab==='abierta'){
      return `<div class="shabatReading"><p>${x.abierta}</p></div>`;
    }
    if(selectedTab==='profunda'){
      return `
        <div class="shabatReading">
          <div class="shabatDeepHeb">${x.profunda.hebreoFuente}</div>
          <p>${x.profunda.texto}</p>
          <div class="shabatSources">${x.profunda.fuentes.map(f=>`<div class="shabatSource">${f}</div>`).join('')}</div>
        </div>`;
    }
    const item=x.practica.dias[selectedDay]||x.practica.dias[0];
    return `
      <div class="shabatReading">
        <div class="shabatPracticeTitle"><b>${x.practica.titulo}</b><span>PRÁCTICA 7 DÍAS</span></div>
        <div class="shabatDays" aria-label="Elegir día">${x.practica.dias.map((d,i)=>`<button type="button" class="shabatDay${i===selectedDay?' on':''}" data-shabat-day="${i}">${d.dia.replace('Día ','D')}</button>`).join('')}</div>
        <div class="shabatAction">${item.accion}</div>
        <div class="shabatKavana"><small>CAVANÁ DE LA SEMANA</small><p>“${x.tagline}”</p></div>
      </div>`;
  }

  function renderDetail(scroll=false){
    const x=selected();
    const host=document.getElementById('shabatDetail');
    host.innerHTML=`
      <div class="shabatDetailScene" style="--shabat-pos:${positions[x.id-1]||'18% 40%'}">
        <span class="num">${x.num}</span>
        <span class="shabatDetailHeb">${x.hebreoNikud}</span>
      </div>
      <div class="shabatDetailBody">
        <div class="shabatDetailMeta">SHABAT · CAMINO ${x.num} DE 06</div>
        <h2>${x.titulo}</h2>
        <p class="shabatTranslit">${x.tituloHeb} · ${x.translit}</p>
        <p class="shabatTagline">${x.tagline}</p>
        <div class="shabatTabs" role="tablist" aria-label="Profundidad de lectura">
          <button type="button" class="shabatTab${selectedTab==='abierta'?' on':''}" data-shabat-tab="abierta">Abierta</button>
          <button type="button" class="shabatTab${selectedTab==='profunda'?' on':''}" data-shabat-tab="profunda">Profunda</button>
          <button type="button" class="shabatTab${selectedTab==='practica'?' on':''}" data-shabat-tab="practica">Práctica</button>
        </div>
        <div id="shabatTabContent">${tabContent(x)}</div>
        <div class="shabatNav">
          <button type="button" data-shabat-prev>← ${SHABAT_DATA[(x.id+4)%6].titulo}</button>
          <button type="button" data-shabat-next>${SHABAT_DATA[x.id%6].titulo} →</button>
        </div>
      </div>`;
    renderGates();
    if(scroll) host.scrollIntoView({behavior:'smooth',block:'start'});
  }

  screen.addEventListener('click',e=>{
    const scroll=e.target.closest('[data-shabat-scroll]');
    if(scroll){document.getElementById(scroll.dataset.shabatScroll)?.scrollIntoView({behavior:'smooth',block:'start'});return;}

    const gate=e.target.closest('[data-shabat-id]');
    if(gate){selectedId=Number(gate.dataset.shabatId);selectedTab='abierta';selectedDay=0;renderDetail(true);return;}

    const tab=e.target.closest('[data-shabat-tab]');
    if(tab){selectedTab=tab.dataset.shabatTab;selectedDay=0;renderDetail(false);return;}

    const day=e.target.closest('[data-shabat-day]');
    if(day){selectedDay=Number(day.dataset.shabatDay);renderDetail(false);return;}

    if(e.target.closest('[data-shabat-prev]')){selectedId=selectedId===1?6:selectedId-1;selectedTab='abierta';selectedDay=0;renderDetail(true);return;}
    if(e.target.closest('[data-shabat-next]')){selectedId=selectedId===6?1:selectedId+1;selectedTab='abierta';selectedDay=0;renderDetail(true);return;}
  });

  renderGates();
  renderDetail(false);
})();
