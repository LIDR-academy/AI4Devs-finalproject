import type {
  ReminderEmailStatus,
  SendRemindersResponse,
} from '../types/reminders.types';

export function mapReminderEmailStatusLabel(status: ReminderEmailStatus): string {
  switch (status) {
    case 'sent':
      return 'Enviado';
    case 'skipped_no_email':
      return 'Omitido — sin correo';
    case 'skipped_disabled':
      return 'Omitido — correo deshabilitado';
    case 'skipped_not_eligible':
      return 'Omitido — ya no elegible';
    case 'failed':
      return 'Error al enviar';
    default:
      return status;
  }
}

export function mapSendSummaryToToast(
  summary: SendRemindersResponse['summary'],
): string {
  return `Recordatorios: ${summary.sent} enviados, ${summary.skipped} omitidos, ${summary.failed} con error.`;
}
