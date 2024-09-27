import { validate } from 'class-validator';
import { User } from '../../../domain/models/User';

describe('User Model', () => {
  it('should validate a valid user', async () => {
    const user = new User();
    user.sessionId = 'valid-session-id';
    user.creationDate = new Date();

    const errors = await validate(user);
    expect(errors.length).toBe(0);
  });

  it('should not validate a user without sessionId', async () => {
    const user = new User();
    user.creationDate = new Date();

    const errors = await validate(user);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should not validate a user with invalid date', async () => {
    const user = new User();
    user.sessionId = 'valid-session-id';
    user.creationDate = new Date('invalid-date');

    const errors = await validate(user);
    expect(errors.length).toBeGreaterThan(0);
  });
});