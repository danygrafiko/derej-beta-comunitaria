# Backend Frutos · v1.8

## Activo en Supabase
- `public.fruits` con RLS.
- `public.fruit_moderation_events` con acceso sólo de servidor.
- Edge Function `submit-fruit` ACTIVE.
- Edge Function `fruit-moderation-console` ACTIVE.

## Privacidad
La lectura pública sólo puede acceder a campos editoriales seguros de frutos con `status=published`. `user_id`, relato original, señales automáticas y notas de moderación no son columnas públicas.

## Auditoría
Cada transición pending → published/hidden o regreso a pending genera un evento de moderación. Las ediciones posteriores de la versión pública también pueden auditarse.

## QA realizado
Se creó y publicó un fruto sintético dentro de una transacción y se comprobó el evento `publish`; luego se ejecutó `ROLLBACK`. Resultado final: 0 frutos y 0 eventos de prueba persistentes.

## Gate pendiente
Realizar desde iPhone: envío anónimo → pendiente → edición/publicación en panel moderador → aparición en Bitácora pública.
