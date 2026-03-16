import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException, ThrottlerLimitDetail } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;
    
    throw new ThrottlerException(
      `Demasiadas solicitudes desde ${ip}. Límite: ${throttlerLimitDetail.limit} solicitudes por ${throttlerLimitDetail.ttl}ms. Por favor, intente de nuevo más tarde.`,
    );
  }
}
