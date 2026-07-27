import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContactCard } from '@/components/contact-card';
import { EmptyState, LoadingState } from '@/components/ui/states';
import { colors } from '@/constants/colors';
import { compactDueLabel, contactLine, isDue } from '@/lib/design';
import { formatDate, todayDateString } from '@/lib/date';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import type { Contact, Conversation } from '@/types/database';

type DashboardData = {
  contacts: Contact[];
  conversations: Array<Conversation & { contacts?: Pick<Contact, 'name'> | null }>;
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [data, setData] = useState<DashboardData>({ contacts: [], conversations: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    const [contactsResult, conversationsResult] = await Promise.all([
      supabase.from('contacts').select('*').order('follow_up_date', { ascending: true, nullsFirst: false }),
      supabase
        .from('conversations')
        .select('*, contacts(name)')
        .order('conversation_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(4),
    ]);

    if (contactsResult.error || conversationsResult.error) {
      Alert.alert('Could not load dashboard', contactsResult.error?.message ?? conversationsResult.error?.message);
    } else {
      setData({
        contacts: (contactsResult.data ?? []) as Contact[],
        conversations: (conversationsResult.data ?? []) as DashboardData['conversations'],
      });
    }
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useFocusEffect(useCallback(() => {
    loadDashboard();
  }, [loadDashboard]));

  const today = todayDateString();
  const dueCount = data.contacts.filter((contact) => contact.follow_up_date && contact.follow_up_date <= today).length;
  const followUps = data.contacts.filter((contact) => isDue(contact)).slice(0, 4);
  const stale = data.contacts
    .filter((contact) => !isDue(contact) && contact.updated_at < new Date(Date.now() - 14 * 86400000).toISOString())
    .slice(0, 3);
  const firmCount = new Set(data.contacts.map((contact) => contact.company).filter(Boolean)).size;
  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.email?.split('@')[0] ?? 'NetworkLoop';
  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Could not log out', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  if (loading) return <LoadingState label="Loading your dashboard…" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadDashboard(); }} />}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>{dateLabel}</Text>
            <Text style={styles.title}>Today</Text>
          </View>
          <Pressable accessibilityLabel="Log out" onPress={handleSignOut}>
            <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
          </Pressable>
        </View>

        <View style={styles.metrics}>
          <MetricCard value={data.contacts.length} label="contacts" />
          <MetricCard value={firmCount} label="firms" />
          <MetricCard value={dueCount} label="to follow up" alert />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEyebrow}>Follow up now</Text>
          <Pressable onPress={() => router.push('/contact/new')}>
            <Text style={styles.inlineAction}>Add contact</Text>
          </Pressable>
        </View>

        <View style={styles.list}>
          {followUps.length ? followUps.map((contact) => (
            <View key={contact.id} style={styles.dueCard}>
              <ContactCard contact={contact} onPress={() => router.push(`/contact/${contact.id}`)} />
              <View style={styles.dueActions}>
                <Pressable style={styles.logButton} onPress={() => router.push(`/contact/${contact.id}/conversation`)}>
                  <Text style={styles.logButtonText}>Log a chat</Text>
                </Pressable>
                <View style={styles.duePill}><Text style={styles.duePillText}>{compactDueLabel(contact.follow_up_date)}</Text></View>
              </View>
            </View>
          )) : (
            <EmptyState
              icon="checkmark-circle-outline"
              title="No follow-ups due"
              detail="You’re all caught up. Add a follow-up date to a contact when you’re ready."
            />
          )}
        </View>

        {stale.length ? (
          <>
            <Text style={styles.sectionEyebrow}>Going cold</Text>
            <View style={styles.groupCard}>
              {stale.map((contact) => (
                <Pressable key={contact.id} onPress={() => router.push(`/contact/${contact.id}`)} style={styles.staleRow}>
                  <View style={styles.staleText}>
                    <Text style={styles.staleName}>{contact.name}</Text>
                    <Text style={styles.staleLine} numberOfLines={1}>{contactLine(contact)}</Text>
                  </View>
                  <Text style={styles.staleDate}>{formatDate(contact.updated_at.slice(0, 10), { month: 'short', day: 'numeric' })}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <Text style={styles.sectionEyebrow}>Logged this week</Text>
        <View style={styles.recentList}>
          {data.conversations.length ? data.conversations.map((conversation) => (
            <View key={conversation.id} style={styles.recentRow}>
              <View style={styles.recentDot} />
              <View style={styles.recentBody}>
                <Text style={styles.recentTitle}>
                  <Text style={styles.recentWho}>{conversation.contacts?.name ?? 'Contact'}</Text>
                  {' · '}
                  {conversation.conversation_type}
                </Text>
                <Text style={styles.recentText} numberOfLines={2}>{conversation.notes}</Text>
              </View>
              <Text style={styles.recentWhen}>{formatDate(conversation.conversation_date, { month: 'short', day: 'numeric' })}</Text>
            </View>
          )) : (
            <Text style={styles.emptyCopy}>No conversations logged yet.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  value,
  label,
  alert = false,
}: {
  value: number;
  label: string;
  alert?: boolean;
}) {
  return (
    <View style={[styles.metricCard, alert && styles.alertMetric]}>
      <Text style={[styles.metricValue, alert && styles.alertMetricValue]}>{value}</Text>
      <Text style={[styles.metricLabel, alert && styles.alertMetricLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 112, gap: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  eyebrow: { color: colors.textSubtle, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -0.7, marginTop: 2 },
  userName: { color: colors.textMuted, fontSize: 13, maxWidth: 150 },
  metrics: { flexDirection: 'row', gap: 8 },
  metricCard: {
    flex: 1,
    minHeight: 76,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    padding: 12,
  },
  alertMetric: { backgroundColor: colors.primary },
  metricValue: { color: colors.text, fontSize: 24, fontWeight: '700', fontFamily: 'Menlo' },
  metricLabel: { color: colors.textSubtle, fontSize: 11, marginTop: 5 },
  alertMetricValue: { color: colors.white },
  alertMetricLabel: { color: 'rgba(255,255,255,0.82)' },
  sectionHeader: { marginTop: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  sectionEyebrow: { color: colors.textSubtle, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', marginHorizontal: 4 },
  inlineAction: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  list: { gap: 10 },
  dueCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' },
  dueActions: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, paddingBottom: 12 },
  logButton: { flex: 1, alignItems: 'center', borderRadius: 11, backgroundColor: colors.primary, paddingVertical: 9 },
  logButtonText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  duePill: { justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)', borderRadius: 11, paddingHorizontal: 13, backgroundColor: colors.surface },
  duePillText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  groupCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden' },
  staleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  staleText: { flex: 1 },
  staleName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  staleLine: { color: colors.textSubtle, fontSize: 12.5, marginTop: 2 },
  staleDate: { color: colors.warning, fontSize: 12, fontWeight: '700', fontFamily: 'Menlo' },
  recentList: { gap: 2, paddingBottom: 8 },
  recentRow: { flexDirection: 'row', gap: 11, paddingHorizontal: 4, paddingVertical: 8 },
  recentDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#C4C8D0', marginTop: 6 },
  recentBody: { flex: 1 },
  recentTitle: { color: colors.text, fontSize: 13.5, lineHeight: 19 },
  recentWho: { fontWeight: '700' },
  recentText: { color: colors.textSubtle, fontSize: 12.5, lineHeight: 18, marginTop: 2 },
  recentWhen: { color: '#A6ABB4', fontSize: 11.5, fontWeight: '600', fontFamily: 'Menlo', marginTop: 3 },
  emptyCopy: { color: colors.textSubtle, fontSize: 13, marginHorizontal: 4 },
});
