-- Ampliación compatible con los eventos existentes. Sin datos personales nuevos.
alter table public.analytics_events drop constraint analytics_events_section_check;
alter table public.analytics_events add constraint analytics_events_section_check
  check (section in ('home','camino','shabat','moed','radio','personal','pozo','arbol','voces','nombres'));
