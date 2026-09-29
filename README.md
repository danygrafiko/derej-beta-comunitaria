# DÉREJ MASTER · RC3 Candidate v1.6

Base v0.6 + Release Shell PWA.



## v1.6 · Site Key Turnstile cargada

- Site Key pública configurada: `0x4AAAAAAFH3dbY5Vj3Mu_dA`.
- `communityCaptchaEnabled` permanece en `false` hasta que CAPTCHA esté activado en Supabase Auth con la Secret Key privada.
- La Secret Key no forma parte del paquete ni debe incorporarse al frontend.

## Nuevo en v1.3 · Escudo antiabuso

- Integración frontend preparada para **Cloudflare Turnstile** antes de crear una nueva identidad anónima.
- El desafío sólo aparece cuando hace falta crear una sesión anónima nueva; una sesión válida o renovable no repite CAPTCHA en cada acción.
- El token se envía al endpoint Auth de Supabase como `gotrue_meta_security.captcha_token`, equivalente al flujo oficial `signInAnonymously({ options: { captchaToken } })`.
- `config.js` incorpora `communityCaptchaEnabled`, `communityCaptchaProvider` y `turnstileSiteKey`. La Site Key es pública; la Secret Key nunca debe entrar al paquete.
- Modo seguro de preparación: `communityCaptchaEnabled` queda en `false` hasta que exista un widget real de Cloudflare y CAPTCHA esté habilitado en Supabase Auth.
- Se retiraron del paquete las páginas de bootstrap inicial: el primer admin ya existe y el endpoint de bootstrap está cerrado permanentemente.
- Service Worker versionado como `derej-master-v1.6-20260928-01`; Turnstile es externo y no se cachea.

## Nuevo en v1.2.1

- Código temporal de un solo uso: el paquete nunca contiene el código en texto plano.
- Creación server-side de cuenta permanente con `auth.admin.createUser()`.
- El bootstrap se cierra automáticamente cuando ya existe un moderador activo.
- El panel `moderacion.html` sigue siendo la superficie normal después de la configuración inicial.
- Service Worker versionado como `derej-master-v1.2.1-20260928-01`; las páginas administrativas no forman parte del shell offline.

## Nuevo en v1.1
- `manifest.webmanifest` instalable.
- Service Worker namespaced y versionado (`derej-master-v1.1-20260928-01`).
- Precaché de shell, contenido JSON, catálogo y carátula.
- MP3 y Range Requests excluidos del Service Worker.
- Recursos externos (Supabase, Drive, lectores externos) no son interceptados.
- Navegación: network-first con fallback a `index.html` offline.
- Recursos same-origin: network-first + fallback de caché.
- Flujo de actualización controlado: aviso + botón `Actualizar`.
- Instalación: `beforeinstallprompt` cuando está disponible y ayuda manual para iOS/otros navegadores.
- Iconos PWA temporales generados para esta candidata; reemplazar por los iconos oficiales de RC2 antes de publicar RC3.

## Alcance offline
La interfaz, los módulos JSON y las pantallas ya visitables desde el shell pueden abrir sin conexión después de que el Service Worker haya instalado el caché. Radio requiere red porque los MP3 permanecen en Supabase y se excluyen deliberadamente del caché.

## Release gate pendiente
1. Sustituir iconos temporales por los oficiales.
2. QA real en iPhone/Safari, Android/Chrome y escritorio.
3. Verificar instalación/actualización/offline en HTTPS.
4. Supabase RLS antes de conectar Comunidad.


## Comunidad LIVE · v1.0
- Primera conversación publicada desde Supabase: `shabat-para-la-tierra`.
- Lectura pública de conversación, secciones, misión y testimonios publicados bajo RLS.
- Participación mediante identidad anónima de Supabase Auth, sin nombre/correo/religión.
- La identidad se solicita sólo al registrar misión o enviar testimonio.
- Misión: la reflexión permanece local; el servidor guarda únicamente la huella de realización.
- Testimonio: requiere consentimiento explícito, ingresa como `pending` y no se publica automáticamente.
- Dependencia Supabase JS evitada: integración por REST/Auth HTTP nativo para mantener el shell estático y auditable.
- Anonymous Sign-Ins ya fue validado E2E en producción; la participación se mantiene bajo RLS y el siguiente gate público es CAPTCHA/Turnstile.


