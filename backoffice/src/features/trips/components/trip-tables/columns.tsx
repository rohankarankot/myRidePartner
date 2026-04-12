'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { Badge } from '@/components/ui/badge';

export interface Trip {
  id: number;
  documentId: string;
  startingPoint: string;
  destination: string;
  date: string;
  time: string;
  availableSeats: number;
  pricePerSeat: string | number | null;
  status: 'PUBLISHED' | 'STARTED' | 'COMPLETED' | 'CANCELLED';
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

function formatPrice(v: string | number | null | undefined) {
  if (v === null || v === undefined) {
    return '—';
  }
  const n = typeof v === 'string' ? parseFloat(v) : v;
  if (Number.isNaN(n)) {
    return String(v);
  }
  return n.toFixed(2);
}

export const columns: ColumnDef<Trip>[] = [
  {
    id: 'creator',
    header: 'CREATOR',
    cell: ({ row }) => {
      const trip = row.original;
      return (
        <UserAvatarProfile
          user={{
            image: trip.creator.userProfile?.avatar,
            name:
              trip.creator.userProfile?.fullName ||
              trip.creator.username ||
              trip.creator.email,
            email: trip.creator.email,
          }}
          showInfo
        />
      );
    },
  },
  {
    accessorKey: 'startingPoint',
    header: 'FROM',
  },
  {
    accessorKey: 'destination',
    header: 'TO',
  },
  {
    id: 'when',
    header: 'WHEN',
    cell: ({ row }) => {
      const t = row.original;
      return (
        <span className='text-sm'>
          {t.date} {t.time}
        </span>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'STATUS',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return <Badge variant='outline'>{status}</Badge>;
    },
  },
  {
    accessorKey: '_count.joinRequests',
    header: 'APPROVED',
    cell: ({ row }) => row.original._count?.joinRequests ?? 0,
  },
  {
    accessorKey: 'availableSeats',
    header: 'SEATS',
  },
  {
    id: 'price',
    header: 'PRICE/SEAT',
    cell: ({ row }) => formatPrice(row.original.pricePerSeat),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
