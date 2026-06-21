import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import type { ContactStatus } from '@/types/database';

export function StatusBadge({ status }: { status: ContactStatus }) {
  const tone = status === 'Strong connection'
    ? 'success'
    : status === 'Follow-up needed'
      ? 'warning'
      : status === 'Not interested'
        ? 'danger'
        : 'neutral';

  return (
    <View style={[styles.badge, styles[`${tone}Badge`]]}>
      <Text style={[styles.text, styles[`${tone}Text`]]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  text: { fontSize: 12, fontWeight: '700' },
  neutralBadge: { backgroundColor: colors.surfaceMuted },
  neutralText: { color: colors.textMuted },
  successBadge: { backgroundColor: colors.successSoft },
  successText: { color: colors.success },
  warningBadge: { backgroundColor: colors.warningSoft },
  warningText: { color: colors.warning },
  dangerBadge: { backgroundColor: colors.dangerSoft },
  dangerText: { color: colors.danger },
});
