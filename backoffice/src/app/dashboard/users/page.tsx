import UserListingPage from '@/features/users/components/user-listing';
import { SearchParams } from 'nuqs';

export const metadata = {
  title: 'Dashboard: User Management'
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: Props) {
  return <UserListingPage />;
}
