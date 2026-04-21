'use client';

import { useSession } from 'next-auth/react';
import PageContainer from '@bo/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@bo/components/ui/card';
import { UserAvatarProfile } from '@bo/components/user-avatar-profile';

export default function ProfileViewPage() {
  const { data: session } = useSession();

  return (
    <PageContainer pageTitle='Profile' pageDescription='View and manage your profile'>
      <div className='flex w-full flex-col'>
        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-4'>
              <UserAvatarProfile user={session?.user} className='h-16 w-16' />
              <div className='space-y-1'>
                <h3 className='text-lg font-medium'>{session?.user?.name}</h3>
                <p className='text-muted-foreground text-sm'>{session?.user?.email}</p>
                <div className='bg-primary/10 text-primary mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold'>
                  {(session?.user as any)?.role || 'User'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
