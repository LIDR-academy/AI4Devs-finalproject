jest.mock('../dao/auth.dao', () => ({
  AuthDao: {
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
  },
}));

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
    // "Invalid email" message (not just "some error").
    it('rejects a malformed email without calling the DAO', async () => {
      await expect(AuthService.signIn('not-an-email', 'secret1')).rejects.toThrow('Invalid email');
      expect(dao.signInWithPassword).not.toHaveBeenCalled();
    });

    // @s9 — an empty password is rejected before any network call is made, with the exact
    // "Password is required" message (not just "some error").
    it('rejects an empty password without calling the DAO', async () => {
      await expect(AuthService.signIn('user@example.com', '')).rejects.toThrow('Password is required');
      expect(dao.signInWithPassword).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    // @s4 — sign-out delegates to the DAO.
    it('signs out through the DAO', async () => {
      dao.signOut.mockResolvedValue(undefined);

      await AuthService.signOut();

      expect(dao.signOut).toHaveBeenCalledWith();
    });
  });
});
