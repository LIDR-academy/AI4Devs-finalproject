export type EligibleReminderItem = {
  vehicleId: string;
  licensePlate: string;
  vehicleLabel: string;
  ownerName: string;
  ownerEmail: string | null;
  ownerClientId: string;
  lastVisitAt: string;
  daysSinceVisit: number;
  lastReminderSentAt: string | null;
  canEmail: boolean;
};

export type EligibleRemindersResponse = {
  items: EligibleReminderItem[];
  total: number;
  limit: number;
  offset: number;
  thresholdDays: number;
};

export type ReminderEmailStatus =
  | 'sent'
  | 'skipped_no_email'
  | 'skipped_disabled'
  | 'skipped_not_eligible'
  | 'failed';

export type SendReminderResultItem = {
  vehicleId: string;
  licensePlate: string;
  emailStatus: ReminderEmailStatus;
  warning: string | null;
};

export type SendRemindersResponse = {
  results: SendReminderResultItem[];
  summary: {
    requested: number;
    sent: number;
    skipped: number;
    failed: number;
  };
};

export type OptedOutReminderItem = {
  vehicleId: string;
  licensePlate: string;
  vehicleLabel: string;
  ownerName: string | null;
  excludedAt: string | null;
  excludedBy: { id: string; fullName: string } | null;
};

export type OptedOutRemindersResponse = {
  items: OptedOutReminderItem[];
  total: number;
};

export type ReminderOptResponse = {
  vehicleId: string;
  excludeFromReminders: boolean;
};
