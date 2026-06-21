import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { EmptyState, LoadingState } from '@/components/ui/states';
import { colors } from '@/constants/colors';
import { formatDate, followUpLabel, todayDateString } from '@/lib/date';
import { supabase } from '@/lib/supabase';
import type { Contact, Conversation } from '@/types/database';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [contact, setContact] = useState<Contact | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContact = useCallback(async () => {
    const [contactResult, conversationsResult] = await Promise.all([
      supabase.from('contacts').select('*').eq('id', id).single(),
      supabase.from('conversations').select('*').eq('contact_id', id).order('conversation_date', { ascending: false }).order('created_at', { ascending: false }),
    ]);
    if (contactResult.error) {
      Alert.alert('Could not load contact', contactResult.error.message);
    } else {
      setContact(contactResult.data as Contact);
      setConversations((conversationsResult.data ?? []) as Conversation[]);
    }
    setLoading(false);
  }, [id]);

  useFocusEffect(useCallback(() => {
    loadContact();
  }, [loadContact]));

  useLayoutEffect(() => {
    navigation.setOptions({
      title: contact?.name ?? 'Contact',
      headerRight: contact ? () => (
        <Pressable onPress={() => router.push(`/contact/${id}/edit`)} hitSlop={12}>
          <Text style={styles.editLink}>Edit</Text>
        </Pressable>
      ) : undefined,
    });
  }, [contact, id, navigation, router]);

  function deleteContact() {
    Alert.alert(
      'Delete contact?',
      'This will also delete the conversation history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('contacts').delete().eq('id', id);
            if (error) Alert.alert('Could not delete contact', error.message);
            else router.replace('/(tabs)/contacts');
          },
        },
      ],
    );
  }

  async function openUrl(url: string) {
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    try {
      await Linking.openURL(normalized);
    } catch {
      Alert.alert('Could not open link', normalized);
    }
  }

  if (loading || !contact) return <LoadingState label="Loading contact…" />;
  const overdue = Boolean(contact.follow_up_date && contact.follow_up_date < todayDateString());

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>
            {contact.name.split(' ').map((part) => part[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.role}>{[contact.role, contact.company].filter(Boolean).join(' · ') || 'No role or company added'}</Text>
        <StatusBadge status={contact.status} />
      </View>

      <View style={styles.actions}>
        <ActionButton icon="create-outline" label="Edit" onPress={() => router.push(`/contact/${id}/edit`)} />
        <ActionButton icon="chatbubble-outline" label="Add note" onPress={() => router.push(`/contact/${id}/conversation`)} primary />
      </View>

      <Section title="Contact information">
        <DetailRow icon="business-outline" label="Company" value={contact.company} />
        <DetailRow icon="briefcase-outline" label="Role" value={contact.role} />
        <DetailRow icon="layers-outline" label="Industry" value={contact.industry} />
        <DetailRow
          icon="mail-outline"
          label="Email"
          value={contact.email}
          onPress={contact.email ? () => Linking.openURL(`mailto:${contact.email}`) : undefined}
        />
        <DetailRow
          icon="logo-linkedin"
          label="LinkedIn"
          value={contact.linkedin_url}
          onPress={contact.linkedin_url ? () => openUrl(contact.linkedin_url!) : undefined}
        />
      </Section>

      <Section title="Follow-up">
        <View style={styles.followUpRow}>
          <View style={[styles.detailIcon, overdue && styles.overdueIcon]}>
            <Ionicons name="calendar-outline" size={19} color={overdue ? colors.danger : colors.primary} />
          </View>
          <View style={styles.detailText}>
            <Text style={styles.detailLabel}>Next follow-up</Text>
            <Text style={[styles.detailValue, overdue && styles.overdueText]}>
              {contact.follow_up_date ? followUpLabel(contact.follow_up_date) : 'No follow-up scheduled'}
            </Text>
          </View>
        </View>
      </Section>

      <Section title="General notes">
        <Text style={contact.notes ? styles.notes : styles.placeholder}>
          {contact.notes || 'No general notes yet.'}
        </Text>
      </Section>

      <View style={styles.historyHeader}>
        <View>
          <Text style={styles.sectionTitle}>Conversation history</Text>
          <Text style={styles.historyCount}>{conversations.length} {conversations.length === 1 ? 'entry' : 'entries'}</Text>
        </View>
        <Pressable onPress={() => router.push(`/contact/${id}/conversation`)} style={styles.smallAdd}>
          <Ionicons name="add" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.timeline}>
        {conversations.length ? conversations.map((conversation) => (
          <ConversationCard key={conversation.id} conversation={conversation} />
        )) : (
          <EmptyState
            icon="chatbubbles-outline"
            title="No conversations yet"
            detail="Add a note after your next call, interview, coffee chat, or email."
          />
        )}
      </View>

      <Button label="Delete contact" variant="danger" onPress={deleteContact} />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null;
  onPress?: () => void;
}) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={styles.detailRow}>
      <View style={styles.detailIcon}><Ionicons name={icon} size={19} color={colors.primary} /></View>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, !value && styles.placeholder]} numberOfLines={2}>{value || 'Not added'}</Text>
      </View>
      {onPress ? <Ionicons name="open-outline" size={17} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  primary = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.actionButton, primary && styles.primaryAction]}>
      <Ionicons name={icon} size={20} color={primary ? colors.white : colors.primary} />
      <Text style={[styles.actionText, primary && styles.primaryActionText]}>{label}</Text>
    </Pressable>
  );
}

