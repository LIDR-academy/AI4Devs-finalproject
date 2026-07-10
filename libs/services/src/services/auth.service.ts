import { AuthDao, type SignInWithPasswordResult } from '../dao/auth.dao';

// Lightweight MVP check: local-part@domain-label.tld — enough to catch missing
// "@", missing domain, or missing TLD without a full RFC 5322 implementation.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Business logic over AuthDao: validates credentials before ever calling Supabase.
 * Password *strength* is reserved for the signup story — login only requires a
 * well-formed email and a non-empty password (spec.md Open decisions).
 */
export abstract class AuthService {
  static isValidEmail(email: string): boolean {
    return EMAIL_PATTERN.test(email);
  }

  static isNonEmptyPassword(password: string): boolean {
    return password.trim().length > 0;
  }

  static signIn(email: string, password: string): Promise<SignInWithPasswordResult> {
    if (!AuthService.isValidEmail(email)) {
      return Promise.reject(new Error('Invalid email'));
    }
    if (!AuthService.isNonEmptyPassword(password)) {
      return Promise.reject(new Error('Password is required'));
    }
    return AuthDao.signInWithPassword({ email, password });
  }

  static signOut(): Promise<void> {
    return AuthDao.signOut();
  }
}
