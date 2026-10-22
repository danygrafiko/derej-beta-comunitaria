begin;
do $$
begin
 if derej_reminders.next_due('America/Santiago','07:30','2026-10-22T09:00:00Z') <> '2026-10-22T10:30:00Z'::timestamptz then raise exception 'morning schedule';end if;
 if derej_reminders.next_due('America/Santiago','07:30','2026-10-22T10:30:00Z') <> '2026-10-23T10:30:00Z'::timestamptz then raise exception 'next day schedule';end if;
 if derej_reminders.next_due('America/Santiago','07:30','2026-09-05T12:00:00Z') <> '2026-09-06T10:30:00Z'::timestamptz then raise exception 'Chile daylight saving';end if;
 if has_schema_privilege('anon','derej_reminders','USAGE') or has_schema_privilege('authenticated','derej_reminders','USAGE') then raise exception 'public schema access';end if;
 if exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='derej_reminders' and c.relkind='r' and not c.relrowsecurity) then raise exception 'missing RLS';end if;
end $$;
-- A due row can be claimed only once, even when dispatch runs again immediately.
insert into derej_reminders.subscriptions(endpoint,token_hash,subscription,timezone,local_time,destination,next_due)
values('https://fcm.googleapis.com/derej-sql-qa','test','{}','America/Santiago','07:30','camino',now()-interval '1 minute');
do $$ declare n integer;i integer;
begin
 for i in 1..2 loop
  with due as (
   select endpoint from derej_reminders.subscriptions
   where endpoint='https://fcm.googleapis.com/derej-sql-qa' and next_due<=now()
   and last_local_date is distinct from (now() at time zone timezone)::date
   for update skip locked limit 100
  ), claimed as (
   update derej_reminders.subscriptions s set last_local_date=(now() at time zone s.timezone)::date,
    next_due=derej_reminders.next_due(s.timezone,s.local_time,now())
   from due where s.endpoint=due.endpoint returning s.endpoint
  ) select count(*) into n from claimed;
  if n<>(case when i=1 then 1 else 0 end) then raise exception 'duplicate dispatch';end if;
 end loop;
end $$;
set local role anon;
do $$ begin
 begin perform 1 from derej_reminders.subscriptions;raise exception 'unexpected subscription access';exception when insufficient_privilege then null;end;
 begin perform 1 from derej_reminders.config;raise exception 'unexpected config access';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select 'PASS: private subscriptions and config; Chile timezone and daylight-saving schedule' as result;
