-- Run this once in the Supabase SQL Editor for an existing NetworkLoop project.
-- New projects get the same function from schema.sql.

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
