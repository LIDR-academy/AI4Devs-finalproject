import { Controller, Get, Post, Body, Param, Req} from '@nestjs/common';
import { ApiResponse } from 'src/shared/util';
import { AuthEnum } from '../../infrastructure/enum/enum';
import { AuthService } from '../../infrastructure/service/service';
import { AuthEntity } from '../../domain/entity';
import { SignInDto } from '../../infrastructure/dto';



@Controller(AuthEnum.table)
export class AuthController {
    constructor(private readonly service: AuthService) { }
    @Post('signIn')
    public async signIn(@Body() params: SignInDto): Promise<ApiResponse<{ user: AuthEntity, token: { access: string, refresh: string } }>> {
        return await this.service.signIn(params);
    }

    @Get('signOut')
    public async signOut(@Param('id') id: number) {
        return await this.service.signOut(+id);
    }

    @Get('verifyToken')
    public async verifyToken(@Req() req: Request): Promise<ApiResponse<{ user: AuthEntity, token: { access: string, refresh: string } }>> {
        const token = req.headers['authorization']?.split(' ')[1];
        return await this.service.verifyToken(token);
    }

    @Get('refreshToken')
    public async refreshToken(@Req() req: Request): Promise<ApiResponse<AuthEntity>> {
        const token = req.headers['authorization']?.split(' ')[1];
        return await this.service.refreshToken(token);
    }

    @Get('findUserInfo/:id')
    public async findUserInfo(@Param('id') id: number): Promise<ApiResponse<AuthEntity>> {
        return await this.service.findUserInfo(+id);
    }
}
