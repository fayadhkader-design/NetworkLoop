import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '@/constants/colors';

type FormInputProps = TextInputProps & {
  label: string;
  hint?: string;
};

export function FormInput({ label, hint, multiline, style, ...props }: FormInputProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[styles.input, multiline && styles.multiline, style]}
        {...props}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 7 },
  label: { color: colors.text, fontSize: 13, fontWeight: '700' },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 13,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15.5,
    paddingHorizontal: 14,
  },
  multiline: { minHeight: 112, paddingTop: 14 },
  hint: { color: colors.textSubtle, fontSize: 12 },
});
