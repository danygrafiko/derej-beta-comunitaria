# Dérej · Revisión de Shabat, Moed, Árbol y Patio

Fecha editorial: 18 de noviembre de 2026.

## Propósito
Facilitar la primera lectura sin sacrificar fuentes tradicionales ni crear obligaciones espirituales o rituales para los visitantes.

## Hallazgos y cambios
- **Shabat:** se conservan seis puertas con 42 gestos de práctica. La entrada aclara que puede elegirse una sola puerta. Pestañas: «Conocer», «Profundizar», «Llevar». No se reescribieron los textos de tradición.
- **Moed:** las seis puertas se conservan. En cinco de ellas se revisaron las 35 propuestas para dejar una acción sencilla a la vez, contextualizar observancias judías y evitar imperativos confusos. Iom Kipur mantiene intactas sus dos experiencias complementarias.
- **Moed, texto de inicio:** se aclararon Pésaj, Shavuot, Sucot y la puerta compartida de Janucá/Purim, sin modificar su texto de profundización ni las fuentes enumeradas.
- **Sucot:** las cuatro especies son etrog, lulav, hadás y aravá. No se reemplazan por objetos cualesquiera en su práctica ritual.
- **Janucá y Purim:** son festividades diferentes. Se evita prescribir el encendido de la janukía fuera de su contexto festivo.
- **Árbol:** se mantienen las diez sefirot y el marcador didáctico de Dáat, que no se suma como una undécima. Cuatro preguntas se aclararon. La contemplación no exige imaginar.
- **Patio y bienvenida:** se introdujeron rótulos comprensibles y opciones claras para usuarios nuevos. Se conserva la navegación y los enlaces existentes.
- **Accesibilidad:** se añade información accesible del estado seleccionado en puertas, pestañas y alternativas mediante `aria-pressed`; las pestañas se identifican como grupo de botones.

## Criterio de fuentes y límites
Los datos tradicionales de las seis puertas de Shabat permanecieron intactos. Para Moed, los textos de profundización y las referencias existentes tampoco se modificaron. Esta revisión **no equivale a una auditoría exegética completa** de esas atribuciones; esa verificación debe abordarse por separado.

Fuentes públicas de contraste para distinguir las prácticas rituales de la reflexión editorial: Jabad en Español, [Las cuatro especies](https://es.chabad.org/library/article_cdo/aid/2236727/jewish/Las-cuatro-especies-el-Lulav-y-el-Etrog.htm) y [Qué es Janucá](https://es.chabad.org/holidays/chanukah/article_cdo/aid/6698511/jewish/Qu-es-Januc.htm).

## Verificaciones
Comprobación estática de las estructuras, sintaxis JavaScript, campos de fuentes, cantidad y claridad de propuestas. Prueba reproducible: `node tests/claridad-shabat-moed-arbol.test.cjs`. Queda pendiente una prueba completa con lectores reales, especialmente en pantallas móviles y con distintas edades.
