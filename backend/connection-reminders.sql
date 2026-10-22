-- Private device subscriptions. No reading or writing through the public Data API.
create schema if not exists derej_reminders;
revoke all on schema derej_reminders from public, anon, authenticated;
create table derej_reminders.config (
  singleton boolean primary key default true check(singleton),
  public_key text not null,
  private_key text not null,
  dispatch_secret text not null,
  enabled boolean not null default false
);
create table derej_reminders.subscriptions (
  endpoint text primary key,
  token_hash text not null,
  subscription jsonb not null,
  timezone text not null,
  local_time text not null check(local_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  destination text not null check(destination in ('camino','radio')),
  next_due timestamptz not null,
  last_local_date date,
  last_status integer,
  last_test timestamptz,
  updated_at timestamptz not null default now()
);
create index connection_reminders_due on derej_reminders.subscriptions(next_due);
create table derej_reminders.rate_limit (
  bucket timestamptz primary key,
  attempts integer not null default 0
);
alter table derej_reminders.config enable row level security;
alter table derej_reminders.subscriptions enable row level security;
alter table derej_reminders.rate_limit enable row level security;
revoke all on all tables in schema derej_reminders from public,anon,authenticated;

create function derej_reminders.next_due(tz text, clock text, after_time timestamptz)
returns timestamptz language sql stable security invoker set search_path='' as $$
  with candidate as (
    select ((after_time at time zone tz)::date + clock::time) at time zone tz as value
  )
  select case when value > after_time then value
    else (((after_time at time zone tz)::date + 1) + clock::time) at time zone tz end
  from candidate;
$$;
revoke all on function derej_reminders.next_due(text,text,timestamptz) from public,anon,authenticated;
