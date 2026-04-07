-- Supabase ダッシュボードの SQL Editor で実行するか、Supabase CLI で適用してください。
-- https://supabase.com/dashboard/project/_/sql

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null default '新しいタスク',
  sender_name text not null default '',
  receiver_name text not null default '',
  priority text not null default '中',
  due_date date,
  status text not null default 'not_started',
  sort_order integer not null default 0,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tasks_priority_check check (priority in ('高', '中', '低')),
  constraint tasks_status_check check (status in ('not_started', 'in_progress', 'done'))
);

create index if not exists tasks_status_sort_idx on public.tasks (status, sort_order);

alter table public.tasks enable row level security;

create policy "tasks_select_authenticated"
  on public.tasks for select
  to authenticated
  using (true);

create policy "tasks_insert_authenticated"
  on public.tasks for insert
  to authenticated
  with check (true);

create policy "tasks_update_authenticated"
  on public.tasks for update
  to authenticated
  using (true)
  with check (true);

create policy "tasks_delete_authenticated"
  on public.tasks for delete
  to authenticated
  using (true);

-- Realtime: Dashboard → Database → Publications → supabase_realtime で
-- public.tasks を有効化するか、次を 1 回だけ実行:
--   alter publication supabase_realtime add table public.tasks;
