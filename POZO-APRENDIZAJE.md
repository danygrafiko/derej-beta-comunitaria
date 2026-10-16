# El Pozo · primera unidad de aprendizaje

Integración sobre la edición comunitaria v2.5.3, sin sustituir el patio ni modificar el reproductor de Radio.

## Entrada

El agua de la imagen original del patio recibe un botón accesible «El Pozo». La primera visita ofrece descubrir el taller; después el acceso permanece identificado como espacio de aprendizaje. `#pozo` abre directamente ese espacio.

## Unidad «Agua y luz»

Seis letras (álef, vav, resh, mem, yod, dálet), más mem final. Las palabras son מַיִם y אוֹר, vinculadas a los pasajes de los encuentros OR y RAKIA existentes. Se incluyen fichas, visualización con/sin vocalización, construcción RTL, comparación de formas, parejas de memoria, trazado libre y reconocimiento en el pasaje. La lectura de אור admite sus dos apariciones correctas en Génesis 1:3.

También hay fichas y asociación de las cuatro voces de los Caminos y cuatro preguntas de Nóaj. La pronunciación usa únicamente una voz hebrea del dispositivo, si existe, y lo informa. No se presenta como grabación revisada. El trazado no se califica automáticamente.

El avance se conserva en `derej.pozo.learning.v1`, separado de los borradores y recuerdos personales existentes. Las preguntas se repasan con prioridad a errores y vencimientos; los intervalos de 1/3/7 días dependen de días distintos con aciertos. Se puede pausar, retomar y exportar el registro. No hay puntuación de inteligencia ni medición clínica.

## Validación

`tests/pozo.test.cjs` usa jsdom 26.1.0 como herramienta externa de QA. Se puede ejecutar con `NODE_PATH` apuntando al directorio de dependencias que lo contenga. Verifica la interfaz completa, descubrimiento persistente, navegación, letras, construcción de palabras, pausa/restauración, lectura, trazado, parejas y conservación de la instancia de audio al regresar a Radio. La inspección visual se realiza por separado.
