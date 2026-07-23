import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { accompliceGuard } from './accomplice.guard';
import { AccompliceService } from '../services/accomplice.service';

describe('accompliceGuard', () => {
  let mockRouter: any;
  let mockAccompliceService: any;

  beforeEach(() => {
    mockRouter = {
      createUrlTree: jasmine.createSpy('createUrlTree').and.returnValue('mockUrlTree')
    };

    mockAccompliceService = {
      checkAuthStatus: jasmine.createSpy('checkAuthStatus')
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AccompliceService, useValue: mockAccompliceService }
      ]
    });
  });

  it('should return true if checkAuthStatus returns an accomplice object', (done) => {
    mockAccompliceService.checkAuthStatus.and.returnValue(of({ id: '123', eventSlug: 'test' }));

    TestBed.runInInjectionContext(() => {
      const result = accompliceGuard(null as any, null as any);
      // CanActivateFn returns Observable|Promise|boolean|UrlTree
      if (result && typeof (result as any).subscribe === 'function') {
        (result as any).subscribe((res: any) => {
          expect(res).toBeTrue();
          done();
        });
      }
    });
  });

  it('should return UrlTree to /login if checkAuthStatus returns null', (done) => {
    mockAccompliceService.checkAuthStatus.and.returnValue(of(null));

    TestBed.runInInjectionContext(() => {
      const result = accompliceGuard(null as any, null as any);
      if (result && typeof (result as any).subscribe === 'function') {
        (result as any).subscribe((res: any) => {
          expect(res).toBe('mockUrlTree');
          expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
          done();
        });
      }
    });
  });

  it('should return UrlTree to /login on error', (done) => {
    mockAccompliceService.checkAuthStatus.and.returnValue(throwError(() => new Error('error')));

    TestBed.runInInjectionContext(() => {
      const result = accompliceGuard(null as any, null as any);
      if (result && typeof (result as any).subscribe === 'function') {
        (result as any).subscribe((res: any) => {
          expect(res).toBe('mockUrlTree');
          expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
          done();
        });
      }
    });
  });
});
