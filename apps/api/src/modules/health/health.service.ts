import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { HealthLiveResponseDto } from './dto/health-live-response.dto';
import { HealthReadyResponseDto } from './dto/health-ready-response.dto';

const DATABASE_CHECK_TIMEOUT_MS = 2500;

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  getLiveStatus(): HealthLiveResponseDto {
    return { status: 'ok' };
  }

  async getReadyStatus(): Promise<HealthReadyResponseDto> {
    const database = await this.checkDatabase();

    if (database === 'up') {
      return {
        status: 'ok',
        checks: { database: 'up' },
      };
    }

    return {
      status: 'error',
      checks: { database: 'down' },
    };
  }

  private async checkDatabase(): Promise<'up' | 'down'> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    try {
      const timeoutPromise = new Promise<'down'>((resolve) => {
        timeoutId = setTimeout(() => {
          resolve('down');
        }, DATABASE_CHECK_TIMEOUT_MS);
      });

      const queryPromise = this.prisma.$queryRaw`SELECT 1`
        .then(() => 'up' as const)
        .catch(() => 'down' as const);

      return await Promise.race([queryPromise, timeoutPromise]);
    } catch {
      return 'down';
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    }
  }
}
