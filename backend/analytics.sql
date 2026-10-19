-- Métricas v1: INSERT anónimo validado. Sin nombres, textos, IP, URL o ID permanente.
create table public.analytics_events (
  id uuid primary key,
  received_at timestamptz not null default now(),
  event_type text not null check (event_type in ('visit','section_view','section_time','radio_start','radio_30s','radio_complete')),
  daily_id uuid not null,
  session_id uuid not null,
  section text not null check (section in ('home','camino','shabat','moed','radio','personal','pozo')),
  device_class text not null check (device_class in ('mobile','tablet','desktop')),
  collection_id text check (collection_id ~ '^[a-z0-9_-]{1,80}$'),
  track_id text check (track_id ~ '^[a-z0-9_-]{1,80}$'),
  seconds smallint check (seconds between 1 and 1800),
  is_test boolean not null default false,
  release text not null check (release = 'metrics-v1'),
  constraint analytics_event_shape check (
    (event_type in ('visit','section_view') and collection_id is null and track_id is null and seconds is null)
    or (event_type='section_time' and collection_id is null and track_id is null and seconds is not null)
    or (event_type='radio_start' and section='radio' and collection_id is not null and track_id is not null and seconds is null)
    or (event_type='radio_30s' and section='radio' and collection_id is not null and track_id is not null and seconds is not null and seconds=30)
    or (event_type='radio_complete' and section='radio' and collection_id is not null and track_id is not null and seconds is not null and seconds>=30)
  )
);
alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from public, anon, authenticated;
grant insert (id,event_type,daily_id,session_id,section,device_class,collection_id,track_id,seconds,is_test,release)
  on public.analytics_events to anon, authenticated;
grant select,insert,update,delete on public.analytics_events to service_role;
create policy analytics_insert_only on public.analytics_events for insert to anon,authenticated
  with check (
    coalesce(current_setting('request.headers',true)::jsonb->>'origin','') = 'https://derej-beta-comunitaria.vercel.app'
  );
create index analytics_events_received_at_idx on public.analytics_events(received_at desc);
create index analytics_events_session_idx on public.analytics_events(session_id,event_type);

-- Sólo administración. Las vistas respetan RLS y no se conceden al público.
create view public.analytics_daily with (security_invoker=true) as
select (received_at at time zone 'America/Santiago')::date as day,
  count(*) filter(where event_type='visit') as visits,
  count(distinct daily_id) as daily_browsers,
  count(*) filter(where event_type='section_view') as section_views,
  coalesce(sum(seconds) filter(where event_type='section_time'),0) as visible_seconds,
  count(*) filter(where event_type='radio_start') as radio_starts,
  count(*) filter(where event_type='radio_30s') as radio_30s,
  count(*) filter(where event_type='radio_complete') as radio_completes
from public.analytics_events where not is_test group by 1;
revoke all on public.analytics_daily from public,anon,authenticated;
grant select on public.analytics_daily to service_role;

create view public.analytics_sections with (security_invoker=true) as
select (received_at at time zone 'America/Santiago')::date as day,section,
  count(*) filter(where event_type='section_view') as views,
  coalesce(sum(seconds) filter(where event_type='section_time'),0) as visible_seconds
from public.analytics_events where not is_test group by 1,2;
revoke all on public.analytics_sections from public,anon,authenticated;
grant select on public.analytics_sections to service_role;

create view public.analytics_radio with (security_invoker=true) as
select (received_at at time zone 'America/Santiago')::date as day,collection_id,track_id,
  count(*) filter(where event_type='radio_start') as starts,
  count(*) filter(where event_type='radio_30s') as qualified_30s,
  count(*) filter(where event_type='radio_complete') as completes
from public.analytics_events where not is_test and event_type like 'radio_%' group by 1,2,3;
revoke all on public.analytics_radio from public,anon,authenticated;
grant select on public.analytics_radio to service_role;
