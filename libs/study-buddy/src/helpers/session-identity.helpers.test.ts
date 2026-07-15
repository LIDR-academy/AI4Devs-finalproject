import { getSessionIdentity } from './session-identity.helpers';

describe('getSessionIdentity', () => {
  it('prefers the session display name and derives initials', () => {
    expect(
      getSessionIdentity({
        email: 'learner@example.com',
        user_metadata: { full_name: 'Ada Lovelace' },
      }),
    ).toEqual({
      label: 'Ada Lovelace',
      email: 'learner@example.com',
      initials: 'AL',
    });
  });

  it('uses the email as the label when the session has no display name', () => {
    expect(getSessionIdentity({ email: 'learner@example.com' })).toEqual({
      label: 'learner@example.com',
      email: 'learner@example.com',
      initials: 'L',
    });
  });

  it('uses display_name metadata when it is available', () => {
    expect(
      getSessionIdentity({
        email: 'learner@example.com',
        user_metadata: { display_name: 'Grace Hopper' },
      }),
    ).toEqual({
      label: 'Grace Hopper',
      email: 'learner@example.com',
      initials: 'GH',
    });
  });

  it('returns no identity while the session user is unavailable', () => {
    expect(getSessionIdentity(undefined)).toBeNull();
  });
});
