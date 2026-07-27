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
  label: { color: colors.text, fontSize: 13, fontWeight: '700' },
  row: { gap: 7, paddingRight: 18 },
  chip: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
    borderRadius: 999,
    backgroundColor: colors.surface,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  selectedChip: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  selectedText: { color: colors.white },
});
