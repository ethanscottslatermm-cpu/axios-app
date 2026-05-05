-- Equipment Scanner: user_equipment table
-- Run this in the Supabase SQL editor

create table if not exists public.user_equipment (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  equipment_name text not null,
  equipment_type text,
  scanned_at     timestamptz not null default now()
);

-- Index for fast per-user queries
create index if not exists user_equipment_user_id_idx on public.user_equipment(user_id);

-- Row Level Security
alter table public.user_equipment enable row level security;

create policy "Users can view their own equipment"
  on public.user_equipment for select
  using (auth.uid() = user_id);

create policy "Users can insert their own equipment"
  on public.user_equipment for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own equipment"
  on public.user_equipment for delete
  using (auth.uid() = user_id);
