'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { Badge } from '@/components/ui/badge';

export interface JoinRequest {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  requestedSeats: number;
  message: string | null;
  passenger: {
    email: string;
    username: string | null;
    userProfile: {
      fullName: string | null;
      avatar: string | null;
    } | null;
  };
  trip: {
    from: string;
    to: string;
    departureTime: string;
    creator: {
      userProfile: {
        fullName: string | null;
      } | null;
    };
  };
  createdAt: string;
}

export const columns: ColumnDef<JoinRequest>[] = [
  {
    accessorKey: 'passenger.userProfile.avatar',
    header: 'PASSENGER',
    cell: ({ row }) => {
      const request = row.original;
      return (
        <UserAvatarProfile
          user={{
            image: request.passenger.userProfile?.avatar,
            name: request.passenger.userProfile?.fullName || request.passenger.username || request.passenger.email,
            email: request.passenger.email,
          }}
          showInfo
        />
      );
    },
  },
  {
    accessorKey: 'trip',
    header: 'TRIP',
    cell: ({ row }) => {
      const trip = row.original.trip;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{trip.from} → {trip.to}</span>
          <span className="text-xs text-muted-foreground">{trip.creator.userProfile?.fullName || 'Captain'}</span>
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
        <Badge variant={status === 'APPROVED' ? 'default' : status === 'PENDING' ? 'secondary' : 'destructive'}>
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
