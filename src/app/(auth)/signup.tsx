import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AuthScreen } from '@/components/auth-screen';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { colors } from '@/constants/colors';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [resending, setResending] = useState(false);

  async function handleSignUp() {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Missing information', 'Complete all fields to create your account.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Password too short', 'Use at least 8 characters.');
      return;
    }
    if (!isSupabaseConfigured) {
      Alert.alert('Supabase not configured', 'Create a .env file using .env.example first.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: Linking.createURL('/login'),
      },
    });
    setLoading(false);
    if (error) {
      Alert.alert('Could not sign up', error.message);
      return;
    }
    if (!data.session) setConfirmationEmail(email.trim());
  }

  async function resendConfirmation() {
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: confirmationEmail,
    });
    setResending(false);
    if (error) {
      Alert.alert('Could not resend email', error.message);
      return;
    }
    Alert.alert('Email sent', `We sent another confirmation link to ${confirmationEmail}.`);
  }

  if (confirmationEmail) {
    return (
      <AuthScreen
        title="Check your email"
        subtitle="Your account is almost ready."
        footerText="Already confirmed?"
        footerLink="Log in"
        footerHref="/login">
        <View style={styles.confirmationCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="mail-unread-outline" size={32} color={colors.primary} />
          </View>
          <Text style={styles.confirmationTitle}>Confirm your email address</Text>
          <Text style={styles.confirmationText}>
            We sent a verification link to:
          </Text>
          <Text style={styles.email}>{confirmationEmail}</Text>
          <Text style={styles.confirmationText}>
            Open the email and tap the confirmation link. Then return to NetworkLoop and log in.
          </Text>
          <Text style={styles.spamHint}>
            Can’t find it? Check your spam or promotions folder.
          </Text>
        </View>
        <Button
          label="Resend confirmation email"
          variant="secondary"
          onPress={resendConfirmation}
          loading={resending}
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Create your loop"
      subtitle="Start keeping track of the people and conversations moving your career forward."
      footerText="Already have an account?"
      footerLink="Log in"
      footerHref="/login">
      <FormInput
        label="Full name"
        value={fullName}
        onChangeText={setFullName}
        autoComplete="name"
        placeholder="Alex Morgan"
      />
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
        hint="At least 8 characters"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="new-password"
        secureTextEntry
        placeholder="Create a password"
      />
      <Button label="Create account" onPress={handleSignUp} loading={loading} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  confirmationCard: {
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 22,
  },
  iconCircle: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    marginBottom: 4,
  },
  confirmationTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
  },
  confirmationText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  email: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  spamHint: {
    color: colors.warning,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 4,
  },
});
