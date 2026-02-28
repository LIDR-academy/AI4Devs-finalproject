'use client';

import { useState } from 'react';
import { SimulateStore, AdminUser } from '@/types/api';
import { OrderSummaryBar } from './order-summary-bar';
import { SimulationEmptyState } from './simulation-empty-state';
import { OrderConfigModal } from './order-config-modal';

interface ActiveConversation {
  conversationId: string;
  orderId: string;
  summary: string;
}

interface SimulationPageProps {
  stores: SimulateStore[];
  users: AdminUser[];
}

export function SimulationPage({ stores, users }: SimulationPageProps) {
  const [activeConversation, setActiveConversation] = useState<ActiveConversation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Zona A: barra de resumen fija */}
      <OrderSummaryBar
        summary={activeConversation?.summary ?? null}
        onNewSimulation={() => setModalOpen(true)}
        onChangeOrder={() => setModalOpen(true)}
      />

      {/* Zona B: área de chat scrollable */}
      <div className="flex-1 overflow-y-auto">
        {!activeConversation ? (
          <SimulationEmptyState onNewSimulation={() => setModalOpen(true)} />
        ) : (
          <div>{/* SimulationChat — CU03-A6 */}</div>
        )}
      </div>

      {/* Zona C: input fijo — CU03-A6 */}
      {activeConversation && (
        <div className="border-t p-4">
          {/* ChatInput — CU03-A6 */}
        </div>
      )}

      {/* Modal de configuración — CU03-A5 */}
      <OrderConfigModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        stores={stores}
        users={users}
        onConversationStarted={(data) => {
          setActiveConversation(data);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
