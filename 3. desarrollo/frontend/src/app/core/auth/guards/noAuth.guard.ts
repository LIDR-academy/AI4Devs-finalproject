import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from 'app/modules/auth/application/facades/auth.facade';
import { map, take } from 'rxjs/operators';

/**
 * Guard que previene que usuarios autenticados accedan a rutas de login
 * Si el usuario ya está autenticado, lo redirige al dashboard
 */
export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (
  route,
  state
) => {
  const router = inject(Router);
  const authFacade = inject(AuthFacade);

  // Verificar estado de autenticación
  return authFacade.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated) => {
      // Si el usuario está autenticado, redirigir al dashboard
      if (isAuthenticated) {
        return router.parseUrl('/signed-in-redirect');
      }

      // Permitir el acceso si no está autenticado
      return true;
    })
  );
};
