import { AuthEntity, SignInInterface } from "../../domain/entity";
import { AuthPort } from "../../domain/port";
import { AuthValue } from "../../domain/value";
import { InformationMessage, ResponseUtil } from "src/shared/util";
import { AuthEnum } from "../enum/enum";
import { Injectable } from "@nestjs/common";
import { PgService } from "src/common/database/pg.config";

@Injectable()
export class AuthDBRepository implements AuthPort {

    private readonly table = AuthEnum.table;

    constructor(private readonly pgRepository: PgService) { }

    public async signIn(data: SignInInterface): Promise<AuthEntity | null> {
        try {
            const sql = `
            SELECT 
                per.perso_nom_rzsoc,
                usu.usuar_cod_usuar,    
                usu.usuar_cod_perso,
                usu.usuar_cod_perfi,    
                usu.usuar_nom_usuar,
                usu.usuar_psw_usuar,
                usu.usuar_dir_corre,
                usu.usuar_est_usuar
            FROM ${this.table} AS usu
            INNER JOIN rrfperso AS per ON usu.usuar_cod_perso = per.perso_cod_perso
            WHERE usuar_nom_usuar = $1 AND usuar_psw_usuar = $2`;
            const geted = await this.pgRepository.queryGet<AuthEntity>(sql, [data.username, data.password]);
            return geted ? new AuthValue(geted).toJson() : null;
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'get', resource: this.table, method: 'signIn' }), 500, error);
        }
    }

    public async signOut(id: number): Promise<AuthEntity | null> {
        try {
            const sql = `SELECT * FROM ${this.table} WHERE usuar_cod_usuar = $1`;

            const geted = await this.pgRepository.queryGet<AuthEntity>(sql, [id]);
            return geted ? new AuthValue(geted).toJson() : null;
        } catch (error: any) {
            throw ResponseUtil.error(
                InformationMessage.error({ action: 'delete', resource: this.table, method: 'signOut' }),
                500,
                error
            );
        }
    }

    public async verifyToken(token: string): Promise<AuthEntity | null> {
        try {
            const sql = `SELECT * FROM ${this.table} WHERE token = $1`;
            const geted = await this.pgRepository.queryGet<AuthEntity>(sql, [token]);
            return geted ? new AuthValue(geted).toJson() : null;
        } catch (error: any) {
            throw ResponseUtil.error(
                InformationMessage.error({ action: 'get', resource: this.table, method: 'verifyToken' }),
                500,
                error
            );
        }
    }

    public async refreshToken(token: string): Promise<AuthEntity | null> {
        try {
            const sql = `UPDATE ${this.table} SET token = $1 WHERE token = $2 RETURNING *`;
            const geted = await this.pgRepository.queryGet<AuthEntity>(sql, [token, token]);
            return geted ? new AuthValue(geted).toJson() : null;
        } catch (error: any) {
            throw ResponseUtil.error(
                InformationMessage.error({ action: 'update', resource: this.table, method: 'refreshToken' }),
                500,
                error
            );
        }
    }

    public async findUserInfo(id: number): Promise<AuthEntity | null> {
        try {
            const sql = `
            SELECT 
                per.perso_nom_rzsoc,
                usu.usuar_cod_usuar,    
                usu.usuar_cod_perso,
                usu.usuar_cod_perfi,    
                usu.usuar_nom_usuar,
                usu.usuar_psw_usuar,
                usu.usuar_dir_corre,
                usu.usuar_est_usuar
            FROM ${this.table} AS usu
            INNER JOIN rrfperso AS per ON usu.usuar_cod_perso = per.perso_cod_perso
            WHERE usuar_cod_usuar = $1`;
            const geted = await this.pgRepository.queryGet<AuthEntity>(sql, [id]);
            return geted ? new AuthValue(geted).toJson() : null;
        } catch (error: any) {
            throw ResponseUtil.error(InformationMessage.error({ action: 'get', resource: this.table, method: 'findUserInfo' }), 500, error);
        }
    }

}