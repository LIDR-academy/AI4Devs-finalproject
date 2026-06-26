'use client';

import { ClientProfilePage } from '@/features/history/components/ClientProfilePage';

interface ClientDetailPageProps {
  params: { id: string };
}

export default function ClientDetailPage({ params }: ClientDetailPageProps) {
  return <ClientProfilePage clientId={params.id} />;
}
