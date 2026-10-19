# Métricas de Dérej · v1

La medición comienza con esta publicación. No reconstruye visitas ni estudios anteriores.
Se activa sólo en `derej-beta-comunitaria.vercel.app`; los previews y las copias locales no envían eventos.
El enlace **Privacidad y métricas** en el patio permite desactivarla. Se respetan Global Privacy Control y Do Not Track.

## Qué significa cada dato

| Evento | Definición |
| --- | --- |
| visit | Nueva sesión por pestaña, después de 30 minutos sin eventos o al cambiar el día de Chile. No equivale a una persona. |
| section_view | Entrada a una puerta: patio, Camino, Shabat, Moed, Radio, Mi Camino o Pozo. No lee sus contenidos. |
| section_time | Segundos con esa sección visible, hasta 30 minutos por tramo. No demuestra atención. Se detiene al ocultar la pestaña. |
| radio_start | El navegador confirma reproducción. Pausar y continuar no suma otro inicio. No incluye precargas. |
| radio_30s | Al menos 30 segundos reales de reproducción con volumen y sin silencio. No cuenta saltos por la barra. No prueba que la persona estuviera escuchando. |
| radio_complete | Llega al final después de 30 segundos reales y de reproducir al menos el 90% de la duración. |

Un código aleatorio de navegador cambia cada día en `America/Santiago`; sólo se conserva el actual. No hay huella digital ni identificador permanente. La sesión usa otro código, guardado por pestaña. La etiqueta móvil/tablet/escritorio es aproximada.

El registro no almacena nombres, correos, IP, URLs, búsquedas, texto escrito ni progreso personal. Los proveedores conservan sus registros técnicos habituales. Los IDs de colección y pista proceden del catálogo editorial, no de contenido de usuarios.

## Datos y consulta

Proyecto Supabase: `derej-production` (`ryeztkcyopbmwwaacpxl`).
Tabla: `public.analytics_events`. Sólo permite INSERT validado desde el origen público; no tiene política SELECT/UPDATE/DELETE para visitantes. La función `record_analytics` usa SECURITY INVOKER, lotes de hasta 20 y deduplicación por UUID. No usa claves de servicio en el cliente.

Las vistas `analytics_daily`, `analytics_sections` y `analytics_radio` respetan RLS, excluyen `is_test` y no están concedidas al público. Se consultan mediante las herramientas administrativas existentes; no se ha publicado un panel con datos de visitantes.

```sql
select * from public.analytics_daily
where day >= (now() at time zone 'America/Santiago')::date - 14
order by day;

select section, sum(views) as entradas, sum(visible_seconds) as segundos_visibles
from public.analytics_sections
where day >= (now() at time zone 'America/Santiago')::date - 14
group by section order by entradas desc;

select collection_id,track_id,sum(starts) as inicios,
  sum(qualified_30s) as escuchas_30s,sum(completes) as finales
from public.analytics_radio
where day >= (now() at time zone 'America/Santiago')::date - 14
group by collection_id,track_id order by escuchas_30s desc;
```

Los navegadores diarios no deben sumarse para presentarlos como personas únicas de varios días. Los eventos son declaraciones del cliente, no cifras auditadas ni resistentes a manipulación. Los bloqueadores, el modo offline y el rechazo de métricas pueden producir subregistro.

## Validación y publicación

- `tests/analytics.test.cjs`: precargas, pausas, saltos, silencio, 30 segundos, finales, navegación, rotación diaria, sesiones, exclusión de previews, opt-out, GPC y fallos de red.
- `tests/pozo.test.cjs`: regresión del patio, trazado, memoria y navegación con radio.
- Enviar pruebas con `?metricas=prueba`; estos eventos quedan excluidos de los informes. No se envía el parámetro ni la URL al registro.
- Base publicada antes de activar el cliente. Los SQL en `backend/` documentan el esquema final ya aplicado; no se deben ejecutar de nuevo en producción.
- La medición no modifica reflexiones, progreso, ejercicios ni fuentes editoriales.
