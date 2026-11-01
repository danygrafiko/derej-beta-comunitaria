'use strict';
// Explicit editorial boundaries apply independently of the model's obedience.
function boundary(question) {
  const q=question.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  if (/(inventa|fabrica|falsea)[\s\S]{0,90}(cita|versiculo|fuente)/.test(q) && /(autentic|atribu|presenta|real)/.test(q)) return {answer:'No puedo inventar una cita ni atribuírsela a un sabio como si fuera auténtica. Podemos buscar una enseñanza documentada y distinguirla de una reflexión original de Dérej.',reflection:'¿Qué enseñanza o tema te gustaría revisar en sus fuentes?',sources:[],grounded:false};
  if (/\b(cur[ae]|curar|san[ae]|sanar|tratamiento|diagnostico)\b/.test(q) && /salmo|tehilim|sefiro|meditacion/.test(q) && /dolor|enfermedad|rodilla|cancer|sintoma|cura/.test(q)) return {answer:'No puedo indicar un Salmo como tratamiento ni prometer una curación. En Dérej, las correspondencias entre el cuerpo y los Salmos se estudian como acompañamiento espiritual y reflexión editorial. Puedo ayudarte a revisar esas relaciones, sus pasajes y sus límites.',reflection:'¿Quieres explorar el significado simbólico de esa correspondencia?',sources:[],grounded:false};
  return null;
}
module.exports={boundary};
