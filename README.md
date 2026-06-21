# NetworkLoop

NetworkLoop is a personal CRM for students and young professionals who are networking, recruiting, and interviewing. It tracks contacts, conversation notes, and follow-up dates in a focused mobile-first interface.

## Stack

- React Native with Expo SDK 56
- Expo Router
- Supabase Auth and Postgres
- TypeScript

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL Editor.
3. Paste and run [`supabase/schema.sql`](supabase/schema.sql).
4. In Authentication → Providers, make sure Email is enabled.
5. For easier local testing, you can temporarily disable email confirmation under Authentication → Sign In / Providers → Email. Keep confirmation enabled for production.

### 3. Add environment variables

Copy the example:

```bash
cp .env.example .env
```

Find the values in Supabase under Project Settings → API:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The anon key is safe to use in the app because access is protected by the included row-level security policies. Never put a Supabase service-role key in a mobile app.

### 4. Start the app

```bash
npx expo start
```

Then scan the QR code with Expo Go, press `i` for the iOS simulator, `a` for Android, or `w` for the browser.

## Project structure

```text
src/
  app/
    (auth)/                  Login and sign-up
    (tabs)/                  Dashboard and contacts
    contact/                 Create, view, edit, and add conversations
  components/                Reusable UI and forms
  constants/                 Colors
  lib/                       Supabase client and date helpers
  providers/                 Authentication state
  types/                     App data types
supabase/
  schema.sql                 Tables, triggers, indexes, and RLS policies
```

## App Store preparation

The project now includes account deletion, password recovery, privacy and support screens,
production branding, EAS build profiles, and App Store metadata drafts.

Start with [`docs/APP_STORE_CHECKLIST.md`](docs/APP_STORE_CHECKLIST.md), then follow
[`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md).

## Current MVP scope

The app includes authentication, password recovery, private per-user data, dashboard metrics,
contact search, create/edit/delete contacts, follow-up reminders, reverse-chronological
conversation notes, privacy/support information, and permanent account deletion. Push
notifications, native date pickers, and CSV import/export are sensible next releases.
