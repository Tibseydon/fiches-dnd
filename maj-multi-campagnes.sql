-- ─────────────────────────────────────────────────────────────
--  Mise à jour : plusieurs campagnes, créées et rejointes depuis le site
--  À exécuter UNE fois dans Supabase → SQL Editor → New query → Run.
--
--  - Chacun peut s'inscrire librement, puis créer une campagne (il en devient MJ)
--    ou en rejoindre une avec son code d'invitation.
--  - Les fiches, réglages et contenus de bibliothèque appartiennent à une campagne.
--  - Les données existantes sont rangées dans une campagne « Notre campagne »,
--    avec les mêmes MJ et joueurs. Son code d'invitation est affiché sur le site
--    (onglet Campagne). Le script peut être relancé sans risque.
-- ─────────────────────────────────────────────────────────────

-- Campagnes et membres
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 60),
  join_code text not null unique,
  settings jsonb not null default '{"startLevel": 1}',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.campaign_members (
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'joueur' check (role in ('joueur', 'mj')),
  joined_at timestamptz not null default now(),
  primary key (campaign_id, user_id)
);

alter table public.characters add column if not exists campaign_id uuid references public.campaigns (id) on delete cascade;
alter table public.content_items add column if not exists campaign_id uuid references public.campaigns (id) on delete cascade;
create index if not exists characters_campaign_idx on public.characters (campaign_id);
create index if not exists content_items_campaign_idx on public.content_items (campaign_id);

-- Code d'invitation lisible (ex. K7QM-2XWD), sans caractères ambigus (0/O, 1/I)
create or replace function public.new_join_code() returns text
language plpgsql volatile set search_path = public as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  bytes bytea;
  code text;
begin
  loop
    bytes := uuid_send(gen_random_uuid());
    code := '';
    for i in 0..7 loop
      code := code || substr(alphabet, 1 + (get_byte(bytes, i) % 32), 1);
    end loop;
    code := substr(code, 1, 4) || '-' || substr(code, 5, 4);
    exit when not exists (select 1 from public.campaigns where join_code = code);
  end loop;
  return code;
end;
$$;

-- Fonctions d'aide (security definer : pas de récursion des règles)
create or replace function public.is_campaign_member(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.campaign_members where campaign_id = cid and user_id = auth.uid());
$$;

create or replace function public.is_campaign_gm(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.campaign_members where campaign_id = cid and user_id = auth.uid() and role = 'mj');
$$;

create or replace function public.shares_campaign(other uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.campaign_members a
    join public.campaign_members b on a.campaign_id = b.campaign_id
    where a.user_id = auth.uid() and b.user_id = other
  );
$$;

-- MJ d'au moins une campagne (utilisé par la fonction « extraire-livre »)
create or replace function public.is_gm() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.campaign_members where user_id = auth.uid() and role = 'mj');
$$;

-- Créer une campagne : son créateur en devient MJ
create or replace function public.create_campaign(p_name text) returns public.campaigns
language plpgsql security definer set search_path = public as $$
declare c public.campaigns;
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'NON_CONNECTE';
  end if;
  insert into public.campaigns (name, join_code, created_by)
    values (trim(p_name), public.new_join_code(), auth.uid())
    returning * into c;
  insert into public.campaign_members (campaign_id, user_id, role) values (c.id, auth.uid(), 'mj');
  return c;
end;
$$;

-- Rejoindre une campagne avec son code (tirets et espaces facultatifs, majuscules ou non)
create or replace function public.join_campaign(p_code text) returns public.campaigns
language plpgsql security definer set search_path = public as $$
declare c public.campaigns;
begin
  if auth.uid() is null or not exists (select 1 from public.profiles where id = auth.uid()) then
    raise exception 'NON_CONNECTE';
  end if;
  select * into c from public.campaigns
    where replace(join_code, '-', '') = upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  if not found then
    raise exception 'CODE_INVALIDE';
  end if;
  insert into public.campaign_members (campaign_id, user_id, role)
    values (c.id, auth.uid(), 'joueur')
    on conflict (campaign_id, user_id) do nothing;
  return c;
end;
$$;

-- Nouveau code d'invitation (l'ancien ne fonctionne plus)
create or replace function public.regenerate_join_code(p_campaign uuid) returns text
language plpgsql security definer set search_path = public as $$
declare code text;
begin
  if not public.is_campaign_gm(p_campaign) then
    raise exception 'RESERVE_AU_MJ';
  end if;
  code := public.new_join_code();
  update public.campaigns set join_code = code where id = p_campaign;
  return code;
end;
$$;

