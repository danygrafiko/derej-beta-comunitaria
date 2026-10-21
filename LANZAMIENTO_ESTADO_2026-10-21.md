# Dérej · Preparación del lanzamiento · Parte 1
Fecha: 21 de octubre de 2026.

## Implementado
- Lej Lejá: 28 aplicaciones desarrolladas, con marco de fuente y aplicación editorial separados en sus siete jornadas. Se conservan sus siete Midrash propios.
- Vayerá: siete lecturas tradicionales diferentes, catorce preguntas y 28 aplicaciones desarrolladas. Contexto explícito en los siete días; se conservan las referencias específicas de las jornadas.
- Los rótulos distinguen comentario de Rashí, agadá y enseñanza talmúdica. No se presentan todos los géneros como Midrash.
- Corrección de Caín (Génesis 4:9): primero responde que no sabe dónde está su hermano y luego pregunta si es su guardián.
- Sustitución de la pregunta heredada de Bereshit 2 por una práctica de cuidado del jardín y los espacios compartidos.
- Tetzavé 5: selección hebrea continua de Éxodo 29:20, con Aharón y sus hijos; omisiones explicadas y paráfrasis española diferenciada.
- La clasificación del español se muestra junto al versículo cuando el dato declara su tipo.
- Eliminada la repetición de «tus propias palabras» en Lej Lejá 2.

## Lecturas de Vayerá
| Día | Lectura | Fuente |
|---|---|---|
| 1 | Ver también es comprender | Rashí sobre Génesis 18:2 |
| 2 | Cuando ayudar se vuelve una falta | Sanhedrín 109b; Rashí sobre Génesis 18:21 |
| 3 | La vida antes que lo que poseemos | Rashí sobre Génesis 19:16; Génesis Rabá 50:11 |
| 4 | Volver a estar presente por la mañana | Berajot 26b |
| 5 | Escuchar a quien está aquí, ahora | Rashí sobre Génesis 21:17; Rosh Hashaná 16b; Génesis Rabá 53:14 |
| 6 | Dejar testimonio de un acuerdo | Rashí sobre Génesis 21:30 |
| 7 | Escuchar la orden de detenerse | Rashí sobre Génesis 22:12 |

Las adaptaciones son textos propios en español, no reproducciones de traducciones modernas. La conexión con la práctica cotidiana se identifica como elaboración de Dérej. Las lecturas permanecen en Raíz; las preguntas, en Profundizar. No se incorporan nuevas dependencias ni enlaces externos de lectura.

## Alcance de la revisión
Las comprobaciones automáticas recorren 140 jornadas y verifican rango de aliyá, presencia de cuatro voces, selección de lecturas y separación de preguntas. La cobertura de lecturas tradicionales pasa de 10 a 17; hay 123 jornadas sin un complemento diario específico de esta colección. Estos conteos no certifican calidad ni equivalen a un porcentaje de finalización editorial.

La separación de marcos y aplicaciones en Lej Lejá y Vayerá no sustituye el cotejo crítico de todas las atribuciones y ediciones del archivo. El calendario cargado cubre 20 semanas; el ciclo anual completo sigue pendiente.

## Pendientes siguientes
1. Revisión visual en Safari de iPhone y en Android reales, incluido progreso y regreso al estudio.
2. Revisión de la bienvenida con personas nuevas y claridad de la identidad de Dérej.
3. Comprobar aviso y recuperación del progreso local; explicar cambio de navegador y borrado de datos.
4. Medir inicio y finalización del estudio y definir una medición de retorno compatible con la privacidad.
5. Verificar respaldos, capacidad operativa y canal de observaciones.
6. Continuar el cierre editorial por Jaye Sara y las semanas siguientes; completar Bereshit y Noaj.
7. Mantener la curaduría musical en su propio flujo de trabajo.

## Parte 2 · Bienvenida y recuperación del avance
- Verificadas la guía de primera visita, la entrada posterior al Patio y la recuperación de la parashá, el día y la etapa exactos entre visitas.
- Comprobado que la recuperación conserva notas privadas, encuentros completados y preferencia de métricas.
- Corregida la espera que permanecía en «Preparando el estudio…» cuando fallaba la carga inicial: ahora informa el fallo y permite reintentar la opción elegida desde la misma bienvenida.
- El reintento reconstruye la interfaz del estudio que había mostrado el error y limpia el estado de fallo al recuperar los datos.
- Aclarado que el avance y las reflexiones pertenecen al navegador: no se trasladan automáticamente a otro y pueden perderse si se borran sus datos.
- Estas comprobaciones funcionales no reemplazan la observación de personas nuevas ni la revisión en teléfonos reales.

## Parte 3 · Inicio y finalización del estudio
- Dos señales agregadas: apertura de una jornada y acción de marcarla como realizada. No se envía la identidad de la lectura, la nota, la etapa ni el historial privado.
- Se evita duplicar la misma jornada por etapa, renderizado o recarga de pestaña durante una sesión. El final requiere confirmación del guardado local.
- La preferencia de métricas y las señales de privacidad del navegador se aplican a ambos eventos. Las pruebas quedan excluidas.
- La vista administrativa diaria incorpora los contadores de estudio. La lectura pública de la tabla y la vista continúa bloqueada. La prueba de inserción se ejecutó bajo el rol público y revirtió sus filas.
- Se conserva el identificador diario cambiante: no se ha implementado seguimiento de personas entre días.
- La revisión de seguridad no informó incidencias de las tablas o vistas de métricas. Quedaron para la revisión final de accesos las advertencias existentes sobre políticas de `mission_actions`, `testimonies` y protección de contraseñas. Esas advertencias requieren revisar su contexto; no certifican por sí solas una exposición. [Políticas](https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins) · [Contraseñas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
