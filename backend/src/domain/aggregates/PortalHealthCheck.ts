/**
 * PortalHealthCheck aggregate (FR-027).
 */
export type PortalStatus = 'UNKNOWN' | 'OK' | 'THROTTLED' | 'BLOCKED' | 'CONFIRMED_BLOCKED';

export class PortalHealthCheck {
  private constructor(
    public readonly id: string,
    public readonly domain: string,
    public readonly status: PortalStatus,
    public readonly successRate: number,
    public readonly consecutiveFailures: number,
    public readonly lastCheckedAt: Date,
    public readonly alertTriggeredAt: Date | null,
  ) {}

  get isBlocked(): boolean {
    return this.status === 'BLOCKED' || this.status === 'CONFIRMED_BLOCKED';
  }

  static fromPrisma(row: {
    id: string;
    domain: string;
    status: PortalStatus;
    successRate: number;
    consecutiveFailures: number;
    lastCheckedAt: Date;
    alertTriggeredAt: Date | null;
  }): PortalHealthCheck {
    return new PortalHealthCheck(
      row.id,
      row.domain,
      row.status,
      row.successRate,
      row.consecutiveFailures,
      row.lastCheckedAt,
      row.alertTriggeredAt,
    );
  }
}
