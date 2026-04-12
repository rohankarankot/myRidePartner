'use client';

import { ReportTable } from './report-tables';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { UserReportRow } from './report-tables/columns';
import { adminGet, type PaginatedResult } from '@/lib/admin-fetch';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function ReportListingPage() {
  const [data, setData] = useState<UserReportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
  const [reviewStatus, setReviewStatus] = useQueryState(
    'status',
    parseAsString.withDefault(''),
  );
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    setSearchInput(q);
  }, [q]);

  const debouncedSetQ = useDebouncedCallback((value: string) => {
    void setPage(1);
    void setQ(value || null);
  }, 400);

  const load = useCallback(async () => {
    if (!accessToken) {
      return;
    }
    setLoading(true);
    try {
      const res = await adminGet<PaginatedResult<UserReportRow>>(
        accessToken,
        '/api/admin/reports',
        {
          page,
          limit: perPage,
          search: q || undefined,
          status: reviewStatus || undefined,
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
  }, [accessToken, page, perPage, q, reviewStatus]);

  useEffect(() => {
    const onRefresh = () => void load();
    window.addEventListener('admin:reports-refresh', onRefresh);
    return () => window.removeEventListener('admin:reports-refresh', onRefresh);
  }, [load]);

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
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <Heading
            title={`Reports (${total})`}
            description='Triage user-submitted reports.'
          />
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <Select
              value={reviewStatus || 'all'}
              onValueChange={(v) => {
                void setPage(1);
                void setReviewStatus(v === 'all' ? null : v);
              }}
            >
              <SelectTrigger className='w-full sm:w-[200px]'>
                <SelectValue placeholder='Review status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All statuses</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='REVIEWED'>Reviewed</SelectItem>
                <SelectItem value='DISMISSED'>Dismissed</SelectItem>
                <SelectItem value='ACTION_TAKEN'>Action taken</SelectItem>
              </SelectContent>
            </Select>
            <div className='relative w-full sm:max-w-xs'>
              <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
              <Input
                placeholder='Search email, report id…'
                className='pl-9'
                value={searchInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchInput(v);
                  debouncedSetQ(v);
                }}
              />
            </div>
            {searchInput ? (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  setSearchInput('');
                  void setQ(null);
                }}
              >
                Clear search
              </Button>
            ) : null}
          </div>
        </div>
        <Separator />
        {loading ? (
          <p className='text-muted-foreground text-sm'>Loading…</p>
        ) : (
          <ReportTable data={data} totalItems={total} />
        )}
      </div>
    </PageContainer>
  );
}
