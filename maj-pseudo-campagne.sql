-- ─────────────────────────────────────────────────────────────
--  Mise à jour : pseudo modifiable + réglages de campagne du MJ
--  À exécuter UNE fois dans Supabase → SQL Editor → New query → Run.
--  (Sans danger : ne touche ni aux fiches ni au code de campagne.)
-- ─────────────────────────────────────────────────────────────

-- 1. Chaque joueur peut changer son pseudo (et seulement son pseudo : pas son rôle)
drop policy if exists "chacun modifie son pseudo" on public.profiles;
create policy "chacun modifie son pseudo" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.profiles from anon, authenticated;
grant update (display_name) on public.profiles to authenticated;

alter table public.profiles drop constraint if exists display_name_length;
alter table public.profiles add constraint display_name_length
  check (char_length(trim(display_name)) between 1 and 40);

-- Le nouveau pseudo est recopié sur les fiches du joueur (« joué par … »)
create or replace function public.sync_owner_name() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.display_name is distinct from old.display_name then
    update public.characters
      set data = jsonb_set(data, '{ownerName}', to_jsonb(new.display_name))
      where owner_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_sync_owner_name on public.profiles;
create trigger profiles_sync_owner_name
  after update on public.profiles
  for each row execute function public.sync_owner_name();

-- 2. Réglages de la campagne (une seule ligne), modifiables par le MJ uniquement
create table if not exists public.campaign (
  id int primary key default 1 check (id = 1),
  settings jsonb not null default '{"startLevel": 1}',
  updated_at timestamptz not null default now()
);
insert into public.campaign (id) values (1) on conflict (id) do nothing;

alter table public.campaign enable row level security;

drop policy if exists "membres lisent la campagne" on public.campaign;
create policy "membres lisent la campagne" on public.campaign
  for select to authenticated using (public.is_member());

drop policy if exists "MJ modifie la campagne" on public.campaign;
create policy "MJ modifie la campagne" on public.campaign
  for update to authenticated using (public.is_gm()) with check (public.is_gm());
