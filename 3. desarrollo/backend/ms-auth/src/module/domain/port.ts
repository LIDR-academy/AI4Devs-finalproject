import { AuthEntity, SignInInterface } from "./entity";

export interface AuthPort {
    signIn(data: SignInInterface): Promise<AuthEntity | null>;
    signOut(id: number): Promise<AuthEntity | null>;
    verifyToken(token: string): Promise<AuthEntity | null>;
    refreshToken(token: string): Promise<AuthEntity | null>;
    findUserInfo(id: number): Promise<AuthEntity | null>;
}