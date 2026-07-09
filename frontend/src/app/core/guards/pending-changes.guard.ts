import { CanDeactivateFn } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface CanComponentDeactivate {
  hasUnsavedChanges: () => boolean;
  forceSave: () => Observable<any>;
}

export const pendingChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component.hasUnsavedChanges()) {
    // Force an immediate save when navigating away
    return component.forceSave().pipe(
      map(() => true),
      catchError(() => of(true)) // Allow navigation even if save fails, or we could prevent it
    );
  }
  return true;
};
