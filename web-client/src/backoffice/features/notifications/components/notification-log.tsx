'use client';

import PageContainer from '@bo/components/layout/page-container';
import { Heading } from '@bo/components/ui/heading';
import { Separator } from '@bo/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@bo/components/ui/table';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { adminGet, type PaginatedResult } from '@bo/lib/admin-fetch';
import { parseAsInteger, useQueryState } from 'nuqs';
import { Button } from '@bo/components/ui/button';
import Link from 'next/link';

type Row = {
  id: number;
  documentId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
  user: { id: number; email: string; username: string | null };
};

export default function NotificationLogPage() {
  const [data, setData] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(20));
  const [userId] = useQueryState('userId', parseAsInteger);

  const load = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setLoading(true);
    try {
      const res = await adminGet<PaginatedResult<Row>>(
        accessToken,
        '/api/admin/notifications',
        {
          page,
          limit: perPage,
          userId: userId ?? undefined,
        },
      );
      setData(res.items);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, perPage, userId]);

  useEffect(() => {
    if (status === 'authenticated' && accessToken) {
      void load();
    }
    if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, accessToken, load]);

  return (
    <PageContainer scrollable>
      <div className='space-y-4'>
        <Heading
          title={`Notifications (${total})`}
          description={
            userId
              ? `Filtered to user #${userId}`
              : 'Recent push/in-app notification records.'
          }
        />
        <Separator />
        {userId ? (
          <Button asChild variant='outline' size='sm'>
            <Link href='/backoffice/dashboard/notifications'>Clear user filter</Link>
          </Button>
        ) : null}
        {loading ? (
          <p className='text-muted-foreground text-sm'>Loading…</p>
        ) : (
          <>
          <div className='rounded-md border'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Read</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className='whitespace-nowrap text-sm'>
                      {new Date(n.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Link
                        className='text-primary underline-offset-4 hover:underline'
                        href={`/backoffice/dashboard/users/${n.user.id}`}
                      >
                        {n.user.email}
                      </Link>
                    </TableCell>
                    <TableCell>{n.type}</TableCell>
                    <TableCell className='max-w-[280px] truncate'>
                      {n.title}
                    </TableCell>
                    <TableCell>{n.read ? 'yes' : 'no'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className='text-muted-foreground flex items-center justify-between gap-2 text-sm'>
            <span>
              Page {page} · {total} total
            </span>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                disabled={page <= 1}
                onClick={() => void setPage(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                disabled={page * perPage >= total}
                onClick={() => void setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
