import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContactCard } from '@/components/contact-card';
import { EmptyState, LoadingState } from '@/components/ui/states';
import { colors } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import type { Contact } from '@/types/database';

export default function ContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [query, setQuery] = useState('');
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
    if (!normalized) return contacts;
    return contacts.filter((contact) =>
      [contact.name, contact.company, contact.role]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalized)),
    );
  }, [contacts, query]);

  if (loading) return <LoadingState label="Loading contacts…" />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Contacts</Text>
          <Text style={styles.subtitle}>{contacts.length} {contacts.length === 1 ? 'person' : 'people'} in your loop</Text>
        </View>
        <Pressable onPress={() => router.push('/contact/new')} style={styles.addButton}>
          <Ionicons name="add" size={25} color={colors.white} />
        </Pressable>
      </View>

      <View style={styles.search}>
        <Ionicons name="search-outline" size={20} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, company, or role"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={20} color={colors.textMuted} /></Pressable>
        ) : null}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, !filtered.length && styles.emptyList]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <ContactCard contact={item} onPress={() => router.push(`/contact/${item.id}`)} />
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 16 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  addButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: colors.primary,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 17,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15 },
  list: { paddingHorizontal: 20, paddingBottom: 32 },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  separator: { height: 12 },
});
