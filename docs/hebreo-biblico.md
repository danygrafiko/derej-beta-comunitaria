# Biblioteca · Hebreo bíblico

Primera edición de un diccionario de estudio con 128 entradas del Tanaj, dos ejemplos por entrada, 24 ampliaciones, una guía de lectura, siete recorridos y seis fichas de recepción posterior. Se integra en el catálogo vigente de Biblioteca como «Hebreo bíblico» y abre `diccionario-hebreo.html`.

## Contenido y fuentes

`content/hebreo/diccionario.json` es la fuente editorial de las fichas; `guia.json` contiene las lecciones y recorridos. Las definiciones españolas son elaboración editorial propia. No se presenta el trabajo como revisión académica independiente ni como un léxico exhaustivo.

Los 256 ejemplos se cotejaron con los identificadores léxicos y formas de Open Scriptures Hebrew Bible, commit `3d15126fb1ef74867fc1434be1942e837932691f`. El texto WLC es de dominio público y las anotaciones OSHB se atribuyen bajo CC BY 4.0. Se retiran cantilación y marcas auxiliares en la presentación; se conserva niqqud. La numeración es la hebrea del corpus.

Se consultaron Open Scriptures Hebrew Lexicon/Brown–Driver–Briggs y se cotejaron lemas y categorías con STEP Bible/Tyndale House. No se reproducen las definiciones inglesas de TBESH. Los índices Strong no se tratan como equivalencias semánticas exactas: los homónimos y las formas emparentadas se explican. Panim, mayim y tiféret se presentan como formas de consulta y documentan sus variantes en la propia ficha.

La guía separa significado bíblico, contexto, recepción rabínica/cabalística y aplicación editorial. Las seis fichas posteriores no se cuentan entre los lemas técnicos bíblicos. El Nombre de cuatro consonantes tiene una ficha sin pronunciación propuesta.

Fuentes enlazadas en la aplicación: OSHB, Open Scriptures Hebrew Lexicon, STEP Bible, Mishná en Mechon Mamre y Sefer Yetzirá en Wikisource. La fuente Noto Serif Hebrew se sirve localmente con su licencia SIL OFL en `assets/fonts/`.

## Comportamiento

Búsqueda en español, transliteración, raíz y formas hebreas, con o sin niqqud; filtros temáticos y de inicial; ordenación; enlaces profundos `#palabra=<id>`; guardados locales y copia de ficha. Los guardados no se sincronizan entre dispositivos. Sin audio ni servicios nuevos de IA. La página puede volver a Biblioteca; el historial del catálogo conserva la última lectura.

## Validación

- 128 identificadores únicos; 256 ejemplos con una forma documentada; enlaces de recorridos sin destinos ausentes.
- Pruebas de búsqueda con hebreo vocalizado y no vocalizado, alias, raíces, filtros, paginación, guardados, rutas directas, entrada ausente y fallo de carga.
- Catálogo: ocho colecciones, enlace al diccionario, búsqueda, filtros, lector Tehilim y última lectura.
- Pruebas de Radio y reflexiones de Caminos aprobadas.
- Dos pruebas antiguas (`portal-navigation` en la expectativa `prTitle` y `preguntas-disponibilidad` en un nodo retirado) fallan igual en el commit base y en esta rama. No se modificó su comportamiento como parte de este trabajo.

La presencia léxica no constituye por sí sola una validación de todas las interpretaciones semánticas. El resumen de cotejo está en `content/hebreo/verificacion.json`.
