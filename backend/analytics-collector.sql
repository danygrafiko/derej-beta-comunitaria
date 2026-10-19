-- API limitada, idempotente y sin privilegios elevados.
create function public.record_analytics(events jsonb) returns void
language plpgsql security invoker set search_path='' as $$
declare item jsonb;
begin
  if jsonb_typeof(events) <> 'array' or jsonb_array_length(events) not between 1 and 20 then
    raise exception 'Invalid analytics batch' using errcode='22023';
  end if;
  for item in select value from jsonb_array_elements(events) loop
    if jsonb_typeof(item) <> 'object' then
      raise exception 'Invalid event' using errcode='22023';
    end if;
    if exists(select 1 from jsonb_object_keys(item) as k(key) where key not in
      ('id','event_type','daily_id','session_id','section','device_class','collection_id','track_id','seconds','is_test','release')) then
      raise exception 'Unexpected event field' using errcode='22023';
    end if;
  end loop;
  insert into public.analytics_events(id,event_type,daily_id,session_id,section,device_class,collection_id,track_id,seconds,is_test,release)
    select x.id,x.event_type,x.daily_id,x.session_id,x.section,x.device_class,x.collection_id,x.track_id,x.seconds,x.is_test,x.release
    from jsonb_to_recordset(events) as x(id uuid,event_type text,daily_id uuid,session_id uuid,section text,device_class text,collection_id text,track_id text,seconds smallint,is_test boolean,release text)
    on conflict do nothing;
end;
$$;
revoke all on function public.record_analytics(jsonb) from public;
grant execute on function public.record_analytics(jsonb) to anon,authenticated,service_role;
revoke select on public.analytics_events from anon,authenticated;
