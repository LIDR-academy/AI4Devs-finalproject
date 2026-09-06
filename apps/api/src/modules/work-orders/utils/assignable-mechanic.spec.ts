import { UserRole } from '@prisma/client';
import {
  isAssignableAsMechanic,
  normalizeCanActAsMechanic,
} from './assignable-mechanic';

describe('assignable-mechanic', () => {
  describe('isAssignableAsMechanic', () => {
    it('returns true for active mechanic', () => {
      expect(
        isAssignableAsMechanic({
          active: true,
          role: UserRole.MECHANIC,
          canActAsMechanic: false,
        }),
      ).toBe(true);
    });

    it('returns true for active admin with flag', () => {
      expect(
        isAssignableAsMechanic({
          active: true,
          role: UserRole.ADMIN,
          canActAsMechanic: true,
        }),
      ).toBe(true);
    });

    it('returns false for active admin without flag', () => {
      expect(
        isAssignableAsMechanic({
          active: true,
          role: UserRole.ADMIN,
          canActAsMechanic: false,
        }),
      ).toBe(false);
    });

    it('returns false for inactive mechanic', () => {
      expect(
        isAssignableAsMechanic({
          active: false,
          role: UserRole.MECHANIC,
          canActAsMechanic: false,
        }),
      ).toBe(false);
    });

    it('returns false for inactive admin with flag', () => {
      expect(
        isAssignableAsMechanic({
          active: false,
          role: UserRole.ADMIN,
          canActAsMechanic: true,
        }),
      ).toBe(false);
    });
  });

  describe('normalizeCanActAsMechanic', () => {
    it('forces false for mechanic role', () => {
      expect(normalizeCanActAsMechanic(UserRole.MECHANIC, true)).toBe(false);
    });

    it('persists true for admin when requested', () => {
      expect(normalizeCanActAsMechanic(UserRole.ADMIN, true)).toBe(true);
    });

    it('defaults false for admin when omitted', () => {
      expect(normalizeCanActAsMechanic(UserRole.ADMIN, undefined)).toBe(false);
    });
  });
});
