# App Store Connect App Privacy Draft

These are draft answers based on NetworkLoop 1.0. Re-check them whenever analytics, advertising,
crash reporting, notifications, or new SDKs are added.

## Data linked to the user

### Contact Info

- Email Address
  - Purpose: App Functionality
  - Linked to the user's identity: Yes
  - Used for tracking: No

- Name
  - Purpose: App Functionality
  - Linked to the user's identity: Yes
  - Used for tracking: No

### User Content

- Other User Content
  - Includes contacts entered by the user, professional notes, conversation history, and next steps
  - Purpose: App Functionality
  - Linked to the user's identity: Yes
  - Used for tracking: No

### Other Data

- Follow-up dates and relationship statuses
  - Purpose: App Functionality
  - Linked to the user's identity: Yes
  - Used for tracking: No

## Data not currently collected

- Precise or coarse location
- Device contact book
- Photos or videos
- Audio
- Health or fitness data
- Financial information
- Purchases
- Browsing or search history outside the app
- Advertising data
- Product interaction analytics
- Crash diagnostics from a third-party SDK

## Tracking

NetworkLoop does not currently track users across apps or websites and does not use advertising
identifiers. “Data Used to Track You” should therefore be No.

## Third-party processor

Supabase processes authentication and database information to provide app functionality. This use
must be disclosed in the privacy policy even though the data is not sold or used for advertising.

## Important future changes

If analytics, crash reporting, push notifications, social login, payments, or marketing SDKs are
added, revisit both this document and the public privacy policy before submitting an update.
