
import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if(!request.headers['authorization']) throw new InternalServerErrorException('Token no encontrado en la solicitud');
    return request.headers['authorization']?.split(' ')[1];
  },
);
