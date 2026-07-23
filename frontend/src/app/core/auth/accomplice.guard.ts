import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AccompliceService } from '../services/accomplice.service';

export const accompliceGuard: CanActivateFn = () => {
  const router = inject(Router);
  const accompliceService = inject(AccompliceService);

  return accompliceService.checkAuthStatus().pipe(
    map(res => {
      if (res && res.id) {
        return true;
      }
      return router.createUrlTree(['/login']);
    }),
    catchError(() => {
      return of(router.createUrlTree(['/login']));
    })
  );
};
