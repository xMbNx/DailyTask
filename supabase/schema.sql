-- Daily Task: esquema de Supabase.
-- Pegar entero en Supabase → SQL Editor → Run (una sola vez).

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (length(name) between 1 and 60),
  -- Mismo formato que los antiguos <proyecto>.json: { "categories": [...] }.
  -- null = proyecto recién creado; la app lo rellena con las categorías por defecto.
  data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, slug)
);

-- updated_at lo pone siempre la base de datos: la app lo usa para detectar
-- si otra pestaña/dispositivo guardó antes (control de concurrencia optimista).
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- Cada usuario solo ve y modifica sus propios proyectos.
alter table public.projects enable row level security;

drop policy if exists "own projects" on public.projects;
create policy "own projects" on public.projects
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
