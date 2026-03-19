'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { JoinRequest } from './columns';
import { Eye, MoreHorizontal, Trash, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface CellActionProps {
  data: JoinRequest;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);

  const onApprove = async () => {
    setLoading(true);
    // TODO: Implement approve API
    toast.success(`Request from ${data.passenger.email} approved`);
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
            onClick={() => window.open(`/dashboard/requests/${data.id}`, '_blank')}
          >
            <Eye className='mr-2 h-4 w-4' /> View Message
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onApprove} className="text-green-500">
            <CheckCircle className='mr-2 h-4 w-4' /> Approve Request
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-500">
            <XCircle className='mr-2 h-4 w-4' /> Reject Request
          </DropdownMenuItem>
          <DropdownMenuItem className="text-red-700">
            <Trash className='mr-2 h-4 w-4' /> Delete Request
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
