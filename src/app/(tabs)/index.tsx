import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContactCard } from '@/components/contact-card';
import { Button } from '@/components/ui/button';
import { EmptyState, LoadingState } from '@/components/ui/states';
import { colors } from '@/constants/colors';
import { todayDateString } from '@/lib/date';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/auth-provider';
import type { Contact } from '@/types/database';

type DashboardData = {
  contacts: Contact[];
  conversationCount: number;
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [data, setData] = useState<DashboardData>({ contacts: [], conversationCount: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    const [contactsResult, conversationsResult] = await Promise.all([
      supabase.from('contacts').select('*').order('follow_up_date', { ascending: true, nullsFirst: false }),
      supabase.from('conversations').select('*', { count: 'exact', head: true }),
    ]);

    if (contactsResult.error || conversationsResult.error) {
      Alert.alert('Could not load dashboard', contactsResult.error?.message ?? conversationsResult.error?.message);
    } else {
      setData({
        contacts: (contactsResult.data ?? []) as Contact[],
        conversationCount: conversationsResult.count ?? 0,
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
  const followUps = data.contacts.filter((contact) => contact.follow_up_date).slice(0, 5);
  const firstName = (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ?? 'there';

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
            <Text style={styles.eyebrow}>NETWORKLOOP</Text>
            <Text style={styles.title}>Hi, {firstName}</Text>
            <Text style={styles.subtitle}>Keep the conversation moving.</Text>
          </View>
          <Pressable accessibilityLabel="Log out" onPress={handleSignOut} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={22} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.metrics}>
          <MetricCard value={data.contacts.length} label="Contacts" icon="people-outline" />
          <MetricCard value={data.conversationCount} label="Conversations" icon="chatbubbles-outline" />
          <MetricCard value={dueCount} label="Due now" icon="time-outline" alert={dueCount > 0} />
        </View>

        <Button label="Add a new contact" onPress={() => router.push('/contact/new')} />

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Follow Up Soon</Text>
            <Text style={styles.sectionSubtitle}>Upcoming and overdue reminders</Text>
          </View>
        </View>

        <View style={styles.list}>
          {followUps.length ? followUps.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onPress={() => router.push(`/contact/${contact.id}`)}
            />
          )) : (
            <EmptyState
              icon="checkmark-circle-outline"
              title="No follow-ups due"
              detail="You’re all caught up. Add a follow-up date to a contact when you’re ready."
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  value,
  label,
  icon,
  alert = false,
}: {
  value: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  alert?: boolean;
}) {
  return (
    <View style={[styles.metricCard, alert && styles.alertMetric]}>
      <Ionicons name={icon} size={20} color={alert ? colors.warning : colors.primary} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 36, gap: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.4, marginBottom: 7 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: colors.textMuted, fontSize: 15, marginTop: 4 },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  metrics: { flexDirection: 'row', gap: 10 },
  metricCard: {
    flex: 1,
    minHeight: 122,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 17,
    backgroundColor: colors.surface,
    padding: 13,
  },
  alertMetric: { backgroundColor: colors.warningSoft, borderColor: '#EFD8B7' },
  metricValue: { color: colors.text, fontSize: 27, fontWeight: '900', marginTop: 10 },
  metricLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  sectionHeader: { marginTop: 5 },
  sectionTitle: { color: colors.text, fontSize: 21, fontWeight: '900' },
  sectionSubtitle: { color: colors.textMuted, fontSize: 13, marginTop: 3 },
  list: { gap: 12 },
});
