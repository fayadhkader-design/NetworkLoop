import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AuthScreen } from '@/components/auth-screen';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState('');

  async function sendResetLink() {
    if (!email.trim()) {
      Alert.alert('Email required', 'Enter the email address for your NetworkLoop account.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: Linking.createURL('/reset-password'),
    });
    setLoading(false);
    if (error) {
      Alert.alert('Could not send reset link', error.message);
      return;
    }
    setSentTo(email.trim());
  }

  return (
    <AuthScreen
      title={sentTo ? 'Check your email' : 'Reset your password'}
      subtitle={sentTo ? 'We sent you a secure password-reset link.' : 'Enter your email and we’ll help you get back in.'}
      footerText="Remembered your password?"
      footerLink="Log in"
      footerHref="/login">
      {sentTo ? (
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Reset link sent</Text>
          <Text style={styles.noticeText}>
            Open the email sent to {sentTo}, tap the link, and choose a new password.
          </Text>
          <Text style={styles.hint}>Check spam or promotions if it doesn’t arrive.</Text>
        </View>
      ) : (
        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="you@example.com"
        />
      )}
      <Button
        label={sentTo ? 'Resend reset link' : 'Send reset link'}
        onPress={sendResetLink}
        loading={loading}
        variant={sentTo ? 'secondary' : 'primary'}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  notice: {
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 20,
  },
  noticeTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  noticeText: { color: colors.textMuted, fontSize: 14, lineHeight: 21 },
  hint: { color: colors.warning, fontSize: 12, lineHeight: 18 },
});
