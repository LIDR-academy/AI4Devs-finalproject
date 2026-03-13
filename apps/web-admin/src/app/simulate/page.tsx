import { getStores, getUsersForSimulate } from '@/lib/api';
import { SimulationPage } from '@/components/simulate/simulation-page';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Simulación | Adresles Admin' };

export default async function SimulatePage() {
  const [storesData, usersData] = await Promise.all([
    getStores(),
    getUsersForSimulate(),
  ]);

  return (
    <SimulationPage
      stores={storesData.data}
      users={usersData.data}
    />
  );
}
