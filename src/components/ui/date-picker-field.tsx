import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { FormInput } from '@/components/ui/form-input';
import { isValidDateString, todayDateString } from '@/lib/date';

type DatePickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
  allowClear?: boolean;
};

function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateFromString(value: string) {
  if (!value || !isValidDateString(value)) return new Date(`${todayDateString()}T12:00:00`);
  return new Date(`${value}T12:00:00`);
}

export function DatePickerField({
  label,
  value,
  onChange,
  hint,
  placeholder = 'Select a date',
  allowClear = true,
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <FormInput
        label={label}
        hint={hint ?? 'Use YYYY-MM-DD.'}
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
        placeholder="2026-07-15"
      />
    );
  }

  function handleNativeChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (event.type === 'dismissed') {
      setOpen(false);
      return;
    }
    if (selectedDate) onChange(toDateString(selectedDate));
    if (Platform.OS !== 'ios') setOpen(false);
  }

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${value ? `Selected date ${value}` : placeholder}`}
        onPress={() => setOpen((current) => !current)}
        style={({ pressed }) => [styles.dateButton, pressed && styles.pressed]}>
        <Text style={[styles.dateText, !value && styles.placeholder]}>{value || placeholder}</Text>
        <Ionicons name="calendar-outline" size={19} color={colors.textMuted} />
      </Pressable>
      <View style={styles.metaRow}>
        {hint ? <Text style={styles.hint}>{hint}</Text> : <View />}
        {allowClear && value ? (
          <Pressable onPress={() => onChange('')} hitSlop={8}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        ) : null}
      </View>
      {open ? (
        <View style={styles.pickerCard}>
          <DateTimePicker
            value={dateFromString(value)}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={handleNativeChange}
            themeVariant="light"
          />
          {Platform.OS === 'ios' ? (
            <Pressable onPress={() => setOpen(false)} style={styles.doneButton}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 7 },
  label: { color: colors.text, fontSize: 13, fontWeight: '700' },
  dateButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },
  pressed: { opacity: 0.82 },
  dateText: { flex: 1, color: colors.text, fontSize: 15.5 },
  placeholder: { color: colors.textMuted },
  metaRow: { minHeight: 16, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  hint: { flex: 1, color: colors.textSubtle, fontSize: 12 },
  clearText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  pickerCard: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  doneButton: {
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    paddingVertical: 12,
  },
  doneText: { color: colors.primary, fontSize: 15, fontWeight: '800' },
});
