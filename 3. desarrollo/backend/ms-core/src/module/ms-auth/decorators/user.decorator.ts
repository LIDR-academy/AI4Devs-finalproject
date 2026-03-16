
import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log(request);
    console.log(request.user);
    if(!request.user) throw new InternalServerErrorException('Usuario no encontrado en la solicitud');
    return request.user;
  },
);
