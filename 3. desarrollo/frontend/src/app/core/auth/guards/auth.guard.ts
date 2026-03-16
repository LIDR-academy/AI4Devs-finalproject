import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from 'app/modules/auth/application/facades/auth.facade';
import { TokenStorageService } from 'app/modules/auth/infrastructure/services/token-storage.service';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { map, take } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * Guard que protege rutas que requieren autenticación
 * Verifica si el usuario está autenticado y si el token es válido
 * Si no está autenticado, redirige al login
 */
export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
  const router = inject(Router);
  const authFacade = inject(AuthFacade);
  const tokenStorage = inject(TokenStorageService);

  // Verificar si hay token almacenado
  const accessToken = tokenStorage.getAccessToken();
  
  // Si no hay token, redirigir a login
  if (!accessToken) {
    const redirectURL = state.url === '/sign-out' || state.url === '/auth/sign-out' ? '' : `redirectURL=${state.url}`;
    const urlTree = router.parseUrl(`/auth/login?${redirectURL}`);
    return of(urlTree);
  }

  // Verificar si el token ha expirado
  if (AuthUtils.isTokenExpired(accessToken)) {
    // Intentar refrescar el token
    // Por ahora, si está expirado, redirigir a login
    const redirectURL = state.url === '/sign-out' || state.url === '/auth/sign-out' ? '' : `redirectURL=${state.url}`;
    const urlTree = router.parseUrl(`/auth/login?${redirectURL}`);
    return of(urlTree);
  }

  // Verificar estado de autenticación del facade
  return authFacade.isAuthenticated$.pipe(
    take(1),
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;
        const urlTree = router.parseUrl(`/auth/login?${redirectURL}`);
        return urlTree;
      }
      return true;
    })
  );
};
