/* Calendario anual Moed. Conversión hebrea nativa, sin peticiones ni ubicación. */
(function(root){
  'use strict';
  const DAY=86400000, cache=new Map();
  const monthEs={Tishri:'Tishrei',Heshvan:'Jeshván',Kislev:'Kislev',Tevet:'Tevet',Shevat:'Shevat',Adar:'Adar','Adar I':'Adar I','Adar II':'Adar II',Nisan:'Nisán',Iyar:'Iyar',Sivan:'Siván',Tamuz:'Tamuz',Av:'Av',Elul:'Elul'};
  let hebrew;
  try{hebrew=new Intl.DateTimeFormat('en-u-ca-hebrew',{timeZone:'UTC',day:'numeric',month:'long',year:'numeric'});if(hebrew.resolvedOptions().calendar!=='hebrew')hebrew=null;}catch(_){hebrew=null;}
  const date=s=>new Date(s+'T12:00:00Z');
  const iso=d=>d.toISOString().slice(0,10);
  const add=(s,n)=>iso(new Date(date(s).getTime()+n*DAY));
  function parts(d){const p=Object.fromEntries(hebrew.formatToParts(d).map(x=>[x.type,x.value]));return{day:Number(p.day),month:p.month,year:Number(p.year)};}
  function events(year,region='diaspora'){
    if(!Number.isInteger(year)||year<1900||year>2199)throw new RangeError('Año fuera del calendario disponible');
    if(!hebrew)throw new Error('Calendario hebreo no disponible en este navegador');
    const key=year+region;if(cache.has(key))return cache.get(key);
    const israel=region==='israel', out=[];
    function push(id,title,first,duration,hebrewLabel,note='',gate=id){
      const start=add(first,-1);if(Number(start.slice(0,4))!==year)return;
      out.push({id,title,start,end:add(first,duration-1),hebrew:hebrewLabel,note,gate});
    }
    for(let t=Date.UTC(year,0,1,12);t<=Date.UTC(year+1,0,10,12);t+=DAY){
      const d=new Date(t), s=iso(d), h=parts(d), m=h.month, n=h.day, hy=h.year;
      if(m==='Nisan'&&n===15)push('pesaj','Pesaj',s,israel?7:8,`15–${israel?21:22} de Nisán · ${hy}`,israel?'El séder se celebra la primera noche.':'El séder se celebra las dos primeras noches en la tradición de diáspora.');
      if(m==='Sivan'&&n===6)push('shavuot','Shavuot',s,israel?1:2,`${israel?'6':'6–7'} de Siván · ${hy}`);
      if(m==='Tishri'&&n===1)push('rosh-hashana','Rosh Hashaná',s,2,`1–2 de Tishrei · ${hy}`,'Inicio del año hebreo.');
      if(m==='Tishri'&&n===10)push('iom-kipur','Iom Kipur',s,1,`10 de Tishrei · ${hy}`,'La Auditoría Pre-Iom Kipur puede recorrerse durante los días de preparación.');
      if(m==='Tishri'&&n===15)push('sucot','Sucot',s,7,`15–21 de Tishrei · ${hy}`,'Siete días. Sheminí Atzéret y Simjat Torá tienen sus propias fechas.');
      if(m==='Tishri'&&n===22)push('shemini-atzeret',israel?'Sheminí Atzéret · Simjat Torá':'Sheminí Atzéret',s,1,`22 de Tishrei · ${hy}`,'Celebración posterior a Sucot.');
      if(!israel&&m==='Tishri'&&n===23)push('simjat-tora','Simjat Torá',s,1,`23 de Tishrei · ${hy}`);
      if(m==='Kislev'&&n===25)push('januca','Janucá',s,8,`25 de Kislev · ${hy} · ocho días`,'La primera vela corresponde a la noche de inicio.','januca-purim');
      if(/^Adar/.test(m)&&m!=='Adar I'&&n===14)push('purim','Purim',s,1,`14 de ${monthEs[m]||m} · ${hy}`,'En Jerusalén y otras ciudades amuralladas corresponde Shushán Purim: del atardecer del '+format(s)+' al anochecer del '+format(add(s,1))+'.','januca-purim');
      // Un mes de 30 días comienza Rosh Jodesh el día 30 anterior y continúa el día 1.
      if(n===30||n===1){
        const prev=parts(new Date(t-DAY)), next=parts(new Date(t+DAY));
        if(n===1&&prev.day===30)continue;
        const nm=n===30?next.month:m;
        if(nm==='Tishri')continue;
        push('rosh-jodesh-'+s,'Rosh Jodesh · '+(monthEs[nm]||nm),s,n===30?2:1,`${n===30?'30 de '+(monthEs[m]||m)+' y ':''}1 de ${monthEs[nm]||nm} · ${hy}`,'Inicio del mes hebreo; no siempre coincide con la luna nueva astronómica.','rosh-jodesh');
      }
    }
    out.sort((a,b)=>a.start.localeCompare(b.start)||a.id.localeCompare(b.id));cache.set(key,out);return out;
  }
  function format(s){return new Intl.DateTimeFormat('es-CL',{timeZone:'UTC',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(date(s));}
  function today(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
  function state(e,now=today()){
    if(now<e.start)return 'Por venir';
    if(now===e.start)return 'Comienza hoy al atardecer';
    if(now===e.end)return 'Termina hoy al anochecer';
    return now>e.end?'Finalizada':'En curso';
  }
  function card(e){return `<article class="moedDateCard"><div class="moedDateTop"><h4>${e.title}</h4><span>${state(e)}</span></div><p class="moedDateHebrew">${e.hebrew}</p><dl><div><dt>Comienza al atardecer</dt><dd><time datetime="${e.start}">${format(e.start)}</time></dd></div><div><dt>Termina al anochecer</dt><dd><time datetime="${e.end}">${format(e.end)}</time></dd></div></dl>${e.note?`<p class="moedDateNote">${e.note}</p>`:''}</article>`;}
  let region='diaspora';try{if(root.localStorage?.getItem('derej_moed_region')==='israel')region='israel';}catch(_){}
  let year=new Date().getFullYear();
  function controls(){return `<div class="moedCalendarControls"><label>Año civil<select data-moed-year>${Array.from({length:11},(_,i)=>new Date().getFullYear()-2+i).map(y=>`<option value="${y}"${y===year?' selected':''}>${y}</option>`).join('')}</select></label><label>Calendario<select data-moed-region><option value="diaspora"${region==='diaspora'?' selected':''}>Diáspora · Chile y otros países</option><option value="israel"${region==='israel'?' selected':''}>Israel</option></select></label></div>`;}
  const failure='<p class="moedDateNote">Este navegador no permite calcular las fechas hebreas. Consulta el calendario en español de la fuente indicada.</p>';
  function annual(){
    let content=failure;
    try{
      const all=events(year,region), main=all.filter(e=>e.gate!=='rosh-jodesh'), monthly=all.filter(e=>e.gate==='rosh-jodesh');
      const upcoming=main.find(e=>e.end>=today());
      content=`${upcoming?`<p class="moedNextDate">${upcoming.start>today()?'Próxima celebración de este año':'Celebración más cercana'}: <b>${upcoming.title}</b> · ${format(upcoming.start)} al atardecer.</p>`:''}<details class="moedAnnualList"><summary>Ver todas las fechas de ${year}</summary><div class="moedDatesGrid">${main.map(card).join('')}</div></details><details class="moedAnnualList"><summary>Rosh Jodesh · fechas mes a mes</summary><div class="moedDatesGrid">${monthly.map(card).join('')}</div></details>`;
    }catch(_){}
    return `<section class="moedCalendar" aria-labelledby="moedCalendarTitle"><small>PARA PREPARARTE Y PARTICIPAR</small><h3 id="moedCalendarTitle">Cuándo se celebra</h3><p>La fecha hebrea se mantiene; su correspondencia con el calendario civil cambia cada año.</p>${controls()}<div aria-live="polite">${content}</div><p class="moedDateNote">Fechas de celebraciones que comienzan en el año civil elegido, aunque terminen en enero siguiente. El inicio es a la puesta del sol y el cierre al anochecer, según tu localidad; aquí no se calculan horas de encendido ni de ayuno.</p><a class="moedCalendarSource" href="https://es.chabad.org/holidays/default_cdo/${region==='israel'?'location/israel/':''}year/${year}/jewish/holidays-${year}.htm" target="_blank" rel="noopener noreferrer">Consultar calendario de referencia en español ↗</a></section>`;
  }
  function detail(id){
    try{
      const list=events(year,region).filter(e=>e.gate===id);
      if(!list.length)return '';
      if(id==='rosh-jodesh'){
        const e=list.find(e=>e.end>=today())||list[0];
        return `<section class="moedDetailDates" aria-label="Fechas de Rosh Jodesh"><h3>Rosh Jodesh en ${year}</h3>${card(e)}<p class="moedDateNote">Todas las fechas mensuales están en el calendario de arriba.</p></section>`;
      }
      return `<section class="moedDetailDates" aria-label="Fechas de celebración"><h3>Cuándo · ${year} · ${region==='israel'?'Israel':'Diáspora'}</h3>${list.map(card).join('')}<p class="moedDateNote">Las prácticas de este recorrido son propuestas de estudio y reflexión. Su cantidad no indica la duración de la festividad.</p></section>`;
    }catch(_){return failure;}
  }
  function compact(id){try{const a=events(year,region).filter(e=>e.gate===id);const e=a.find(e=>e.end>=today())||a[0];return e?`<span class="moedGateDate">${id==='januca-purim'?'Dos celebraciones · ':''}${e.title} · ${new Intl.DateTimeFormat('es-CL',{timeZone:'UTC',day:'numeric',month:'short'}).format(date(e.start))}<br>Inicio al atardecer · ${year}</span>`:'';}catch(_){return '';}}
  function update(field,value){if(field==='year'){const n=Number(value);if(Number.isInteger(n)&&n>=1900&&n<=2199)year=n;}if(field==='region'&&(value==='israel'||value==='diaspora')){region=value;try{root.localStorage?.setItem('derej_moed_region',region);}catch(_){}}}
  root.DerejMoedCalendar={events,format,state,annual,detail,compact,update};
  if(typeof module!=='undefined')module.exports=root.DerejMoedCalendar;
})(typeof window!=='undefined'?window:globalThis);
