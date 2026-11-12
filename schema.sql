-- TN-Naun Designer database schema.
-- Run in Supabase SQL Editor. Review existing production data before applying changes.
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  category text default 'Logo Design',
  image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

create table if not exists public.card_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  card_type text not null check (card_type in ('royal', 'gold')),
  full_name text not null,
  email text not null,
  phone text,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'revoked')),
  created_at timestamptz not null default now()
);

-- Safe additive migration for databases created from the earlier starter schema.
alter table public.card_requests add column if not exists user_id uuid references auth.users(id) on delete cascade;
create index if not exists card_requests_user_type_status_idx on public.card_requests(user_id, card_type, status);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  client_display_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  project_title text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

create table if not exists public.page_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;
alter table public.messages enable row level security;
alter table public.card_requests enable row level security;
alter table public.reviews enable row level security;
alter table public.admin_notifications enable row level security;
alter table public.admin_users enable row level security;
alter table public.page_events enable row level security;
alter table public.push_subscriptions enable row level security;

-- Public visitors can read published portfolio content only.
drop policy if exists "published projects readable" on public.projects;
create policy "published projects readable" on public.projects for select using (is_published = true);
drop policy if exists "published reviews readable" on public.reviews;
create policy "published reviews readable" on public.reviews for select using (is_published = true);

-- Private tables intentionally have no public policies. Server routes use the service-role key
-- only after checking the signed-in user and administrator role where required.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', false, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
