import { JoinRequestStatus, TripStatus } from '@/types/api';
import { ActivityFilterTab } from '@/features/trips/constants/activity';

type TripLike = {
  status: TripStatus;
};

type RequestLike = {
  status: JoinRequestStatus;
  trip?: {
    status?: TripStatus;
  } | null;
};

export function getFilteredActivityData<TTrip extends TripLike, TRequest extends RequestLike>({
  activeTab,
  requests,
  trips,
}: {
  activeTab: ActivityFilterTab;
  requests: TRequest[];
  trips: TTrip[];
}) {
  let displayTrips: TTrip[] = [];
  let displayRequests: TRequest[] = [];

  switch (activeTab) {
    case 'leading':
      displayTrips = trips;
      break;
    case 'part-of':
      displayRequests = requests;
      break;
    case 'published':
      displayTrips = trips.filter((trip) => trip.status === 'PUBLISHED');
      break;
    case 'in-progress':
      displayTrips = trips.filter((trip) => trip.status === 'STARTED');
      displayRequests = requests.filter(
        (request) => request.trip?.status === 'STARTED' && request.status === 'APPROVED'
      );
      break;
    case 'completed':
      displayTrips = trips.filter((trip) => trip.status === 'COMPLETED');
      displayRequests = requests.filter(
        (request) => request.trip?.status === 'COMPLETED' && request.status === 'APPROVED'
      );
      break;
  }

  return { displayRequests, displayTrips };
}
