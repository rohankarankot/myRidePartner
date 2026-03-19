'use client';

import { TripTable } from './trip-tables';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Trip } from './trip-tables/columns';

export default function TripListingPage() {
  const [data, setData] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/trips`, {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        });
        if (res.ok) {
          const trips = await res.json();
          setData(trips);
        }
      } catch (error) {
        console.error('Failed to fetch trips:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchTrips();
    }
  }, [session]);

  return (
    <PageContainer scrollable>
      <div className='space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={`Trips (${data.length})`}
            description='Manage all trips published on MyRidePartner.'
          />
        </div>
        <Separator />
        <TripTable data={data} totalItems={data.length} />
      </div>
    </PageContainer>
  );
}
