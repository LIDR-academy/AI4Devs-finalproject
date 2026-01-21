import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from '../../modules/auth/infrastructure/services/jwt-token.service';

/**
 * Decorator para obtener el usuario actual del request
 * Extrae el payload del JWT token
 */
export const CurrentUser = createParamDecorator(
  (data: keyof TokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

