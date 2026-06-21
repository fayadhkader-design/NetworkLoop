import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';

type ChipSelectProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
};

export function ChipSelect<T extends string>({ label, options, value, onChange }: ChipSelectProps<T>) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <Pressable
              key={option}
              onPress={() => onChange(option)}
              style={[styles.chip, selected && styles.selectedChip]}>
              <Text style={[styles.chipText, selected && styles.selectedText]}>{option}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  label: { color: colors.text, fontSize: 14, fontWeight: '700' },
  row: { gap: 8, paddingRight: 18 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  selectedChip: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  chipText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  selectedText: { color: colors.primaryDark },
});
