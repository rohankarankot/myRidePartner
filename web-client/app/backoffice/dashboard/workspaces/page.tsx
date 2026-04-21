'use client';

import PageContainer from '@bo/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@bo/components/ui/card';
import { useSession } from 'next-auth/react';
import { Alert, AlertDescription } from '@bo/components/ui/alert';
import { Info } from 'lucide-react';

export default function WorkspacesPage() {
  const { data: session, status } = useSession();
  const isLoaded = status !== 'loading';

  return (
    <PageContainer
      isloading={!isLoaded}
      pageTitle='Workspaces'
      pageDescription='Administrative workspace management'
    >
      <div className='space-y-6'>
        <Alert>
          <Info className='h-4 w-4' />
          <AlertDescription>
            Multi-workspace management is currently handled by the system administrator. 
            All administrative tasks are performed within the primary backoffice context.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Active Workspace</CardTitle>
            <CardDescription>
              Primary MyRidePartner Administrative Workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className='text-muted-foreground'>
               You are currently operating in the global administrative context as {(session?.user as any)?.role || 'SUPER_ADMIN'}.
             </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
