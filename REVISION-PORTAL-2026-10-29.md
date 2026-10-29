# Dérej · Revisión de lógica y experiencia

Fecha: 29 de octubre de 2026.

Base revisada: versión pública `68b4fd21fa13423de749ec69d80a15f9a490ae94`, con el piloto Profundizar en Vayerá, el reproductor Wurlitzer y los estudios de Genealogías. El trabajo continúa esa base; no usa la antigua versión de `main`.

## Resultado

La organización del portal permite estudiar, contemplar y escuchar sin obligar a seguir un recorrido único. Los problemas más importantes estaban en la continuidad entre pantallas, el tratamiento de las notas, la recuperación de errores y el trabajo repetido de interfaz. Esta revisión corrige esos puntos y deja un inventario de mejoras pendientes.

## Alcance comprobado

| Espacio | Revisión |
| --- | --- |
| Patio | Siete accesos, mostrar/ocultar, preferencia local y acceso independiente a Biblioteca. |
| Camino | 140 jornadas en 20 parashot; siete días por parashá; rangos de aliyot, versículo dentro de su rango, voces y prácticas presentes. |
| Profundizar en Vayerá | Siete aliyot, fuentes diferenciadas, personajes, marcadores, reflexión y regreso al mismo día. |
| Biblioteca | Accesos a Nombres, Voces, Genealogías y el piloto Profundizar. |
| Genealogías | 176 personajes con fichas, estudios y referencias; vínculos de parentesco y navegación de familiares. |
| Radio | Catálogo actual: seis colecciones y 48 pistas; separación entre colección explorada y canción reproducida. |
| Mi Camino | Lecturas guardadas explícitamente, notas y brote personal; separación respecto del avance y los marcadores. |
| Pozo | Letras, trazado, palabras, memoria, ejercicios, guardado y retorno a materiales sin duplicar intentos. |
| Nombres y Voces | Lecturas, referencias, notas opcionales y retorno conservando el contexto anterior. |
| Árbol de la Vida | Vista plana vigente, diez sefirot más Dáat distinguida, práctica guiada, pausa y notas. |
| Shabat y Moed | Recorridos, calendario por año, Israel/diáspora y continuidad de la navegación. |
| Métricas y recordatorios | Pruebas locales de consentimiento, exclusión de revisiones internas, acciones de estudio, escuchas y controles del recordatorio. |

## Correcciones incluidas

### 1. Continuidad, direcciones e historial

- La pantalla visible tiene una dirección correspondiente. Camino conserva parashá, día y etapa en el enlace; el historial no contiene notas privadas.
- Atrás y Adelante del navegador recuperan pantallas del portal. Al recuperar Camino se conservan su día y etapa.
- Al salir de una ficha genealógica se eliminan los parámetros que podían hacer que una recarga regresara a ese personaje desde otra pantalla.
- Volver desde Nombres, Voces, Árbol o Mi Camino conserva el contexto del estudio. El retorno desde Mi Camino evita abrir de nuevo el día actual cuando se estaba leyendo otro.
- Una ruta desconocida devuelve al Patio con una explicación, evitando una pantalla vacía.
- Se elimina el reinicio tardío de etapa al entrar en Camino. La entrada normal con carga lenta espera los datos y selecciona el estudio de hoy.
- Los enlaces anteriores de Genealogías, Nombres, Árbol y Profundizar mantienen su mecanismo de apertura.

### 2. Notas, avance y almacenamiento

- Las notas y el brote personal se muestran como texto. Símbolos como `<`, `>` y `&` ya no se interpretan como elementos de la página en Mi Camino.
- Camino informa si un borrador quedó guardado o si el navegador rechazó el guardado.
- Si falla el guardado de un estudio realizado, se explica el fallo sin confirmar un avance que no quedó persistido.
- El portal puede iniciar y continuar funcionando cuando el acceso al almacenamiento local está bloqueado; las notas muestran el límite de persistencia.
- Mi Camino actualiza sus recuerdos también cuando se abre desde el historial o la navegación central.

### 3. Recuperación ante fallos de conexión

