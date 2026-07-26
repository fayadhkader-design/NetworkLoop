# Supabase keep-alive

NetworkLoop uses a free Supabase project. Free projects can pause after low activity over about 7 days.

This repo includes a GitHub Actions workflow that calls a tiny Supabase RPC twice per week. The RPC returns only `ok`; it does not read or write any user data.

## One-time Supabase setup

1. Open the NetworkLoop project in Supabase.
2. Resume the project if it is paused.
3. Go to SQL Editor.
4. Run `supabase/keep-alive.sql`.

## One-time GitHub setup

Add these repository secrets in GitHub:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Then go to Actions → Supabase keep-alive → Run workflow to test it manually.

## Notes

This is a free best-effort remedy. It may reduce automatic pauses, but Supabase Pro is the only guaranteed way to prevent free-project pausing.
