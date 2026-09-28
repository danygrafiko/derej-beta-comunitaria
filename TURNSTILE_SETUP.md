# DÉREJ · Activación de Cloudflare Turnstile

La v1.3.1 ya contiene la integración de cliente y la Site Key pública real. Queda deliberadamente desactivada hasta configurar la Secret Key privada en Supabase Auth.

## 1. Crear el widget en Cloudflare

En Cloudflare Dashboard → Turnstile → Add widget:

- Nombre sugerido: `DEREJ Community`
- Hostname de producción: `danygrafiko.github.io`
- Widget mode: `Managed`

Copia las dos credenciales:

- **Site Key**: es pública y puede ir en `config.js`.
- **Secret Key**: es privada; NUNCA debe ir en `config.js`, GitHub, HTML o JavaScript del navegador.

## 2. Activar CAPTCHA en Supabase Auth

Supabase Dashboard → Authentication → Bot and Abuse Protection → Enable CAPTCHA protection.

- Provider: Cloudflare Turnstile
- Secret key: pegar la Secret Key de Cloudflare
- Guardar.

## 3. Activar v1.3 en el frontend

En `config.js`:

```js
communityCaptchaEnabled: true,
communityCaptchaProvider: "turnstile",
turnstileSiteKey: "0x4AAAAAAFH3dbY5Vj3Mu_dA"
```

No cambiar ninguna otra clave.

## 4. Comportamiento esperado

Cuando una persona intenta por primera vez registrar una misión, enviar un testimonio o reportar contenido y todavía no posee sesión anónima válida:

1. Dérej abre el diálogo “Confirmar presencia humana”.
2. Turnstile entrega un token de corta duración.
3. Dérej crea la identidad anónima enviando el token a Supabase Auth.
4. Supabase valida el token contra la Secret Key configurada en Auth.
5. La sesión queda almacenada localmente como antes; no se solicita CAPTCHA en cada acción.

## 5. Gate de publicación

No publicar `communityCaptchaEnabled: true` hasta que:

- la Site Key pertenezca al widget real;
- la Secret Key esté guardada en Supabase Auth;
- el dominio publicado esté admitido por Cloudflare;
- se haya probado en iPhone/Safari y escritorio;
- el Security Advisor haya sido revisado nuevamente.


## Estado v1.4

Configuración activada. Supabase Auth fue verificado rechazando una alta anónima sin CAPTCHA con `captcha_failed`. La prueba visual/token real debe realizarse desde el hostname autorizado `danygrafiko.github.io` tras desplegar esta versión.
