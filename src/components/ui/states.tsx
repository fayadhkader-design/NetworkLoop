import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.primary} size="large" />
      <Text style={styles.detail}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  icon = 'people-outline',
  title,
  detail,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    borderStyle: 'dashed',
    backgroundColor: colors.surface,
    padding: 28,
  },
  iconCircle: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    backgroundColor: colors.primarySoft,
    marginBottom: 4,
  },
  title: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  detail: { color: colors.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
