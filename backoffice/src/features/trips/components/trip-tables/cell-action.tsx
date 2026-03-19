'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Trip } from './columns';
import { Edit, MoreHorizontal, Trash, Ban } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: Trip;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);

  const onCancel = async () => {
    setLoading(true);
    // TODO: Implement cancel API
    toast.success(`Trip from ${data.from} to ${data.to} cancelled`);
    setLoading(false);
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>Open menu</span>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => window.open(`/dashboard/trips/${data.id}`, '_blank')}
          >
            <Edit className='mr-2 h-4 w-4' /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCancel} className="text-orange-500">
            <Ban className='mr-2 h-4 w-4' /> Cancel Trip
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-500">
            <Trash className='mr-2 h-4 w-4' /> Delete Trip
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
