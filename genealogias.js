/* Genealogías Dérej · síntesis, fuentes y ramas desplegables. */
(()=>{
  const root=document.getElementById('derej-raices-v2');
  const people={};
  function add(id,name,father,mother,ref,story='',note='',alias=''){
    people[id]={id,name,father,mother,ref,story,note,alias};
  }
  const line=[['adam','Adam'],['set','Shet', 'Set'],['enosh','Enosh'],['kenan','Kenán'],['mahalalel','Mahalalel'],['yered','Yéred'],['janoj','Janoj','Enoc'],['metush','Metushélaj','Matusalén'],['lemej','Lémej'],['noaj','Nóaj','Noé'],['shem','Shem'],['arpaj','Arpajshad'],['shelaj','Shélaj'],['ever','Éver'],['peleg','Péleg'],['reu','Reú'],['serug','Serug'],['nahorabuelo','Najor','abuelo de Abraham'],['teraj','Téraj','Taré'],['abraham','Abraham']];
  line.forEach(([id,name,alias],i)=>add(id,name,i?line[i-1][0]:null,null,i<=9?'Génesis 5':'Génesis 11:10–27','', '',alias||''));
  people.adam.story='El punto de partida de la línea humana que el Génesis sigue hasta Nóaj. Esta vista desarrolla la rama de Shet; no contiene todos los descendientes de Adam.';
  people.noaj.story='Nóaj tiene a Shem, Jam y Yéfet. La ascendencia de Abraham continúa por Shem.';
  people.abraham.ref='Génesis 16:15; 21:1–5; 25:1–4';
  people.abraham.story='El Génesis nombra ocho hijos varones de Abraham. Las ramas de Sará, Hagar y Keturá abren historias diferentes. La línea por Itzjak conduce hacia Israel.';
  people.teraj.story='Padre de Abraham, Najor y Harán. Su casa conecta a los patriarcas con Rivká, Leá y Rajel.';
  add('jam','Jam','noaj',null,'Génesis 5:32');add('yefet','Yéfet','noaj',null,'Génesis 5:32');
  add('nahor','Najor','teraj',null,'Génesis 11:27–29; 22:20–24','Hermano de Abraham. Con Milcá tiene a Betuel, padre de Rivká.','No confundir con Najor, padre de Téraj.');
  add('haran','Harán','teraj',null,'Génesis 11:27–29','Hermano de Abraham; padre de Lot, Milcá e Iscá.','Harán es una persona; Jarán es la ciudad.');
  add('lot','Lot','haran',null,'Génesis 11:27; 19:30–38','Lot es sobrino de Abraham. De su rama proceden Moab y Ben Amí.','Génesis 19:30–38 narra un episodio de embriaguez e incesto. El árbol registra el parentesco; no lo presenta como modelo de conducta.');
  add('milca','Milcá','haran',null,'Génesis 11:29; 22:20–23','Hija de Harán y esposa de Najor. Es madre de Betuel y abuela de Rivká.');
  add('isca','Iscá','haran',null,'Génesis 11:29','El Génesis nombra a Iscá como hija de Harán.','Rashí la identifica con Sará. Es una identificación tradicional; el texto no expresa directamente esa equivalencia.');
  add('sara','Sará',null,null,'Génesis 17:15–19; 20:12; 21:1–5','Madre de Itzjak y figura central de la promesa.','En Génesis 20:12 Abraham la presenta como media hermana paterna. Rashí la identifica con Iscá, hija de Harán, e interpreta el parentesco en consecuencia. Este árbol no fija una sola filiación para Sará.');
  add('hagar','Hagar',null,null,'Génesis 16; 21:9–21','Mujer egipcia y madre de Ismael. Su historia concede voz a quien vive en una posición vulnerable.');
  add('ketura','Keturá',null,null,'Génesis 25:1–4','Madre nombrada de seis hijos de Abraham.','Rashí identifica a Keturá con Hagar; Ibn Ezra las considera mujeres distintas. Aquí se conservan los dos nombres del texto por separado.');
  add('ismael','Ismael','abraham','hagar','Génesis 16:11–16; 25:12–16','Hijo de Abraham y Hagar. El Génesis nombra doce hijos suyos como jefes de sus agrupaciones.');
  add('itzjak','Itzjak','abraham','sara','Génesis 21:1–5; 25:19–26','Hijo de Abraham y Sará. Con Rivká tiene a Esav y Yaakov. La familia de Rivká vuelve a enlazar las ramas de los hermanos de Abraham.','','Isaac');
  [['zimran','Zimrán'],['yocshan','Yocshán'],['medan','Medán'],['madian','Madián'],['ishbak','Ishbak'],['shuaj','Shúaj']].forEach(([id,name])=>add(id,name,'abraham','ketura','Génesis 25:1–4'));
  [['neb','Nebayot'],['quedar','Quedar'],['adbeel','Adbeel'],['mibsam','Mibsam'],['mishma','Mishmá'],['duma','Dumá'],['masa','Masá'],['jadad','Jadad'],['tema','Temá'],['yetur','Yetur'],['nafish','Nafish'],['quedma','Quédma']].forEach(([id,name])=>add(id,name,'ismael',null,'Génesis 25:13–16'));
  add('sheva','Shevá','yocshan',null,'Génesis 25:3');add('dedan','Dedán','yocshan',null,'Génesis 25:3');
  [['efa','Efá'],['efer','Éfer'],['janojmadian','Janoj'],['abida','Abidá'],['eldaa','Eldaá']].forEach(([id,name])=>add(id,name,'madian',null,'Génesis 25:4'));
  add('reuma','Reumá',null,null,'Génesis 22:24');
  [['utz','Utz'],['buz','Buz'],['kemuel','Kemuel'],['quesed','Quésed'],['jazo','Jazó'],['pildash','Pildash'],['yidlaf','Yidlaf'],['betuel','Betuel']].forEach(([id,name])=>add(id,name,'nahor','milca','Génesis 22:20–23'));
  [['tevaj','Tévaj'],['gajam','Gájam'],['tajash','Tájash'],['maaca','Maacá']].forEach(([id,name])=>add(id,name,'nahor','reuma','Génesis 22:24'));
  add('aramkemuel','Aram','kemuel',null,'Génesis 22:21');
  add('rivka','Rivká','betuel',null,'Génesis 22:23; 24:15,24,29','Hija de Betuel, nieta de Najor y Milcá. Con Itzjak tiene a Esav y Yaakov.','Su genealogía reúne las ramas de Najor y Harán. Su hospitalidad y su decisión de partir tienen un lugar propio en el relato.','Rebeca');
  add('laban','Labán','betuel',null,'Génesis 24:29; 28:5; 29:16','Hermano de Rivká y padre de Leá y Rajel.');
  add('lea','Leá','laban',null,'Génesis 29:16,31–35; 30:17–21','Madre de seis hijos varones de Yaakov y de Diná.');
  add('rajel','Rajel','laban',null,'Génesis 29:16; 30:22–24; 35:16–20','Madre de Yosef y Binyamín.');
  add('bilha','Bilhá',null,null,'Génesis 30:3–8','Madre de Dan y Naftalí en la casa de Yaakov.');
  add('zilpa','Zilpá',null,null,'Génesis 30:9–13','Madre de Gad y Asher en la casa de Yaakov.');
  add('esav','Esav','itzjak','rivka','Génesis 25:24–26; 36:1–14','Hermano de Yaakov. El Génesis vincula su descendencia con Edom.','','Esaú');
  [['elifaz','Elifaz'],['reuelesav','Reuel'],['yeush','Yeush'],['yalam','Yalam'],['koraj','Kóraj']].forEach(([id,name])=>add(id,name,'esav',null,'Génesis 36:4–5'));
  add('timna','Timná',null,null,'Génesis 36:12');add('amalek','Amalek','elifaz','timna','Génesis 36:12');
  add('yaakov','Yaakov','itzjak','rivka','Génesis 25:24–26; 35:10,22–26','Yaakov recibe el nombre Israel. Sus doce hijos varones constituyen la referencia familiar de las tribus; Diná forma también parte de su genealogía.','','Jacob · Israel');
  [['reuven','Reuvén'],['shimon','Shimón'],['levi','Leví'],['yehuda','Yehudá'],['isajar','Isajar'],['zevulun','Zevulún'],['dina','Diná']].forEach(([id,name])=>add(id,name,'yaakov','lea','Génesis 29:31–35; 30:17–21'));
  [['yosef','Yosef'],['binyamin','Binyamín']].forEach(([id,name])=>add(id,name,'yaakov','rajel','Génesis 30:22–24; 35:16–18'));
  [['dan','Dan'],['naftali','Naftalí']].forEach(([id,name])=>add(id,name,'yaakov','bilha','Génesis 30:3–8'));
  [['gad','Gad'],['asher','Asher']].forEach(([id,name])=>add(id,name,'yaakov','zilpa','Génesis 30:9–13'));
  add('efraim','Efraím','yosef',null,'Génesis 48:1,5');add('menashe','Menashé','yosef',null,'Génesis 48:1,5');
  people.yehuda.story='Hijo de Yaakov y Leá. La línea de Péretz que aparece al final de Rut conduce hasta David.';
  add('tamar','Tamar',null,null,'Rut 4:12','Madre de Péretz, hijo de Yehudá.');
  add('peretz','Péretz','yehuda','tamar','Rut 4:12,18');
  const davidLine=[['jetzron','Jetzrón','Hezrón'],['ram','Ram'],['aminadav','Aminadav'],['najshon','Najshón'],['salmon','Salmón'],['boaz','Boaz'],['obed','Obed'],['ishai','Ishai','Isaí'],['david','David']];
  davidLine.forEach(([id,name,alias],i)=>add(id,name,i?davidLine[i-1][0]:'peretz',id==='obed'?'rut':null,'Rut 4:18–22','', '',alias||''));
  add('rut','Rut',null,null,'Rut 4:13–17','Mujer moabita; con Boaz es madre de Obed, abuelo de David.','La conexión con Moab pertenece al relato de origen del pueblo. No se enumeran todas las generaciones entre Moab y Rut, por lo que aquí no se dibuja una filiación directa entre ambos.');
  people.david.story='Hijo de Ishai. El final de Rut enlaza a David con Boaz y Rut y con la línea de Péretz, hijo de Yehudá y Tamar.';
  people.david.ref='Rut 4:18–22; 1 Crónicas 3:1–16';
  people.david.note='La descendencia familiar y la sucesión en el trono no son lo mismo. Esta vista sigue vínculos de filiación. Los nombres repetidos de 1 Crónicas 3:6–8 se conservan como entradas distintas, con su versículo.';
  add('moab','Moab','lot',null,'Génesis 19:30–38','Hijo de Lot y de su hija mayor; el relato lo vincula con el origen de Moab.');
  add('benami','Ben Amí','lot',null,'Génesis 19:30–38','Hijo de Lot y de su hija menor; el relato lo vincula con el origen de Amón.');
  const mothersDavid=[['ajinoam','Ajinoam'],['avigail','Avigail'],['maacadavid','Maacá'],['jaguit','Jaguit'],['avital','Avital'],['egla','Eglá'],['batshua','Bat Shúa']];
  mothersDavid.forEach(([id,name])=>add(id,name,null,null,'1 Crónicas 3:1–5'));
  people.batshua.alias='Betsabé';people.batshua.story='Crónicas la nombra Bat Shúa, hija de Amiel, y le atribuye cuatro hijos de David: Shimá, Shovav, Natán y Shelomó.';
  people.batshua.note='La forma Bat Sheva o Betsabé aparece en Samuel. Se conserva aquí el nombre de Crónicas con su equivalente habitual en español.';
  [['amnon','Amnón','ajinoam'],['danieldavid','Daniel','avigail'],['avshalom','Avshalom','maacadavid'],['adoniyahu','Adoniyahu','jaguit'],['shefatya','Shefatyá','avital'],['yitream','Yitream','egla']].forEach(([id,name,mother])=>add(id,name,'david',mother,'1 Crónicas 3:1–3'));
  people.danieldavid.note='Este Daniel es un hijo de David. No se identifica aquí con el profeta del mismo nombre.';
  [['shimea','Shimá'],['shovav','Shovav'],['natan','Natán'],['shlomo','Shelomó']].forEach(([id,name])=>add(id,name,'david','batshua','1 Crónicas 3:5'));
  people.shlomo.alias='Salomón';people.shlomo.story='Hijo de David y Bat Shúa. Crónicas continúa desde él la línea que lleva a Rejavam y los posteriores reyes de Judá.';
  people.natan.note='Este Natán es hijo de David y Bat Shúa. No debe confundirse automáticamente con el profeta Natán.';
  [['yivjar','Yivjar','6'],['elishama6','Elishamá','6'],['elifelet6','Elifélet','6'],['nogah','Nógah','7'],['nefeg','Néfeg','7'],['yafia','Yafía','7'],['elishama8','Elishamá','8'],['eliada','Eliadá','8'],['elifelet8','Elifélet','8']].forEach(([id,name,verse])=>add(id,name,'david',null,'1 Crónicas 3:'+verse,'','El nombre se registra tal como aparece en esta lista. La madre no se identifica en este pasaje.','v. '+verse));
  add('tamardavid','Tamar','david',null,'1 Crónicas 3:9','Crónicas la menciona como hermana de los hijos de David.','No es Tamar, madre de Péretz. El parentesco materno no se fija aquí a partir de este versículo.');
  const royal=[['rejavam','Rejavam','Roboam'],['aviya','Aviyá','Abías'],['asa','Asá'],['yehoshafat','Yehoshafat','Josafat'],['yehoram','Yehoram','Joram'],['ajazyahu','Ajazyahu','Ocozías'],['yoash','Yoash','Joás'],['amatzyahu','Amatzyahu','Amasías'],['azarya','Azaryá','Azarías'],['yotam','Yotam','Jotam'],['ajaz','Ajaz','Acaz'],['jizkiyahu','Jizkiyahu','Ezequías'],['menasherey','Menashé','rey de Judá'],['amonrey','Amón'],['yoshiyahu','Yoshiyahu','Josías'],['yehoyakim','Yehoyakim','Joacim'],['yejonya','Yejonyá','Joaquín']];
  royal.forEach(([id,name,alias],i)=>add(id,name,i?royal[i-1][0]:'shlomo',null,'1 Crónicas 3:10–16','', '',alias||''));
  add('yojananjosia','Yojanán','yoshiyahu',null,'1 Crónicas 3:15');add('tzidkiyahu','Tzidkiyahu','yoshiyahu',null,'1 Crónicas 3:15','Hijo de Yoshiyahu nombrado en Crónicas.','','Sedequías');add('shalum','Shalum','yoshiyahu',null,'1 Crónicas 3:15');
  people.yejonya.story='La lista enlaza a Yejonyá, hijo de Yehoyakim, con la descendencia del tiempo del exilio.';
  people.yejonya.note='No se completa el versículo 16 con una filiación adicional no aclarada en esta selección. La continuación utiliza los nombres y relaciones expresos de los versículos 17–19.';
  [['shealtiel','Shealtiel'],['malkiram','Malkiram'],['pedaya','Pedayá'],['shenatzar','Shenatzar'],['yekamya','Yekamyá'],['hoshama','Hoshamá'],['nedavya','Nedavyá']].forEach(([id,name])=>add(id,name,'yejonya',null,'1 Crónicas 3:17–18'));
  add('zerubavel','Zerubavel','pedaya',null,'1 Crónicas 3:19; Ageo 1:1','Crónicas lo coloca entre los hijos de Pedayá. Ageo lo llama hijo de Shealtiel y lo presenta como gobernador de Judá.','Se mantienen ambas referencias. El árbol sigue 1 Crónicas 3:19 para la línea paterna; no dibuja a Pedayá y Shealtiel como si fueran la misma persona ni resuelve la diferencia mediante una adopción supuesta.','Zorobabel');
  people.zerubavel.related=['shealtiel'];
  add('shimi','Shimí','pedaya',null,'1 Crónicas 3:19');
  [['mesulam','Mesulam'],['jananya','Jananyá'],['shelomit','Shelomit']].forEach(([id,name])=>add(id,name,'zerubavel',null,'1 Crónicas 3:19'));
  people.zerubavel.note+=' El versículo 20 añade Jashuvá, Óhel, Berejyá, Jasadya y Yushav Jésed. La adscripción de ese grupo varía entre ediciones; no se fuerza aquí una conexión gráfica única.';
  people.jananya.note='El comienzo de 1 Crónicas 3:21 nombra a Pelatyá y Yeshayá. El resto del versículo tiene lecturas distintas sobre el encadenamiento de las familias; esta vista no rellena esa continuidad.';
  add('pelatya','Pelatyá','jananya',null,'1 Crónicas 3:21');add('yeshayapost','Yeshayá','jananya',null,'1 Crónicas 3:21','Nombre registrado en la rama de Jananyá.','No se identifica con el profeta Isaías por compartir un nombre.');
  const children=id=>Object.values(people).filter(p=>p.father===id||p.mother===id);
  const $=id=>root.querySelector('#'+id);
  const detail=$('r-reading');
  let focus='shlomo',selected='shlomo',expanded=new Set(['rejavam']),showAncestors=false,closedFamilies=new Set(),readOpen=true;
  const button=(text,cls,fn,label)=>{const b=document.createElement('button');b.type='button';b.className=cls+'';b.textContent=text;if(label)b.setAttribute('aria-label',label);b.addEventListener('click',fn);return b;};
  function paternalPath(id){const out=[];const seen=new Set();let p=people[id];while(p&&!seen.has(p.id)){seen.add(p.id);out.unshift(p.id);p=people[p.father];}return out;}
  function grouping(id){const groups=[];children(id).forEach(p=>{const other=p.father===id?p.mother:p.father;let g=groups.find(x=>x.other===other);if(!g){g={other,children:[]};groups.push(g);}g.children.push(p.id);});return groups;}
  function select(id,anchor=null,open=true){
    selected=id;readOpen=open;const p=people[id];
    const location=anchor||root.querySelector('[data-person="'+id+'"]')||root.querySelector('[data-read-person="'+id+'"]');
    if(location&&id!==focus)location.insertAdjacentElement('afterend',detail);else $('r-read-slot').appendChild(detail);
    detail.hidden=!readOpen;
    $('r-source').textContent='Texto bíblico · '+p.ref;
    $('r-detail-name').textContent=p.name+(p.alias?' · '+p.alias:'');
    const parental=[p.father&&people[p.father].name,p.mother&&people[p.mother].name].filter(Boolean);
    $('r-story').textContent=p.story||(parental.length?'El pasaje registra a '+p.name+' como descendiente de '+parental.join(' y ')+'.':'Personaje nombrado en '+p.ref+'.');
    $('r-note-details').hidden=!p.note;$('r-note-details').open=false;$('r-note').textContent=p.note;
    $('r-note-title').textContent=['sara','isca','ketura'].includes(id)?'Texto e interpretación tradicional':'Nota de lectura';
    $('r-actions').replaceChildren();
    const more=button('Saber más sobre '+p.name,'r-study-open',event=>root.genealogy.openStudy?.(id,event?.currentTarget));more.dataset.studyPerson=id;$('r-actions').appendChild(more);
    if(id!==focus)$('r-actions').appendChild(button('Centrar esta rama','',()=>setFocus(id)));
    [p.father,p.mother].filter(Boolean).forEach(par=>$('r-actions').appendChild(button('Ir a '+people[par].name,'',()=>setFocus(par))));
    (p.related||[]).forEach(par=>$('r-actions').appendChild(button('Otra referencia: '+people[par].name,'',()=>select(par))));
    root.querySelectorAll('[data-person]').forEach(el=>el.setAttribute('aria-current',String(el.dataset.person===id)));
    root.querySelectorAll('[data-read-button]').forEach(el=>el.setAttribute('aria-expanded',String(el.dataset.readButton===id&&readOpen)));
    $('r-root-name').setAttribute('aria-expanded',String(id===focus&&readOpen));
    requestAnimationFrame(drawConnections);
  }
  function makeNode(id,depth){
    const p=people[id],kids=children(id),li=document.createElement('li');li.className='r-leaf';
    const node=document.createElement('div');node.className='r-node';node.dataset.person=id;
    const name=button('','r-name',()=>select(id,node),'Leer sobre '+p.name);
    name.dataset.readButton=id;name.setAttribute('aria-controls','r-reading');
    const title=document.createElement('span');title.textContent=p.name;name.appendChild(title);
    if(p.alias){const alias=document.createElement('small');alias.textContent=p.alias;name.appendChild(alias);}
    node.appendChild(name);li.appendChild(node);
    if(kids.length){
      const open=expanded.has(id),toggle=button('','r-expand',()=>{
        select(id);
        if(depth>=2){setFocus(id);return;}
        if(expanded.has(id))expanded.delete(id);else expanded.add(id);
        render(false);requestAnimationFrame(()=>{const q=root.querySelector('[data-expand="'+id+'"]');if(q)q.focus({preventScroll:true});});
      },(depth>=2?'Continuar con ':open?'Plegar descendientes de ':'Desplegar descendientes de ')+p.name);
      toggle.dataset.expand=id;
      if(depth<2)toggle.setAttribute('aria-expanded',String(open));
      const plus=document.createElement('span');plus.className='r-plus';plus.textContent=depth>=2?'›':open?'−':'+';plus.setAttribute('aria-hidden','true');toggle.appendChild(plus);
      node.appendChild(toggle);
      if(open&&depth<2){
        const container=document.createElement('div');container.className='r-child-group';
        grouping(id).forEach(g=>{
          if(g.other){const label=document.createElement('div');label.className='r-child-label';label.dataset.readPerson=g.other;const reader=button('Con '+people[g.other].name,'',()=>select(g.other,label));reader.dataset.readButton=g.other;reader.setAttribute('aria-controls','r-reading');label.appendChild(reader);container.appendChild(label);}
          const ul=document.createElement('ul');ul.className='r-list';g.children.forEach(c=>ul.appendChild(makeNode(c,depth+1)));container.appendChild(ul);
        });
        container.appendChild(button('Centrar '+p.name+' y continuar','r-center',()=>setFocus(id)));li.appendChild(container);
      }
    }
    return li;
  }
  function drawConnections(){
    const target=$('r-groups'),svg=target.querySelector('.r-wires');if(!svg)return;
    svg.replaceChildren();const bounds=target.getBoundingClientRect();if(!bounds.width)return;
    svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
    const mobile=bounds.width<500||target.dataset.many==='true';const ns='http://www.w3.org/2000/svg';
    target.querySelectorAll('.r-family > .r-couple').forEach(label=>{
      const b=label.getBoundingClientRect();let x=b.left-bounds.left+b.width/2,y=b.top-bounds.top;
      const path=document.createElementNS(ns,'path');
      if(mobile){x=b.left-bounds.left;path.setAttribute('d',`M${bounds.width/2},0 V12 H0 V${y+b.height/2} H${x}`);}else{path.setAttribute('d',`M${bounds.width/2},0 V17 H${x} V${y}`);}
      svg.appendChild(path);
      const list=label.parentElement.querySelector('.r-list');
      if(list){
        const lb=list.getBoundingClientRect();const branch=document.createElementNS(ns,'path');
        const sx=b.left-bounds.left+b.width/2,sy=b.bottom-bounds.top,tx=lb.left-bounds.left+8,ty=lb.top-bounds.top+25;
        branch.setAttribute('d',`M${sx},${sy} V${sy+7} H${tx} V${ty}`);svg.appendChild(branch);
      }
    });
  }
  function render(resetSelection=true){
    $('r-read-slot').appendChild(detail);
    const p=people[focus],kids=children(focus),path=paternalPath(focus);
    root.querySelectorAll('[data-start]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.start===focus)));
    $('r-breadcrumbs').replaceChildren();
    const visible=path.slice(-3);
    visible.forEach((id,i)=>{if(i){const sep=document.createElement('span');sep.textContent='›';sep.setAttribute('aria-hidden','true');$('r-breadcrumbs').appendChild(sep);}$('r-breadcrumbs').appendChild(button(people[id].name,'r-text-button',()=>setFocus(id)));});
    $('r-ancestor-toggle').hidden=path.length<2;
    $('r-ancestor-toggle').textContent=(showAncestors?'Ocultar':'Ver')+' '+Math.max(0,path.length-1)+' antepasados';
    $('r-ancestor-toggle').setAttribute('aria-expanded',String(showAncestors));$('r-ancestors').hidden=!showAncestors||path.length<2;
    $('r-ancestry-list').replaceChildren();path.forEach((id,i)=>{const li=document.createElement('li');const b=button('','',()=>setFocus(id));const n=document.createElement('span');n.textContent=String(i+1).padStart(2,'0');b.appendChild(n);b.appendChild(document.createTextNode(people[id].name));li.appendChild(b);$('r-ancestry-list').appendChild(li);});
    $('r-parent-line').replaceChildren();[p.father,p.mother].filter(Boolean).forEach(id=>$('r-parent-line').appendChild(button(people[id].name,'r-parent',()=>setFocus(id),'Subir a '+people[id].name)));
    $('r-root-name').textContent=p.name;$('r-root-small').textContent=p.alias||(kids.length?kids.length+' '+(kids.length===1?'descendiente visible':'descendientes visibles'):'Final de esta rama incluida');
    const target=$('r-groups');target.replaceChildren();
    const groups=grouping(focus);target.dataset.many=String(groups.length>3);target.style.setProperty('--group-count',Math.min(groups.length,3));
    if(groups.length){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('r-wires');svg.setAttribute('aria-hidden','true');target.appendChild(svg);
      groups.forEach(g=>{const family=document.createElement('section');family.className='r-family';const label=document.createElement('div');label.className='r-couple';
        const familyKey=focus+':'+(g.other||'unknown'),isClosed=closedFamilies.has(familyKey);
        if(g.other){const con=document.createElement('span');con.textContent='Con';label.appendChild(con);label.dataset.readPerson=g.other;const reader=button(people[g.other].name,'',()=>select(g.other,label),'Leer sobre '+people[g.other].name);reader.dataset.readButton=g.other;reader.setAttribute('aria-controls','r-reading');label.appendChild(reader);}
        else label.textContent='Otro progenitor no indicado';
        if(groups.length>1){const fold=button((isClosed?'+ ':'− ')+g.children.length,'r-expand',()=>{if(closedFamilies.has(familyKey))closedFamilies.delete(familyKey);else closedFamilies.add(familyKey);selected=focus;readOpen=false;render(false);},(isClosed?'Desplegar':'Plegar')+' rama '+(g.other?people[g.other].name:'sin madre nombrada en este pasaje'));fold.setAttribute('aria-expanded',String(!isClosed));label.appendChild(fold);}
        family.appendChild(label);if(!isClosed){const ul=document.createElement('ul');ul.className='r-list';g.children.forEach(id=>ul.appendChild(makeNode(id,1)));family.appendChild(ul);}target.appendChild(family);});
    }else{const empty=document.createElement('p');empty.className='r-empty';empty.textContent='No se despliegan más generaciones en esta selección. Puedes volver a sus progenitores o abrir su ascendencia.';target.appendChild(empty);}
    $('r-status').textContent='Cada ficha se abre junto al nombre · + despliega · › continúa la rama';
    select(resetSelection?focus:selected,null,readOpen);requestAnimationFrame(drawConnections);
  }
  function setFocus(id){if(!people[id])return;focus=id;selected=id;expanded=new Set();showAncestors=false;closedFamilies=new Set();readOpen=true;
    if(id==='david')grouping(id).filter(g=>g.other!=='batshua').forEach(g=>closedFamilies.add(id+':'+(g.other||'unknown')));
    render();requestAnimationFrame(()=>$('r-root-name').scrollIntoView({block:'nearest',behavior:'auto'}));}
  $('r-root-name').addEventListener('click',()=>select(focus));
  $('r-root-name').setAttribute('aria-controls','r-reading');
  $('r-close').addEventListener('click',()=>{const trigger=root.querySelector('[data-read-button="'+selected+'"]')||$('r-root-name');detail.hidden=true;readOpen=false;root.querySelectorAll('[data-read-button]').forEach(b=>b.setAttribute('aria-expanded','false'));$('r-root-name').setAttribute('aria-expanded','false');trigger.focus({preventScroll:true});requestAnimationFrame(drawConnections);});
  $('r-ancestor-toggle').addEventListener('click',()=>{showAncestors=!showAncestors;render(false);});
  root.querySelectorAll('[data-start]').forEach(b=>b.addEventListener('click',()=>setFocus(b.dataset.start)));
  new ResizeObserver(drawConnections).observe($('r-groups'));
  root.genealogy={people,children,grouping,paternalPath,setFocus,select};
  render();
})();

/* Acceso nativo desde Biblioteca; conserva el reproductor y el estado del estudio. */
(()=>{
 'use strict';
 const screen=document.querySelector('[data-screen="genealogias"]');
 if(!screen)return;
 let returnFocus=null,returnY=0;
 function open(trigger){
  returnFocus=trigger;returnY=window.scrollY;
  route('genealogias');
  document.getElementById('genealogiasTitle').focus({preventScroll:true});
 }
 document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-genealogias-open]');
  if(trigger){event.preventDefault();open(trigger);return;}
  if(event.target.closest('[data-genealogias-back]')){
   route('biblioteca');
   const target=returnFocus?.isConnected?returnFocus:document.getElementById('bibliotecaTitle');
   target?.focus({preventScroll:true});window.scrollTo({top:returnY,behavior:'instant'});
  }
 });
 if(new URLSearchParams(location.search).get('estudio')==='genealogias'){
  const welcome=document.querySelector('#derejWelcome');
  if(welcome?.open)welcome.addEventListener('close',()=>queueMicrotask(()=>open(null)),{once:true});
  else open(null);
 }
})();
