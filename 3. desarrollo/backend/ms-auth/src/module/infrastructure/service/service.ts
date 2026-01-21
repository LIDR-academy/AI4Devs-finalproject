import { Injectable } from "@nestjs/common";
import { AuthEnum } from "../enum/enum";
import { AuthUseCase } from "../../application/usecase";
import { AuthEntity, SignInInterface } from "../../domain/entity";
import { ApiResponse, InformationMessage, ResponseUtil } from "src/shared/util";
import { AuthDBRepository } from "../repository/repository";
import { JwtService } from "@nestjs/jwt";
import { envs } from "src/common";

@Injectable()
export class AuthService {
    public usecase: AuthUseCase;

    constructor(
        private readonly repository: AuthDBRepository,
        private readonly jwtService: JwtService
    ) {
        this.usecase = new AuthUseCase(this.repository)
    }
    public async signIn(data: SignInInterface): Promise<ApiResponse<{ user: AuthEntity, token: { access: string, refresh: string } }>> {
        try {
            const detail = InformationMessage.detail({ action: 'signIn', resource: AuthEnum.title, method: 'signIn' });
            const signedIn = await this.usecase.signIn(data);
            if (signedIn === null) return ResponseUtil.error(detail, 401);
            const accessToken = await this.jwtSign(signedIn, envs.jwt.expiresIn);
            const refreshToken = await this.jwtSign(signedIn, envs.jwt.refreshIn);
            return ResponseUtil.response<{ user: AuthEntity, token: { access: string, refresh: string } }>(
                {
                    user: signedIn,
                    token: { access: accessToken, refresh: refreshToken }
                },
                detail
            );
        } catch (error) {
            throw error;
        }
    }

    public async signOut(id: number): Promise<ApiResponse<AuthEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'signOut', resource: AuthEnum.title, method: 'signOut' });
            const signedOut = await this.usecase.signOut(id);
            if (signedOut === null) return ResponseUtil.error(detail, 401);
            return ResponseUtil.response<AuthEntity>(signedOut, detail);
        } catch (error) {
            throw error;
        }
    }

    public async refreshToken(token: string): Promise<ApiResponse<AuthEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'get', resource: AuthEnum.title, method: 'refreshToken' });
            const refreshed = await this.usecase.refreshToken(token);
            if (refreshed === null) return ResponseUtil.error(detail, 401);
            return ResponseUtil.response<AuthEntity>(refreshed, detail);
        } catch (error) {
            throw error;
        }
    }

    public async verifyToken(token: string): Promise<ApiResponse<{ user: AuthEntity, token: { access: string, refresh: string } }>> {
        try {
            const detail = InformationMessage.detail({ action: 'get', resource: AuthEnum.title, method: 'verifyToken' });
            // Verifica el token y extrae el payload
            const payload: AuthEntity = this.jwtService.verify(token, { secret: envs.jwt.secret });
            if (!payload || !payload.usuar_cod_usuar) return ResponseUtil.error(detail, 401);
            // Busca el usuario usando el id del payload
            const user = await this.usecase.findUserInfo(payload.usuar_cod_usuar);
            if (!user || user.usuar_cod_usuar === null) return ResponseUtil.error(detail, 401);

            // Genera nuevos tokens
            const accessToken = await this.jwtSign(user, envs.jwt.expiresIn);
            const refreshToken = await this.jwtSign(user, envs.jwt.refreshIn);

            return ResponseUtil.response<{ user: AuthEntity, token: { access: string, refresh: string } }>(
                { user: user, token: { access: accessToken, refresh: refreshToken } },
                detail
            );
        } catch (error) {
            return ResponseUtil.error(InformationMessage.detail({ action: 'get', resource: AuthEnum.title, method: 'verifyToken' }), 401, 'Su token es invalido o ya se encuentra expirado');
        }
    }

    public async findUserInfo(id: number): Promise<ApiResponse<AuthEntity>> {
        try {
            const detail = InformationMessage.detail({ action: 'get', resource: AuthEnum.title, method: 'findUserInfo' });
            const userInfo = await this.usecase.findUserInfo(id);
            if (userInfo === null) return ResponseUtil.error(detail, 404);
            return ResponseUtil.response<AuthEntity>(userInfo, detail);
        } catch (error) {
            throw error;
        }
    }

    private async jwtSign(payload: any, expiresIn?: string): Promise<string> {
        if (expiresIn) return this.jwtService.signAsync(payload, { expiresIn });
        return this.jwtService.signAsync(payload);
    }

}







