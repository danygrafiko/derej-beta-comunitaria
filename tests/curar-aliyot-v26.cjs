// Herramienta editorial: ejecuta una sola transformación reproducible y conserva
// las jornadas alineadas. Las frases nuevas se encuentran en el manifiesto.
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const snapshot=path.resolve(process.argv[2]||'../auditoria-aliya');
const dataPath=path.join(root,'content/caminos-ramak-v25.json');
const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
const calendar=JSON.parse(fs.readFileSync(path.join(snapshot,'hebcal-aliyot.json'),'utf8'));
const books={Bereshit:JSON.parse(fs.readFileSync(path.join(snapshot,'genesis.json'),'utf8')),Shemot:JSON.parse(fs.readFileSync(path.join(snapshot,'exodus.json'),'utf8'))};
const days=require('../content/curaduria-aliyot-v26.cjs');
const sources={
 rambam:{fuente:'Mishné Torá · Hiljot Deot 1:6',url:'https://www.sefaria.org/Mishneh_Torah%2C_Human_Dispositions.1.6',base:'Rambam presenta la misericordia y otras cualidades como orientaciones para la conducta humana.'},
 ramak:{fuente:'Tomer Devorah 1:1',url:'https://www.sefaria.org/Tomer_Devorah.1.1',base:'Ramak sitúa la semejanza con el Creador en los actos y desarrolla cualidades de misericordia.'},
 ramjal:{fuente:'Mesilat Yesharim 3',url:'https://www.sefaria.org/Mesillat_Yesharim.3',base:'Ramjal invita a examinar las acciones, antes de realizarlas y al revisar lo que ya hicimos.'},
 rabiNajman:{fuente:'Likutei Moharan II:25:1',url:'https://www.sefaria.org/Likutei_Moharan%2C_Part_II.25.1',base:'Rabí Najman describe la conversación personal con el Creador en la lengua habitual de quien habla.'}
};
const sefirot=['Chesed','Gevurah','Tiferet','Netzach','Hod','Yesod','Malchut'];
const colors=['#E8EAED','#B85C38','#D4AF37','#7A9B69','#D9A441','#8C75A8','#35543D'];
for(const [parasha,day,verse,title,es,context,question,action,...applications] of days){
 const p=data.parashot.find(x=>x.parasha===parasha);
 if(!p)throw Error('Parashá no encontrada: '+parasha);
 let c=p.caminos.find(x=>x.dia===day);
 if(!c){c={dia:day,sefira:sefirot[day-1],ramak_color:{hex:colors[day-1]}};p.caminos.push(c);}
 const book=p.ref.split(' ')[0];
 const [chapter,v]=verse.split(':').map(Number);
 const hebrew=books[book]?.he?.[chapter-1]?.[v-1];
 if(!hebrew)throw Error('Versículo no encontrado: '+book+' '+verse);
 c.titulo=title;
 c.pasuk={hebreo:hebrew.replace(/&(?:nbsp|thinsp|ensp|emsp);/gi,' ').replace(/&#(?:x([0-9a-f]+)|(\d+));/gi,(_,hex,dec)=>String.fromCodePoint(parseInt(hex||dec,hex?16:10))).replace(/<[^>]*>/g,'').replace(/[\u0591-\u05af]/g,''),trans:'',ref:book+' '+verse,es,es_tipo:'PARÁFRASIS DÉREJ',fuente_url:'https://www.sefaria.org/'+(book==='Bereshit'?'Genesis':'Exodus')+'.'+verse.replace(':','.')};
 c.rootNote=context+' El texto español es una paráfrasis de Dérej. Las cuatro voces ofrecen marcos de lectura; sus aplicaciones a esta escena son nuestras y no comentarios directos de los maestros a este versículo.';
 c.reflexion=question;
 c.paraLlevar={avoda:action,kavana:applications[0],hitbodedut:applications[3]+' Puedes hacerlo en tus propias palabras; la participación es libre.'};
 c.voces=Object.fromEntries(Object.entries(sources).map(([k,s],i)=>[k,{...s,tipo:'LECTURA DÉREJ',texto:applications[i],atribucion:'El marco resume la fuente indicada. La aplicación es elaboración propia de Dérej; no es una cita ni una exégesis atribuida al maestro.'}]));
 c.revision_editorial='v2.6 · aliyá, contexto y aplicación propia · 2026-10-20';
}
const scheduled=calendar.items.filter(x=>x.category==='parashat'&&x.date>='2026-10-10').slice(0,20);
const references={criterio:'División anual completa; numeración hebrea. No es el ciclo trienal.',fuente:'https://www.hebcal.com/hebcal?v=1&cfg=json&year=5787&yt=H&s=on&leyning=on',consultado:'2026-10-20',parashot:[]};
for(let i=0;i<data.parashot.length;i++){
 const p=data.parashot[i],event=scheduled[i];
 if(!event||event.leyning.torah.split(';')[0].trim().replace('Genesis','Bereshit').replace('Exodus','Shemot')!==p.ref)throw Error('Secuencia de parashot inesperada: '+p.parasha);
 p.caminos.sort((a,b)=>a.dia-b.dia);
 const aliyot={};
 for(let day=1;day<=7;day++){
  const ref=event.leyning[day].replace('Genesis','Bereshit').replace('Exodus','Shemot');
  aliyot[day]=ref;
  const c=p.caminos.find(x=>x.dia===day);if(!c)throw Error('Día ausente: '+p.parasha+' '+day);
  c.aliya=day;c.aliyaRange=ref;
 }
 references.parashot.push({parasha:p.parasha,fecha_shabat:event.date,fuente:event.link,aliyot});
}
// Aclarar una lectura interpretativa del primer día sin alterar el texto original.
const first=data.parashot.find(p=>p.parasha==='Lej Lejá').caminos[0];
first.pasuk.es='Vete de tu tierra, de tu lugar de nacimiento y de la casa de tu padre, hacia la tierra que te mostraré.';
first.rootNote='Génesis 12:1 es la base textual. «Vete hacia ti» es una lectura interpretativa, no la traducción literal completa. La aplicación de las fuentes al camino personal es editorial de Dérej.';
data.total_caminos=data.parashot.reduce((n,p)=>n+p.caminos.length,0);
data.revision_editorial='DÉREJ v2.6 · secuencia anual de aliyot y curaduría contextual';
data.nota_fuentes='Las etiquetas distinguen paráfrasis de fuente y aplicaciones propias. En las jornadas v2.6, «Marco de la fuente» resume el pasaje identificado y «Aplicación Dérej» expresa nuestra lectura de la escena; no atribuimos a los maestros comentarios directos que no hayamos localizado. Las prácticas son propuestas libres de Dérej.';
data.auditoria={fecha:'2026-10-20',total_parashot:data.parashot.length,total_caminos:data.total_caminos,lej_leja_estado:'COMPLETO · 7/7',jornadas_reelaboradas:days.length,desalineaciones_de_versiculo_corregidas:50,criterio:'Versículo central dentro de la aliyá anual correspondiente. Las referencias interpretativas pueden ir a otros textos si se explicita su aplicación.',alcance:'Correspondencia y contexto revisados; se conservan las fuentes de las jornadas previamente alineadas. No se declara cotejo crítico de todas sus ediciones ni traducciones.'};
fs.writeFileSync(dataPath,JSON.stringify(data,null,2)+'\n');
fs.writeFileSync(path.join(root,'content/aliyot-anuales-v26.json'),JSON.stringify(references,null,2)+'\n');
console.log('Curaduría aplicada:',days.length,'jornadas reelaboradas;',data.total_caminos,'jornadas en total.');
