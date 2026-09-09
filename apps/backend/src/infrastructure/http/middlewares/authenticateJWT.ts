import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    name: string;
    role: string;
    /**
     * TK-121 (US-015 Esc. 2): lista de permisos del rol al momento de emitir el token.
     * Opcional — los tokens anteriores a TK-121 no la traen. **Ninguna decisión de
     * autorización debe leerse de aquí**: `authorizePermissions` consulta el
     * repositorio en vivo para que una revocación surta efecto de inmediato, sin
     * esperar a que expire el token. Este campo existe solo para que el cliente sepa
     * qué ofrecer.
     */
    permissions?: string[];
  };
}

export function createAuthenticateJWTMiddleware(jwtSecret: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        type: 'https://restostock.com/errors/unauthorized',
        title: 'UnauthorizedException',
        status: 401,
        detail: 'Acceso no autorizado. Se requiere un token Bearer JWT valido en el encabezado Authorization.',
        instance: req.originalUrl || req.url,
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        sub: string;
        name: string;
        role: string;
      };
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({
        type: 'https://restostock.com/errors/invalid-token',
        title: 'InvalidTokenException',
        status: 401,
        detail: 'El token de autenticacion proporcionado es invalido o ha expirado.',
        instance: req.originalUrl || req.url,
      });
    }
  };
}
