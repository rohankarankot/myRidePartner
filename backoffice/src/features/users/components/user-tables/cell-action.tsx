'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { User } from './columns';
import { Edit, MoreHorizontal, Trash, UserX, UserCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: User;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);

  const onBlock = async () => {
    setLoading(true);
    // TODO: Implement block API
    toast.success(`User ${data.email} ${data.blocked ? 'unblocked' : 'blocked'}`);
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
            onClick={() => window.open(`/dashboard/users/${data.id}`, '_blank')}
          >
            <Edit className='mr-2 h-4 w-4' /> View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onBlock}>
            {data.blocked ? (
              <>
                <UserCheck className='mr-2 h-4 w-4' /> Unblock User
              </>
            ) : (
              <>
                <UserX className='mr-2 h-4 w-4' /> Block User
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-500">
            <Trash className='mr-2 h-4 w-4' /> Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