-- L'inscription n'exige plus de code : on rejoint les campagnes depuis le site
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Reprise des données existantes dans une première campagne
do $$
declare cid uuid;
begin
  if not exists (select 1 from public.campaigns)
     and (exists (select 1 from public.profiles) or exists (select 1 from public.characters)) then
    insert into public.campaigns (name, join_code, settings, created_by)
    values (
      'Notre campagne',
      public.new_join_code(),
      coalesce((select settings from public.campaign where id = 1), '{"startLevel": 1}'),
      (select id from public.profiles where role = 'mj' order by created_at limit 1)
    )
    returning id into cid;
    insert into public.campaign_members (campaign_id, user_id, role)
      select cid, id, role from public.profiles
      on conflict do nothing;
    update public.characters set campaign_id = cid where campaign_id is null;
    update public.content_items set campaign_id = cid where campaign_id is null;
  end if;
exception when undefined_table then
  -- Ancienne table « campaign » absente : on recommence sans elle.
  if not exists (select 1 from public.campaigns) then
    insert into public.campaigns (name, join_code, created_by)
      values ('Notre campagne', public.new_join_code(), (select id from public.profiles where role = 'mj' order by created_at limit 1))
      returning id into cid;
    insert into public.campaign_members (campaign_id, user_id, role)
      select cid, id, role from public.profiles on conflict do nothing;
    update public.characters set campaign_id = cid where campaign_id is null;
    update public.content_items set campaign_id = cid where campaign_id is null;
  end if;
end $$;

-- Le propriétaire et la campagne d'une fiche ne changent pas
create or replace function public.keep_owner() returns trigger
language plpgsql as $$
begin
  new.owner_id := old.owner_id;
  new.campaign_id := old.campaign_id;
  new.updated_at := now();
  return new;
end;
$$;

-- Sécurité au niveau des lignes
alter table public.campaigns enable row level security;
alter table public.campaign_members enable row level security;

revoke insert, update, delete on public.campaigns from anon, authenticated;
grant select on public.campaigns to authenticated;
grant update (name, settings) on public.campaigns to authenticated;
grant delete on public.campaigns to authenticated;
revoke insert on public.campaign_members from anon, authenticated;
grant select, update (role), delete on public.campaign_members to authenticated;

drop policy if exists "membres voient la campagne" on public.campaigns;
create policy "membres voient la campagne" on public.campaigns
  for select to authenticated using (public.is_campaign_member(id));
drop policy if exists "MJ modifie la campagne" on public.campaigns;
create policy "MJ modifie la campagne" on public.campaigns
  for update to authenticated using (public.is_campaign_gm(id)) with check (public.is_campaign_gm(id));
drop policy if exists "MJ supprime la campagne" on public.campaigns;
create policy "MJ supprime la campagne" on public.campaigns
  for delete to authenticated using (public.is_campaign_gm(id));

drop policy if exists "membres voient les membres" on public.campaign_members;
create policy "membres voient les membres" on public.campaign_members
  for select to authenticated using (public.is_campaign_member(campaign_id));
drop policy if exists "MJ change les rôles" on public.campaign_members;
create policy "MJ change les rôles" on public.campaign_members
  for update to authenticated using (public.is_campaign_gm(campaign_id)) with check (public.is_campaign_gm(campaign_id));
drop policy if exists "quitter ou retirer un membre" on public.campaign_members;
create policy "quitter ou retirer un membre" on public.campaign_members
  for delete to authenticated using (user_id = auth.uid() or public.is_campaign_gm(campaign_id));

drop policy if exists "membres lisent les profils" on public.profiles;
create policy "membres lisent les profils" on public.profiles
  for select to authenticated using (id = auth.uid() or public.shares_campaign(id));

drop policy if exists "membres lisent les fiches" on public.characters;
create policy "membres lisent les fiches" on public.characters
  for select to authenticated using (public.is_campaign_member(campaign_id));
drop policy if exists "membres créent leurs fiches" on public.characters;
create policy "membres créent leurs fiches" on public.characters
  for insert to authenticated with check (owner_id = auth.uid() and public.is_campaign_member(campaign_id));
drop policy if exists "propriétaire ou MJ modifie" on public.characters;
create policy "propriétaire ou MJ modifie" on public.characters
  for update to authenticated
  using (owner_id = auth.uid() or public.is_campaign_gm(campaign_id))
  with check (owner_id = auth.uid() or public.is_campaign_gm(campaign_id));
drop policy if exists "propriétaire ou MJ supprime" on public.characters;
create policy "propriétaire ou MJ supprime" on public.characters
  for delete to authenticated using (owner_id = auth.uid() or public.is_campaign_gm(campaign_id));

drop policy if exists "membres lisent la bibliothèque" on public.content_items;
create policy "membres lisent la bibliothèque" on public.content_items
  for select to authenticated using (public.is_campaign_member(campaign_id));
drop policy if exists "MJ gère la bibliothèque" on public.content_items;
create policy "MJ gère la bibliothèque" on public.content_items
  for all to authenticated using (public.is_campaign_gm(campaign_id)) with check (public.is_campaign_gm(campaign_id));