- El fallo de carga de Camino ofrece «Volver a cargar el estudio».
- Radio muestra el fallo del catálogo dentro de su pantalla y ofrece «Volver a cargar la música». Antes, el aviso podía quedar solamente en un reproductor aún oculto.
- La acción principal de reproducir permanece deshabilitada hasta que existe una colección disponible.

### 4. Trabajo de interfaz y observación

- Se evita reescribir continuamente una hoja de estilos y el nombre de la parashá desde el observador de navegación.
- Los observadores de los ajustes de Camino se limitan a esa pantalla y agrupan las actualizaciones pendientes.
- La interfaz en reposo deja de generar el bucle de cambios detectado en la revisión.
- Genealogías conserva su funcionamiento si el navegador no dispone de ResizeObserver.
- Las pruebas de navegador disponen de limpieza de observadores y animaciones al cerrar su documento de prueba.

### 5. Métricas

- Biblioteca y Genealogías se reconocen como secciones propias.
- Se conserva el respeto a las métricas desactivadas, GPC y la clasificación de revisiones internas.
- No se incorporan notas, reflexiones ni identidad de la lectura al historial de navegación o a los nuevos eventos de pantalla.

## Verificación y límites

- Dieciocho suites correspondientes a funcionalidades activas pasan sus comprobaciones locales. Incluyen el recorrido integrado de las doce pantallas, notas, avance, errores de carga y navegación del piloto.
- La comprobación estática no encuentra destinos `data-route` desconocidos ni recursos locales referenciados ausentes en la entrada principal.
- En el navegador se comprobó Biblioteca → Nombres → Atrás → Biblioteca.
- Se reprodujo una pista real de Vayerá y se exploró Noaj sin cambiar la fuente de audio. La misma reproducción continuó al entrar al Patio y a Camino, sin error de audio observado.
- Las referencias y coherencia estructural de las jornadas se comprueban; esta revisión no equivale a una nueva revisión académica de todos los textos ni a comprobar externamente todos sus enlaces.
- El envío real de notificaciones no se ejecutó. La prueba de API que crea una suscripción sintética requiere una ejecución explícita aparte.
- Existe una prueba antigua de proyección 3D que falla porque Maljut sale del área prevista en determinadas proyecciones. Ese motor no está cargado en el portal actual, que utiliza la vista plana; queda registrado para la limpieza del código heredado.
- La revisión en navegador no sustituye una comprobación física en Safari/iPhone de notificaciones, reproducción en segundo plano y gestos.

## Mejoras siguientes, en orden recomendado

| Orden | Mejora | Motivo |
| --- | --- | --- |
| 1 | Reunir en Mi Camino «Continuar», «Realizados», «Lecturas guardadas» y «Reflexiones», manteniendo sus diferencias. | Hoy la memoria personal existe en varios sistemas; una nota, un marcador y un estudio realizado representan acciones distintas. |
| 2 | Completar el calendario editorial y mostrar con claridad el contenido en preparación. | La edición diaria contiene 20 parashot; no representa todavía todo el ciclo anual. |
| 3 | Añadir búsqueda transversal de estudios, personajes y sabios, con resultados identificados por colección. | La Biblioteca tiene suficiente contenido para que la búsqueda sea más útil que agregar puertas al Patio. |
| 4 | Ofrecer una copia descargable de la memoria personal y después una restauración con vista previa. | La persistencia actual depende del navegador y dispositivo; no hay sincronización entre ellos. |
| 5 | Hacer un inventario único de lecturas y música disponibles y pendientes. | El catálogo musical revisado contiene Noaj, Vayerá y la colección original; no incluye actualmente colecciones identificadas como Lej Lejá o Jayé Sará. |
| 6 | Consolidar los controladores antiguos y retirar módulos heredados tras verificar dependencias. | La navegación central estabiliza el comportamiento actual, pero la base aún conserva capas y archivos de versiones previas. |
| 7 | Preparar descarga semanal sin conexión y probarla por separado del audio. | El trabajador activo de recordatorios es de notificaciones; no proporciona una biblioteca completa sin conexión. |

La prioridad de producto es hacer que cada persona sepa dónde está, qué dejó pendiente y cómo volver a lo que le importó. La expansión de contenidos y la búsqueda deben apoyarse en esa continuidad.
