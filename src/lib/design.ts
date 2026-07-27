import { colors } from '@/constants/colors';
import { todayDateString } from '@/lib/date';
import type { Contact, ContactStatus } from '@/types/database';

const avatarTints = ['#3A6FD8', '#5B5F9E', '#2E7D74', '#8A5A4E', '#6E5B9E', '#3F7A5A', '#8A6A2E', '#4A6E8A', '#7A4E6E', '#5A7A3F'];

export function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?';
}

export function avatarColor(seed: string) {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) hash = (hash + seed.charCodeAt(index) * (index + 1)) % avatarTints.length;
  return avatarTints[hash];
}

export function contactLine(contact: Pick<Contact, 'role' | 'company'>) {
  return [contact.role, contact.company].filter(Boolean).join(' · ') || 'No role or company yet';
}

export function isDue(contact: Pick<Contact, 'follow_up_date'>) {
  return Boolean(contact.follow_up_date && contact.follow_up_date <= todayDateString());
}

export function isOverdue(contact: Pick<Contact, 'follow_up_date'>) {
  return Boolean(contact.follow_up_date && contact.follow_up_date < todayDateString());
}

export function compactDueLabel(value: string | null) {
  if (!value) return 'No nudge';
  const today = todayDateString();
  const todayTime = new Date(`${today}T12:00:00`).getTime();
  const valueTime = new Date(`${value}T12:00:00`).getTime();
  const dayDelta = Math.round((valueTime - todayTime) / 86400000);
  if (dayDelta < 0) return `${Math.abs(dayDelta)}d late`;
  if (dayDelta === 0) return 'Due today';
  if (dayDelta === 1) return 'Tomorrow';
  return `in ${dayDelta}d`;
}

export function dueTone(value: string | null) {
  if (!value) return { color: colors.textSubtle, backgroundColor: colors.surfaceMuted };
  if (value < todayDateString()) return { color: colors.danger, backgroundColor: colors.dangerSoft };
  if (value === todayDateString()) return { color: colors.primaryDark, backgroundColor: colors.primarySoft };
  return { color: colors.textMuted, backgroundColor: colors.surfaceMuted };
}

export function statusTone(status: ContactStatus) {
  if (status === 'Strong connection') return { color: colors.success, backgroundColor: colors.successSoft };
  if (status === 'Follow-up needed') return { color: colors.warning, backgroundColor: colors.warningSoft };
  if (status === 'Not interested') return { color: colors.danger, backgroundColor: colors.dangerSoft };
  if (status === 'Spoke with them' || status === 'Call scheduled') return { color: colors.primaryDark, backgroundColor: colors.primarySoft };
  return { color: colors.textMuted, backgroundColor: colors.surfaceMuted };
}