## Escudo Comunitario v0.1
- Testimonios ya no se insertan directamente desde el navegador.
- Envío exclusivo vía Edge Function `submit-testimony`.
- La función valida la sesión Supabase antes de derivar `user_id`.
- Consentimiento obligatorio, 10–1500 caracteres y conversación publicada.
- Rate limit por identidad: 3 testimonios/hora y 10/día.
- Semáforo interno green/amber/red; nunca visible al público.
- Señales: hostigamiento, amenazas, datos personales, spam, contenido explícito y preocupación de seguridad.
- Todo queda `pending`; ninguna clasificación automática publica contenido.
- `user_id` y campos de moderación no están disponibles mediante SELECT público.
- Revisión humana obligatoria antes de `published`; la base registra `moderated_at`.

- Private moderation queue: `private.testimony_moderation_queue` (service_role only; red → amber → green).
- Legacy direct-write RLS policies removed: testimonies are fail-closed for client mutation.


## Moderación v1.0
- `moderacion.html` es un panel administrativo separado y no enlazado desde la navegación pública.
- Requiere cuenta permanente de Supabase Auth + fila activa en `community_moderators`.
- La sesión administrativa vive en `sessionStorage`; no se conserva como memoria comunitaria.
- Consume exclusivamente la Edge Function `moderation-console`; el navegador no recibe `service_role`.
- La cola permite revisar Pendientes / Publicados / Ocultos y ejecutar Publicar / Ocultar / Volver a pendiente.
- Cada transición queda auditada automáticamente en `moderation_events` mediante trigger transaccional.
- El Service Worker v1.0 evita que páginas administrativas sustituyan el fallback offline de `index.html`.


## Reportes comunitarios · D-014
- Cada testimonio publicado muestra una acción discreta `Reportar`.
- El reporte requiere identidad técnica autenticada, pero nunca se muestra quién reportó.
- Motivos cerrados: hostigamiento, odio/discriminación, amenaza, datos personales, contenido sexual explícito, spam u otro.
- Detalle opcional de hasta 500 caracteres.
- Un usuario puede reportar una sola vez cada testimonio.
- Límite por identidad: 5 reportes/hora y 20/día.
- Los reportes nunca ocultan contenido automáticamente: evitan que una brigada pueda censurar por volumen.
- `moderation-console` v2 incorpora reportes abiertos a la cola de revisión.
- Al ocultar un testimonio, sus reportes abiertos quedan `actioned`.
- Si el moderador decide mantenerlo publicado, puede cerrar esos reportes como `dismissed`.


## v1.2.1 hotfix
- No depende de JS externo ni de CORS para crear el primer administrador.
- El servidor devuelve una página explícita de éxito o error.


## Estado del bootstrap inicial

El primer administrador ya fue creado y autorizado. `bootstrap-moderator` está retirado (HTTP 410) y no forma parte del flujo normal. Nuevos moderadores deben incorporarse por una ruta administrativa confiable, nunca reabriendo un bootstrap público.


## v1.6 · Turnstile activo

- CAPTCHA de Cloudflare Turnstile activado para la creación de nuevas identidades anónimas.
- La Site Key pública está en `config.js`; la Secret Key permanece exclusivamente en Supabase Auth.
- Supabase fue verificado para rechazar altas anónimas sin `captcha_token`.
- Sesiones anónimas válidas existentes no vuelven a pedir CAPTCHA en cada acción.
- Se retiró `moderacion-configurar.html`; el bootstrap del primer administrador está cerrado.


## v1.6 · Lectura y Memoria

- Lector nativo Dérej para las raíces de Camino: hebreo, transliteración, significado en español, contexto, lectura editorial y fuentes.
- Referencias bíblicas bilingües (por ejemplo, Vayikrá · Levítico).
- Fecha hebrea de Israel restaurada en el encabezado.
- Sistema iconográfico/cromático unificado para Camino.
- Mi Camino deduplica acciones repetidas e incorpora reflexiones privadas locales.
- Mensajes técnicos de migración retirados de la experiencia pública.
- Campo de reflexión privada optimizado para iPhone.
- Radio Dérej vuelve a usar la portada histórica del repositorio como artwork canónico.


## v1.6 · Apartados y lenguaje vivo
Esta versión incorpora símbolos Ramak, glosario táctil, deep-link al pasaje fuente, acciones “Qué llevar contigo” y apartados HTML enriquecidos integrados en la misma aplicación.
