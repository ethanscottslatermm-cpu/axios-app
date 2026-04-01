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
