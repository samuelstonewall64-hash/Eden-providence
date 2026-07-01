-- =========================================
-- GROUPE SCOLAIRE EDEN PROVIDENCE
-- Schema minimal pour partager le CMS public
-- Version corrigée (compatible PostgreSQL / Supabase)
-- =========================================
-- Astuce : PostgreSQL ne supporte pas "CREATE POLICY IF NOT EXISTS".
-- On supprime donc la policy si elle existe déjà, puis on la recrée.
-- Ce script peut être exécuté plusieurs fois sans erreur.
-- =========================================

create extension if not exists pgcrypto;

create table if not exists public.site_state (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_state enable row level security;

-- Lecture publique du contenu du site
drop policy if exists "Public can read site_state" on public.site_state;
create policy "Public can read site_state"
on public.site_state
for select
using (true);

-- Écriture publique simplifiée pour cette version frontend.
-- IMPORTANT: pour la production sérieuse, remplace cette policy
-- par une authentification admin sécurisée.
drop policy if exists "Public can write site_state" on public.site_state;
create policy "Public can write site_state"
on public.site_state
for insert
with check (true);

drop policy if exists "Public can update site_state" on public.site_state;
create policy "Public can update site_state"
on public.site_state
for update
using (true)
with check (true);

insert into public.site_state (id, data)
values ('public-site', '{}'::jsonb)
on conflict (id) do nothing;

-- Ajout de la table à la publication realtime.
-- On ignore l'erreur si la table y est déjà (évite un blocage si le script
-- est exécuté plusieurs fois).
do $$
begin
  alter publication supabase_realtime add table public.site_state;
exception
  when duplicate_object then
    null;
end;
$$;

-- =========================================
-- Storage bucket pour médias admin/public
-- =========================================
insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do nothing;

-- Lecture publique des fichiers
drop policy if exists "Public can read site-media" on storage.objects;
create policy "Public can read site-media"
on storage.objects
for select
using (bucket_id = 'site-media');

-- Upload public simplifié pour cette version frontend.
-- IMPORTANT: à sécuriser ensuite avec auth admin.
drop policy if exists "Public can upload site-media" on storage.objects;
create policy "Public can upload site-media"
on storage.objects
for insert
with check (bucket_id = 'site-media');

drop policy if exists "Public can update site-media" on storage.objects;
create policy "Public can update site-media"
on storage.objects
for update
using (bucket_id = 'site-media')
with check (bucket_id = 'site-media');

drop policy if exists "Public can delete site-media" on storage.objects;
create policy "Public can delete site-media"
on storage.objects
for delete
using (bucket_id = 'site-media');
