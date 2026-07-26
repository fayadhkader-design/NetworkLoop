import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AuthScreen } from '@/components/auth-screen';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  async function updatePassword() {
    if (!session) {
      Alert.alert('Open your reset link', 'Use the password-reset link from your email before choosing a new password.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Password too short', 'Use at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      Alert.alert('Passwords do not match', 'Enter the same password twice.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      Alert.alert('Could not update password', error.message);
      return;
    }
    Alert.alert('Password updated', 'Your new password is ready.', [
      { text: 'Continue', onPress: () => router.replace('/(tabs)') },
    ]);
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
      <Button label="Update password" onPress={updatePassword} loading={loading} />
    </AuthScreen>
  );
}
