-- ============================================================
-- AXIOS App — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- FOOD LOGS
-- ─────────────────────────────────────────
create table food_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  food_name   text not null,
  calories    integer default 0,
  protein     numeric(6,1) default 0,
  carbs       numeric(6,1) default 0,
  fat         numeric(6,1) default 0,
  meal_type   text check (meal_type in ('Breakfast','Lunch','Dinner','Snack')) default 'Lunch',
  date        date not null,
  logged_at   timestamptz default now(),
  created_at  timestamptz default now()
);
alter table food_logs enable row level security;
create policy "Users manage own food logs"
  on food_logs for all using (auth.uid() = user_id);
create index idx_food_logs_user_date on food_logs(user_id, date);

-- ─────────────────────────────────────────
-- WATER LOGS
-- ─────────────────────────────────────────
create table water_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  oz          integer default 8,
  date        date not null,
  logged_at   timestamptz default now()
);
alter table water_logs enable row level security;
create policy "Users manage own water logs"
  on water_logs for all using (auth.uid() = user_id);
create index idx_water_logs_user_date on water_logs(user_id, date);

-- ─────────────────────────────────────────
-- WEIGHT LOGS
-- ─────────────────────────────────────────
create table weight_logs (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  weight_lbs   numeric(6,1) not null,
  logged_date  date not null,
  note         text,
  created_at   timestamptz default now()
);
alter table weight_logs enable row level security;
create policy "Users manage own weight logs"
  on weight_logs for all using (auth.uid() = user_id);
create index idx_weight_logs_user_date on weight_logs(user_id, logged_date);

-- ─────────────────────────────────────────
-- WORKOUTS + EXERCISES
-- ─────────────────────────────────────────
create table workouts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  workout_date  date not null,
  label         text,
  type          text,
  duration_min  integer,
  created_at    timestamptz default now()
);
alter table workouts enable row level security;
create policy "Users manage own workouts"
  on workouts for all using (auth.uid() = user_id);

create table exercises (
  id             uuid primary key default uuid_generate_v4(),
  workout_id     uuid references workouts(id) on delete cascade not null,
  exercise_name  text not null,
  sets           integer,
  reps           integer,
  weight_lbs     numeric(6,1),
  muscle_group   text,
  created_at     timestamptz default now()
);
alter table exercises enable row level security;
create policy "Users manage own exercises"
  on exercises for all
  using (workout_id in (select id from workouts where user_id = auth.uid()));

-- ─────────────────────────────────────────
-- PRAYER LOGS
-- ─────────────────────────────────────────
create table prayer_logs (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  category     text check (category in ('gratitude','request','intercession','praise','confession')) default 'gratitude',
  prayer_text  text not null,
  note         text,
  answered     boolean default false,
  answered_at  timestamptz,
  date         date default current_date,
  logged_at    timestamptz default now()
);
alter table prayer_logs enable row level security;
create policy "Users manage own prayer logs"
  on prayer_logs for all using (auth.uid() = user_id);
create index idx_prayer_logs_user on prayer_logs(user_id, logged_at desc);

-- ─────────────────────────────────────────
-- DEVOTIONALS
-- ─────────────────────────────────────────
create table devotionals (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references auth.users(id) on delete cascade not null,
  date            date not null,
  scripture_ref   text,
  scripture_text  text,
  reflection      text,
  application     text,
  created_at      timestamptz default now(),
  unique (user_id, date)
);
alter table devotionals enable row level security;
create policy "Users manage own devotionals"
  on devotionals for all using (auth.uid() = user_id);
create index idx_devotionals_user_date on devotionals(user_id, date desc);

-- ─────────────────────────────────────────
-- STOCK WATCHLIST
-- ─────────────────────────────────────────
create table stock_watchlist (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  symbol     text not null,
  added_at   timestamptz default now(),
  unique (user_id, symbol)
);
alter table stock_watchlist enable row level security;
create policy "Users manage own watchlist"
  on stock_watchlist for all using (auth.uid() = user_id);
create index idx_stock_watchlist_user on stock_watchlist(user_id, added_at asc);

-- ─────────────────────────────────────────
-- ADD last_login TO PROFILES
-- Run this if profiles table already exists
-- ─────────────────────────────────────────
alter table profiles add column if not exists last_login  timestamptz;
alter table profiles add column if not exists last_seen   timestamptz;
alter table profiles add column if not exists theme       text;

-- ─────────────────────────────────────────
-- LOGIN HISTORY
-- ─────────────────────────────────────────
create table login_history (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  logged_in_at timestamptz default now(),
  device       text
);
alter table login_history enable row level security;
create policy "Users can insert own login history"
  on login_history for insert with check (auth.uid() = user_id);
create policy "Admins can read all login history"
  on login_history for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
create index idx_login_history_user on login_history(user_id, logged_in_at desc);

-- ─────────────────────────────────────────
-- VERSE POOL (editable from Admin)
-- ─────────────────────────────────────────
create table verse_pool (
  id         uuid primary key default uuid_generate_v4(),
  reference  text not null unique,
  sort_order integer default 0,
  active     boolean default true,
  created_at timestamptz default now()
);
alter table verse_pool enable row level security;
create policy "Authenticated users can read verse pool"
  on verse_pool for select using (auth.uid() is not null);
create policy "Admins can manage verse pool"
  on verse_pool for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
