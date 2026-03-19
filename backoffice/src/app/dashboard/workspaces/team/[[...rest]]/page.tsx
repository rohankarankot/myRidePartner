'use client';

import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function TeamPage() {
  const { data: session, status } = useSession();
  const isLoaded = status !== 'loading';

  return (
    <PageContainer
      isloading={!isLoaded}
      pageTitle='Team Management'
      pageDescription='Administrative team and roles management'
    >
      <div className='space-y-6'>
        <Alert>
          <Info className='h-4 w-4' />
          <AlertDescription>
            Team management is currently restricted to the system administrator. 
            User roles and permissions are defined in the central authentication system.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Administrative Role</CardTitle>
            <CardDescription>
              User: {session?.user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className='text-muted-foreground'>
               Your current role is {(session?.user as any)?.role || 'SUPER_ADMIN'}. 
               This role provides full access to all backoffice features.
             </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
