'use client';

import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { adminGet } from '@/lib/admin-fetch';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type SupportPayload = {
  user: {
    id: number;
    email: string;
    username: string | null;
    blocked: boolean;
    accountStatus: string;
    role: string;
    createdAt: string;
    userProfile: { fullName: string | null; avatar: string | null } | null;
    _count: {
      createdTrips: number;
      joinRequests: number;
      reportsGiven: number;
      reportsReceived: number;
    };
  };
  recentTrips: Array<{
    documentId: string;
    startingPoint: string;
    destination: string;
    date: string;
    time: string;
    status: string;
    createdAt: string;
  }>;
  recentJoinRequests: Array<{
    id: number;
    status: string;
    trip: {
      documentId: string;
      startingPoint: string;
      destination: string;
      status: string;
    };
    createdAt: string;
  }>;
  reportsAsReporter: Array<{
    id: number;
    documentId: string;
    reason: string;
    createdAt: string;
    reportedUser: { id: number; email: string };
  }>;
  reportsAsReported: Array<{
    id: number;
    documentId: string;
    reason: string;
    createdAt: string;
    reporter: { id: number; email: string };
  }>;
  recentNotifications: Array<{
    id: number;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
  }>;
};

export function UserSupportView({ userId }: { userId: number }) {
  const { data: session, status } = useSession();
  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  const [data, setData] = useState<SupportPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !accessToken) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await adminGet<SupportPayload>(
          accessToken,
          `/api/admin/users/${userId}/support`,
        );
        if (!cancelled) {
          setData(res);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load');
          setData(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, accessToken, userId]);

  if (status === 'loading' || (status === 'authenticated' && !data && !error)) {
    return (
      <PageContainer>
        <p className='text-muted-foreground text-sm'>Loading…</p>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer>
        <p className='text-destructive text-sm'>{error || 'User not found'}</p>
        <Button asChild variant='outline' className='mt-4'>
          <Link href='/dashboard/users'>Back to users</Link>
        </Button>
      </PageContainer>
    );
  }

  const u = data.user;

  return (
    <PageContainer scrollable>
      <div className='mb-4 flex items-center gap-2'>
        <Button asChild variant='ghost' size='sm'>
          <Link href='/dashboard/users'>← Users</Link>
        </Button>
      </div>
      <div className='space-y-6'>
        <div className='flex flex-col gap-2'>
          <Heading
            title={u.userProfile?.fullName || u.username || u.email}
            description={`User #${u.id} · ${u.email}`}
          />
          <div className='flex flex-wrap gap-2'>
            <Badge variant='outline'>{u.role}</Badge>
            <Badge variant={u.blocked ? 'destructive' : 'secondary'}>
              {u.blocked ? 'Blocked' : 'Not blocked'}
            </Badge>
            <Badge variant='outline'>{u.accountStatus}</Badge>
          </div>
        </div>
        <Separator />

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {(
            [
              ['Trips created', u._count.createdTrips],
              ['Join requests', u._count.joinRequests],
              ['Reports filed', u._count.reportsGiven],
              ['Reports received', u._count.reportsReceived],
            ] as const
          ).map(([label, count]) => (
            <Card key={label}>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>{label}</CardTitle>
              </CardHeader>
              <CardContent className='text-2xl font-semibold'>{count}</CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent trips (creator)</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            {data.recentTrips.length === 0 ? (
              <p className='text-muted-foreground'>None</p>
            ) : (
              data.recentTrips.map((t) => (
                <div
                  key={t.documentId}
                  className='flex flex-wrap justify-between gap-2 border-b pb-2 last:border-0'
                >
                  <span>
                    {t.startingPoint} → {t.destination}
                  </span>
                  <span className='text-muted-foreground'>
                    {t.date} {t.time} · {t.status}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent join requests</CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            {data.recentJoinRequests.length === 0 ? (
              <p className='text-muted-foreground'>None</p>
            ) : (
              data.recentJoinRequests.map((r) => (
                <div
                  key={r.id}
                  className='flex flex-wrap justify-between gap-2 border-b pb-2 last:border-0'
                >
                  <span>
                    {r.trip.startingPoint} → {r.trip.destination}
                  </span>
                  <span className='text-muted-foreground'>
                    {r.status} · {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className='grid gap-4 md:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle>Reports they filed</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              {data.reportsAsReporter.length === 0 ? (
                <p className='text-muted-foreground'>None</p>
              ) : (
                data.reportsAsReporter.map((r) => (
                  <div key={r.id} className='border-b pb-2 last:border-0'>
                    <div>{r.reason}</div>
                    <div className='text-muted-foreground text-xs'>
                      vs {r.reportedUser.email} ·{' '}
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Reports against them</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2 text-sm'>
              {data.reportsAsReported.length === 0 ? (
                <p className='text-muted-foreground'>None</p>
              ) : (
                data.reportsAsReported.map((r) => (
                  <div key={r.id} className='border-b pb-2 last:border-0'>
                    <div>{r.reason}</div>
                    <div className='text-muted-foreground text-xs'>
                      by {r.reporter.email} ·{' '}
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between'>
            <CardTitle>Recent notifications</CardTitle>
            <Button asChild variant='outline' size='sm'>
              <Link href={`/dashboard/notifications?userId=${u.id}`}>
                Full log
              </Link>
            </Button>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            {data.recentNotifications.length === 0 ? (
              <p className='text-muted-foreground'>None</p>
            ) : (
              data.recentNotifications.map((n) => (
                <div key={n.id} className='border-b pb-2 last:border-0'>
                  <div className='font-medium'>{n.title}</div>
                  <div className='text-muted-foreground'>{n.message}</div>
                  <div className='text-muted-foreground text-xs'>
                    {n.type} · {n.read ? 'read' : 'unread'} ·{' '}
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
