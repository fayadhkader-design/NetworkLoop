-- NetworkLoop keep-alive RPC
-- Run this once in the Supabase SQL Editor after resuming the project.
--
-- Purpose:
-- GitHub Actions can call this small RPC twice per week so the free Supabase
-- project receives light database activity. It does not read, write, or expose
-- any user data.

create or replace function public.keep_alive()
returns text
language sql
security definer
set search_path = ''
as $$
  select 'ok'::text;
$$;

revoke all on function public.keep_alive() from public;
grant execute on function public.keep_alive() to anon;
grant execute on function public.keep_alive() to authenticated;
