import type { Metadata } from 'next';
import { UserList } from '@/features/users/components/UserList';

export const metadata: Metadata = {
  title: 'Usuarios — MecaTrack',
};

export default function AdminUsersPage() {
  return <UserList />;
}