-- Seed with default verses (same as hardcoded fallback)
insert into verse_pool (reference, sort_order) values
  ('john/3/16',           0),  ('psalms/23/1',          1),
  ('philippians/4/13',    2),  ('romans/8/28',          3),
  ('jeremiah/29/11',      4),  ('proverbs/3/5',         5),
  ('isaiah/40/31',        6),  ('matthew/6/33',         7),
  ('joshua/1/9',          8),  ('romans/12/2',          9),
  ('psalms/46/1',         10), ('john/14/6',            11),
  ('galatians/5/22',      12), ('ephesians/2/8',        13),
  ('hebrews/11/1',        14), ('matthew/11/28',        15),
  ('romans/8/38',         16), ('psalms/119/105',       17),
  ('john/16/33',          18), ('philippians/4/6',      19),
  ('1corinthians/13/4',   20), ('james/1/2',            21),
  ('romans/5/8',          22), ('psalms/27/1',          23),
  ('isaiah/41/10',        24), ('john/15/13',           25),
  ('matthew/5/16',        26), ('romans/10/9',          27),
  ('1john/4/19',          28), ('proverbs/31/25',       29)
on conflict (reference) do nothing;

-- ─────────────────────────────────────────
-- APP SETTINGS (maintenance mode etc.)
-- ─────────────────────────────────────────
create table app_settings (
  key   text primary key,
  value text not null default 'false'
);
insert into app_settings (key, value) values ('app_offline', 'false') on conflict (key) do nothing;
insert into app_settings (key, value) values ('app_version', '1.0.0') on conflict (key) do nothing;
insert into app_settings (key, value) values ('release_notes', '') on conflict (key) do nothing;
alter table app_settings enable row level security;
create policy "Anyone can read app_settings"
  on app_settings for select using (true);
create policy "Only admins can modify app_settings"
  on app_settings for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- ─────────────────────────────────────────
-- PLAID ITEMS (bank connections)
-- ─────────────────────────────────────────
create table if not exists plaid_items (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  access_token     text not null,
  item_id          text not null,
  institution_name text,
  created_at       timestamptz default now(),
  unique (user_id)
);
alter table plaid_items enable row level security;
create policy "Users manage own plaid items"
  on plaid_items for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- BILLS
-- ─────────────────────────────────────────
create table if not exists bills (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  payee        text not null,
  amount       numeric(10,2) not null default 0,
  due_day      integer not null check (due_day between 1 and 31),
  frequency    text check (frequency in ('monthly','yearly','weekly','one-time')) default 'monthly',
  category     text default 'other',
  autopay      boolean default false,
  notes        text,
  paid_months  text[] default '{}',
  created_at   timestamptz default now()
);
alter table bills enable row level security;
create policy "Users manage own bills"
  on bills for all using (auth.uid() = user_id);
create index if not exists idx_bills_user_due on bills(user_id, due_day);

-- ─────────────────────────────────────────
-- WEBAUTHN CREDENTIALS
-- ─────────────────────────────────────────
create table if not exists webauthn_credentials (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  credential_id  text not null,
  public_key     text not null,
  created_at     timestamptz default now(),
  unique (user_id)
);
alter table webauthn_credentials enable row level security;
create policy "Users manage own webauthn credentials"
  on webauthn_credentials for all using (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- CALENDAR EVENTS
-- ─────────────────────────────────────────
create table if not exists calendar_events (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  title          text not null,
  date           date not null,
  time           time,
  type           text check (type in ('general','workout','prayer','meal','finance')) default 'general',
  notes          text,
  recurring      text check (recurring in ('none','daily','weekly')) default 'none',
  email_reminder boolean default false,
  reminder_sent  boolean default false,
  created_at     timestamptz default now()
);
alter table calendar_events enable row level security;
create policy "Users manage own calendar events"
  on calendar_events for all using (auth.uid() = user_id);
create index if not exists idx_calendar_events_user_date on calendar_events(user_id, date);

-- ─────────────────────────────────────────
-- ROUTINE ITEMS
-- ─────────────────────────────────────────
create table if not exists routine_items (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid references auth.users(id) on delete cascade not null,
  title              text not null,
  routine_type       text check (routine_type in ('morning','night')) not null,
  position           integer default 0,
  reminder_time      time,
  reminder_enabled   boolean default false,
  calendar_event_id  uuid,
  created_at         timestamptz default now()
);
alter table routine_items enable row level security;
create policy "Users manage own routine items"
  on routine_items for all using (auth.uid() = user_id);
create index if not exists idx_routine_items_user on routine_items(user_id, routine_type, position);
-- New columns (run if table already exists)
alter table routine_items add column if not exists category     text default 'other';
alter table routine_items add column if not exists duration_min integer;
alter table routine_items add column if not exists notes        text;

-- ─────────────────────────────────────────
-- ROUTINE LOGS (daily completion tracking)
-- ─────────────────────────────────────────
create table if not exists routine_logs (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  item_id      uuid references routine_items(id) on delete cascade not null,
  date         date not null,
  completed    boolean default false,
  completed_at timestamptz,
  created_at   timestamptz default now(),
  unique (user_id, item_id, date)
);
alter table routine_logs enable row level security;
create policy "Users manage own routine logs"
  on routine_logs for all using (auth.uid() = user_id);
create index if not exists idx_routine_logs_user_date on routine_logs(user_id, date);
