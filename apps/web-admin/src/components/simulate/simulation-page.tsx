'use client';

import { useState } from 'react';
import { SimulateStore, AdminUser } from '@/types/api';
import { OrderSummaryBar } from './order-summary-bar';
import { SimulationEmptyState } from './simulation-empty-state';
import { OrderConfigModal } from './order-config-modal';
import { SimulationChat } from './simulation-chat';

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

      {/* Zona B+C: gestionadas por SimulationChat cuando hay conversación activa */}
      {!activeConversation ? (
        <SimulationEmptyState onNewSimulation={() => setModalOpen(true)} />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <SimulationChat
            key={activeConversation.conversationId}
            conversationId={activeConversation.conversationId}
          />
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
