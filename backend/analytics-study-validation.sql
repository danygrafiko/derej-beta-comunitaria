-- Prueba transaccional: no conserva filas y no cambia permisos.
begin;
select set_config('derej.validation_session',gen_random_uuid()::text,true);
set local role anon;
select set_config('request.headers','{"origin":"https://derej-beta-comunitaria.vercel.app"}',true);
do $$
declare base jsonb; invalid_rejected boolean; reading_denied boolean;
begin
  base:=jsonb_build_object('daily_id',gen_random_uuid(),'session_id',current_setting('derej.validation_session')::uuid,'section','camino','device_class','desktop','collection_id',null,'track_id',null,'seconds',null,'is_test',true,'release','metrics-v1');
  perform public.record_analytics(jsonb_build_array(base||jsonb_build_object('id',gen_random_uuid(),'event_type','study_start'),base||jsonb_build_object('id',gen_random_uuid(),'event_type','study_complete')));
  invalid_rejected:=false;
  begin
    perform public.record_analytics(jsonb_build_array(base||jsonb_build_object('id',gen_random_uuid(),'event_type','study_complete','section','radio')));
  exception when check_violation then invalid_rejected:=true;
  end;
  if not invalid_rejected then raise exception 'Se aceptó una forma inválida de study_complete';end if;
  invalid_rejected:=false;
  begin
    perform public.record_analytics(jsonb_build_array(base||jsonb_build_object('id',gen_random_uuid(),'event_type','radio_30s','section','radio','collection_id','test','track_id','test')));
  exception when check_violation then invalid_rejected:=true;
  end;
  if not invalid_rejected then raise exception 'Se aceptó una escucha sin segundos';end if;
  invalid_rejected:=false;
  begin
    perform public.record_analytics(jsonb_build_array(base||jsonb_build_object('id',gen_random_uuid(),'event_type','study_start','note','PRIVATE SENTINEL')));
  exception when invalid_parameter_value then invalid_rejected:=true;
  end;
  if not invalid_rejected then raise exception 'Se aceptó un campo de texto privado';end if;
  reading_denied:=false;
  begin perform 1 from public.analytics_events limit 1;exception when insufficient_privilege then reading_denied:=true;end;
  if not reading_denied then raise exception 'Anon puede leer los eventos';end if;
  reading_denied:=false;
  begin perform 1 from public.analytics_daily limit 1;exception when insufficient_privilege then reading_denied:=true;end;
  if not reading_denied then raise exception 'Anon puede leer las métricas diarias';end if;
end $$;
reset role;
do $$
begin
  if (select count(*) from public.analytics_events where session_id=current_setting('derej.validation_session')::uuid)<>2 then raise exception 'No se registraron los dos eventos válidos';end if;
  if exists(select 1 from public.analytics_events where session_id=current_setting('derej.validation_session')::uuid and not is_test) then raise exception 'La prueba no quedó marcada';end if;
end $$;
rollback;
select 'PASS: RPC anónima admite los dos eventos; rechaza formas inválidas y campos privados; lectura pública bloqueada; filas de prueba revertidas.' as validation;
