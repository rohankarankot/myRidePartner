'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { Badge } from '@/components/ui/badge';

export interface JoinRequest {
  id: number;
  documentId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  requestedSeats: number;
  message: string | null;
  passenger: {
    id: number;
    email: string;
    username: string | null;
    userProfile: {
      fullName: string | null;
      avatar: string | null;
    } | null;
  };
  trip: {
    documentId: string;
    startingPoint: string;
    destination: string;
    date: string;
    time: string;
    creator: {
      userProfile: {
        fullName: string | null;
      } | null;
      username: string | null;
      email: string;
    };
  };
  createdAt: string;
}

export const columns: ColumnDef<JoinRequest>[] = [
  {
    id: 'passenger',
    header: 'PASSENGER',
    cell: ({ row }) => {
      const request = row.original;
      return (
        <UserAvatarProfile
          user={{
            image: request.passenger.userProfile?.avatar,
            name:
              request.passenger.userProfile?.fullName ||
              request.passenger.username ||
              request.passenger.email,
            email: request.passenger.email,
          }}
          showInfo
        />
      );
    },
  },
  {
    id: 'trip',
    header: 'TRIP',
    cell: ({ row }) => {
      const trip = row.original.trip;
      return (
        <div className='flex flex-col'>
          <span className='font-medium'>
            {trip.startingPoint} → {trip.destination}
          </span>
          <span className='text-muted-foreground text-xs'>
            {trip.date} {trip.time} ·{' '}
            {trip.creator.userProfile?.fullName ||
              trip.creator.username ||
              trip.creator.email}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: 'requestedSeats',
    header: 'SEATS',
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge
          variant={
            status === 'APPROVED'
              ? 'default'
              : status === 'PENDING'
                ? 'secondary'
                : 'destructive'
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'REQUESTED AT',
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
