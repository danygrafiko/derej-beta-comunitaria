-- Extensión de métricas: sin enviar parashá, día, etapa, notas ni historial.
-- Aplicar una sola vez mediante la migración analytics_study_lifecycle.
alter table public.analytics_events drop constraint analytics_events_event_type_check;
alter table public.analytics_events add constraint analytics_events_event_type_check
  check (event_type in ('visit','section_view','section_time','radio_start','radio_30s','radio_complete','study_start','study_complete'));
alter table public.analytics_events drop constraint analytics_event_shape;
alter table public.analytics_events add constraint analytics_event_shape check (
  (event_type in ('visit','section_view') and collection_id is null and track_id is null and seconds is null)
  or (event_type='section_time' and collection_id is null and track_id is null and seconds is not null)
  or (event_type='radio_start' and section='radio' and collection_id is not null and track_id is not null and seconds is null)
  or (event_type='radio_30s' and section='radio' and collection_id is not null and track_id is not null and seconds is not null and seconds=30)
  or (event_type='radio_complete' and section='radio' and collection_id is not null and track_id is not null and seconds is not null and seconds>=30)
  or (event_type in ('study_start','study_complete') and section='camino' and collection_id is null and track_id is null and seconds is null)
);

-- Conservar columnas y orden existentes; añadir los dos contadores al final.
create or replace view public.analytics_daily with (security_invoker=true) as
select (received_at at time zone 'America/Santiago')::date as day,
  count(*) filter(where event_type='visit') as visits,
  count(distinct daily_id) as daily_browsers,
  count(*) filter(where event_type='section_view') as section_views,
  coalesce(sum(seconds) filter(where event_type='section_time'),0) as visible_seconds,
  count(*) filter(where event_type='radio_start') as radio_starts,
  count(*) filter(where event_type='radio_30s') as radio_30s,
  count(*) filter(where event_type='radio_complete') as radio_completes,
  count(*) filter(where event_type='study_start') as study_starts,
  count(*) filter(where event_type='study_complete') as study_completes
from public.analytics_events where not is_test group by 1;
revoke all on public.analytics_daily from public,anon,authenticated;
grant select on public.analytics_daily to service_role;
