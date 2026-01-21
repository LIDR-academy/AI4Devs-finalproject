import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthFacade } from 'app/modules/auth/application/facades/auth.facade';
import { map, take } from 'rxjs/operators';

/**
 * Guard que verifica si el usuario necesita seleccionar una oficina
 * Si el usuario necesita seleccionar oficina y no la ha seleccionado, redirige a la página de selección
 */
export const OfficeSelectedGuard: CanActivateFn | CanActivateChildFn = (
  route,
  state
) => {
  const router = inject(Router);
  const authFacade = inject(AuthFacade);

  return authFacade.user$.pipe(
    take(1),
    map((user) => {
      if (!user) {
        // Si no hay usuario, redirigir a login
        return router.parseUrl('/auth/login');
      }

      // Verificar si el usuario necesita seleccionar oficina
      if (user.necesitaSeleccionarOficina()) {
        // Verificar si ya tiene una oficina seleccionada
        if (!user.oficinaId) {
          // No tiene oficina seleccionada, redirigir a selección
          return router.parseUrl('/auth/select-office');
        }
      }

      // Usuario no necesita seleccionar oficina o ya la tiene seleccionada
      return true;
    })
  );
};

