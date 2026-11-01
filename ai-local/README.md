# Dérej IA · prototipo con un modelo abierto

Este prototipo ejecuta **Qwen3.5-2B, cuantización Q4_K_M**, mediante **llama.cpp**, y utiliza la biblioteca de Dérej como evidencia. No entrena un modelo desde cero. El sistema propio comprende la recuperación de pasajes, los criterios editoriales, la validación de referencias, el servidor y la experiencia de conversación.

## Puesta en marcha reproducible · Linux x64

Requiere Node.js 22 o posterior, `curl`, `tar`, conexión para la descarga inicial y espacio para aproximadamente 1,3 GB de pesos más el motor. El entorno de prueba dispone de 8 GB de RAM y CPU, sin GPU; esto describe la prueba, no garantiza el rendimiento en otros equipos.

Desde la raíz del repositorio:

```bash
node scripts/setup-derej-local.cjs
node scripts/run-derej-local.cjs
```

Abre `http://127.0.0.1:4173/?puerta=preguntas` en ese mismo equipo. El instalador verifica ambos SHA-256 contra las versiones fijadas en `runtime-lock.json`. Se conservan los archivos en `~/.cache/derej-ia`; `DEREJ_RUNTIME_DIR` permite elegir otra carpeta. No descarga nuevas versiones automáticamente.

El servidor de inferencia escucha en `127.0.0.1:8081` y recibe una clave aleatoria para cada ejecución, compartida únicamente con el servidor de Dérej mediante variables de entorno. El navegador no recibe esa clave. El servidor de Dérej escucha en `127.0.0.1:4173`. Al detener el lanzador con Ctrl+C se detienen ambos procesos. No se abre un túnel ni se publica el equipo en internet.

El instalador incluido es para Linux x64. Para otro sistema operativo se necesita un binario compatible de llama.cpp; `DEREJ_LLAMA_SERVER` y `DEREJ_MODEL_PATH` permiten indicar sus rutas. Esa variante no se ha validado en esta prueba.

## Qué ocurre al preguntar

1. La persona acepta enviar su consulta al servidor local.
2. Dérej recupera pasajes de la colección curada. Se incluyen también los siete encuentros de Primeros pasos, sin sus notas personales.
3. Se envían al modelo la pregunta, un máximo de cuatro mensajes recientes de hasta 900 caracteres cada uno y hasta tres fragmentos públicos. Para este prototipo cada fragmento se limita a 1.600 caracteres.
4. El motor genera JSON con respuesta, pregunta de reflexión e identificadores de fuente. El esquema restringe esos identificadores a los recuperados.
5. El servidor comprueba los identificadores y muestra las lecturas correspondientes. Una referencia válida **no demuestra por sí sola que todas las afirmaciones sean correctas**; la revisión editorial sigue siendo necesaria.

Las peticiones explícitas de inventar citas atribuidas o de indicar Salmos como curación reciben una respuesta editorial de límite, sin recurrir al modelo. Esta detección cubre casos explícitos; no es una garantía exhaustiva frente a todas las formulaciones adversarias.

La colección se regenera con `node scripts/build-derej-knowledge.cjs`. Las conversaciones permanecen en memoria de la pestaña; la aplicación no las escribe en su base de datos ni en el almacenamiento del navegador. Después de la descarga, la inferencia local no llama a AI Gateway ni a un proveedor de generación externo. Las funciones previas del portal, como radio, fuentes enlazadas y métricas autorizadas, conservan sus propias conexiones.

## Evaluación

Para arrancar el prototipo, ejecutar las pruebas reales y detenerlo automáticamente:

```bash
node scripts/verify-derej-local.cjs
```

O, con el prototipo ya en ejecución:

```bash
node scripts/evaluate-derej-local.cjs
```

El script envía cinco preguntas públicas de prueba a localhost. Guarda un informe local fuera del repositorio con tiempos, respuestas y fuentes. No confunde validación de estructura o de identificadores con una evaluación factual. Consulta `EVALUACION.md` para los resultados observados y las limitaciones.

Pruebas de integración y controles:

```bash
node tests/derej-engine.test.cjs
node tests/derej-editorial.test.cjs
node tests/derej-local-server.test.cjs
node tests/preguntas-api.test.cjs
```

## Conexión futura del portal público

El adaptador admite un servicio propio compatible con `/v1/chat/completions`:

```text
DEREJ_AI_PROVIDER=selfhosted
DEREJ_AI_BASE_URL=https://<servidor-propio>/v1
DEREJ_AI_MODEL=<alias-del-modelo>
DEREJ_AI_API_KEY=<secreto-solo-en-el-servidor>
DEREJ_AI_ENABLED=1
```

Estas son instrucciones de configuración, no una conexión ya desplegada. Vercel no puede alcanzar el localhost del computador de una persona. El servicio permanente necesita una dirección HTTPS, autenticación y capacidad de cómputo. La clave se configura en el gestor de secretos, nunca en el código, el navegador ni el chat. Un fallo del motor propio no deriva consultas a un servicio de pago.

El límite actual de cinco consultas por minuto es por instancia. Antes de abrir el servicio a la comunidad se necesitan controles compartidos de uso, concurrencia y disponibilidad, además de la evaluación editorial. No se contrató infraestructura ni se cambió facturación.

## Procedencia

- Modelo base y licencia Apache-2.0: https://huggingface.co/Qwen/Qwen3.5-2B
- Cuantización y versión exacta: https://huggingface.co/unsloth/Qwen3.5-2B-GGUF/tree/f6d5376be1edb4d416d56da11e5397a961aca8ae
- Motor y licencia: https://github.com/ggml-org/llama.cpp/releases/tag/b11960
- API y salidas estructuradas: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md

Los pesos y los binarios no se incluyen en Git. El código de integración de Dérej permanece versionado junto al portal.
