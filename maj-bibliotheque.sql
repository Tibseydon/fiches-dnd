-- ─────────────────────────────────────────────────────────────
--  Mise à jour : bibliothèque de contenus importés par le MJ
--  À exécuter UNE fois dans Supabase → SQL Editor → New query → Run.
--  (Sans danger : ne touche ni aux fiches ni au code de campagne.)
-- ─────────────────────────────────────────────────────────────

-- Contenus extraits des livres du MJ : visibles par les membres de la campagne uniquement
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('class', 'subclass', 'species', 'background', 'feat')),
  name text not null,
  source_title text not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.content_items enable row level security;

drop policy if exists "membres lisent la bibliothèque" on public.content_items;
create policy "membres lisent la bibliothèque" on public.content_items
  for select to authenticated using (public.is_member());

drop policy if exists "MJ gère la bibliothèque" on public.content_items;
create policy "MJ gère la bibliothèque" on public.content_items
  for all to authenticated using (public.is_gm()) with check (public.is_gm());
