import { format, isToday, isTomorrow } from 'date-fns';
import { Trip } from '@/types/api';
import { buildTripStartDateTime } from '@/features/trips/utils/trip-editability';

export const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';

  const tripDate = new Date(dateStr);
  if (isToday(tripDate)) return 'Today';
  if (isTomorrow(tripDate)) return 'Tomorrow';

  return format(tripDate, 'MMM d');
};

export const filterAndSortTrips = ({
  blockedUserIds,
  trips,
  userId,
}: {
  blockedUserIds: number[];
  trips: Trip[];
  userId?: number;
}) => {
  const now = new Date();

  return trips
    .filter((trip) => {
      const isOwnTrip = Boolean(userId && trip.creator?.id === userId);
      const isBlockedCreator = trip.creator?.id ? blockedUserIds.includes(trip.creator.id) : false;
      const isUpcoming = buildTripStartDateTime(trip.date, trip.time).getTime() > now.getTime();
      const isPublished = trip.status === 'PUBLISHED';

      return !isOwnTrip && !isBlockedCreator && isUpcoming && isPublished;
    })
    .sort(
      (a, b) =>
        buildTripStartDateTime(a.date, a.time).getTime() -
        buildTripStartDateTime(b.date, b.time).getTime()
    );
};
