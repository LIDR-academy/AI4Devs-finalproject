jest.mock('../dao/auth.dao', () => ({
  AuthDao: {
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
}));

import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';

import { AuthDao } from '../dao/auth.dao';
import { AuthService } from './auth.service';

const dao = AuthDao as jest.Mocked<typeof AuthDao>;

describe('AuthService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('isValidEmail', () => {
    // @s9 — a well-formed email is accepted.
    it('accepts a well-formed email', () => {
      expect(AuthService.isValidEmail('user@example.com')).toBe(true);
    });

    // @s9 — a malformed email (missing @/domain) is rejected.
    it.each(['not-an-email', 'user@', '@example.com', 'user@example', ''])(
      'rejects a malformed email: %s',
      (email) => {
        expect(AuthService.isValidEmail(email)).toBe(false);
      },
    );

    // Regex boundary — a leading, disallowed character before an otherwise well-formed
    // email must not validate: pins the `^` anchor (without it, the pattern would still
    // match the well-formed "user@example.com" tail and wrongly report true).
    it('rejects an email with a disallowed character before the local part', () => {
      expect(AuthService.isValidEmail(' user@example.com')).toBe(false);
    });

    // Regex boundary — a well-formed email followed by trailing "@domain" junk must not
    // validate: pins the `$` anchor (without it, the pattern would match just the leading
    // "test@test.com" and ignore the trailing junk, wrongly reporting true).
    it('rejects an email with trailing junk after the tld', () => {
      expect(AuthService.isValidEmail('test@test.com@invalid')).toBe(false);
    });
  });

  describe('isNonEmptyPassword', () => {
    // @s9 — a non-blank password is accepted.
    it('accepts a non-empty password', () => {
      expect(AuthService.isNonEmptyPassword('secret1')).toBe(true);
    });

    // @s9 — an empty or whitespace-only password is rejected.
    it.each(['', '   '])('rejects a blank password: %j', (password) => {
      expect(AuthService.isNonEmptyPassword(password)).toBe(false);
    });
  });

  describe('signIn', () => {
    // @s2 — valid credentials are forwarded to the DAO and the session/user is returned.
    it('signs in through the DAO with valid credentials and returns the result', async () => {
      const result = { session: { access_token: 'tok' }, user: { id: 'u1' } };
      dao.signInWithPassword.mockResolvedValue(result as never);

      await expect(AuthService.signIn('user@example.com', 'secret1')).resolves.toBe(result);
      expect(dao.signInWithPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret1',
      });
    });

    // @s9 — a malformed email is rejected before any network call is made, with the exact
    // "Invalid email" message (not just "some error") and the validation_error code.
    it('rejects a malformed email without calling the DAO', async () => {
      await expect(AuthService.signIn('not-an-email', 'secret1')).rejects.toThrow('Invalid email');
      await expect(AuthService.signIn('not-an-email', 'secret1')).rejects.toMatchObject({
        code: 'validation_error',
      });
      expect(dao.signInWithPassword).not.toHaveBeenCalled();
    });

    // @s9 — an empty password is rejected before any network call is made, with the exact
    // "Password is required" message (not just "some error") and the validation_error code.
    it('rejects an empty password without calling the DAO', async () => {
      await expect(AuthService.signIn('user@example.com', '')).rejects.toThrow('Password is required');
      await expect(AuthService.signIn('user@example.com', '')).rejects.toMatchObject({
        code: 'validation_error',
      });
      expect(dao.signInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe('signIn error normalization', () => {
    // @s5 — a Supabase invalid-login error (wrong email OR wrong password — supabase itself
    // returns the identical generic shape for both, by design) normalizes to a bare
    // `{ code: 'invalid_credentials' }`: no raw supabase error (message/status/name) leaks
    // upward to the UI, and no user-enumeration signal differs between the two causes.
    it('normalizes a Supabase invalid-login error to a sanitized invalid_credentials code', async () => {
      const supabaseError = new AuthApiError('Invalid login credentials', 400, 'invalid_credentials');
      dao.signInWithPassword.mockRejectedValue(supabaseError);

      await expect(AuthService.signIn('user@example.com', 'wrongpass')).rejects.toMatchObject({
        code: 'invalid_credentials',
        message: 'Invalid credentials',
      });
      await expect(AuthService.signIn('user@example.com', 'wrongpass')).rejects.not.toHaveProperty('status');
    });

    // @s5/@s6 — a differently-coded Supabase AuthApiError (e.g. an unconfirmed-email account —
    // a real GoTrue REST error, but NOT a wrong email/password) must NOT be classified as
    // invalid_credentials: only the exact invalid-login signal collapses to that code. Every
    // other AuthApiError falls back to the safe network_error default (Round-1 slice-2 review,
    // Major 1).
    it('does not classify a differently-coded AuthApiError (e.g. unconfirmed email) as invalid_credentials', async () => {
      const supabaseError = new AuthApiError('Email not confirmed', 400, 'email_not_confirmed');
      dao.signInWithPassword.mockRejectedValue(supabaseError);

      await expect(AuthService.signIn('user@example.com', 'secret1')).rejects.toMatchObject({
        code: 'network_error',
      });
    });

    // @s6 — a Supabase retryable-fetch failure (transient network issue) normalizes to
    // network_error, not invalid_credentials — the two must never be conflated.
    it('normalizes a Supabase retryable-fetch error to network_error', async () => {
      dao.signInWithPassword.mockRejectedValue(new AuthRetryableFetchError('Failed to fetch', 0));

      await expect(AuthService.signIn('user@example.com', 'secret1')).rejects.toMatchObject({
        code: 'network_error',
        message: 'Network error',
      });
    });

    // @s6 — a raw thrown/aborted fetch exception (offline, not wrapped by supabase into any
    // Auth*Error at all) also normalizes to network_error, the safe default for an unrecognized
    // failure — it must never be reported as invalid_credentials.
    it('normalizes an unrecognized thrown exception (e.g. offline fetch) to network_error', async () => {
      dao.signInWithPassword.mockRejectedValue(new TypeError('Network request failed'));

      await expect(AuthService.signIn('user@example.com', 'secret1')).rejects.toMatchObject({
        code: 'network_error',
      });
    });

    // @s6 — retry works: a subsequent call after a network_error resolves normally once the
    // connection is restored.
    it('resolves normally on a subsequent call after a prior network_error (retry works)', async () => {
      dao.signInWithPassword.mockRejectedValueOnce(new AuthRetryableFetchError('Failed to fetch', 0));
      await expect(AuthService.signIn('user@example.com', 'secret1')).rejects.toMatchObject({
        code: 'network_error',
      });

      const result = { session: { access_token: 'tok' }, user: { id: 'u1' } };
      dao.signInWithPassword.mockResolvedValueOnce(result as never);

      await expect(AuthService.signIn('user@example.com', 'secret1')).resolves.toBe(result);
    });
  });

  describe('signOut', () => {
    // @s4 — sign-out delegates to the DAO.
    it('signs out through the DAO', async () => {
      dao.signOut.mockResolvedValue(undefined);

      await AuthService.signOut();

      expect(dao.signOut).toHaveBeenCalledWith();
    });

    // Full-review Round 1, Major 1 — a failed signOut must be normalized the same way as a
    // failed signIn (no raw DAO/provider error escaping upward), so callers get the same
    // AuthErrorCode contract regardless of which auth mutation failed.
    it('normalizes a thrown signOut failure to network_error', async () => {
      dao.signOut.mockRejectedValue(new Error('boom'));

      await expect(AuthService.signOut()).rejects.toMatchObject({ code: 'network_error' });
    });
  });
});
