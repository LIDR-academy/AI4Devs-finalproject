import { ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

function contextWithAuthorization(authorization?: string): ExecutionContext {
  const request: { headers: { authorization?: string }; user?: unknown } = { headers: {} };
  if (authorization) request.headers.authorization = authorization;
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  it('rejects missing and invalid bearer tokens', () => {
    const jwtService = { verify: jest.fn().mockImplementation(() => { throw new Error('invalid'); }) } as unknown as JwtService;
    const guard = new JwtAuthGuard(jwtService);

    expect(() => guard.canActivate(contextWithAuthorization())).toThrow('Authentication required');
    expect(() => guard.canActivate(contextWithAuthorization('Bearer invalid'))).toThrow('Invalid or expired token');
  });

  it('rejects a verified token with an invalid user payload', () => {
    const jwtService = { verify: jest.fn().mockReturnValue({ sub: 'user-id' }) } as unknown as JwtService;
    const guard = new JwtAuthGuard(jwtService);

    expect(() => guard.canActivate(contextWithAuthorization('Bearer malformed'))).toThrow('Invalid or expired token');
  });

  it('attaches the verified user to the request', () => {
    const jwtService = { verify: jest.fn().mockReturnValue({ id: 'user-id', email: 'owner@example.com' }) } as unknown as JwtService;
    const guard = new JwtAuthGuard(jwtService);
    const request: { headers: { authorization: string }; user?: unknown } = { headers: { authorization: 'Bearer valid-token' } };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
    expect(request.user).toEqual({ id: 'user-id', email: 'owner@example.com' });
    expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
  });
});
