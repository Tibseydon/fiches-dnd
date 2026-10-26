-- ─────────────────────────────────────────────────────────────
--  Schéma Supabase pour les fiches D&D 5.5
--  À exécuter UNE fois dans Supabase → SQL Editor → New query → Run.
--
--  ⚠️ Remplace CHANGE-MOI (plus bas) par ton code de campagne avant d'exécuter.
-- ─────────────────────────────────────────────────────────────

-- Profils des joueurs (un par compte)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  role text not null default 'joueur' check (role in ('joueur', 'mj')),
  created_at timestamptz not null default now()
);

-- Fiches de personnage : tout le contenu de la fiche est dans `data`
create table if not exists public.characters (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Fonctions d'aide (security definer pour éviter la récursion des règles)
create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid());
$$;

create or replace function public.is_gm() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'mj');
$$;

-- Création du profil à l'inscription, seulement avec le bon code de campagne.
-- Sans le bon code, l'inscription est refusée et aucun compte n'est créé.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'campaign_code', '') <> 'CHANGE-MOI' then
    raise exception 'CAMPAIGN_CODE_INVALID';
  end if;
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Sécurité au niveau des lignes
alter table public.profiles enable row level security;
alter table public.characters enable row level security;

drop policy if exists "membres lisent les profils" on public.profiles;
create policy "membres lisent les profils" on public.profiles
  for select to authenticated using (public.is_member());

drop policy if exists "membres lisent les fiches" on public.characters;
create policy "membres lisent les fiches" on public.characters
  for select to authenticated using (public.is_member());

drop policy if exists "membres créent leurs fiches" on public.characters;
create policy "membres créent leurs fiches" on public.characters
  for insert to authenticated with check (public.is_member() and owner_id = auth.uid());

drop policy if exists "propriétaire ou MJ modifie" on public.characters;
create policy "propriétaire ou MJ modifie" on public.characters
  for update to authenticated
  using (owner_id = auth.uid() or public.is_gm())
  with check (owner_id = auth.uid() or public.is_gm());

drop policy if exists "propriétaire ou MJ supprime" on public.characters;
create policy "propriétaire ou MJ supprime" on public.characters
  for delete to authenticated using (owner_id = auth.uid() or public.is_gm());

-- Le propriétaire d'une fiche ne peut pas être changé
create or replace function public.keep_owner() returns trigger
language plpgsql as $$
begin
  new.owner_id := old.owner_id;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists characters_keep_owner on public.characters;
create trigger characters_keep_owner
  before update on public.characters
  for each row execute function public.keep_owner();

-- Mises à jour en direct (vue du groupe)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'characters'
  ) then
    alter publication supabase_realtime add table public.characters;
  end if;
end $$;
