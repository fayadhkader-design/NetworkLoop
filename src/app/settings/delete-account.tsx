import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  async function deleteAccount() {
    if (confirmation.trim().toUpperCase() !== 'DELETE') {
      Alert.alert('Confirmation required', 'Type DELETE to confirm permanent account deletion.');
      return;
    }
    Alert.alert(
      'Permanently delete account?',
      'Your account, contacts, and conversation notes will be deleted immediately. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete forever',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase.rpc('delete_own_account');
            setLoading(false);
            if (error) {
              Alert.alert('Could not delete account', error.message);
              return;
            }
            await supabase.auth.signOut({ scope: 'local' });
            router.replace('/login');
          },
        },
      ],
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.warning}>
        <Text style={styles.warningTitle}>This action is permanent</Text>
        <Text style={styles.warningText}>
          Deleting your account removes your login, contacts, general notes, conversation history,
          and follow-up dates. NetworkLoop cannot restore them afterward.
        </Text>
      </View>

      <View style={styles.list}>
        <Text style={styles.listTitle}>What will be deleted</Text>
        <Text style={styles.item}>• Your NetworkLoop account and profile</Text>
        <Text style={styles.item}>• Every saved contact</Text>
        <Text style={styles.item}>• All conversation notes and next steps</Text>
        <Text style={styles.item}>• All follow-up dates</Text>
      </View>

      <FormInput
        label='Type "DELETE" to confirm'
        value={confirmation}
        onChangeText={setConfirmation}
        autoCapitalize="characters"
        placeholder="DELETE"
      />
      <Button
        label="Delete my account"
        variant="danger"
        onPress={deleteAccount}
        loading={loading}
        disabled={confirmation.trim().toUpperCase() !== 'DELETE'}
      />
      <Button label="Keep my account" variant="ghost" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: 20, padding: 20, paddingBottom: 42 },
  warning: { gap: 8, borderRadius: 18, backgroundColor: colors.dangerSoft, padding: 18 },
  warningTitle: { color: colors.danger, fontSize: 18, fontWeight: '900' },
  warningText: { color: colors.danger, fontSize: 14, lineHeight: 21 },
  list: {
    gap: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 18,
  },
  listTitle: { color: colors.text, fontSize: 16, fontWeight: '900', marginBottom: 3 },
  item: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
});
