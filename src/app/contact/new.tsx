import { useRouter } from 'expo-router';

import { ContactForm } from '@/components/contact-form';
import { requestReminderPermission, scheduleFollowUpReminder } from '@/lib/reminders';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import type { ContactFormValues } from '@/types/database';

export default function NewContactScreen() {
  const router = useRouter();
  const { user } = useAuth();

  async function createContact(values: ContactFormValues) {
    if (!user) throw new Error('You must be logged in.');
    const { data, error } = await supabase.from('contacts').insert({
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
    }).select('id,name,company,follow_up_date').single();
    if (error) throw error;
    if (values.follow_up_date && data) {
      const allowed = await requestReminderPermission();
      if (allowed) await scheduleFollowUpReminder(data);
    }
    router.back();
  }

  return <ContactForm submitLabel="Save contact" onSubmit={createContact} />;
}
