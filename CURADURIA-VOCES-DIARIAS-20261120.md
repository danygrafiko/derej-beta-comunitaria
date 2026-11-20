# Dérej — Curaduría editorial de las voces diarias
**Auditoría:** 20 de noviembre de 2026  
**Base revisada:** `content/caminos-ramak-v25.json` (20 parashot, 140 días)  
**Alcance de esta propuesta:** revisión completa de las 28 intervenciones de Vayetzé (7 días × 4 voces); las restantes requieren una segunda ronda editorial.

## Diagnóstico del conjunto original
- 561 intervenciones: 140 de Rambam, 140 de Ramak, 140 de Ramjal, 140 de Rabí Najman y una de Baal Shem Tov.
- Sin duplicados textuales exactos entre las intervenciones, pero con **fundamentos y encuadres repetitivos**.
- En la versión previa a esta propuesta, Ramak remitía a `Tomer Devorah 1:1` en **140/140 días**.
- Una misma fuente se repetía **56 veces** para Rambam (`Hiljot Deot 1:6`) y **56 veces** para Ramjal (`Mesilat Yesharim 3`).
- **86** tarjetas de Rabí Najman compartían la misma explicación base sobre la conversación personal con el Creador.
- **211 enlaces a Sefaria** permanecen en otras parashot después de revisar Vayetzé. El equipo debe reemplazarlos con fuentes manualmente verificadas, de preferencia en español, o convertirlos en referencias bibliográficas sin enlace. No reemplazar enlaces automáticamente sin verificar destino, pasaje e idioma.
- La colección independiente `voces-content.js` contiene nueve perfiles, pero las tarjetas de los días usan cuatro autores fijos (salvo una excepción). La biblioteca de perfiles y el comentario diario son dos funcionalidades distintas.

## Qué cambia en Vayetzé
- Cada una de las **28 tarjetas** explica una enseñanza identificable del autor y luego la conecta, como **lectura editorial de Dérej**, con la escena del día.
- Se sustituye el consejo telegráfico por una lectura de varias frases, en español claro, sin añadir nuevas preguntas.
- **Rambam:** decisiones éticas, vínculos, verdad y deberes concretos.
- **Ramak:** misericordia, humildad, atención al otro y Maljut, sin hacer pasar asociaciones cabalísticas por comentario directo al versículo.
- **Ramjal:** examen de la conducta, sentido, honestidad en el trato e intención.
- **Rabí Najman:** reconocer el bien, perseverancia y diálogo personal honesto (hitbodedut).
- Se diversifican los pasajes de referencia con especial cautela: `Tomer Devorah` capítulos 1, 2 y 9, `Mesilat Yesharim` capítulos 1, 3, 11 y 19, `Likutei Moharan` I:282 y II:25/48, y pasajes diferenciados de Rambam.
- Todas las conexiones entre un texto del sabio y la escena bíblica se identifican como **interpretaciones de Dérej**, no como citas ni comentarios directos.
- Se eliminan de las 28 tarjetas de Vayetzé los enlaces a Sefaria, sin introducir direcciones no verificadas.

## Norma de edición para todas las parashot
1. **Fidelidad:** comprobar el autor, obra y pasaje antes de escribir; no inventar citas, intenciones, personajes ni relación con una aliyá.
2. **Dos planos separados:** sintetizar primero qué enseña la fuente; explicar después qué lectura o aplicación propone Dérej para la escena. No confundirlas.
3. **Voz reconocible:** cada maestro debe aportar una perspectiva propia. Cuatro consejos genéricos no equivalen a cuatro enseñanzas.
4. **Claridad sin banalizar:** 2–4 frases sustantivas; términos hebreos con explicación mínima; evitar imperativos genéricos y preguntas acumuladas.
5. **Diversidad responsable:** no rotar referencias por decoración. Cuando una fuente se repite, debe existir una razón contextual; cuando no hay conexión sólida, reducir o sustituir la voz.
6. **Respeto humano:** no moralizar el sufrimiento, la infertilidad, el duelo o la pobreza; no atribuir falta de mérito a quien espera o padece.
7. **Fuentes:** preferir materiales acreditables en español. Identificar fuente principal, edición y alcance; si solo hay edición hebrea/inglesa, ofrecer síntesis en español con señalización clara.
8. **Práctica sin exceso:** no agregar una pregunta por maestro. La invitación práctica diaria es suficiente en la experiencia de Camino.
9. **Curaduría acumulativa:** evitar repetir la misma `base` o el mismo pasaje siete días sin explicar qué faceta nueva se está estudiando.

## Orden sugerido de continuación
- **Siguiente: Vayishlaj**, por su cercanía con la secuencia de la semana y sus 23/28 intervenciones inferiores a 130 caracteres en la revisión inicial.
- **Después: Vayeshev, Miketz y Vayigash** (21, 23 y 23 textos breves, respectivamente).
- **Luego: Bereshit, Noaj, Jayé Sara y Toldot**, donde también abundan las intervenciones telegráficas.
- Finalmente, curaduría transversal de las restantes parashot, diversidad de fuentes de Ramak y enlaces de procedencia.

## Comprobaciones antes de publicar
- Los siete días de Vayetzé contienen cuatro voces completas.
- Cada una incluye `fuente`, `base`, `texto` y una advertencia de atribución.
- Las 28 lecturas son sustantivas, no frases genéricas, y no se repiten literalmente.
- Se verifica en móvil que `Consultar el marco de la fuente` no parezca una cita literal.
- Verificación filológica final por los editores antes de integrar la rama de revisión.

**Estado:** revisión editorial propuesta en una rama GitHub; **no está integrada ni publicada**.
