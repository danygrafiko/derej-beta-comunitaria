const {JSDOM}=require('jsdom'),fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const root=path.join(__dirname,'..');
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://derej.example/',runScripts:'outside-only'}),w=dom.window;
w.HTMLElement.prototype.scrollIntoView=function(){};
vm.runInContext(fs.readFileSync(path.join(root,'primeros-pasos.js'),'utf8'),dom.getInternalVMContext());
const doc=w.document,click=s=>doc.querySelector(s).click(),key='derej.primeros-pasos.v1';
assert.equal(doc.querySelectorAll('#firstStepsChoices button').length,7);
for(let i=0;i<7;i++){
 click('#firstStepsChoices [data-first-day="'+i+'"]');
 assert.equal(doc.querySelectorAll('#firstStepsReading section').length,5);
 assert(doc.querySelector('.firstReference').textContent);
 assert(doc.querySelector('.firstPractice p').textContent);
 assert(!doc.querySelector('.derejEditorialReference').open);
}
click('#firstStepsChoices [data-first-day="0"]');
const note='<img src=x onerror=alert(1)> Una reflexión';
doc.querySelector('#firstNote').value=note;doc.querySelector('#firstNote').dispatchEvent(new w.Event('input',{bubbles:true}));
click('#firstStepsChoices [data-first-day="1"]');click('#firstStepsChoices [data-first-day="0"]');
assert.equal(doc.querySelector('#firstNote').value,note);
assert.equal(JSON.parse(w.localStorage.getItem(key)).notes[0],undefined,'El borrador no se persiste sin guardado explícito');
click('[data-first-save]');assert.equal(JSON.parse(w.localStorage.getItem(key)).notes[0],note);
click('#firstStepsChoices [data-first-day="1"]');click('#firstStepsChoices [data-first-day="0"]');
assert(!doc.querySelector('#firstStepsReading img'));assert.equal(doc.querySelector('#firstNote').value,note);
click('[data-first-delete]');assert.equal(JSON.parse(w.localStorage.getItem(key)).notes[0],undefined);
assert.equal(doc.querySelector('#firstNote').value,'');
console.log('PASS: siete encuentros, cinco etapas, referencias cerradas, borradores en memoria, guardado explícito y borrado local.');w.close();
