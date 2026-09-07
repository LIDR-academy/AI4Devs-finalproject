import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';

/**
 * The composition root of the frontend (`ARCHITECTURE.md` §5.1, §7.1): routing,
 * providers and interceptors. Standalone only: not a single Angular module
 * declaration exists anywhere in `apps/web` — `bootstrapApplication` is the only
 * entry point.
 *
 * The interceptor chain is declared and deliberately empty. The three functional
 * interceptors it will hold — `jwtInterceptor` (Bearer token),
 * `localeInterceptor` (`Accept-Language`) and `httpErrorInterceptor`
 * (contract error code -> Transloco key) — are owned by `T-C10-30`; registering
 * the chain here means that ticket adds entries to an existing array instead of
 * reshaping the bootstrap.
 *
 * Transloco providers are likewise absent: i18n setup is owned by the `NFR`
 * epic i18n slice and is only declared as a dependency here.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([])),
  ],
};
