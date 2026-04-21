'use client';

import { Button } from '@bo/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@bo/components/ui/dropdown-menu';
import { Trip } from './columns';
import { MoreHorizontal, Ban } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { adminPatch } from '@bo/lib/admin-fetch';

interface CellActionProps {
  data: Trip;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const refresh = () => {
    window.dispatchEvent(new Event('admin:trips-refresh'));
  };

  const onCancel = async () => {
    if (!accessToken) {
      toast.error('Not signed in');
      return;
    }
    if (data.status === 'CANCELLED') {
      toast.message('Trip already cancelled');
      return;
    }
    setLoading(true);
    try {
      await adminPatch(
        accessToken,
        `/api/admin/trips/${data.documentId}/status`,
        { status: 'CANCELLED' },
      );
      toast.success('Trip cancelled');
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' className='h-8 w-8 p-0' disabled={loading}>
          <span className='sr-only'>Open menu</span>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={onCancel}
          disabled={data.status === 'CANCELLED'}
          className='text-orange-600'
        >
          <Ban className='mr-2 h-4 w-4' /> Cancel trip
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
