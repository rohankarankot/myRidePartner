'use client';

import { Button } from '@bo/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@bo/components/ui/dropdown-menu';
import {
  UserReportRow,
  type ReportReviewStatus,
} from './columns';
import { MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { adminPatch } from '@bo/lib/admin-fetch';
import Link from 'next/link';

interface CellActionProps {
  data: UserReportRow;
}

const STATUSES: ReportReviewStatus[] = [
  'PENDING',
  'REVIEWED',
  'DISMISSED',
  'ACTION_TAKEN',
];

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const refresh = () => {
    window.dispatchEvent(new Event('admin:reports-refresh'));
  };

  const setStatus = (reviewStatus: ReportReviewStatus) => async () => {
    if (!accessToken) {
      toast.error('Not signed in');
      return;
    }
    setLoading(true);
    try {
      await adminPatch(
        accessToken,
        `/api/admin/reports/${data.documentId}`,
        { reviewStatus },
      );
      toast.success('Report updated');
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
        <DropdownMenuLabel>Review</DropdownMenuLabel>
        {STATUSES.map((s) => (
          <DropdownMenuItem key={s} onClick={setStatus(s)}>
            Mark {s.replace('_', ' ')}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/users/${data.reportedUser.id}`}>
            Reported user 360
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/users/${data.reporter.id}`}>
            Reporter 360
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
