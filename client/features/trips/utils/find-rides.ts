import { format, isToday, isTomorrow } from 'date-fns';
import { Trip } from '@/types/api';

export const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';

  const tripDate = new Date(dateStr);
  if (isToday(tripDate)) return 'Today';
  if (isTomorrow(tripDate)) return 'Tomorrow';

  return format(tripDate, 'MMM d');
};

export const filterAndSortTrips = ({
  blockedUserIds,
  date,
  trips,
  userId,
}: {
  blockedUserIds: number[];
  date?: Date;
  trips: Trip[];
  userId?: number;
}) => {
  const todayString = format(new Date(), 'yyyy-MM-dd');

  return trips
    .filter((trip) => {
      const isOwnTrip = Boolean(userId && trip.creator?.id === userId);
      const isBlockedCreator = trip.creator?.id ? blockedUserIds.includes(trip.creator.id) : false;
      const isUpcoming = date ? true : trip.date >= todayString;
      const isPublished = trip.status === 'PUBLISHED';

      return !isOwnTrip && !isBlockedCreator && isUpcoming && isPublished;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
