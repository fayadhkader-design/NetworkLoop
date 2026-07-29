import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ChipSelect } from '@/components/ui/chip-select';
import { DatePickerField } from '@/components/ui/date-picker-field';
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
        <View style={styles.sheetHandle} />
        <View style={styles.header}>
          <Text style={styles.cancel} onPress={() => router.back()}>Cancel</Text>
          <Text style={styles.title}>Log an interaction</Text>
          <Text style={[styles.cancel, notes.trim() && styles.saveHint]}>Save</Text>
        </View>
        <DatePickerField
          label="Date"
          value={date}
          onChange={setDate}
          hint="Choose when the conversation happened."
          placeholder="Choose a date"
          allowClear={false}
        />
        <ChipSelect label="Type" options={CONVERSATION_TYPES} value={type} onChange={setType} />
        <FormInput
          label="What came out of it *"
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="What did you discuss? What stood out? What should future-you remember?"
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
  content: { gap: 18, padding: 18, paddingBottom: 42 },
  sheetHandle: { width: 38, height: 5, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.16)', alignSelf: 'center', marginBottom: -2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  cancel: { color: colors.textSubtle, fontSize: 15.5, fontWeight: '600' },
  saveHint: { color: colors.primary },
  title: { color: colors.text, fontSize: 16.5, fontWeight: '800', letterSpacing: -0.2 },
  footer: { marginTop: 5 },
});
