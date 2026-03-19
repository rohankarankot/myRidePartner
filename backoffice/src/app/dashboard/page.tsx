import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    return redirect('/auth/signin');
  } else {
    redirect('/dashboard/overview');
  }
}
