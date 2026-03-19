'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function BillingPage() {
  const { data: session, status } = useSession();
  const isLoaded = status !== 'loading';

  return (
    <PageContainer
      isloading={!isLoaded}
      pageTitle='Billing & Plans'
      pageDescription='Subscription management is currently handled by the system administrator.'
    >
      <div className='space-y-6'>
        <Alert>
          <Info className='h-4 w-4' />
          <AlertDescription>
            Billing information for MyRidePartner is managed centrally. 
            Individual workspace billing is not available in the current administrative configuration.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
            <CardDescription>
              Backend administrative access is active.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className='text-muted-foreground'>
               Your account ({(session?.user as any)?.role || 'SUPER_ADMIN'}) has full access to the backoffice management features.
             </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
