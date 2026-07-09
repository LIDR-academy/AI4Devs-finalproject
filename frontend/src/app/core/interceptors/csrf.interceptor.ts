import { HttpInterceptorFn } from '@angular/common/http';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method.toUpperCase())) {
    const csrfCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('aura_csrf='))
      ?.split('=')[1];

    if (csrfCookie) {
      const clonedReq = req.clone({
        headers: req.headers.set('X-CSRF-Token', decodeURIComponent(csrfCookie))
      });
      return next(clonedReq);
    }
  }
  return next(req);
};
