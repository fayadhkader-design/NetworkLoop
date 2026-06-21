import { useRouter } from 'expo-router';

import { ContactForm } from '@/components/contact-form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import type { ContactFormValues } from '@/types/database';

export default function NewContactScreen() {
  const router = useRouter();
  const { user } = useAuth();

  async function createContact(values: ContactFormValues) {
    if (!user) throw new Error('You must be logged in.');
    const { error } = await supabase.from('contacts').insert({
      user_id: user.id,
      name: values.name,
      company: values.company || null,
      role: values.role || null,
      email: values.email || null,
      linkedin_url: values.linkedin_url || null,
      industry: values.industry || null,
      status: values.status,
      notes: values.notes || null,
      follow_up_date: values.follow_up_date || null,
    });
    if (error) throw error;
    router.back();
  }

  return <ContactForm submitLabel="Save contact" onSubmit={createContact} />;
}
