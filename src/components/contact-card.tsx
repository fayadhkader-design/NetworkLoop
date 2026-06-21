import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { colors } from '@/constants/colors';
import { followUpLabel, todayDateString } from '@/lib/date';
import type { Contact } from '@/types/database';

export function ContactCard({ contact, onPress }: { contact: Contact; onPress: () => void }) {
  const initials = contact.name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const overdue = Boolean(contact.follow_up_date && contact.follow_up_date < todayDateString());

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.topRow}>
        <View style={styles.avatar}><Text style={styles.initials}>{initials || '?'}</Text></View>
        <View style={styles.identity}>
          <Text style={styles.name} numberOfLines={1}>{contact.name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {[contact.role, contact.company].filter(Boolean).join(' · ') || 'No role or company yet'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
      <View style={styles.bottomRow}>
        <StatusBadge status={contact.status} />
        {contact.follow_up_date ? (
          <Text style={[styles.followUp, overdue && styles.overdue]}>
            {followUpLabel(contact.follow_up_date)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 16,
  },
  pressed: { opacity: 0.78 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  initials: { color: colors.primaryDark, fontSize: 15, fontWeight: '800' },
  identity: { flex: 1, gap: 3 },
  name: { color: colors.text, fontSize: 17, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 14 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  followUp: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  overdue: { color: colors.danger },
});
