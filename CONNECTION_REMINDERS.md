# Mi momento diario · 22 de octubre de 2026

Recordatorio diario voluntario, independiente de las métricas. Entrada desde el patio y Mi Camino; hora local, zona IANA y destino Camino/Radio. La opción predeterminada 07:30 y la práctica de cinco a diez minutos son propuestas editoriales, no horarios religiosos obligatorios.

## Activación

La persona marca la autorización y pulsa Activar. Sólo entonces se solicita el permiso del dispositivo. En iPhone/iPad debe añadir Dérej a la pantalla de inicio y abrirla desde allí. Tras guardar, puede pulsar Enviar aviso de prueba. El servicio puede aceptar una notificación y el sistema operativo demorar u ocultar su presentación; no se promete entrega exacta ni sonido.

Sin soporte web push se ofrece un archivo de Calendario con repetición diaria y aviso. Es necesario importarlo y confirmar la alerta en Calendario. Esta opción se elimina desde Calendario y no depende de la suscripción web. Evitar importarlo varias veces para no duplicar eventos.

## Entrega

- `connection-sw.js` recibe avisos y abre sólo Camino o Radio. No intercepta navegación ni audio, ni inicia reproducción.
- La Edge Function `connection-reminders` tiene validación propia: origen canónico para operaciones del navegador, token aleatorio de gestión por suscripción y secreto independiente para el planificador. La clave pública de Supabase no autoriza envíos.
- `pg_cron` revisa cada minuto. `pg_net` sólo invoca el servicio cuando hay suscripciones pendientes. El inicio es liviano mientras nadie lo active.
- La toma de pendientes es atómica. Se registra como máximo un intento diario por fecha local; las ejecuciones repetidas no duplican avisos. Un fallo transitorio puede perder el aviso de ese día. Los avisos con más de quince minutos de retraso se omiten, y los enviados caducan en quince minutos. La prueba manual es adicional y está limitada a una por minuto por dispositivo.
- Las bajas 404/410 eliminan endpoints vencidos. La desactivación elimina la fila del servidor y cancela la suscripción local. Si falla, se muestra el error y la alternativa de bloquear en ajustes.
- La zona horaria se captura al guardar. Al viajar se debe volver a guardar el horario; los cambios estacionales dentro de la misma zona los calcula Postgres.

## Privacidad y acceso

Datos privados: endpoint, claves de entrega, hash del token de gestión, horario, zona, destino y estado técnico. No se adjuntan notas, texto de estudio, nombres, correo ni identificadores de métricas. No se guardan IPs para la limitación de registros. El token original se conserva sólo en el navegador y se envía por TLS para gestionar la suscripción. Cada instalación/navegador se configura por separado; borrar los datos locales puede requerir bloquear y reactivar el permiso.

Las tablas de `derej_reminders` tienen RLS, sin acceso de `anon` ni `authenticated`. No hay RPC pública que permita leer suscripciones ni claves privadas. La función usa la conexión de base de datos del entorno servidor. La clave privada VAPID y el secreto del planificador se generan una vez y se conservan exclusivamente en la configuración privada de producción, fuera de Git y del cliente.

El asesor informa RLS sin políticas como dato informativo en estas tres tablas: es deliberado porque no hay acceso de cliente. [Referencia del asesor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy). Las advertencias previas sobre `mission_actions`, `testimonies` y contraseñas siguen fuera de esta intervención: [políticas](https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins), [contraseñas](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Validación

Pruebas DOM de consentimiento, permiso dentro del gesto, altas/cambios/bajas, fallos de red y almacenamiento, alternativa Calendario, instrucciones iOS y destinos seguros. Prueba SQL transaccional de privacidad, próximo horario y cambio de hora de Chile. Prueba de API con suscripción sintética futura que se elimina al terminar, sin enviar push. Pruebas de bienvenida y métricas de estudio conservadas. La recepción de una notificación real se confirma en un dispositivo que decida activarla; no se habilitaron notificaciones a usuarios durante la preparación.

Dependencias servidor fijadas en `backend/connection-reminders/package.json` y su lock. El archivo SQL de configuración no incluye secretos; una instalación nueva requiere generarlos en el servidor antes de habilitar el planificador.
