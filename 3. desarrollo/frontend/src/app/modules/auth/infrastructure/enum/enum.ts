import { envs } from "app/common";

export const AuthEnum = {
    title: "Autenticación",
    signIn:  `${envs.apiUrl}/rrfusuar/signIn`,
    signOut: `${envs.apiUrl}/rrfusuar/signOut`,
    findUserInfo: `${envs.apiUrl}/rrfusuar/findUserInfo`,
    verifyToken: `${envs.apiUrl}/rrfusuar/verifyToken`,
    refreshToken: `${envs.apiUrl}/rrfusuar/refreshToken`,
}