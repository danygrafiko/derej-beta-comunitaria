const {test}=require('node:test');
const assert=require('node:assert/strict');
const cal=require('../moed-calendar.js');
const event=(year,id,region)=>cal.events(year,region).find(e=>e.id===id);
test('Fechas contrastadas con calendarios Chabad en español 2026 y 2027',()=>{
  for(const [year,id,start,end] of [
    [2026,'pesaj','2026-04-01','2026-04-09'],[2026,'shavuot','2026-05-21','2026-05-23'],
    [2026,'rosh-hashana','2026-09-11','2026-09-13'],[2026,'iom-kipur','2026-09-20','2026-09-21'],
    [2026,'sucot','2026-09-25','2026-10-02'],[2026,'januca','2026-12-04','2026-12-12'],
    [2026,'purim','2026-03-02','2026-03-03'],[2027,'purim','2027-03-22','2027-03-23'],
    [2027,'pesaj','2027-04-21','2027-04-29'],[2027,'shavuot','2027-06-10','2027-06-12'],
    [2027,'iom-kipur','2027-10-10','2027-10-11'],[2027,'januca','2027-12-24','2028-01-01']
  ]){const e=event(year,id);assert.equal(e?.start,start,id);assert.equal(e?.end,end,id);}
});
test('Israel acorta Pesaj y Shavuot y une Sheminí Atzéret y Simjat Torá',()=>{
  assert.equal(event(2027,'pesaj','israel').end,'2027-04-28');
  assert.equal(event(2027,'shavuot','israel').end,'2027-06-11');
  assert.equal(event(2027,'sucot','israel').end,event(2027,'sucot').end);
  assert.match(event(2027,'shemini-atzeret','israel').title,/Simjat Torá/);
  assert.equal(event(2027,'simjat-tora','israel'),undefined);
});
test('Purim en Adar II del año bisiesto, no en Adar I',()=>{
  assert.equal(cal.events(2027).filter(e=>e.id==='purim').length,1);
  assert.match(event(2027,'purim').hebrew,/Adar II/);
});
test('Rosh Jodesh une días 30 y 1, incluye Jeshván y excluye Tishrei',()=>{
  const months=cal.events(2026).filter(e=>e.gate==='rosh-jodesh');
  const h=months.find(e=>e.title==='Rosh Jodesh · Jeshván');
  assert.equal(h?.start,'2026-10-10');assert.equal(h?.end,'2026-10-12');
  assert.equal(months.some(e=>e.title.includes('Tishrei')),false);
  assert.equal(new Set(months.map(e=>e.title)).size,months.length);
  assert.ok(months.some(e=>e.start==='2026-03-18'&&e.end==='2026-03-19'));
});
test('Estados no anuncian el inicio antes del atardecer ni el término antes del anochecer',()=>{
  const e=event(2026,'januca');
  assert.equal(cal.state(e,'2026-12-03'),'Por venir');
  assert.equal(cal.state(e,'2026-12-04'),'Comienza hoy al atardecer');
  assert.equal(cal.state(e,'2026-12-05'),'En curso');
  assert.equal(cal.state(e,'2026-12-12'),'Termina hoy al anochecer');
  assert.equal(cal.state(e,'2026-12-13'),'Finalizada');
});
test('Selección de año y región actualiza el calendario y separa Janucá/Purim',()=>{
  cal.update('year','2027');cal.update('region','israel');
  assert.match(cal.detail('pesaj'),/2027-04-28/);assert.doesNotMatch(cal.detail('pesaj'),/2027-04-29/);
  assert.match(cal.detail('januca-purim'),/Janucá/);assert.match(cal.detail('januca-purim'),/Purim/);
  assert.match(cal.annual(),/location\/israel\/year\/2027/);
  for(let y=2024;y<=2034;y++){
    const all=cal.events(y);assert.equal(all.filter(e=>e.id==='purim').length,1);
    assert.equal(all.filter(e=>e.gate==='rosh-jodesh').length>=11,true);
    assert.ok(all.every(e=>e.start.startsWith(String(y))&&e.end>e.start));
  }
});
