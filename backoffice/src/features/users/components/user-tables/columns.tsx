'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { UserAvatarProfile } from '@/components/user-avatar-profile';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

export interface User {
  id: number;
  username: string | null;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  userProfile: {
    fullName: string | null;
    avatar: string | null;
  } | null;
  _count: {
    createdTrips: number;
    joinRequests: number;
  };
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'userProfile.avatar',
    header: 'USER',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <UserAvatarProfile
          user={{
            image: user.userProfile?.avatar,
            name: user.userProfile?.fullName || user.username || user.email,
            email: user.email,
          }}
          showInfo
        />
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'EMAIL',
  },
  {
    accessorKey: 'role',
    header: 'ROLE',
    cell: ({ row }) => {
      const role = row.getValue('role') as string;
      return (
        <Badge variant={role === 'SUPER_ADMIN' ? 'default' : 'outline'}>
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'confirmed',
    header: 'CONFIRMED',
    cell: ({ row }) => {
      const confirmed = row.getValue('confirmed') as boolean;
      return confirmed ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      );
    },
  },
  {
    accessorKey: '_count.createdTrips',
    header: 'TRIPS',
  },
  {
    accessorKey: 'createdAt',
    header: 'JOINED',
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleDateString();
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
