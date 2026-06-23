-- ─────────────────────────────────────────
-- CUSTOM WATER CONTAINERS
-- ─────────────────────────────────────────
create table if not exists custom_water_containers (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  amount_oz  integer not null,
  created_at timestamptz default now()
);

alter table custom_water_containers enable row level security;
create policy "Users manage own custom containers"
  on custom_water_containers for all using (auth.uid() = user_id);
create index idx_custom_containers_user on custom_water_containers(user_id, created_at);
