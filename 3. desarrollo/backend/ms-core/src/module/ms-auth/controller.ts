import { Controller, Get, Post, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { AuthEnum } from './enum/enum';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { SignInDto } from './dto';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from './guards/auth.guard';
import { Token } from './decorators';

@Controller(AuthEnum.table)
export class AuthContext {
    constructor(@Inject(AuthEnum.msService) private readonly service: ClientProxy) { }

    @Post('signIn')
    public async signIn(@Body() params: SignInDto) {
        try {
            return await firstValueFrom(this.service.send({ sm: AuthEnum.smSignIn },  params));
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Get('signOut')
    @UseGuards(AuthGuard)
    public async signOut(@Param('id') id: number) {
        try {
            return await firstValueFrom(this.service.send({ sm: AuthEnum.smSignOut }, id));
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Get('verifyToken')
    @UseGuards(AuthGuard)
    public async verifyToken(@Token() token: string) {
        try {
            return await firstValueFrom(this.service.send({ sm: AuthEnum.smVerifyToken }, { token }));
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Get('refreshToken')
    @UseGuards(AuthGuard)
    public async refreshToken(@Token() token: string) {
        try {
            return await firstValueFrom(this.service.send({ sm: AuthEnum.smRefreshToken }, { token }));
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Get('findUserInfo/:id')
    @UseGuards(AuthGuard)
    public async findUserInfo(@Param('id') id: number) {
        try {
            return await firstValueFrom(this.service.send({ sm: AuthEnum.smFindUserInfo }, { id }));
        } catch (error) {
            throw new RpcException(error);
        }
    }
}
