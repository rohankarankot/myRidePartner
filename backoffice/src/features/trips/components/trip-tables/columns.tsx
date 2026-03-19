'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { Badge } from '@/components/ui/badge';

export interface Trip {
  id: number;
  from: string;
  to: string;
  departureTime: string;
  status: 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';
  seats: number;
  price: number;
  creator: {
    email: string;
    username: string | null;
    userProfile: {
      fullName: string | null;
      avatar: string | null;
    } | null;
  };
  _count: {
    joinRequests: number;
  };
  createdAt: string;
}

export const columns: ColumnDef<Trip>[] = [
  {
    accessorKey: 'creator.userProfile.avatar',
    header: 'CREATOR',
    cell: ({ row }) => {
      const trip = row.original;
      return (
        <UserAvatarProfile
          user={{
            image: trip.creator.userProfile?.avatar,
            name: trip.creator.userProfile?.fullName || trip.creator.username || trip.creator.email,
            email: trip.creator.email,
          }}
          showInfo
        />
      );
    },
  },
  {
    accessorKey: 'from',
    header: 'FROM',
  },
  {
    accessorKey: 'to',
    header: 'TO',
  },
  {
    accessorKey: 'departureTime',
    header: 'DEPARTURE',
    cell: ({ row }) => {
      return new Date(row.getValue('departureTime')).toLocaleString();
    },
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'PUBLISHED' ? 'default' : status === 'COMPLETED' ? 'secondary' : 'destructive'}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: '_count.joinRequests',
    header: 'PASSENGERS',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
