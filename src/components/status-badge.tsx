import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { statusTone } from '@/lib/design';
import type { ContactStatus } from '@/types/database';

export function StatusBadge({ status }: { status: ContactStatus }) {
  const tone = statusTone(status);

  return (
    <View style={[styles.badge, { backgroundColor: tone.backgroundColor }]}>
      <Text style={[styles.text, { color: tone.color }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4 },
  text: { fontSize: 11, fontWeight: '700' },
});
