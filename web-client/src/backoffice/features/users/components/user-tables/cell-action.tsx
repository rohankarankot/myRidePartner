'use client';

import { Button } from '@bo/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@bo/components/ui/dropdown-menu';
import { User } from './columns';
import { MoreHorizontal, UserX, UserCheck, PauseCircle, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { adminPatch } from '@bo/lib/admin-fetch';
import Link from 'next/link';

interface CellActionProps {
  data: User;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const refresh = () => {
    window.dispatchEvent(new Event('admin:users-refresh'));
  };

  const run = async (fn: () => Promise<void>) => {
    if (!accessToken) {
      toast.error('Not signed in');
      return;
    }
    setLoading(true);
    try {
      await fn();
      toast.success('Updated');
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const onBlockToggle = () =>
    run(() =>
      adminPatch(
        accessToken!,
        `/api/admin/users/${data.id}/block`,
        { blocked: !data.blocked },
      ),
    );

  const onPause = () =>
    run(() =>
      adminPatch(accessToken!, `/api/admin/users/${data.id}/account-status`, {
        accountStatus: 'PAUSED',
      }),
    );

  const onActivate = () =>
    run(() =>
      adminPatch(accessToken!, `/api/admin/users/${data.id}/account-status`, {
        accountStatus: 'ACTIVE',
      }),
    );

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0' disabled={loading}>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link href={`/backoffice/dashboard/users/${data.id}`}>360 view</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onBlockToggle}>
            {data.blocked ? (
              <>
                <UserCheck className='mr-2 h-4 w-4' /> Unblock user
              </>
            ) : (
              <>
                <UserX className='mr-2 h-4 w-4' /> Block user
              </>
            )}
          </DropdownMenuItem>
          {data.accountStatus === 'PAUSED' ? (
            <DropdownMenuItem onClick={onActivate}>
              <PlayCircle className='mr-2 h-4 w-4' /> Activate account
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={onPause}>
              <PauseCircle className='mr-2 h-4 w-4' /> Pause account
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
