-- NetworkLoop database schema
-- Run this entire file in the Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  company text,
  role text,
  email text,
  linkedin_url text,
  industry text,
  status text not null default 'Reached out'
    check (status in (
      'Reached out',
      'Responded',
      'Call scheduled',
      'Spoke with them',
      'Follow-up needed',
      'Strong connection',
      'Not interested'
    )),
  notes text,
  follow_up_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  conversation_date date not null default current_date,
  conversation_type text not null
    check (conversation_type in (
      'Networking call',
      'Interview',
      'Coffee chat',
      'Recruiter email',
      'Follow-up',
      'Other'
    )),
  notes text,
  next_step text,
  created_at timestamptz not null default now()
);

create index if not exists contacts_user_id_idx on public.contacts(user_id);
create index if not exists contacts_follow_up_date_idx on public.contacts(user_id, follow_up_date);
create index if not exists conversations_contact_id_idx on public.conversations(contact_id);
create index if not exists conversations_user_id_idx on public.conversations(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contacts_set_updated_at on public.contacts;
create trigger contacts_set_updated_at
before update on public.contacts
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Apple requires apps that create accounts to let users delete them in-app.
-- This function deletes only the currently authenticated user. Foreign-key
-- cascades then remove that user's profile, contacts, and conversations.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from auth.users
  where id = (select auth.uid());
end;
$$;

revoke all on function public.delete_own_account() from public;
revoke all on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;

alter table public.profiles enable row level security;
alter table public.contacts enable row level security;
alter table public.conversations enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles for select
using ((select auth.uid()) = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can view own contacts" on public.contacts;
create policy "Users can view own contacts"
on public.contacts for select
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create own contacts" on public.contacts;
create policy "Users can create own contacts"
on public.contacts for insert
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own contacts" on public.contacts;
create policy "Users can update own contacts"
on public.contacts for update
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own contacts" on public.contacts;
create policy "Users can delete own contacts"
on public.contacts for delete
using ((select auth.uid()) = user_id);

drop policy if exists "Users can view own conversations" on public.conversations;
create policy "Users can view own conversations"
on public.conversations for select
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create own conversations" on public.conversations;
create policy "Users can create own conversations"
on public.conversations for insert
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.contacts
    where contacts.id = contact_id
      and contacts.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can update own conversations" on public.conversations;
create policy "Users can update own conversations"
on public.conversations for update
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.contacts
    where contacts.id = contact_id
      and contacts.user_id = (select auth.uid())
  )
);

drop policy if exists "Users can delete own conversations" on public.conversations;
create policy "Users can delete own conversations"
on public.conversations for delete
using ((select auth.uid()) = user_id);
