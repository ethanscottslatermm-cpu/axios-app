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
