import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { colors } from '@/constants/colors';
import { avatarColor, compactDueLabel, contactLine, dueTone, initials, isDue, isOverdue } from '@/lib/design';
import type { Contact } from '@/types/database';

export function ContactCard({
  contact,
  onPress,
  compact = false,
}: {
  contact: Contact;
  onPress: () => void;
  compact?: boolean;
}) {
  const overdue = isOverdue(contact);
  const due = isDue(contact);
  const dueStyle = dueTone(contact.follow_up_date);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, compact && styles.compactCard, pressed && styles.pressed]}>
      <View style={styles.topRow}>
        <View style={[styles.avatar, { backgroundColor: avatarColor(contact.id || contact.name) }]}>
          <Text style={styles.initials}>{initials(contact.name)}</Text>
        </View>
        <View style={styles.identity}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{contact.name}</Text>
            {due ? <View style={styles.dueDot} /> : null}
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>
            {contactLine(contact)}
          </Text>
        </View>
        <View style={styles.trailing}>
          <StatusBadge status={contact.status} />
          {contact.follow_up_date ? (
            <Text style={[styles.followUp, dueStyle, overdue && styles.overdue]}>
              {compactDueLabel(contact.follow_up_date)}
            </Text>
          ) : null}
        </View>
      </View>
      {!compact && contact.notes ? <Text style={styles.hook} numberOfLines={2}>{contact.notes}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 14,
  },
  compactCard: { borderRadius: 0, borderWidth: 0, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
  pressed: { opacity: 0.78 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  initials: { color: colors.white, fontSize: 13, fontWeight: '700' },
  identity: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  name: { color: colors.text, fontSize: 15.5, fontWeight: '700', letterSpacing: -0.1 },
  dueDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  subtitle: { color: colors.textMuted, fontSize: 12.5 },
  trailing: { alignItems: 'flex-end', gap: 6 },
  followUp: { overflow: 'hidden', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, fontSize: 11, fontWeight: '700' },
  overdue: { color: colors.danger },
  hook: { color: colors.textSubtle, fontSize: 12.5, lineHeight: 18, marginLeft: 50 },
});
