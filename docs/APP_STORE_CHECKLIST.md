# NetworkLoop App Store Checklist

This checklist separates completed engineering work from steps that require the app owner's
accounts, legal identity, final URLs, or business decisions.

## Completed in the app

- [x] Unique iOS bundle identifier: `com.fayadhkader.networkloop`
- [x] Version and build number configured
- [x] Original 1024×1024 app icon with no transparency
- [x] Branded splash screen and web favicon
- [x] Export-compliance declaration for standard HTTPS encryption
- [x] Email sign-up and confirmation guidance
- [x] Forgot-password and reset-password flows
- [x] In-app privacy policy
- [x] In-app support page
- [x] In-app permanent account deletion
- [x] Per-user row-level database security
- [x] EAS production, preview, and development build profiles
- [x] Draft App Store description, keywords, review notes, and privacy answers
- [x] Public web versions of the privacy and support pages, ready to deploy

## Owner actions before TestFlight

- [ ] Join the Apple Developer Program.
- [ ] Create an Expo account and run `eas login`.
- [ ] Run `eas init` so Expo adds the project ID to app configuration.
- [x] Add a monitored support email to `.env` as `EXPO_PUBLIC_SUPPORT_EMAIL`.
- [x] Deploy the app, privacy policy, and support page to a public HTTPS domain.
- [x] Replace the placeholder URLs in `.env` with the deployed URLs.
- [x] Add the deployed URLs and `networkloop://**` to Supabase Auth redirect URLs.
- [ ] Configure custom SMTP in Supabase for production confirmation and reset emails.
- [ ] Create a production EAS build and test it on a physical iPhone.
- [ ] Confirm account deletion on a disposable test account.

## Owner actions in App Store Connect

- [ ] Create the NetworkLoop app record using bundle ID `com.fayadhkader.networkloop`.
- [ ] Add the privacy-policy URL and support URL.
- [ ] Complete App Privacy using `APP_PRIVACY_ANSWERS.md`.
- [ ] Add screenshots from supported iPhone sizes.
- [ ] Add the description, subtitle, keywords, and review notes from `APP_STORE_METADATA.md`.
- [ ] Provide Apple with a working review account containing sample data.
- [ ] Upload/select the TestFlight build.
- [ ] Complete age rating, content rights, pricing, and availability.
- [ ] Submit for App Review.

## Final release checks

- [ ] No placeholder text, email addresses, or domains remain.
- [ ] All links work without requiring a developer computer.
- [ ] Email confirmation opens the installed app.
- [ ] Password reset opens the installed app and updates the password.
- [ ] Privacy policy accurately matches the shipped app and third-party services.
- [ ] The reviewer account works and does not require an inaccessible email code.
- [ ] The app has been tested with VoiceOver, large text, poor connectivity, and empty data.
