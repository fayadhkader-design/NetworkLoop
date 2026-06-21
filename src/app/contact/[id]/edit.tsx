import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { ContactForm } from '@/components/contact-form';
import { LoadingState } from '@/components/ui/states';
import { supabase } from '@/lib/supabase';
import type { Contact, ContactFormValues } from '@/types/database';

export default function EditContactScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    supabase.from('contacts').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error) Alert.alert('Could not load contact', error.message);
      else setContact(data as Contact);
    });
  }, [id]);

  if (!contact) return <LoadingState label="Loading contact…" />;

  const initialValues: ContactFormValues = {
    name: contact.name,
    company: contact.company ?? '',
    role: contact.role ?? '',
    email: contact.email ?? '',
    linkedin_url: contact.linkedin_url ?? '',
    industry: contact.industry ?? '',
    status: contact.status,
    notes: contact.notes ?? '',
    follow_up_date: contact.follow_up_date ?? '',
  };

  async function updateContact(values: ContactFormValues) {
    const { error } = await supabase.from('contacts').update({
      name: values.name,
      company: values.company || null,
      role: values.role || null,
      email: values.email || null,
      linkedin_url: values.linkedin_url || null,
      industry: values.industry || null,
      status: values.status,
      notes: values.notes || null,
      follow_up_date: values.follow_up_date || null,
    }).eq('id', id);
    if (error) throw error;
    router.back();
  }

  return <ContactForm initialValues={initialValues} submitLabel="Save changes" onSubmit={updateContact} />;
}
