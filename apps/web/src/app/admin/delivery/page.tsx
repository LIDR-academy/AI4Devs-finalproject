import type { Metadata } from 'next';
import { DeliveryPanelPage } from '@/features/delivery-panel/components/DeliveryPanelPage';

export const metadata: Metadata = {
  title: 'Listos para entrega — MecaTrack',
};

export default function AdminDeliveryPage() {
  return <DeliveryPanelPage />;
}
