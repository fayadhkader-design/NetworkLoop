import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContactCard } from '@/components/contact-card';
import { EmptyState, LoadingState } from '@/components/ui/states';
import { colors } from '@/constants/colors';
import { isDue } from '@/lib/design';
import { supabase } from '@/lib/supabase';
import { Contact, ContactStatus } from '@/types/database';

type Filter = 'All' | 'Due' | 'Stale' | 'Warm' | ContactStatus;

export default function ContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadContacts = useCallback(async () => {
    const { data, error } = await supabase.from('contacts').select('*').order('name');
    if (error) Alert.alert('Could not load contacts', error.message);
    else setContacts((data ?? []) as Contact[]);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => {
    loadContacts();
  }, [loadContacts]));

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    let next = contacts;
    if (filter === 'Due') next = next.filter(isDue);
    else if (filter === 'Stale') next = next.filter((contact) => !isDue(contact) && contact.updated_at < new Date(Date.now() - 14 * 86400000).toISOString());
    else if (filter === 'Warm') next = next.filter((contact) => contact.status === 'Strong connection' || contact.status === 'Spoke with them');
    else if (filter !== 'All') next = next.filter((contact) => contact.status === filter);
    if (!normalized) return next;
    return next.filter((contact) =>
      [contact.name, contact.company, contact.role]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized)),
    );
  }, [contacts, filter, query]);

  const filters: Filter[] = ['All', 'Due', 'Warm', 'Stale', 'Spoke with them', 'Call scheduled', 'Follow-up needed', 'Strong connection'];

  if (loading) return <LoadingState label="Loading contacts…" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Contacts</Text>
        <Pressable onPress={() => router.push('/contact/new')} style={styles.addButton}>
          <Ionicons name="add" size={25} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.search}>
        <Ionicons name="search-outline" size={18} color={colors.textSubtle} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Name, firm, or group"
          placeholderTextColor={colors.textSubtle}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={colors.textMuted} /></Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {filters.map((item) => {
          const selected = item === filter;
          return (
            <Pressable key={item} onPress={() => setFilter(item)} style={[styles.chip, selected && styles.selectedChip]}>
              <Text style={[styles.chipText, selected && styles.selectedChipText]}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.resultLine}>{filtered.length} of {contacts.length} shown</Text>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, !filtered.length && styles.emptyList]}
        renderItem={({ item }) => (
          <ContactCard contact={item} onPress={() => router.push(`/contact/${item.id}`)} compact />
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadContacts(); }} />}
        ListEmptyComponent={
          <EmptyState
            title={query ? 'No matching contacts' : 'No contacts yet'}
            detail={query ? 'Try a different name, company, or role.' : 'Add your first contact and start building your loop.'}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, paddingBottom: 14 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -0.7 },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.primary,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    marginHorizontal: 18,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15.5 },
  chips: { gap: 7, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 2 },
  chip: { flex: 0, borderRadius: 20, backgroundColor: colors.surface, paddingHorizontal: 13, paddingVertical: 7 },
  selectedChip: { backgroundColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  selectedChipText: { color: colors.white },
  resultLine: { color: colors.textSubtle, fontSize: 12, marginHorizontal: 22, marginTop: 14, marginBottom: 8 },
  list: { marginHorizontal: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden', backgroundColor: colors.surface, paddingBottom: 84 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
});