function ConversationCard({ conversation }: { conversation: Conversation }) {
  return (
    <View style={styles.conversation}>
      <View style={styles.conversationTop}>
        <Text style={styles.conversationType}>{conversation.conversation_type}</Text>
        <Text style={styles.conversationDate}>{formatDate(conversation.conversation_date)}</Text>
      </View>
      <Text style={styles.conversationNotes}>{conversation.notes || 'No notes added.'}</Text>
      {conversation.next_step ? (
        <View style={styles.nextStep}>
          <Ionicons name="arrow-forward-circle-outline" size={18} color={colors.primary} />
          <View style={styles.detailText}>
            <Text style={styles.nextStepLabel}>NEXT STEP</Text>
            <Text style={styles.nextStepText}>{conversation.next_step}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 22, padding: 20, paddingBottom: 44 },
  editLink: { color: colors.primary, fontSize: 16, fontWeight: '800' },
  hero: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  avatar: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
    backgroundColor: colors.primarySoft,
    marginBottom: 4,
  },
  initials: { color: colors.primaryDark, fontSize: 24, fontWeight: '900' },
  name: { color: colors.text, fontSize: 27, fontWeight: '900', textAlign: 'center' },
  role: { color: colors.textMuted, fontSize: 15, textAlign: 'center', marginBottom: 3 },
  actions: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  primaryAction: { borderColor: colors.primary, backgroundColor: colors.primary },
  actionText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
  primaryActionText: { color: colors.white },
  section: { gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  sectionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    paddingHorizontal: 16,
  },
  detailRow: { minHeight: 69, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  followUpRow: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12 },
  detailIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
  },
  overdueIcon: { backgroundColor: colors.dangerSoft },
  detailText: { flex: 1, gap: 3 },
  detailLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { color: colors.text, fontSize: 15, fontWeight: '600' },
  overdueText: { color: colors.danger },
  notes: { color: colors.text, fontSize: 15, lineHeight: 22, paddingVertical: 16 },
  placeholder: { color: colors.textMuted, fontWeight: '400' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyCount: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  smallAdd: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
  },
  timeline: { gap: 12 },
  conversation: {
    gap: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 16,
  },
  conversationTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  conversationType: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '800' },
  conversationDate: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  conversationNotes: { color: colors.text, fontSize: 15, lineHeight: 22 },
  nextStep: { flexDirection: 'row', gap: 9, borderRadius: 13, backgroundColor: colors.primarySoft, padding: 12 },
  nextStepLabel: { color: colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  nextStepText: { color: colors.primaryDark, fontSize: 14, lineHeight: 20, fontWeight: '600' },
});
