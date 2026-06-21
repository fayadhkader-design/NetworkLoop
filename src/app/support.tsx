import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { LegalScreen, LegalSection } from '@/components/legal-screen';
import { Button } from '@/components/ui/button';
import { APP_VERSION, SUPPORT_EMAIL } from '@/constants/app';
import { colors } from '@/constants/colors';

export default function SupportScreen() {
  return (
    <LegalScreen title="NetworkLoop Support">
      <View style={styles.hero}>
        <Ionicons name="help-buoy-outline" size={34} color={colors.primary} />
        <Text style={styles.heroTitle}>How can we help?</Text>
        <Text style={styles.heroText}>NetworkLoop version {APP_VERSION}</Text>
      </View>
      <LegalSection title="Account help">
        Use “Forgot password?” on the login screen if you cannot sign in. Email-confirmation and
        password-reset links may appear in your spam or promotions folder.
      </LegalSection>
      <LegalSection title="Delete your account">
        Open Settings → Delete account. After confirmation, your account, contacts, and
        conversations are permanently deleted. You do not need to contact support to complete this.
      </LegalSection>
      <LegalSection title="Report a problem">
        Include what you were doing, what you expected, and what happened. Do not include passwords
        or sensitive conversation notes in a support message.
      </LegalSection>
      {SUPPORT_EMAIL ? (
        <Button
          label={`Email ${SUPPORT_EMAIL}`}
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=NetworkLoop Support`)}
        />
      ) : (
        <View style={styles.setupNotice}>
          <Text style={styles.setupTitle}>Support email pending</Text>
          <Text style={styles.setupText}>
            The app owner will add a monitored support email before public release.
          </Text>
        </View>
      )}
    </LegalScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 7,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    padding: 24,
  },
  heroTitle: { color: colors.text, fontSize: 20, fontWeight: '900' },
  heroText: { color: colors.textMuted, fontSize: 13 },
  setupNotice: {
    gap: 5,
    borderRadius: 16,
    backgroundColor: colors.warningSoft,
    padding: 16,
  },
  setupTitle: { color: colors.warning, fontSize: 14, fontWeight: '900' },
  setupText: { color: colors.warning, fontSize: 13, lineHeight: 19 },
});
