import { Trip } from '@/types/api';
import { CONFIG } from '@/constants/config';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const getTripShareUrl = (documentId: string) =>
  `${trimTrailingSlash(CONFIG.SHARE_BASE_URL)}/trip/${documentId}`;

export const buildTripShareMessage = (trip: Pick<Trip, 'documentId' | 'startingPoint' | 'destination' | 'date' | 'time'>) => {
  const shareUrl = getTripShareUrl(trip.documentId);

  return [
    `Ride shared on My Ride Partner`,
    `${trip.startingPoint} to ${trip.destination}`,
    `${trip.date} at ${trip.time}`,
    shareUrl,
  ].join('\n');
};
