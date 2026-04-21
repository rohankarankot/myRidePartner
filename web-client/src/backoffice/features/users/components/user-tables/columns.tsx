'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { UserAvatarProfile } from '@bo/components/user-avatar-profile';
import { Badge } from '@bo/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export interface User {
  id: number;
  username: string | null;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  confirmed: boolean;
  blocked: boolean;
  accountStatus?: 'ACTIVE' | 'PAUSED';
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
    id: 'user',
    accessorFn: (row) => row.userProfile?.avatar,
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
    id: 'account',
    header: 'STATUS',
    cell: ({ row }) => {
      const u = row.original;
      if (u.blocked) {
        return <Badge variant='destructive'>Blocked</Badge>;
      }
      if (u.accountStatus === 'PAUSED') {
        return <Badge variant='secondary'>Paused</Badge>;
      }
      return <Badge variant='outline'>Active</Badge>;
    },
  },
  {
    accessorKey: 'confirmed',
    header: 'CONFIRMED',
    cell: ({ row }) => {
      const confirmed = row.getValue('confirmed') as boolean;
      return confirmed ? (
        <CheckCircle2 className='h-4 w-4 text-green-500' />
      ) : (
        <XCircle className='h-4 w-4 text-red-500' />
      );
    },
  },
  {
    id: 'trips',
    accessorFn: (row) => row._count?.createdTrips || 0,
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
    id: 'support',
    header: '',
    cell: ({ row }) => (
      <Link
        href={`/dashboard/users/${row.original.id}`}
        className='text-primary text-sm underline-offset-4 hover:underline'
      >
        360 view
      </Link>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
