import TripListingPage from '@/features/trips/components/trip-listing';
import { SearchParams } from 'nuqs';

export const metadata = {
  title: 'Dashboard: Trip Management'
};

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function Page({ searchParams }: Props) {
  return <TripListingPage />;
}
