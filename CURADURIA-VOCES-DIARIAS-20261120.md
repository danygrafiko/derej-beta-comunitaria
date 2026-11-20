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
- Tras revisar Vayetzé y Vayishlaj, **191 enlaces a Sefaria** permanecen en las voces de otras parashot. El equipo debe reemplazarlos con fuentes manualmente verificadas, de preferencia en español, o convertirlos en referencias bibliográficas sin enlace. No reemplazar enlaces automáticamente sin verificar destino, pasaje e idioma.
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
- **Vayishlaj ya completada en la segunda fase**: se reescribieron sus 28 voces y se eliminaron las 23 intervenciones breves.
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

## Segunda fase completada: Vayishlaj (20 de noviembre de 2026)
- Curadas las **28 voces** de Vayishlaj (7 días × 4 maestros), manteniendo el texto bíblico, las reflexiones y las prácticas originales.
- Resultado acumulado de esta rama: **56 voces curadas** entre Vayetzé y Vayishlaj, sobre 561 intervenciones del corpus.
- **Rambam:** 6 fuentes diferentes esta semana; aplicación contextual de la negociación, la responsabilidad, la dignidad y el deber de acompañar el duelo.
- **Ramak:** 4 referencias distintas, con atención a las cualidades de misericordia y humildad; evita conectar automáticamente cada versículo a una sefirá.
- **Ramjal:** 4 capítulos, distinguiendo el examen, las consecuencias, la benevolencia y la cautela ética.
- **Rabí Najman:** 3 pasajes, diferenciando hitbodedut, descubrimiento del bien y perseverancia.
- **Diná, día 5:** no culpar a la persona agredida, no inventar su experiencia, no exigir perdón o un significado espiritual del daño. 
- **Rajel, día 6:** respetar el duelo sin explicaciones forzadas ni mandato de optimismo.
- **Edom, día 7:** no reducir pueblos o genealogías a etiquetas simples ni fabricar conclusiones acerca de personas cuya vida no conocemos.
- Ya no quedan intervenciones telegráficas en esta parashá; los textos tienen entre **291 y 362 caracteres** y cada voz separa fundamento del autor y aplicación de Dérej.
- Se retiraron los enlaces no curados de las tarjetas diarias de Vayishlaj, sin tocar los enlaces de versículos bíblicos ni alterar sus referencias.
- **Estado del resto del corpus:** otras 505 intervenciones; **240** siguen con menos de 130 caracteres; **191** enlaces a Sefaria permanecen en voces de otras parashot; **126** tarjetas de Ramak todavía usan `Tomer Devorah 1:1`.
- Prueba nueva: `tests/voces-vayishlaj-editorial.test.cjs`, preparada para ejecución en CI o local.

### Cotejo de fuentes para esta fase
La redacción de referencia se apoyó en lecturas en línea de los textos: `Mishné Torá`, Melajim uMiljamot 6:1 y 10:12; Avel 14:1; Matnot Aniyim 10:7; Deot 2:3 y 6:3. `Tomer Devorah` 1 (apertura) y 2:2–4. `Mesilat Yesharim` 3, 11, 19 y 20. `Likutei Moharan` I:282, II:25 y II:48. El cotejo puntual **no reemplaza una revisión filológica integral** de todas las ediciones y traducciones. Mantener las referencias como ficha bibliográfica hasta comprobar versiones en español adecuadas.

### Próximas parashot prioritarias
1. **Vayeshev:** 21/28 tarjetas demasiado breves.
2. **Miketz:** 23/28 tarjetas demasiado breves.
3. **Vayigash:** 23/28 tarjetas demasiado breves.
4. **Vayechi:** 17/28 tarjetas demasiado breves.
5. **Jaye Sara, Toldot, Bereshit y Noaj:** terminar homogenización de fuentes y corrección de frases genéricas.

**Publicación:** esta fase sigue dentro de un pull request **borrador**. Falta revisión de las editoras y validación de la interfaz antes de integrar.
