'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Badge } from '@bo/components/ui/badge';

export type ReportReviewStatus =
  | 'PENDING'
  | 'REVIEWED'
  | 'DISMISSED'
  | 'ACTION_TAKEN';

export interface UserReportRow {
  id: number;
  documentId: string;
  reason: string;
  source: string;
  targetType: string;
  tripDocumentId: string | null;
  messageDocumentId: string | null;
  messagePreview: string | null;
  reviewStatus: ReportReviewStatus;
  reviewNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  reportedUser: { id: number; username: string | null; email: string };
  reporter: { id: number; username: string | null; email: string };
  reviewedBy: { id: number; email: string } | null;
}

export const columns: ColumnDef<UserReportRow>[] = [
  {
    accessorKey: 'createdAt',
    header: 'REPORTED',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    id: 'reporter',
    header: 'REPORTER',
    cell: ({ row }) => (
      <div className='text-sm'>
        <div>{row.original.reporter.email}</div>
      </div>
    ),
  },
  {
    id: 'reported',
    header: 'REPORTED USER',
    cell: ({ row }) => (
      <div className='text-sm'>
        <div>{row.original.reportedUser.email}</div>
      </div>
    ),
  },
  {
    accessorKey: 'reason',
    header: 'REASON',
  },
  {
    accessorKey: 'source',
    header: 'SOURCE',
    cell: ({ row }) => <Badge variant='outline'>{row.original.source}</Badge>,
  },
  {
    accessorKey: 'reviewStatus',
    header: 'REVIEW',
    cell: ({ row }) => (
      <Badge variant='secondary'>{row.original.reviewStatus}</Badge>
    ),
  },
  {
    id: 'preview',
    header: 'CONTEXT',
    cell: ({ row }) => (
      <div className='text-muted-foreground max-w-[220px] truncate text-xs'>
        {row.original.tripDocumentId && (
          <span>Trip: {row.original.tripDocumentId.slice(0, 8)}… </span>
        )}
        {row.original.messagePreview || '—'}
      </div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
