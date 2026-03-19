'use client';

import { RequestTable } from './request-tables';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { JoinRequest } from './request-tables/columns';

export default function RequestListingPage() {
  const [data, setData] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/requests`, {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        });
        if (res.ok) {
          const requests = await res.json();
          setData(requests);
        }
      } catch (error) {
        console.error('Failed to fetch requests:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchRequests();
    }
  }, [session]);

  return (
    <PageContainer scrollable>
      <div className='space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={`Join Requests (${data.length})`}
            description='Manage all passenger join requests across the platform.'
          />
        </div>
        <Separator />
        <RequestTable data={data} totalItems={data.length} />
      </div>
    </PageContainer>
  );
}
