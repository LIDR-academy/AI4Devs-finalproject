import { cn } from '@/lib/utils';
import type { ConversationType, ConversationStatus } from '@/types/api';

const CONVERSATION_TYPE_LABELS: Record<ConversationType, string> = {
  GET_ADDRESS: 'Dirección',
  INFORMATION: 'Información',
  REGISTER: 'Registro',
  GIFT_NOTIFICATION: 'Regalo',
  SUPPORT: 'Soporte',
};

const CONVERSATION_STATUS_STYLES: Record<ConversationStatus, string> = {
  ACTIVE: 'bg-brand-teal/10 text-brand-teal',
  WAITING_USER: 'bg-brand-lime text-brand-black',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  ESCALATED: 'bg-orange-100 text-orange-700',
  TIMEOUT: 'bg-red-100 text-red-600',
};

const CONVERSATION_STATUS_LABELS: Record<ConversationStatus, string> = {
  ACTIVE: 'Activa',
  WAITING_USER: 'Esperando usuario',
  COMPLETED: 'Completada',
  ESCALATED: 'Escalada',
  TIMEOUT: 'Timeout',
};

export function ConversationTypeBadge({ type }: { type: ConversationType }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/80">
      {CONVERSATION_TYPE_LABELS[type]}
    </span>
  );
}

export function ConversationStatusBadge({
  status,
}: {
  status: ConversationStatus;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        CONVERSATION_STATUS_STYLES[status],
      )}
    >
      {CONVERSATION_STATUS_LABELS[status]}
    </span>
  );
}
