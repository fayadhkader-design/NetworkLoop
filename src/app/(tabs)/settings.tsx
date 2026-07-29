import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors';
import { APP_VERSION } from '@/constants/app';
import {
  getReminderStatus,
  requestReminderPermission,
  setRemindersEnabled,
  syncFollowUpReminders,
  type ReminderStatus,
} from '@/lib/reminders';
import { useAuth } from '@/providers/auth-provider';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [reminderStatus, setReminderStatus] = useState<ReminderStatus>('off');
  const [reminderLoading, setReminderLoading] = useState(false);

  useEffect(() => {
    getReminderStatus().then(setReminderStatus).catch(() => setReminderStatus('off'));
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Could not log out', error instanceof Error ? error.message : 'Please try again.');
    }
  }

  async function toggleReminders() {
    if (reminderLoading) return;
    if (reminderStatus === 'unsupported') {
      Alert.alert('Reminders unavailable', 'Follow-up reminders work in the installed mobile app.');
      return;
    }

    setReminderLoading(true);
    try {
      if (reminderStatus === 'on') {
        await setRemindersEnabled(false);
        setReminderStatus('off');
        Alert.alert('Reminders off', 'NetworkLoop will stop sending follow-up reminders on this device.');
        return;
      }

      const allowed = await requestReminderPermission();
      if (!allowed) {
        setReminderStatus('denied');
        Alert.alert(
          'Notifications are off',
          'To use reminders, allow notifications for NetworkLoop in your phone settings.',
        );
        return;
      }

      if (user?.id) await syncFollowUpReminders(user.id);
      setReminderStatus('on');
      Alert.alert('Reminders on', 'NetworkLoop will remind you on the morning of your follow-up dates.');
    } catch (error) {
      Alert.alert('Could not update reminders', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setReminderLoading(false);
    }
  }

  const remindersEnabled = reminderStatus === 'on';
  const reminderDetail = reminderStatus === 'unsupported'
    ? 'Available in the mobile app'
    : reminderStatus === 'denied'
      ? 'Turn on in phone settings'
      : remindersEnabled
        ? 'Morning nudges are on'
        : 'Get nudged when follow-ups are due';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Your account, privacy, and support.</Text>
        </View>

        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {((user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? '?')[0]?.toUpperCase()}
            </Text>
          </View>
          <View style={styles.accountText}>
            <Text style={styles.accountName}>
              {(user?.user_metadata?.full_name as string | undefined) ?? 'NetworkLoop user'}
            </Text>
            <Text style={styles.accountEmail}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.group}>
          <SettingsRow
            icon="notifications-outline"
            label="Follow-up reminders"
            detail={reminderDetail}
            onPress={toggleReminders}
            rightAccessory={(
              <Switch
                value={remindersEnabled}
                onValueChange={toggleReminders}
                disabled={reminderLoading || reminderStatus === 'unsupported'}
                trackColor={{ false: colors.surfaceMuted, true: colors.primarySoft }}
                thumbColor={remindersEnabled ? colors.primary : colors.textSubtle}
              />
            )}
          />
          <SettingsRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => router.push('/privacy')} />
          <SettingsRow icon="help-circle-outline" label="Support" onPress={() => router.push('/support')} />
          <SettingsRow icon="log-out-outline" label="Log out" onPress={handleSignOut} />
        </View>

        <View style={styles.group}>
          <SettingsRow
            icon="trash-outline"
            label="Delete account"
            detail="Permanently delete your data"
            danger
            onPress={() => router.push('/settings/delete-account')}
          />
        </View>

        <Text style={styles.version}>NetworkLoop {APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({
  icon,
  label,
  detail,
  rightAccessory,
  danger = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  detail?: string;
  rightAccessory?: React.ReactNode;
  danger?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.rowIcon, danger && styles.dangerIcon]}>
        <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, danger && styles.dangerText]}>{label}</Text>
        {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      </View>
      <View style={styles.rowAccessory}>
        {rightAccessory ?? <Ionicons name="chevron-forward" size={19} color={colors.textMuted} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { gap: 22, padding: 20, paddingBottom: 40 },
  title: { color: colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: 4 },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 17,
  },
  avatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  avatarText: { color: colors.primaryDark, fontSize: 18, fontWeight: '900' },
  accountText: { flex: 1, gap: 3 },
  accountName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  accountEmail: { color: colors.textMuted, fontSize: 13 },
  group: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  row: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 15,
  },
  pressed: { backgroundColor: colors.surfaceMuted },
  rowIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
  },
  dangerIcon: { backgroundColor: colors.dangerSoft },
  rowText: { flex: 1, justifyContent: 'center', gap: 2 },
  rowAccessory: {
    minWidth: 52,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  rowDetail: { color: colors.textMuted, fontSize: 12 },
  dangerText: { color: colors.danger },
  version: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
});
