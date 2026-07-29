import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { todayDateString } from '@/lib/date';
import { supabase } from '@/lib/supabase';
import type { Contact } from '@/types/database';

const REMINDERS_ENABLED_KEY = 'networkloop.reminders.enabled';
const REMINDER_ID_PREFIX = 'networkloop.followup.';
const REMINDER_STORAGE_PREFIX = 'networkloop.followupNotification.';
const REMINDER_CHANNEL_ID = 'follow-up-reminders';
const MAX_SCHEDULED_REMINDERS = 50;

type ReminderContact = Pick<Contact, 'id' | 'name' | 'company' | 'follow_up_date'>;

export type ReminderStatus = 'unsupported' | 'off' | 'denied' | 'on';

function isNativeNotificationsSupported() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

function reminderStorageKey(contactId: string) {
  return `${REMINDER_STORAGE_PREFIX}${contactId}`;
}

function reminderIdentifier(contactId: string) {
  return `${REMINDER_ID_PREFIX}${contactId}`;
}

function scheduledDateForFollowUp(followUpDate: string) {
  const date = new Date(`${followUpDate}T09:00:00`);
  if (Number.isNaN(date.getTime())) return null;

  const soon = new Date(Date.now() + 60 * 1000);
  return date > soon ? date : soon;
}

function reminderBody(contact: ReminderContact) {
  const company = contact.company?.trim();
  return company
    ? `Follow up with ${contact.name} from ${company}.`
    : `Follow up with ${contact.name}.`;
}

async function configureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Follow-up reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#1677F2',
  });
}

export function configureNotificationPresentation() {
  if (!isNativeNotificationsSupported()) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function getRemindersEnabled() {
  if (!isNativeNotificationsSupported()) return false;
  return AsyncStorage.getItem(REMINDERS_ENABLED_KEY).then((value) => value === 'true');
}

export async function setRemindersEnabled(enabled: boolean) {
  if (!isNativeNotificationsSupported()) return false;
  await AsyncStorage.setItem(REMINDERS_ENABLED_KEY, enabled ? 'true' : 'false');
  if (!enabled) await cancelAllFollowUpReminders();
  return enabled;
}

export async function getReminderStatus(): Promise<ReminderStatus> {
  if (!isNativeNotificationsSupported()) return 'unsupported';
  const enabled = await getRemindersEnabled();
  if (!enabled) return 'off';

  const permissions = await Notifications.getPermissionsAsync();
  return permissions.granted ? 'on' : 'denied';
}

export async function requestReminderPermission() {
  if (!isNativeNotificationsSupported()) return false;
  await configureAndroidChannel();

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) {
    await setRemindersEnabled(true);
    return true;
  }

  if (!existing.canAskAgain) {
    await setRemindersEnabled(false);
    return false;
  }

  const requested = await Notifications.requestPermissionsAsync();
  await setRemindersEnabled(requested.granted);
  return requested.granted;
}

export async function cancelFollowUpReminder(contactId: string) {
  if (!isNativeNotificationsSupported()) return;

  const storedIdentifier = await AsyncStorage.getItem(reminderStorageKey(contactId));
  const identifier = storedIdentifier ?? reminderIdentifier(contactId);

  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => null);
  await AsyncStorage.removeItem(reminderStorageKey(contactId));
}

export async function cancelAllFollowUpReminders() {
  if (!isNativeNotificationsSupported()) return;

  const keys = await AsyncStorage.getAllKeys();
  const reminderKeys = keys.filter((key) => key.startsWith(REMINDER_STORAGE_PREFIX));
  const storedIdentifiers = reminderKeys.length ? await AsyncStorage.multiGet(reminderKeys) : [];

  await Promise.all(
    storedIdentifiers
      .map(([, identifier]) => identifier)
      .filter((identifier): identifier is string => Boolean(identifier))
      .map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier).catch(() => null)),
  );

  if (reminderKeys.length) await AsyncStorage.multiRemove(reminderKeys);
}

export async function scheduleFollowUpReminder(contact: ReminderContact) {
  if (!isNativeNotificationsSupported()) return false;

  await cancelFollowUpReminder(contact.id);
  if (!contact.follow_up_date) return false;

  const enabled = await getRemindersEnabled();
  if (!enabled) return false;

  const permissions = await Notifications.getPermissionsAsync();
  if (!permissions.granted) return false;

  const date = scheduledDateForFollowUp(contact.follow_up_date);
  if (!date) return false;

  await configureAndroidChannel();
  const identifier = await Notifications.scheduleNotificationAsync({
    identifier: reminderIdentifier(contact.id),
    content: {
      title: 'Time to follow up',
      body: reminderBody(contact),
      sound: 'default',
      data: {
        contactId: contact.id,
        followUpDate: contact.follow_up_date,
        route: `/contact/${contact.id}`,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: REMINDER_CHANNEL_ID,
    },
  });

  await AsyncStorage.setItem(reminderStorageKey(contact.id), identifier);
  return true;
}

export async function syncFollowUpReminders(userId: string) {
  if (!isNativeNotificationsSupported()) return false;

  const status = await getReminderStatus();
  if (status !== 'on') return false;

  const { data, error } = await supabase
    .from('contacts')
    .select('id,name,company,follow_up_date')
    .eq('user_id', userId)
    .not('follow_up_date', 'is', null)
    .gte('follow_up_date', todayDateString())
    .order('follow_up_date', { ascending: true })
    .limit(MAX_SCHEDULED_REMINDERS);

  if (error) return false;

  await cancelAllFollowUpReminders();
  const contacts = (data ?? []) as ReminderContact[];
  await Promise.all(contacts.map((contact) => scheduleFollowUpReminder(contact)));
  return true;
}
