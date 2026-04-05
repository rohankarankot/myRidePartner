import { JoinRequest, Trip } from '@/types/api';

const parseTripTime = (tripTime: string) => {
  const normalizedTime = tripTime.replace(/\s+/g, ' ').trim();
  const timeMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);

  if (!timeMatch) {
    return { hours: 0, minutes: 0 };
  }

  const [, rawHoursText, rawMinutesText, meridiemRaw] = timeMatch;
  const rawHours = Number.parseInt(rawHoursText, 10);
  const rawMinutes = Number.parseInt(rawMinutesText, 10);
  const meridiem = meridiemRaw?.toUpperCase();

  let hours = Number.isFinite(rawHours) ? rawHours : 0;
  const minutes = Number.isFinite(rawMinutes) ? rawMinutes : 0;

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }

  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  return { hours, minutes };
};

export const buildTripStartDateTime = (tripDate: string, tripTime: string) => {
  const tripStart = new Date(`${tripDate}T00:00:00`);
  const { hours, minutes } = parseTripTime(tripTime);

  tripStart.setHours(hours, minutes, 0, 0);
  return tripStart;
};

export const hasApprovedPassengers = (joinRequests: JoinRequest[]) =>
  joinRequests.some((request) => request.status === 'APPROVED');

export const canCaptainEditTrip = ({
  trip,
  joinRequests,
  currentUserId,
  now = new Date(),
}: {
  trip: Trip | null | undefined;
  joinRequests: JoinRequest[];
  currentUserId?: number;
  now?: Date;
}) => {
  if (!trip || !currentUserId) {
    return false;
  }

  if (trip.creator?.id !== currentUserId || trip.status !== 'PUBLISHED') {
    return false;
  }

  if (hasApprovedPassengers(joinRequests)) {
    return false;
  }

  return buildTripStartDateTime(trip.date, trip.time).getTime() > now.getTime();
};
