import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ChipSelect } from '@/components/ui/chip-select';
import { FormInput } from '@/components/ui/form-input';
import { colors } from '@/constants/colors';
import { isValidDateString } from '@/lib/date';
import { CONTACT_STATUSES, ContactFormValues } from '@/types/database';

export const EMPTY_CONTACT: ContactFormValues = {
  name: '',
  company: '',
  role: '',
  email: '',
  linkedin_url: '',
  industry: '',
  status: 'Reached out',
  notes: '',
  follow_up_date: '',
};

export function ContactForm({
  initialValues = EMPTY_CONTACT,
  submitLabel,
  onSubmit,
}: {
  initialValues?: ContactFormValues;
  submitLabel: string;
  onSubmit: (values: ContactFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit() {
    if (!values.name.trim()) {
      Alert.alert('Name required', 'Add a name for this contact.');
      return;
    }
    if (values.follow_up_date && !isValidDateString(values.follow_up_date)) {
      Alert.alert('Check the date', 'Use YYYY-MM-DD, for example 2026-07-15.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({
        ...values,
        name: values.name.trim(),
        company: values.company.trim(),
        role: values.role.trim(),
        email: values.email.trim(),
        linkedin_url: values.linkedin_url.trim(),
        industry: values.industry.trim(),
        notes: values.notes.trim(),
        follow_up_date: values.follow_up_date.trim(),
      });
    } catch (error) {
      Alert.alert('Something went wrong', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <FormInput label="Name *" value={values.name} onChangeText={(text) => update('name', text)} placeholder="Jordan Lee" />
        <FormInput label="Company" value={values.company} onChangeText={(text) => update('company', text)} placeholder="Acme" />
        <FormInput label="Role" value={values.role} onChangeText={(text) => update('role', text)} placeholder="Product Manager" />
        <FormInput
          label="Email"
          value={values.email}
          onChangeText={(text) => update('email', text)}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="jordan@example.com"
        />
        <FormInput
          label="LinkedIn URL"
          value={values.linkedin_url}
          onChangeText={(text) => update('linkedin_url', text)}
          autoCapitalize="none"
          keyboardType="url"
          placeholder="https://linkedin.com/in/..."
        />
        <FormInput label="Industry" value={values.industry} onChangeText={(text) => update('industry', text)} placeholder="Technology" />
        <ChipSelect label="Status" options={CONTACT_STATUSES} value={values.status} onChange={(status) => update('status', status)} />
        <FormInput
          label="Next follow-up date"
          hint="Use YYYY-MM-DD. Leave blank if no follow-up is scheduled."
          value={values.follow_up_date}
          onChangeText={(text) => update('follow_up_date', text)}
          autoCapitalize="none"
          keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
          placeholder="2026-07-15"
        />
        <FormInput
          label="General notes"
          value={values.notes}
          onChangeText={(text) => update('notes', text)}
          multiline
          placeholder="How you met, shared interests, context to remember…"
        />
        <View style={styles.footer}>
          <Button label={submitLabel} onPress={handleSubmit} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { gap: 19, padding: 20, paddingBottom: 42 },
  footer: { marginTop: 5 },
});
