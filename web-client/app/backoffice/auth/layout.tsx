import { Metadata } from 'next';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false
  }
};

export default function AuthLayout({
  children
}: LayoutProps<'/backoffice/auth'>) {
  return children;
}
