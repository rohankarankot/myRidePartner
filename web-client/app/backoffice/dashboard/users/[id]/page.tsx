import { UserSupportView } from '@bo/features/users/components/user-support-view';

export const metadata = {
  title: 'Dashboard: User support'
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  const userId = parseInt(id, 10);
  if (Number.isNaN(userId)) {
    return <p>Invalid user id</p>;
  }
  return <UserSupportView userId={userId} />;
}
