jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import { useLocalization } from '@helsoft/localization';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { useLoginForm } from './use-login-form';

const mockUseLocalization = useLocalization as jest.Mock;

type HookProps = {
  isSubmitting?: boolean;
  errorMessage?: string;
  emailError?: string;
  passwordError?: string;
};

describe('useLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalization.mockReturnValue({ t: (key: string) => key });
  });

  it('starts with empty fields and isPristine true', async () => {
    const { result } = await renderHook(() => useLoginForm({}));

    expect(result.current?.email).toBe('');
    expect(result.current?.password).toBe('');
    expect(result.current?.isPristine).toBe(true);
    expect(result.current?.hasFieldError).toBe(false);
  });

  it('clears isPristine once both fields have non-whitespace values', async () => {
    const { result } = await renderHook(() => useLoginForm({}));

    await act(async () => {
      result.current?.setEmail('user@example.com');
    });
    expect(result.current?.isPristine).toBe(true);

    await act(async () => {
      result.current?.setPassword('secret1');
    });
    expect(result.current?.isPristine).toBe(false);
  });

  // Mutation-kill — `.trim()` on pristine checks; whitespace-only must stay pristine.
  it('treats whitespace-only email or password as pristine', async () => {
    const { result } = await renderHook(() => useLoginForm({}));

    await act(async () => {
      result.current?.setEmail('   ');
      result.current?.setPassword('secret1');
    });
    expect(result.current?.isPristine).toBe(true);

    await act(async () => {
      result.current?.setEmail('user@example.com');
      result.current?.setPassword('   ');
    });
    expect(result.current?.isPristine).toBe(true);
  });

  it('sets hasFieldError when emailError or passwordError is present', async () => {
    const { result, rerender } = await renderHook(
      (props: HookProps) => useLoginForm(props),
      { initialProps: { emailError: undefined, passwordError: undefined } },
    );

    expect(result.current?.hasFieldError).toBe(false);

    await act(async () => {
      await rerender({ emailError: 'auth.error.email', passwordError: undefined });
    });
    expect(result.current?.hasFieldError).toBe(true);

    await act(async () => {
      await rerender({ emailError: undefined, passwordError: 'auth.error.password' });
    });
    expect(result.current?.hasFieldError).toBe(true);
  });

  it('announces signing-in copy via AccessibilityInfo when isSubmitting becomes true', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await renderHook(
      ({ isSubmitting }: HookProps) => useLoginForm({ isSubmitting }),
      { initialProps: { isSubmitting: false } },
    );
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      await rerender({ isSubmitting: true });
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith('auth.signingIn'));
    announceSpy.mockRestore();
  });

  it('announces errorMessage via AccessibilityInfo when set', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await renderHook(
      ({ errorMessage }: HookProps) => useLoginForm({ errorMessage }),
      { initialProps: { errorMessage: undefined } },
    );
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      await rerender({ errorMessage: 'auth.error.network' });
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith('auth.error.network'));
    announceSpy.mockRestore();
  });
});
