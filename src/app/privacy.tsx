import { LegalScreen, LegalSection } from '@/components/legal-screen';
import { PRIVACY_EFFECTIVE_DATE } from '@/constants/app';

export default function PrivacyScreen() {
  return (
    <LegalScreen title="Privacy Policy" updated={PRIVACY_EFFECTIVE_DATE}>
      <LegalSection title="What NetworkLoop stores">
        NetworkLoop stores your account email and name, plus the professional contacts, notes,
        conversation history, and follow-up dates you choose to enter. You should only add
        information you are permitted to keep.
      </LegalSection>
      <LegalSection title="How the information is used">
        Your information is used only to provide the personal CRM features you request, including
        authentication, contact organization, conversation history, and follow-up reminders.
        NetworkLoop does not sell your information or use it for third-party advertising.
      </LegalSection>
      <LegalSection title="Storage and service providers">
        Account and CRM data are stored using Supabase, which provides authentication and database
        infrastructure. Data is transmitted over encrypted HTTPS connections. Access controls are
        configured so authenticated users can access only their own records.
      </LegalSection>
      <LegalSection title="Retention and deletion">
        Data remains until you remove individual records or delete your account. The in-app Delete
        Account feature permanently removes your authentication account, contacts, and conversation
        notes. Some limited records may be retained when required for security or legal compliance.
      </LegalSection>
      <LegalSection title="Contact information about other people">
        NetworkLoop lets you enter professional contact details and notes about people you meet.
        You are responsible for using that information lawfully, respectfully, and only for
        legitimate personal networking or recruiting purposes.
      </LegalSection>
      <LegalSection title="Children">
        NetworkLoop is intended for students and professionals aged 13 or older. It is not directed
        to children under 13, and we do not knowingly collect their personal information.
      </LegalSection>
      <LegalSection title="Questions">
        Use the Support page in NetworkLoop for privacy questions or data requests. This policy may
        be updated as the app changes; the effective date above will be revised when that happens.
      </LegalSection>
    </LegalScreen>
  );
}
