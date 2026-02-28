'use client';

import { SimulateStore, AdminUser } from '@/types/api';

interface OrderConfigModalProps {
  open: boolean;
  onClose: () => void;
  stores: SimulateStore[];
  users: AdminUser[];
  onConversationStarted: (data: {
    conversationId: string;
    orderId: string;
    summary: string;
  }) => void;
}

export function OrderConfigModal(_props: OrderConfigModalProps) {
  return null;
}
