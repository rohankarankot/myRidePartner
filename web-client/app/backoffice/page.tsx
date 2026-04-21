import { auth } from '@bo/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const session = await auth();

  if (!session) {
    return redirect('/backoffice/auth/signin');
  } else {
    redirect('/backoffice/dashboard/overview');
  }
}
