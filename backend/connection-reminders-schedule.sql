create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
-- A minute-level database check invokes the function only when a subscription is due.
-- No user subscription exists until explicit device consent and permission.
select cron.schedule('derej-connection-reminders','* * * * *',$job$
  select net.http_post(
    url:='https://ryeztkcyopbmwwaacpxl.supabase.co/functions/v1/connection-reminders',
    headers:=jsonb_build_object('Content-Type','application/json','x-derej-job',c.dispatch_secret),
    body:='{}'::jsonb,timeout_milliseconds:=15000
  ) from derej_reminders.config c
  where c.singleton and c.enabled
    and exists(select 1 from derej_reminders.subscriptions where next_due<=now());
$job$);
