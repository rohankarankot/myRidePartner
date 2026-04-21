import SignInViewPage from '@bo/features/auth/components/sign-in-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | MyRidePartner',
  description: 'Sign in to your MyRidePartner admin account'
};

export default function Page() {
  return <SignInViewPage stars={0} />;
}
