import { Trip } from '@/types/api';
import { CONFIG } from '@/constants/config';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const getTripShareUrl = (documentId: string) =>
  `${trimTrailingSlash(CONFIG.SHARE_BASE_URL)}/trip/${documentId}`;

export const buildTripShareMessage = (trip: Pick<Trip, 'documentId' | 'startingPoint' | 'destination' | 'date' | 'time'>) => {
  const shareUrl = getTripShareUrl(trip.documentId);

  return [
    `*Ride shared on My Ride Partner*`,
    '',
    `*From:* ${trip.startingPoint}`,
    `*To:* ${trip.destination}`,
    `*Date:* ${trip.date}`,
    `*Time:* ${trip.time}`,
    '',
    `View trip details:`,
    shareUrl,
  ].join('\n');
};
