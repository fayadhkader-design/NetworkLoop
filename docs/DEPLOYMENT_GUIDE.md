# NetworkLoop TestFlight and App Store Deployment

## 1. Finish public service configuration

Set these values in `.env`:

```env
EXPO_PUBLIC_SUPPORT_EMAIL=networkloop.review@gmail.com
EXPO_PUBLIC_PRIVACY_URL=https://ok-seven-wheat.vercel.app/privacy
EXPO_PUBLIC_SUPPORT_URL=https://ok-seven-wheat.vercel.app/support
```

Deploy the whole project to Vercel or another Expo-compatible static host. `vercel.json` is already
configured to produce the `dist` directory. Apple must be able to open `/privacy` and `/support`
without logging in.

For Vercel, import the GitHub repository or run:

```bash
npx vercel
```

Add the `EXPO_PUBLIC_*` variables in Vercel project settings before the production deployment.

In Supabase → Authentication → URL Configuration, add:

```text
networkloop://**
https://ok-seven-wheat.vercel.app/**
http://localhost:8086/**
```

The localhost entry is for development only. The custom scheme lets confirmation and password
reset emails reopen the installed app.

## 2. Configure production email

Supabase's default email sender is for development and has low delivery limits. Configure a custom
SMTP provider before inviting public users. Update the sender name to NetworkLoop and test:

- account confirmation
- resend confirmation
- password reset

## 3. EAS project

```bash
npm install
npx eas-cli login
npx eas-cli init
```

The app is connected to the Expo account `fayadhkader` as `@fayadhkader/networkloop`. Its EAS
project ID is committed in app configuration.

## 4. Make a preview build

```bash
npx eas-cli build --platform ios --profile preview
```

Install it on a registered test device and test authentication, contact CRUD, account deletion,
privacy/support links, offline/error states, and deep links.

## 5. Make the App Store build

```bash
npx eas-cli build --platform ios --profile production
```

EAS can create or reuse Apple signing credentials. Use the Apple Developer account that owns the
App Store Connect record.

## 6. Submit to TestFlight

```bash
npx eas-cli submit --platform ios --profile production
```

After Apple processes the build, add internal testers in App Store Connect → TestFlight.

## 7. Submit for App Review

Complete the listing using the drafts in this folder, select the tested build, provide the review
account, answer export-compliance and privacy questions, then submit.
