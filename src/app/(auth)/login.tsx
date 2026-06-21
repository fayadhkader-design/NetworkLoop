import { useState } from 'react';
import { Link } from 'expo-router';
import { Alert, StyleSheet } from 'react-native';

import { AuthScreen } from '@/components/auth-screen';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { colors } from '@/constants/colors';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing information', 'Enter your email and password.');
      return;
    }
    if (!isSupabaseConfigured) {
      Alert.alert('Supabase not configured', 'Create a .env file using .env.example first.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) Alert.alert('Could not log in', error.message);
  }

  return (
    <AuthScreen
      title="Welcome back"
      subtitle="Your networking notes, follow-ups, and relationships—all in one place."
      footerText="New to NetworkLoop?"
      footerLink="Create an account"
      footerHref="/signup">
      <FormInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="you@example.com"
      />
      <FormInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="current-password"
        secureTextEntry
        placeholder="Your password"
      />
      <Link href="/forgot-password" style={styles.forgotPassword}>
        Forgot password?
      </Link>
      <Button label="Log in" onPress={handleLogin} loading={loading} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    alignSelf: 'flex-end',
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: -5,
  },
});
