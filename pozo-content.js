/* DÉREJ · El Pozo · unidad 01. Texto editorial propio; referencias al final. */
window.DEREJ_POZO_CONTENT={
 version:1,title:'Agua y luz',subtitle:'Del signo a la palabra',
 letters:[
  {id:'alef',glyph:'א',name:'Álef',hebrewName:'אָלֶף',value:1,sound:'No aporta una vocal fija. Su lectura depende de la vocalización y del contexto.',look:'Dos trazos pequeños unidos por una diagonal.',word:'or',note:'En אוֹר, la vocal o se lee con ayuda del punto junto a la vav.'},
  {id:'vav',glyph:'ו',name:'Vav',hebrewName:'וָו',value:6,sound:'Como consonante, v. Con ciertos signos puede representar las vocales o y u.',look:'Un trazo vertical largo con una pequeña cabeza.',word:'or',note:'En אוֹר, וֹ ayuda a representar el sonido o. No se pronuncia una v aparte.'},
  {id:'resh',glyph:'ר',name:'Resh',hebrewName:'רֵישׁ',value:200,sound:'Corresponde a r. Su pronunciación varía entre tradiciones de lectura.',look:'La parte superior gira hacia abajo en una esquina suave.',word:'or',note:'Observa la diferencia con ד, dálet: la esquina superior no tiene el mismo saliente.'},
  {id:'mem',glyph:'מ',name:'Mem',hebrewName:'מֵם',value:40,sound:'M, como la consonante inicial de mano.',look:'Su forma habitual deja una abertura en la parte inferior.',word:'mayim',note:'La misma letra cambia de forma al final de una palabra: מ → ם.'},
  {id:'yod',glyph:'י',name:'Yod',hebrewName:'יוֹד',value:10,sound:'Puede representar una consonante semejante a y; también participa en la escritura de vocales.',look:'Un trazo pequeño y elevado. Es más corto que ו.',word:'mayim',note:'En מַיִם, acompaña la secuencia que leemos aproximadamente máyim.'},
  {id:'dalet',glyph:'ד',name:'Dálet',hebrewName:'דָּלֶת',value:4,sound:'D, como en día, en la pronunciación introductoria utilizada aquí.',look:'Un techo con un pequeño saliente en la esquina superior derecha.',note:'Compárala con ר, resh. Mirar esa esquina ayuda a distinguirlas.'},
  {id:'mem-final',glyph:'ם',name:'Mem final',hebrewName:'מֵם סוֹפִית',value:40,sound:'Conserva el sonido m de mem.',look:'Su forma final se cierra.',word:'mayim',note:'No es una letra nueva del alfabeto: es la forma de mem al final de palabra.'}
 ],
 words:[
  {id:'mayim',vocalized:'מַיִם',bare:'מים',latin:'Máyim',meaning:'Agua · aguas',letters:['מ','י','ם'],audio:'מַיִם',
   vowelNote:'El pequeño trazo bajo מ se llama pataj. En esta palabra aporta a; el punto bajo י se llama jirik y aporta i. La transliteración es una ayuda aproximada.',
   grammar:'מ y ם son la misma letra, mem; ם es la forma final. El vocablo מַיִם tiene forma plural y se usa para agua o aguas según el contexto.',
   passage:['יְהִי','רָקִיעַ','בְּתוֹךְ','הַמָּיִם'],target:3,ref:'Génesis 1:6',source:'genesis-1-6',
   translation:'Que haya un firmamento en medio de las aguas.',context:'En הַמָּיִם se añade הַ, el artículo definido: aquí, las aguas. La palabra aprendida permanece dentro de una forma más larga.',symbol:'En este recorrido de Dérej, el agua nos invita a observar lo que contiene, sostiene y permite vivir. Es una reflexión editorial, no la traducción de las letras.'},
  {id:'or',vocalized:'אוֹר',bare:'אור',latin:'Or',meaning:'Luz',letters:['א','ו','ר'],audio:'אוֹר',
   vowelNote:'El punto de וֹ se llama jolam y aquí representa o. Los signos de vocalización ayudan a leer; no forman parte de las 22 letras del alfabeto.',
   grammar:'Álef, vav y resh forman la escritura אור. En esta palabra la vav acompaña la vocal o.',
   passage:['וַיֹּאמֶר','אֱלֹהִים','יְהִי','אוֹר','וַיְהִי','אוֹר'],target:3,alsoTarget:5,ref:'Génesis 1:3',source:'genesis-1-3',
   translation:'Dijo Dios: «Que haya luz», y hubo luz.',context:'אוֹר aparece dos veces en este pasaje: en la invitación y en lo que sucede después. Cualquiera de las dos apariciones responde al ejercicio.',symbol:'El encuentro OR de Dérej propone mirar qué necesita recibir luz en nuestra vida. Esta aplicación personal se distingue del significado lingüístico: luz.'}
 ],
 sages:[
  {id:'rambam',name:'Rambam',full:'Rabí Moshé ben Maimón',work:'Mishné Torá',context:'También conocido como Maimónides. Sus enseñanzas acompañan las cuatro voces de los Caminos de Dérej.',source:'rambam'},
  {id:'ramak',name:'Ramak',full:'Rabí Moshé Cordovero',work:'Tomer Devorah',context:'Maestro de Tzfat. Dérej toma sus enseñanzas como una de las voces para estudiar y reflexionar.',source:'ramak'},
  {id:'ramjal',name:'Ramjal',full:'Rabí Moshé Jaim Luzzatto',work:'Mesilat Yesharim',context:'Su nombre también se translitera Ramchal. Es otra de las cuatro voces presentes en nuestros Caminos.',source:'ramjal'},
  {id:'najman',name:'Rabí Najmán',full:'Rabí Najmán de Breslov',work:'Likutei Moharán',context:'En Dérej, sus enseñanzas abren preguntas y momentos de conversación personal con Dios.',source:'najman'}
 ],
 noaj:[
  {q:'¿Qué debía construir Nóaj?',a:['Un arca','Una torre','Un palacio','Una ciudad'],why:'La instrucción de construir el arca aparece en el encuentro TEVA de Dérej.',ref:'Génesis 6:14',source:'genesis-6-14'},
  {q:'¿Qué ave llevaba una hoja de olivo al regresar?',a:['La paloma','El cuervo','El águila','El gorrión'],why:'La hoja de olivo permite reconocer que las aguas han descendido.',ref:'Génesis 8:11',source:'genesis-8-11'},
  {q:'¿Qué señal se menciona para el pacto después del diluvio?',a:['El arco en las nubes','Una lámpara','Una columna de piedra','Una estrella'],why:'El arco en las nubes se presenta como señal del pacto con los seres vivientes.',ref:'Génesis 9:12–17',source:'genesis-9-12'},
  {q:'¿Qué hace pasar Dios sobre la tierra cuando las aguas comienzan a disminuir?',a:['Un viento','Una nevada','Una columna de fuego','Una nube de polvo'],why:'El relato menciona un viento sobre la tierra. El texto y su lectura sostienen la reflexión de Dérej.',ref:'Génesis 8:1',source:'genesis-8-1'}
 ],
 sources:[
  {id:'alfabeto',label:'Las letras de nuestra unidad · formas, nombres y sonidos'},
  {id:'genesis-1-3',label:'Génesis 1:3 · OR · la luz'},
  {id:'genesis-1-6',label:'Génesis 1:6 · RAKIA · las aguas'},
  {id:'lectura',label:'Cómo leer · vocalización y escritura'},
  {id:'rambam',label:'Rambam · nombre y obra'},
  {id:'ramak',label:'Ramak · nombre y obra'},
  {id:'ramjal',label:'Ramjal · nombre y obra'},
  {id:'najman',label:'Rabí Najmán · nombre y obra'},
  {id:'genesis-6-14',label:'Nóaj · el arca que protege'},
  {id:'genesis-8-11',label:'Nóaj · la hoja de olivo'},
  {id:'genesis-9-12',label:'Nóaj · el pacto del arco'},
  {id:'genesis-8-1',label:'Nóaj · el viento y las aguas'}
 ]
};
