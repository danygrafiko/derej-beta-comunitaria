# Árbol de la Vida · Cultivar el interior

Rama integrada de Dérej. Acceso desde el árbol simbólico junto al Pozo del patio, Profundizar, el taller del Pozo y Nombres y presencia. Enlace directo: `/?estudio=arbol`, con selección opcional `&sefira=jesed`.

## Experiencia vigente

- Vista plana fija de las diez sefirot, con nombre hebreo, transliteración y significado. Se ilumina la esfera elegida y se actualizan su pregunta y su enseñanza.
- Sin controles de cámara, giro, acercamiento o movimiento ambiental. La interfaz actual utiliza SVG y CSS; no carga el módulo anterior de WebGL/Canvas.
- Tres modos: Aprender, Contemplar y Llevar a la vida.
- Cuatro recorridos editoriales: Dar y cuidar; Escuchar y comprender; Sostener y agradecer; De la intención al acto.
- Guía escrita de 3, 5 u 8 minutos con cinco momentos. Pausa manual y al ocultar la página o abandonar la sección.
- Reflexión opcional guardada por decisión explícita sólo en este navegador. No se transmite ni sincroniza.

## Árbol en el patio

Un árbol simbólico en maceta, realizado en SVG, permite entrar directamente desde el primer plano a la izquierda del Pozo. Sus diez señales reproducen la selección del estudio. El área de acceso no invade las cinco puertas ni el Pozo; el retorno conserva el foco y la posición de lectura. Se conserva la imagen existente del patio.

## Revisión editorial · 24 de octubre de 2026

Se revisaron las diez fichas completas: nombres y grafías hebreas, significados, síntesis tradicional, reflexión, pregunta, visualización, plegaria, acción, equilibrio y ejemplo. También la introducción, la explicación de Dáat, los cuatro recorridos y los cinco momentos de las guías.

Se afinó la distinción entre el sentido tradicional y la aplicación de Dérej: orientar una intención no agota el significado de Kéter; el agradecimiento en Hod es una práctica editorial; la responsabilidad cotidiana en Maljut es una aplicación y no su traducción literal. Nétzaj lleva el rótulo breve «Victoria»; la perseverancia se explica en la lectura.

Se mantienen diez sefirot en el esquema con Kéter. Dáat se explica aparte, sin agregar una undécima esfera. Los nombres y la disposición se apoyan en Gal Einai; el Tania 3 aporta el contexto jasídico de las facultades intelectuales y emocionales; la introducción de Jacobson al Ómer es un antecedente de trabajo con cualidades relacionadas. Las prácticas de Dérej no constituyen la cuenta ritual del Ómer.

Las preguntas, imágenes, plegarias y acciones son elaboraciones originales Dérej. La visualización y la bitácora son opcionales. Las prácticas no miden un nivel espiritual ni exigen una emoción determinada.

## Referencias revisadas en español

- Gal Einai, Las diez sefirot: https://galeinai.org/2022/09/30/las-diez-sefirot/
- Gal Einai, Dáat: https://galeinai.org/2022/09/26/daat-conocimiento/
- Rabí Shneur Zalman de Liadí, Tania 3: https://es.chabad.org/library/article_cdo/aid/693531/jewish/Captulo-3.htm
- Simon Jacobson, Introducción a la guía espiritual del Ómer: https://es.chabad.org/library/article_cdo/aid/672665/jewish/Introduccion.htm

## Verificación

`tests/arbol.test.cjs` comprueba las diez lecturas y sus guías completas: cada imagen, pregunta, plegaria y acción corresponde a la sefirá elegida. Verifica iluminación única y su correspondencia en el árbol del patio, ausencia de controles gráficos y conservación del estudio, notas y audio al volver. Incluye temporizador, pausas, recarga, escape de HTML, errores de almacenamiento y borrado.

La revisión visual incluye escritorio y un viewport móvil de 390 píxeles (375 útiles), con comprobación de que el nuevo acceso no se superpone al Pozo ni a las puertas. Falta la prueba en un iPhone físico.
