import SignInViewPage from '@bo/features/auth/components/sign-in-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | CabCollab',
  description: 'Sign in to your CabCollab admin account'
};

export default function Page() {
  return <SignInViewPage stars={0} />;
}
