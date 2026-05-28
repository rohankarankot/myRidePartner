type NotificationLike = {
  title?: string | null;
  body?: string | null;
  data?: Record<string, unknown> | null;
};

const SEEN_WINDOW_MS = 10_000;
const seenNotifications = new Map<string, number>();

function normalizeValue(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

export function buildNotificationDedupeKey(notification: NotificationLike) {
  const data = notification.data ?? {};
  const parts = [
    normalizeValue(data.type),
    normalizeValue(data.relatedId),
    normalizeValue(data.messageDocumentId),
    normalizeValue(data.tripId),
    normalizeValue(data.tripDocumentId),
    normalizeValue(data.groupDocumentId),
    normalizeValue(data.screen),
    normalizeValue(notification.title),
    normalizeValue(notification.body),
  ].filter(Boolean);

  return parts.join('|') || `notification:${Date.now()}`;
}

export function shouldSuppressNotification(key: string) {
  const now = Date.now();
  const lastSeen = seenNotifications.get(key);

  if (lastSeen && now - lastSeen < SEEN_WINDOW_MS) {
    return true;
  }

  seenNotifications.set(key, now);

  for (const [seenKey, timestamp] of seenNotifications.entries()) {
    if (now - timestamp > SEEN_WINDOW_MS) {
      seenNotifications.delete(seenKey);
    }
  }

  return false;
}
