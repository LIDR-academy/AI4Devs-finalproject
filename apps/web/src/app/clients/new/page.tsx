'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ClientForm } from '@/features/clients';

export default function NewClientPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Nuevo cliente</h1>
        <p className="mt-1 text-sm text-slate-600">
          Completa los datos para registrar un cliente en el taller.
        </p>
      </div>

      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <ClientForm onCancel={() => router.push('/clients')} />
      </div>

      <Link href="/clients" className="text-sm font-medium text-blue-600 hover:text-blue-700">
        Cancelar y volver a búsqueda
      </Link>
    </div>
  );
}
