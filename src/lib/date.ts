export function todayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10);
}

export function formatDate(value: string | null, options?: Intl.DateTimeFormatOptions) {
  if (!value) return 'Not set';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, options ?? {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function followUpLabel(value: string) {
  const today = todayDateString();
  if (value < today) return `Overdue · ${formatDate(value, { month: 'short', day: 'numeric' })}`;
  if (value === today) return 'Due today';
  return `Due ${formatDate(value, { month: 'short', day: 'numeric' })}`;
}
