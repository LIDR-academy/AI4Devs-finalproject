import { Injectable } from "@nestjs/common";

export const EXPIRING_SOON_THRESHOLD_DAYS = 3;

@Injectable()
export class NotificationThresholdService {
  daysUntilExpiration(expirationDate: Date, now = new Date()): number {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const startOfExpiration = new Date(expirationDate);
    startOfExpiration.setHours(0, 0, 0, 0);

    const diffMs = startOfExpiration.getTime() - startOfToday.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  shouldNotify(daysUntilExpiration: number): boolean {
    return daysUntilExpiration === EXPIRING_SOON_THRESHOLD_DAYS;
  }
}
