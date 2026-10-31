// Rebuild after editing the curated studies. Never index personal notes or telemetry.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
process.chdir(path.join(__dirname, '..'));
const chunks = [];
const skip = /^(id|ids|url|image|color|class|x|y|he|type|kind|version|schema_version)$/;
function strings(value) {
  if (typeof value === 'string') return /^https?:/.test(value) ? [] : [value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()];
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, item]) => skip.test(key) ? [] : strings(item));
}
function add(title, route, value, extra = {}) {
  const text = [...new Set(strings(value))].join('\n');
  if (text.length < 60) return;
  // Overlap keeps a reference and its explanation together at chunk boundaries.
  for (let start = 0; start < text.length; start += 2500) {
    chunks.push({ id: 'd' + (chunks.length + 1), title, route, ...extra, text: text.slice(start, start + 3100) });
    if (start + 3100 >= text.length) break;
  }
}
function js(file) { const sandbox = { window: {} }; vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { timeout: 1000 }); return Object.values(sandbox.window)[0]; }
for (const [file, route] of [['autoestima-content.js','autoestima'], ['meditacion-content.js','meditacion']]) {
  const data = js(file);
  for (const chapter of data.chapters) add(data.title + ' · ' + chapter.title, route, chapter);
  if (data.sources) add(data.title + ' · Fuentes y límites', route, data.sources);
}
for (const [id, profile] of Object.entries(js('voces-content.js').profiles)) add('Voces del Camino · ' + (profile.name || profile.title || id), 'voces', profile);
for (const [id, profile] of Object.entries(js('genealogias-estudios-content.js').profiles)) add('Genealogías · ' + (profile.name || profile.title || id), 'genealogias', profile);
for (const item of js('arbol-content.js').sefirot) add('Árbol de la Vida · ' + item.name, 'arbol', item);
for (const item of js('nombres-content.js').sessions) add('Nombres y presencia · ' + item.title, 'nombres', item);
const index = JSON.parse(fs.readFileSync('content/tehilim/indice.json'));
const guide = JSON.parse(fs.readFileSync('content/tehilim/guia-150.json'));
for (const psalm of index.psalms) {
  const g = guide.psalms.find(p => p.number === psalm.number);
  add('Tehilim · Salmo ' + psalm.number + ' · ' + psalm.title, 'biblioteca', { ...psalm, guide: g }, { collection: 'tehilim' });
}
const atlas = JSON.parse(fs.readFileSync('content/tehilim/atlas-corporal.json'));
for (const region of atlas.regions) add('Salmos y cuerpo · ' + region.name, 'biblioteca', region, { collection: 'tehilim' });
add('Tehilim · Horarios, método y límites', 'biblioteca', { times: atlas.times, horarios: atlas.horariosCurados, method: atlas.method, editorial: atlas.editorialPolicy, medical: atlas.medical, sources: atlas.traditionalSources }, { collection: 'tehilim' });
const camino = JSON.parse(fs.readFileSync('content/caminos-ramak-v25.json'));
for (const week of camino.parashot) for (const day of week.caminos) add('Camino diario · ' + week.parasha + ' · Día ' + day.dia, 'camino', { ref: week.ref, note: week.nota_ramak, ...day });
fs.mkdirSync('api/_lib', { recursive: true });
fs.writeFileSync('api/_lib/knowledge.json', JSON.stringify({ version: 1, chunks }));
console.log('Indexed', chunks.length, 'curated passages.');
