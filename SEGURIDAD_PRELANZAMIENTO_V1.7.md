# DÉREJ v1.7 · Estado de seguridad para prelanzamiento

Fecha de revisión: 2026-09-30

## Estado observado
- 1 usuario anónimo real.
- 1 usuario permanente.
- 1 acción de misión registrada.
- 3 testimonios en estado `pending`.
- 0 testimonios publicados u ocultos.
- 1 moderador activo.
- 0 eventos de moderación registrados.

## RLS / acceso anónimo
El Security Advisor advierte que `mission_actions` y `testimonies` son accesibles para el rol `authenticated`, que también es usado por usuarios anónimos de Supabase. En el diseño actual esto es intencional:
- `mission_actions`: lectura/actualización/borrado sólo cuando `auth.uid() = user_id`; inserción sólo para misión y conversación publicadas.
- `testimonies`: el usuario autenticado puede leer sus propios testimonios; cualquier usuario sólo puede leer testimonios `published` de conversaciones publicadas.

Por lo tanto, la advertencia requiere vigilancia pero no representa por sí sola acceso abierto a filas ajenas.

## Pendientes antes del lanzamiento comunitario
1. Ejecutar E2E de moderación desde `moderacion.html`:
   - publicar un testimonio de prueba;
   - verificar `moderation_events`;
   - verificar que sólo el publicado aparece públicamente;
   - ocultarlo o devolverlo a pendiente y confirmar auditoría.
2. Activar **Leaked Password Protection** en Supabase Auth para las cuentas permanentes de moderación.
3. Mantener Turnstile activo para creación de identidad anónima.
4. Repetir Security Advisor después de cualquier cambio de Auth/RLS.

## Rendimiento
Existe un INFO por FK sin índice en `moderator_bootstrap_tokens.used_by`; no bloquea el piloto pero conviene indexarlo antes de escalar tráfico.
