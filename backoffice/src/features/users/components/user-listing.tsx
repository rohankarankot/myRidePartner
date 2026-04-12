'use client';

import { UserTable } from './user-tables';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { User } from './user-tables/columns';
import { adminGet, type PaginatedResult } from '@/lib/admin-fetch';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function UserListingPage() {
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;

  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [perPage] = useQueryState('perPage', parseAsInteger.withDefault(10));
  const [q, setQ] = useQueryState('q', parseAsString.withDefault(''));
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
      const res = await adminGet<PaginatedResult<User>>(accessToken, '/api/admin/users', {
        page,
        limit: perPage,
        search: q || undefined,
      });
      setData(res.items);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [accessToken, page, perPage, q]);

  useEffect(() => {
    const onRefresh = () => {
      void load();
    };
    window.addEventListener('admin:users-refresh', onRefresh);
    return () => window.removeEventListener('admin:users-refresh', onRefresh);
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
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <Heading
            title={`Users (${total})`}
            description='Manage registered users of MyRidePartner.'
          />
          <div className='relative w-full sm:max-w-xs'>
            <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              placeholder='Search email, name…'
              className='pl-9'
              value={searchInput}
              onChange={(e) => {
                const v = e.target.value;
                setSearchInput(v);
                debouncedSetQ(v);
              }}
            />
            {searchInput ? (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='absolute top-0.5 right-1 h-8 px-2'
                onClick={() => {
                  setSearchInput('');
                  void setPage(1);
                  void setQ(null);
                }}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>
        <Separator />
        {loading ? (
          <p className='text-muted-foreground text-sm'>Loading…</p>
        ) : (
          <UserTable data={data} totalItems={total} />
        )}
      </div>
    </PageContainer>
  );
}
