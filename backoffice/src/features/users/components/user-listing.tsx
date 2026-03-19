'use client';
import { UserTable } from './user-tables';
import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { User } from './user-tables/columns';

export default function UserListingPage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        });
        if (res.ok) {
          const users = await res.json();
          setData(users);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchUsers();
    }
  }, [session]);

  return (
    <PageContainer scrollable>
      <div className='space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title={`Users (${data.length})`}
            description='Manage registered users of MyRidePartner.'
          />
        </div>
        <Separator />
        <UserTable data={data} totalItems={data.length} />
      </div>
    </PageContainer>
  );
}
