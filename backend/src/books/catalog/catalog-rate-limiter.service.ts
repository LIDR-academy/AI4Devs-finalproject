import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CatalogRateLimiter {
  private lastCallAt = 0;

  constructor(private readonly config: ConfigService) {}

  async throttle(): Promise<void> {
    const minIntervalMs = Number(
      this.config.get<string>('CATALOG_MIN_INTERVAL_MS') ?? 250,
    );
    if (minIntervalMs <= 0) {
      return;
    }

    const elapsed = Date.now() - this.lastCallAt;
    if (elapsed < minIntervalMs) {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, minIntervalMs - elapsed);
      });
    }
    this.lastCallAt = Date.now();
  }
}
