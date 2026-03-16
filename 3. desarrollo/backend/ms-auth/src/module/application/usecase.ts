import { AuthEntity, SignInInterface } from "../domain/entity";
import { AuthPort } from "../domain/port";

export class AuthUseCase implements AuthPort {

    constructor(private readonly repository: AuthPort) { }

    public async signIn(data: SignInInterface): Promise<AuthEntity | null> {
        try {
            const signedIn = await this.repository.signIn(data);
            console.log('Usuario autenticado:', signedIn);
            return signedIn;
        } catch (error) {
            throw error;
        }
    }

    public async signOut(id: number): Promise<AuthEntity | null> {
        try {
            const signedOut = await this.repository.signOut(id);
            return signedOut;
        } catch (error) {
            throw error;
        }
    }

    public async findUserInfo(id: number): Promise<AuthEntity | null> {
        try {
            const userInfo = await this.repository.findUserInfo(id);
            return userInfo;
        } catch (error) {
            throw error;
        }
    }

    public async verifyToken(token: string): Promise<AuthEntity | null> {
        try {
            const verified = await this.repository.verifyToken(token);
            return verified;
        } catch (error) {
            throw error;
        }
    }

    public async refreshToken(token: string): Promise<AuthEntity | null> {
        try {
            const refreshed = await this.repository.refreshToken(token);
            return refreshed;
        } catch (error) {
            throw error;
        }
    }
}