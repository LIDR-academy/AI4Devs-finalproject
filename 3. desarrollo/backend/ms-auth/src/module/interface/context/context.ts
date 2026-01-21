import { Controller } from '@nestjs/common';
import { ApiResponse } from 'src/shared/util';
import { AuthEnum } from '../../infrastructure/enum/enum';
import { AuthService } from '../../infrastructure/service/service';
import { SignInDto } from '../../infrastructure/dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthEntity } from 'src/module/domain/entity';


@Controller(AuthEnum.table)
export class AuthContext {
    constructor(private readonly service: AuthService) { }

    @MessagePattern({ sm: AuthEnum.smSignIn })
    public async signIn(@Payload() params: SignInDto): Promise<ApiResponse<{ user: AuthEntity, token: { access: string, refresh: string } }>> {
        return await this.service.signIn(params);
    }

    @MessagePattern({ sm: AuthEnum.smSignOut })
    public async signOut(@Payload('id') id: number): Promise<ApiResponse<AuthEntity>> {
        return await this.service.signOut(+id);
    }

    @MessagePattern({ sm: AuthEnum.smRefreshToken })
    public async refreshToken(@Payload('token') token: string): Promise<ApiResponse<AuthEntity>> {
        return await this.service.refreshToken(token);
    }

    @MessagePattern({ sm: AuthEnum.smVerifyToken })
    public async verifyToken(@Payload('token') token: string): Promise<ApiResponse<{ user: AuthEntity, token: { access: string, refresh: string } }>> {
        return await this.service.verifyToken(token);
    }

    @MessagePattern({ sm: AuthEnum.smFindUserInfo })
    public async findUserInfo(@Payload('id') id: number): Promise<ApiResponse<AuthEntity>> {
        return await this.service.findUserInfo(+id);
    }
}
