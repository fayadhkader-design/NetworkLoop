import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { EmptyState, LoadingState } from '@/components/ui/states';
import { colors } from '@/constants/colors';
import { avatarColor, compactDueLabel, contactLine, initials } from '@/lib/design';
import { formatDate, todayDateString } from '@/lib/date';
import { cancelFollowUpReminder } from '@/lib/reminders';
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
            else {
              await cancelFollowUpReminder(id);
              router.replace('/(tabs)/contacts');
            }
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
        <View style={[styles.avatar, { backgroundColor: avatarColor(contact.id) }]}>
          <Text style={styles.initials}>{initials(contact.name)}</Text>
        </View>
        <View style={styles.heroText}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.role}>{contactLine(contact)}</Text>
          <StatusBadge status={contact.status} />
        </View>
      </View>

      <View style={styles.actions}>
        <ActionButton label="Log" onPress={() => router.push(`/contact/${id}/conversation`)} primary />
        <ActionButton label="Email" onPress={() => contact.email ? Linking.openURL(`mailto:${contact.email}`) : undefined} />
        <ActionButton label="LinkedIn" onPress={() => contact.linkedin_url ? openUrl(contact.linkedin_url) : undefined} />
      </View>

      <View style={styles.factsCard}>
        <FactRow label="Stage" value={contact.status} />
        <FactRow label="Next follow-up" value={contact.follow_up_date ? compactDueLabel(contact.follow_up_date) : 'No nudge'} danger={overdue} />
        <FactRow label="Company" value={contact.company || 'Not added'} />
        <FactRow label="Role" value={contact.role || 'Not added'} />
        <FactRow label="Industry" value={contact.industry || 'Not added'} />
        <FactRow label="Email" value={contact.email || 'Not added'} onPress={contact.email ? () => Linking.openURL(`mailto:${contact.email}`) : undefined} />
        <FactRow label="LinkedIn" value={contact.linkedin_url || 'Not added'} onPress={contact.linkedin_url ? () => openUrl(contact.linkedin_url!) : undefined} />
      </View>

      <View style={styles.historyHeader}>
        <View>
          <Text style={styles.sectionEyebrow}>Conversations</Text>
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

      <Text style={styles.sectionEyebrow}>Notes to self</Text>
      <View style={styles.notesCard}>
        <Text style={contact.notes ? styles.notes : styles.placeholder}>
          {contact.notes || 'No general notes yet.'}
        </Text>
      </View>

      <Button label="Delete contact" variant="danger" onPress={deleteContact} />
    </ScrollView>
  );
}

function FactRow({
  label,
  value,
  onPress,
  danger = false,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} style={styles.factRow}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={[styles.factValue, danger && styles.overdueText]} numberOfLines={2}>{value}</Text>
    </Pressable>
  );
}

function ActionButton({
  label,
  onPress,
  primary = false,
}: {
  label: string;
  onPress: () => void | Promise<void> | undefined | Promise<unknown>;
  primary?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.actionButton, primary && styles.primaryAction]}>
      <Text style={[styles.actionText, primary && styles.primaryActionText]}>{label}</Text>
    </Pressable>
  );
}

function ConversationCard({ conversation }: { conversation: Conversation }) {
  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineRail}>
        <View style={styles.timelineDot} />
        <View style={styles.timelineLine} />
      </View>
      <View style={styles.conversation}>
        <View style={styles.conversationTop}>
          <Text style={styles.conversationType}>{conversation.conversation_type}</Text>
          <Text style={styles.conversationDate}>{formatDate(conversation.conversation_date, { month: 'short', day: 'numeric' })}</Text>
        </View>
        <Text style={styles.conversationNotes}>{conversation.notes || 'No notes added.'}</Text>
        {conversation.next_step ? (
          <Text style={styles.nextStepText}>Next: {conversation.next_step}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 18, padding: 18, paddingBottom: 44 },
  editLink: { color: colors.primary, fontSize: 16, fontWeight: '800' },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 4 },
  avatar: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
  },
  initials: { color: colors.white, fontSize: 21, fontWeight: '700' },
  heroText: { flex: 1, gap: 4 },
  name: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  role: { color: colors.textMuted, fontSize: 13.5, lineHeight: 19 },
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
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  primaryAction: { borderColor: colors.primary, backgroundColor: colors.primary },
  actionText: { color: colors.textMuted, fontSize: 14.5, fontWeight: '700' },
  primaryActionText: { color: colors.white },
  sectionEyebrow: { color: colors.textSubtle, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginHorizontal: 4 },
  factsCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    paddingHorizontal: 14,
  },
  factRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  factLabel: { color: colors.textSubtle, fontSize: 13.5 },
  factValue: { flex: 1, color: colors.text, fontSize: 13.5, fontWeight: '600', textAlign: 'right' },
  overdueText: { color: colors.danger },
  notesCard: { borderRadius: 14, borderWidth: 1, borderColor: colors.noteBorder, backgroundColor: colors.note, padding: 14 },
  notes: { color: '#5A4A22', fontSize: 13.5, lineHeight: 21 },
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
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  timelineRail: { alignItems: 'center', width: 12 },
  timelineDot: { width: 10, height: 10, borderRadius: 6, borderWidth: 2.5, borderColor: colors.primary, backgroundColor: colors.surface, marginTop: 4 },
  timelineLine: { flex: 1, width: 2, backgroundColor: 'rgba(0,0,0,0.08)' },
  conversation: { flex: 1, paddingBottom: 16 },
  conversationTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  conversationType: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '700' },
  conversationDate: { color: '#A6ABB4', fontSize: 11.5, fontWeight: '600', fontFamily: 'Menlo' },
  conversationNotes: { color: '#4C525C', fontSize: 13.5, lineHeight: 20, marginTop: 4 },
  nextStepText: { color: colors.primaryDark, fontSize: 13, lineHeight: 19, fontWeight: '600', marginTop: 6 },
});
