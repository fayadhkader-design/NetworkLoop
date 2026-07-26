import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

export function AuthScreen({
  title,
  subtitle,
  footerText,
  footerLink,
  footerHref,
  children,
}: PropsWithChildren<{
  title: string;
  subtitle: string;
  footerText: string;
  footerLink: string;
  footerHref: '/login' | '/signup';
}>) {
  const { authError } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}><Ionicons name="repeat" size={28} color={colors.white} /></View>
            <Text style={styles.brandName}>NetworkLoop</Text>
          </View>
          <View style={styles.heading}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          {!isSupabaseConfigured ? (
            <View style={styles.notice}>
              <Ionicons name="information-circle-outline" size={20} color={colors.warning} />
              <Text style={styles.noticeText}>Add your Supabase values to a .env file before signing in.</Text>
            </View>
          ) : null}
          {authError ? (
            <View style={styles.notice}>
              <Ionicons name="cloud-offline-outline" size={20} color={colors.warning} />
              <Text style={styles.noticeText}>{authError}</Text>
            </View>
          ) : null}
          <View style={styles.form}>{children}</View>
          <Text style={styles.footer}>
            {footerText}{' '}
            <Link href={footerHref} style={styles.link}>{footerLink}</Link>
          </Text>
          <View style={styles.legalLinks}>
            <Link href="/privacy" style={styles.legalLink}>Privacy</Link>
            <Text style={styles.legalDot}>•</Text>
            <Link href="/support" style={styles.legalLink}>Support</Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 42 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 42 },
  logo: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  brandName: { color: colors.text, fontSize: 21, fontWeight: '900' },
  heading: { gap: 8, marginBottom: 28 },
  title: { color: colors.text, fontSize: 31, fontWeight: '900', letterSpacing: -0.6 },
  subtitle: { color: colors.textMuted, fontSize: 16, lineHeight: 23 },
  notice: {
    flexDirection: 'row',
    gap: 9,
    borderRadius: 13,
    backgroundColor: colors.warningSoft,
    padding: 13,
    marginBottom: 18,
  },
  noticeText: { flex: 1, color: colors.warning, fontSize: 13, lineHeight: 18 },
  form: { gap: 16 },
  footer: { color: colors.textMuted, textAlign: 'center', marginTop: 28, fontSize: 14 },
  link: { color: colors.primary, fontWeight: '800' },
  legalLinks: { flexDirection: 'row', justifyContent: 'center', gap: 9, marginTop: 15 },
  legalLink: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  legalDot: { color: colors.textMuted, fontSize: 12 },
});
