
import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException, } from '@nestjs/common';
import { Request } from 'express';
import { AuthEnum } from '../enum/enum';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(@Inject(AuthEnum.msService) private readonly service: ClientProxy) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new UnauthorizedException();
        try {
            const { user, token: newToken } = await firstValueFrom(this.service.send({ sm: AuthEnum.smVerifyToken }, token));
            request['user'] = user;
            request['token'] = newToken;
        } catch (error) {
            throw new UnauthorizedException('Upps!. No tiene permiso para acceder a este recurso. Por favor, contactese con el administrador.');
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
