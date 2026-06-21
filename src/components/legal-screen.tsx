import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

export function LegalScreen({
  title,
  updated,
  children,
}: PropsWithChildren<{ title: string; updated?: string }>) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        {updated ? <Text style={styles.updated}>Effective {updated}</Text> : null}
      </View>
      {children}
    </ScrollView>
  );
}

export function LegalSection({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.body}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { gap: 22, padding: 22, paddingBottom: 48 },
  heading: { gap: 6, marginBottom: 4 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  updated: { color: colors.textMuted, fontSize: 13 },
  section: {
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 18,
  },
  sectionTitle: { color: colors.text, fontSize: 17, fontWeight: '900' },
  body: { color: colors.textMuted, fontSize: 15, lineHeight: 23 },
});
