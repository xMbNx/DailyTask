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

-- ---------------------------------------------------------------------------
-- Preferencias de cada usuario (tema, zoom, columnas, orden, categorías
-- ocultas y tareas desplegadas por proyecto), para que te sigan en cualquier
-- equipo. Van en una tabla aparte para no tocar el updated_at de los proyectos
-- (desplegar una tarea no debe contar como cambio del tablero).
-- Si ya tenías el esquema anterior, ejecuta solo este bloque.
-- ---------------------------------------------------------------------------
create table if not exists public.user_prefs (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  prefs jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_prefs enable row level security;

drop policy if exists "own prefs" on public.user_prefs;
create policy "own prefs" on public.user_prefs
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Fusiona solo las claves enviadas (no pisa lo que cambió otro dispositivo).
-- Una clave con valor null se elimina.
create or replace function public.merge_prefs(p_patch jsonb)
returns void
language sql
security invoker
set search_path = public
as $$
  insert into public.user_prefs (user_id, prefs)
  values (auth.uid(), jsonb_strip_nulls(p_patch))
  on conflict (user_id) do update
    set prefs = jsonb_strip_nulls(public.user_prefs.prefs || excluded.prefs || p_patch),
        updated_at = now();
$$;

revoke execute on function public.merge_prefs(jsonb) from public, anon;
grant execute on function public.merge_prefs(jsonb) to authenticated;
