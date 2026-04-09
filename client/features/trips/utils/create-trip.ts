import { format } from 'date-fns';

export type CreateTripFormErrors = Partial<
  Record<'from' | 'to' | 'date' | 'time' | 'seats' | 'price' | 'description', string>
>;

export const getStartOfDay = (value: Date) => {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const addDays = (value: Date, days: number) => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
};

export const formatTripDate = (value: Date) => format(value, 'yyyy-MM-dd');

export const formatTripTime = (value: Date) =>
  value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

export const CREATE_TRIP_GENDER_OPTIONS = [
  { key: 'men' as const, label: 'Only Men' },
  { key: 'women' as const, label: 'Only Women' },
  { key: 'both' as const, label: 'Both' },
];
