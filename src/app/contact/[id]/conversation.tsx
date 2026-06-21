import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ChipSelect } from '@/components/ui/chip-select';
import { FormInput } from '@/components/ui/form-input';
import { colors } from '@/constants/colors';
import { isValidDateString, todayDateString } from '@/lib/date';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import { CONVERSATION_TYPES, ConversationType } from '@/types/database';

export default function AddConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [date, setDate] = useState(todayDateString());
  const [type, setType] = useState<ConversationType>('Networking call');
  const [notes, setNotes] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [loading, setLoading] = useState(false);

  async function saveConversation() {
    if (!user) return;
    if (!isValidDateString(date)) {
      Alert.alert('Check the date', 'Use YYYY-MM-DD, for example 2026-07-15.');
      return;
    }
    if (!notes.trim()) {
      Alert.alert('Add a note', 'Write a short summary of the conversation.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('conversations').insert({
      user_id: user.id,
      contact_id: id,
      conversation_date: date,
      conversation_type: type,
      notes: notes.trim(),
      next_step: nextStep.trim() || null,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Could not save conversation', error.message);
      return;
    }
    router.back();
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormInput
          label="Date"
          hint="Use YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
          autoCapitalize="none"
          placeholder="2026-07-15"
        />
        <ChipSelect label="Conversation type" options={CONVERSATION_TYPES} value={type} onChange={setType} />
        <FormInput
          label="Conversation notes *"
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="What did you discuss? What stood out?"
        />
        <FormInput
          label="Next step"
          value={nextStep}
          onChangeText={setNextStep}
          multiline
          placeholder="Send a thank-you note, apply for the role, reconnect next month…"
        />
        <View style={styles.footer}>
          <Button label="Save conversation" onPress={saveConversation} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { gap: 20, padding: 20, paddingBottom: 42 },
  footer: { marginTop: 5 },
});
