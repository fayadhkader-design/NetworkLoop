import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AuthScreen } from '@/components/auth-screen';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function updatePassword() {
    setMessage(null);
    if (!session) {
      setMessage({
        type: 'error',
        text: 'Open the latest password-reset link from your email before choosing a new password.',
      });
      return;
    }
    if (password.length < 8) {
      setMessage({ type: 'error', text: 'Use at least 8 characters for your new password.' });
      return;
    }
    if (password !== confirmation) {
      setMessage({ type: 'error', text: 'Passwords do not match. Enter the same password twice.' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }
    setMessage({ type: 'success', text: 'Password updated. Taking you back into NetworkLoop…' });
    Alert.alert('Password updated', 'Your new password is ready.', [
      { text: 'Continue', onPress: () => router.replace('/(tabs)') },
    ]);
    setTimeout(() => router.replace('/(tabs)'), 1200);
  }

  return (
    <AuthScreen
      title="Choose a new password"
      subtitle="Use a strong password you haven’t used elsewhere."
      footerText="Need a new link?"
      footerLink="Start over"
      footerHref="/login">
      <FormInput
        label="New password"
        hint="At least 8 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="new-password"
        placeholder="New password"
      />
      <FormInput
        label="Confirm new password"
        value={confirmation}
        onChangeText={setConfirmation}
        secureTextEntry
        autoComplete="new-password"
        placeholder="Repeat new password"
      />
      {message ? (
        <View style={[styles.notice, message.type === 'success' ? styles.success : styles.error]}>
          <Text style={[styles.noticeText, message.type === 'success' ? styles.successText : styles.errorText]}>
            {message.text}
          </Text>
        </View>
      ) : null}
      <Button label="Update password" onPress={updatePassword} loading={loading} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  notice: {
    borderRadius: 14,
    padding: 13,
  },
  success: {
    backgroundColor: colors.successSoft,
  },
  error: {
    backgroundColor: colors.dangerSoft,
  },
  noticeText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  successText: {
    color: colors.success,
  },
  errorText: {
    color: colors.danger,
  },
});
