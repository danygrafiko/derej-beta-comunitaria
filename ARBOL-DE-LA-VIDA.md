# Árbol de la Vida · Cultivar el interior

Rama integrada de Dérej: acceso desde el patio, Profundizar, el taller del Pozo y Nombres y presencia. Enlace directo: `/?estudio=arbol`, con selección opcional `&sefira=jesed`.

## Experiencia

- Diez sefirot navegables, con nombre hebreo, transliteración y significado.
- Tres modos: Aprender, Contemplar, Llevar a la vida.
- Cuatro recorridos editoriales: Dar y cuidar; Escuchar y comprender; Sostener y agradecer; De la intención al acto.
- Guía escrita de 3, 5 u 8 minutos con cinco momentos. Pausa manual y al ocultar la página o abandonar la sección. Se puede avanzar y retroceder libremente.
- Reflexión opcional guardada por decisión explícita sólo en el navegador. No se transmite ni sincroniza. Borrado individual y aviso de errores de almacenamiento.

## Criterio editorial

Se emplea el esquema con Kéter y siete sefirot inferiores. Dáat se explica aparte, sin agregar una undécima esfera al mismo recuento. Los nombres, significados y posiciones se apoyan en Gal Einai. El Tania 3 aporta el contexto jasídico de las facultades intelectuales y emocionales; la introducción de Jacobson al Ómer es un antecedente para trabajar cualidades relacionadas. Las prácticas de Dérej no se presentan como cuenta ritual del Ómer.

Las síntesis tradicionales están separadas de las preguntas, imágenes, plegarias y acciones originales Dérej. Los colores y las líneas del gráfico son recursos pedagógicos. No se atribuyen correspondencias tradicionales a los recorridos ni se muestran niveles espirituales.

Fuentes consultadas en español:

- https://galeinai.org/2022/09/30/las-diez-sefirot/
- https://galeinai.org/2022/09/26/daat-conocimiento/
- https://es.chabad.org/library/article_cdo/aid/693531/jewish/Captulo-3.htm
- https://es.chabad.org/library/article_cdo/aid/672665/jewish/Introduccion.htm

## Verificación

`tests/arbol.test.cjs` recorre las diez enseñanzas, la guía completa con reloj controlado, pausas y regreso, notas sin guardado implícito, recarga, escape de HTML, fallo de almacenamiento, borrado y navegación conservando el estudio y el audio. Las pruebas de Nombres y Voces también se ejecutaron con éxito.

La interfaz se comprobó en navegador de escritorio y dentro de un viewport móvil de 390 píxeles (375 útiles). Se verificó que no hay desbordamiento horizontal y que Maljut permanece dentro de la escena. Falta la prueba en un iPhone físico.

Esta primera versión tiene guía escrita. Las grabaciones de voz y la música específica pueden desarrollarse después con curaduría propia.

## Escena inmersiva

Se reemplazó el mapa inicial por una escena de coordenadas tridimensionales: esferas con iluminación, profundidad entre ejes, senderos curvos, partículas suaves y órbitas de base. El giro está limitado para mantener la orientación de estudio. Al elegir una sefirá, la escena conserva la cámara y muestra su pregunta; la enseñanza y la meditación se abren por decisión del usuario.

WebGL dibuja geometría esférica cuando está disponible. Un segundo renderizador Canvas 2D proyecta las mismas coordenadas 3D y conserva giro, acercamiento y selección cuando WebGL no está disponible. La vista plana permanece accesible. No se descargan bibliotecas, texturas ni servicios nuevos.

Los controles incluyen giro, acercar/alejar, centrar, Quietud y Vista plana. Un gesto horizontal gira; el desplazamiento vertical y el zoom nativo del navegador siguen disponibles. Quietud se activa al comenzar una práctica y respeta la preferencia de movimiento reducido. La animación se detiene cuando la escena sale de la pantalla, la pestaña se oculta o se sale de esta rama.

Se probaron la proyección en cinco anchos, el renderizador Canvas, el giro, la separación entre arrastre y toque, el cambio entre vistas, el reuso del contexto y la limpieza de recursos. En este navegador de revisión WebGL no está disponible; la comprobación visual utilizó el renderizador alternativo con proyección 3D. La ruta GPU queda pendiente de una prueba en hardware real.
