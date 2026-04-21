'use client';

import PageContainer from '@bo/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@bo/components/ui/card';
import { useSession } from 'next-auth/react';
import { BadgeCheck, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@bo/components/ui/alert';

export default function ExclusivePage() {
  const { data: session, status } = useSession();
  const isLoaded = status !== 'loading';
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN';

  return (
    <PageContainer isloading={!isLoaded}>
      {!isSuperAdmin ? (
        <div className='flex h-full items-center justify-center'>
          <Alert>
            <Lock className='h-5 w-5 text-yellow-600' />
            <AlertDescription>
              <div className='mb-1 text-lg font-semibold'>
                Super Admin Access Required
              </div>
              <div className='text-muted-foreground'>
                This page is only available to users with the{' '}
                <span className='font-semibold'>SUPER_ADMIN</span> role.
              </div>
            </AlertDescription>
          </Alert>
        </div>
      ) : (
        <div className='space-y-6'>
          <div>
            <h1 className='flex items-center gap-2 text-3xl font-bold tracking-tight'>
              <BadgeCheck className='h-7 w-7 text-green-600' />
              Exclusive Admin Area
            </h1>
            <p className='text-muted-foreground'>
              Welcome, <span className='font-semibold'>{session?.user?.name}</span>! 
              This page contains exclusive features for Super Administrators.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
                Administrative Controls
              </CardTitle>
              <CardDescription>
                You have full access to high-level system settings and analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-lg'>Manage your platform with confidence.</div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
