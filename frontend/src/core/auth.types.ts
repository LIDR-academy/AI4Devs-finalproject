export type AppRole = 'Admin' | 'Vendedor' | 'Almacenista' | 'Logistica' | 'Chofer';

export type AuthUser = {
  idUsuario: number;
  nombre: string;
  email: string;
  rol: AppRole;
};

export type LoginResponse = AuthUser & {
  accessToken: string;
  expiresAt: string;
};

