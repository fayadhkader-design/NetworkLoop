import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState, LoadingState } from '@/components/ui/states';
import { colors } from '@/constants/colors';
import { avatarColor, compactDueLabel, initials } from '@/lib/design';
import { supabase } from '@/lib/supabase';
import type { Contact, ContactStatus } from '@/types/database';

const statusOrder: ContactStatus[] = [
  'Reached out',
  'Responded',
  'Call scheduled',
  'Spoke with them',
  'Follow-up needed',
  'Strong connection',
  'Not interested',
];

export default function FirmsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFirms = useCallback(async () => {
    const { data, error } = await supabase.from('contacts').select('*').order('company').order('name');
    if (error) Alert.alert('Could not load firms', error.message);
    else setContacts((data ?? []) as Contact[]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    loadFirms();
  }, [loadFirms]));

  const firms = useMemo(() => {
    const grouped = new Map<string, Contact[]>();
    contacts.forEach((contact) => {
      const key = contact.company?.trim() || 'No company yet';
      grouped.set(key, [...(grouped.get(key) ?? []), contact]);
    });
    return Array.from(grouped.entries()).map(([name, people]) => {
      const depth = Math.max(...people.map((person) => statusOrder.indexOf(person.status)));
      const soonest = [...people].sort((a, b) => (a.follow_up_date ?? '9999-99-99').localeCompare(b.follow_up_date ?? '9999-99-99'))[0];
      return { name, people, depth, soonest };
    }).sort((a, b) => b.depth - a.depth || a.name.localeCompare(b.name));
  }, [contacts]);

  if (loading) return <LoadingState label="Loading firms…" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Firms</Text>
        <Text style={styles.subtitle}>Where each relationship stands, deepest connection first.</Text>
      </View>

      <FlatList
        data={firms}
        keyExtractor={(item) => item.name}
        contentContainerStyle={[styles.list, !firms.length && styles.emptyList]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadFirms(); }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.firmName}>{item.name}</Text>
              <Text style={styles.count}>{item.people.length} {item.people.length === 1 ? 'contact' : 'contacts'}</Text>
            </View>
            <View style={styles.segments}>
              {statusOrder.slice(0, 6).map((status, index) => {
                const active = index <= item.depth;
                return <View key={status} style={[styles.segment, active && { backgroundColor: index >= 4 ? colors.success : colors.primary }]} />;
              })}
            </View>
            <Text style={styles.stage}>Furthest: {statusOrder[item.depth] ?? 'Reached out'}</Text>
            <View style={styles.peopleRow}>
              <View style={styles.avatars}>
                {item.people.slice(0, 4).map((person, index) => (
                  <Pressable
                    key={person.id}
                    onPress={() => router.push(`/contact/${person.id}`)}
                    style={[styles.avatar, { backgroundColor: avatarColor(person.id), marginLeft: index ? -7 : 0 }]}>
                    <Text style={styles.initials}>{initials(person.name)}</Text>
                  </Pressable>
                ))}
              </View>
              {item.soonest ? (
                <View style={styles.nextWrap}>
                  <Text style={styles.nextLabel} numberOfLines={1}>{item.soonest.name}</Text>
                  <Text style={styles.nextDate}>{compactDueLabel(item.soonest.follow_up_date)}</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="No firms yet"
            detail="Add a company to your contacts and NetworkLoop will group them here."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { padding: 18, paddingBottom: 12 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -0.7 },
  subtitle: { color: colors.textMuted, fontSize: 13.5, lineHeight: 20, marginTop: 6 },
  list: { gap: 10, paddingHorizontal: 18, paddingBottom: 112 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface, padding: 14 },
  cardTop: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  firmName: { flex: 1, color: colors.text, fontSize: 16.5, fontWeight: '700', letterSpacing: -0.2 },
  count: { color: colors.textSubtle, fontSize: 12, fontWeight: '600', fontFamily: 'Menlo' },
  segments: { flexDirection: 'row', gap: 4, marginTop: 12 },
  segment: { flex: 1, height: 5, borderRadius: 3, backgroundColor: '#E4E5E9' },
  stage: { color: colors.textMuted, fontSize: 12.5, marginTop: 9 },
  peopleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  avatars: { flexDirection: 'row', flex: 1 },
  avatar: { width: 28, height: 28, borderRadius: 15, borderWidth: 2, borderColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.white, fontSize: 10.5, fontWeight: '700' },
  nextWrap: { alignItems: 'flex-end', flex: 1 },
  nextLabel: { color: colors.textMuted, fontSize: 12.5, fontWeight: '700' },
  nextDate: { color: colors.textSubtle, fontSize: 12, marginTop: 2 },
});
