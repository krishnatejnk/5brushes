-- =============================================================
--  5 Brushes — Supabase schema
--  Run this in the Supabase SQL editor (one time).
--  It is idempotent-ish; safe to re-run during setup.
-- =============================================================

-- ---------- extensions ----------
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- =============================================================
--  TABLES
-- =============================================================

-- profiles: one row per user, extends auth.users
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'artist' check (role in ('artist','admin')),
  full_name    text,
  display_name text,
  bio          text,
  location     text,
  phone        text,
  avatar_url   text,
  created_at   timestamptz not null default now()
);

-- artworks: one row per painting
create table if not exists public.artworks (
  id              uuid primary key default gen_random_uuid(),
  artist_id       uuid not null references public.profiles(id) on delete cascade,
  title           text not null,
  description     text,
  medium          text,
  width_cm        numeric,
  height_cm       numeric,
  year            int,
  price_inr       numeric,
  image_url       text,
  image_public_id text,
  status          text not null default 'pending' check (status in ('pending','approved','rejected')),
  review_note     text,
  reviewed_by     uuid references public.profiles(id),
  reviewed_at     timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists artworks_artist_idx on public.artworks(artist_id);
create index if not exists artworks_status_idx on public.artworks(status);

-- =============================================================
--  HELPERS
-- =============================================================

-- is the current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =============================================================
--  TRIGGERS
-- =============================================================

-- 1) Create a profiles row automatically when a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    'artist'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) Prevent artists from self-approving.
--    If a non-admin edits an artwork, force moderation fields back to safe values.
create or replace function public.guard_artwork_moderation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    -- non-admin may never change status or review metadata
    new.status      := old.status;
    new.review_note := old.review_note;
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
  end if;
  return new;
end;
$$;

drop trigger if exists artwork_moderation_guard on public.artworks;
create trigger artwork_moderation_guard
  before update on public.artworks
  for each row execute function public.guard_artwork_moderation();

-- =============================================================
--  ROW LEVEL SECURITY
-- =============================================================

alter table public.profiles enable row level security;
alter table public.artworks enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- (Optional) allow the public to read approved artists' public fields.
-- Uncomment if you build public artist pages:
-- drop policy if exists "profiles public read" on public.profiles;
-- create policy "profiles public read" on public.profiles
--   for select using (true);

-- ---------- artworks ----------
-- read: anyone sees APPROVED art; owner & admin see all of theirs
drop policy if exists "artworks read approved or own" on public.artworks;
create policy "artworks read approved or own" on public.artworks
  for select using (
    status = 'approved'
    or artist_id = auth.uid()
    or public.is_admin()
  );

-- insert: artist creates their own art (forced to pending via column default + guard)
drop policy if exists "artworks insert own" on public.artworks;
create policy "artworks insert own" on public.artworks
  for insert with check (artist_id = auth.uid());

-- update: owner edits their art; admin moderates. The trigger above
-- stops non-admins from touching status / review fields.
drop policy if exists "artworks update own or admin" on public.artworks;
create policy "artworks update own or admin" on public.artworks
  for update using (artist_id = auth.uid() or public.is_admin());

-- delete: owner or admin
drop policy if exists "artworks delete own or admin" on public.artworks;
create policy "artworks delete own or admin" on public.artworks
  for delete using (artist_id = auth.uid() or public.is_admin());

-- =============================================================
--  SEED AN ADMIN
-- =============================================================
-- 1. Create the admin user first (Auth → Users → Add user, or have them
--    sign up through the app and confirm their email).
-- 2. Then promote them by email:
--
--    update public.profiles set role = 'admin'
--    where id = (select id from auth.users where email = 'admin@5brushes.in');
--
-- The /admin route checks role = 'admin'.
