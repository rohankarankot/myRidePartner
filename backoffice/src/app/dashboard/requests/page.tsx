import RequestListingPage from '@/features/requests/components/request-listing';
import { SearchParams } from 'nuqs';

export const metadata = {
  title: 'Dashboard: Request Management'
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: Props) {
  return <RequestListingPage />;
}
