import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Linking } from 'react-native';

import { lightColors } from '../../theme/colors';
import { shape } from '../../theme/shape';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ApiKeyForm, LOADING_STATUS_TEST_ID } from './api-key-form';

const labels = {
  inputLabel: 'API key',
  save: 'Save',
  saving: 'Saving…',
  loadingStatus: 'Checking your API key status…',
  replace: 'Replace',
  remove: 'Remove',
  keySavedStatus: 'OpenAI key saved · Updated Jan 1, 2026',
  guidance: "Don't have a key? Get one from OpenAI",
  removeConfirmHeadline: 'Remove API key?',
  removeConfirmBody: "You'll need to add a new key to generate lessons again.",
  removeConfirmAction: 'Confirm removal',
  removeConfirmCancelAction: 'Cancel',
};

const noKeyStatus = { hasKey: false as const };
const savedStatus = { hasKey: true as const, provider: 'openai' as const, updatedAt: '2026-01-01T00:00:00.000Z' };
// Full-review Round 1, Minor 8 — a fixture URL distinct from the (former) hardcoded
// GUIDANCE_URL constant, so a test asserting the exact Linking.openURL argument actually
// proves the value came from this injected prop, not from an internal component constant.
const guidanceUrl = 'https://example.com/get-a-key';

describe('ApiKeyForm', () => {
  // @s1 — with no key saved, the input is rendered (labelled) alongside Save.
  it('renders a labelled secure input and the Save control when no key is saved', async () => {
    await render(<ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);

    expect(screen.getByLabelText('API key')).toBeTruthy();
    expect(screen.getByLabelText('API key').props.secureTextEntry).toBe(true);
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  });

  // @s5 — the Empty state's Save control is disabled until a non-blank key is entered.
  it('disables Save until a non-blank key is entered in the Empty state', async () => {
    await render(<ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);

    expect(screen.getByRole('button', { name: 'Save', disabled: true })).toBeTruthy();

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('API key'), 'sk-test-key');
    });

    expect(screen.getByRole('button', { name: 'Save', disabled: false })).toBeTruthy();
  });

  // @s5 — a whitespace-only key never enables Save (a blank/whitespace-only key is never
  // submittable, spec.md AC7).
  it('keeps Save disabled when the entered key is whitespace-only', async () => {
    await render(<ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('API key'), '   ');
    });

    expect(screen.getByRole('button', { name: 'Save', disabled: true })).toBeTruthy();
  });

  // @s5 — the Empty state shows guidance on where to get a key.
  it('renders a guidance link to where to get a key in the Empty state', async () => {
    await render(<ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);

    expect(screen.getByRole('button', { name: labels.guidance })).toBeTruthy();
  });

  // Full-review Round 1, Minor 13 (WCAG 1.3.2, Meaningful Sequence) — a first-time user should
  // discover where to get a key before (or alongside) the input it explains, not after Save.
  // Mirrors login-form.test.tsx's own "renders ... in that order" reading/focus-order pin.
  it('renders the guidance link before the input in the Empty state', async () => {
    await render(<ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);

    const tree = JSON.stringify(screen.toJSON());
    const order = [labels.guidance, labels.inputLabel, labels.save].map((text) => tree.indexOf(`"${text}"`));

    expect(order.every((index) => index >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  // Full-review Round 1, Minor 8 — the guidance link's destination comes from the injected
  // `guidanceUrl` prop (owned by the wiring layer), not a hardcoded internal constant; a mutant
  // reducing that constant to "" would previously survive since no test asserted the exact
  // argument passed to Linking.openURL.
  it('opens the injected guidanceUrl prop when the guidance link is pressed', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);

    await render(<ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);
    fireEvent.press(screen.getByRole('button', { name: labels.guidance }));

    expect(openURL).toHaveBeenCalledWith(guidanceUrl);
    openURL.mockRestore();
  });

  // Slice 2 review, Minor 1 — a guidance link that can't be opened (no handler, offline) must
  // not become a silent unhandled promise rejection (mirrors SignOut's own signOut guard).
  it('does not leave a rejected Linking.openURL promise unhandled when the guidance link is pressed', async () => {
    const unhandledRejectionSpy = jest.fn();
    process.on('unhandledRejection', unhandledRejectionSpy);
    const openURL = jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error("can't open url"));

    await render(<ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: labels.guidance }));
    });
    // Flush the microtask queue so Node has a chance to flag an unhandled rejection.
    await act(async () => {
      await new Promise<void>((resolve) => setImmediate(() => resolve()));
    });

    process.off('unhandledRejection', unhandledRejectionSpy);
    expect(openURL).toHaveBeenCalledTimes(1);
    expect(unhandledRejectionSpy).not.toHaveBeenCalled();
    openURL.mockRestore();
  });

  // @s1 — entering a key and pressing Save reports the exact typed value up via onSave.
  it('calls onSave with the entered key when Save is pressed', async () => {
    const onSave = jest.fn();
    await render(<ApiKeyForm status={noKeyStatus} onSave={onSave} guidanceUrl={guidanceUrl} labels={labels} />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('API key'), 'sk-test-key');
    });
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith('sk-test-key');
  });

  // @s1 — given a saved status, the masked "key saved" state renders (labels.keySavedStatus)
  // and neither the input nor any raw key value is shown.
  it('renders the masked key-saved state and no input when a key is saved', async () => {
    await render(<ApiKeyForm status={savedStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);

    expect(screen.getByText('OpenAI key saved · Updated Jan 1, 2026')).toBeTruthy();
    expect(screen.queryByLabelText('API key')).toBeNull();
    expect(screen.getByRole('button', { name: 'Replace' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove' })).toBeTruthy();
  });

  // @s1 — the raw key value entered during save must never resurface anywhere once the
  // masked state is shown (a re-render with an updated status prop simulates a save success).
  it('never renders the raw key value once the masked state is shown', async () => {
    const { rerender } = await render(
      <ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('API key'), 'sk-super-secret-key');
    });
    await act(async () => {
      rerender(<ApiKeyForm status={savedStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);
    });

    expect(screen.queryByText('sk-super-secret-key')).toBeNull();
    expect(screen.queryByDisplayValue('sk-super-secret-key')).toBeNull();
  });

  // task-7 Goal — the Loading state (initial status fetch) shows a placeholder instead of
  // the input/masked control.
  it('renders a loading placeholder and no controls while isLoadingStatus', async () => {
    await render(
      <ApiKeyForm status={noKeyStatus} isLoadingStatus onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );

    expect(screen.getByTestId(LOADING_STATUS_TEST_ID)).toBeTruthy();
    expect(screen.queryByLabelText('API key')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
  });

  // Mutation Round 2 — asserted against the literal string, not solely through the re-imported
  // LOADING_STATUS_TEST_ID constant, so an emptied constant can't pass by mutating both sides
  // of the same check identically.
  it('renders the loading placeholder under the literal api-key-form-loading-status test id', async () => {
    await render(
      <ApiKeyForm status={noKeyStatus} isLoadingStatus onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );

    expect(screen.getByTestId('api-key-form-loading-status')).toBeTruthy();
  });

  // Full-review Round 1, Major 4 (WCAG 4.1.3) — the initial status-fetch spinner has no
  // accessible name of its own (ProgressIndicator only sets accessibilityRole="progressbar");
  // a companion live-region signal is needed, mirroring LoginForm's own isSubmitting pattern
  // (login-form.tsx:131-137).
  it('renders a polite live-region signal alongside the status-loading placeholder', async () => {
    await render(
      <ApiKeyForm status={noKeyStatus} isLoadingStatus onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );

    expect(screen.getByText(labels.loadingStatus).props.accessibilityLiveRegion).toBe('polite');
  });

  // Same gap, iOS half — accessibilityLiveRegion has no effect on iOS VoiceOver, so the
  // status-loading transition also needs the imperative, cross-platform announcement
  // (mirrors login-form.tsx:76-80).
  it('announces the status-loading state via AccessibilityInfo when isLoadingStatus becomes true', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await render(
      <ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      rerender(
        <ApiKeyForm
          status={noKeyStatus}
          isLoadingStatus
          onSave={jest.fn()}
          guidanceUrl={guidanceUrl}
          labels={labels}
        />,
      );
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(labels.loadingStatus));
    announceSpy.mockRestore();
  });

  // @s2 — while a save is in flight, the input and Save control are disabled and a progress
  // label is shown; the submit control stays disabled until the request resolves.
  it('disables the input and Save control and shows a progress label while isSubmitting', async () => {
    await render(
      <ApiKeyForm status={noKeyStatus} isSubmitting onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );

    expect(screen.getByLabelText('API key').props.editable).toBe(false);
    expect(screen.getByRole('button', { name: 'Save', disabled: true })).toBeTruthy();
    expect(screen.getByText('Saving…')).toBeTruthy();
  });

  // Mutation Round 2 (WCAG 4.1.2) — the input's programmatic accessibilityState must actually
  // track isSubmitting, not just the (separate) editable prop asserted above.
  it('exposes accessibilityState.disabled on the input matching isSubmitting', async () => {
    const { rerender } = await render(
      <ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );
    expect(screen.getByLabelText('API key').props.accessibilityState).toEqual({ disabled: false });

    await act(async () => {
      rerender(
        <ApiKeyForm status={noKeyStatus} isSubmitting onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
      );
    });

    expect(screen.getByLabelText('API key').props.accessibilityState).toEqual({ disabled: true });
  });

  // Full-review Round 1, Major 4 (WCAG 4.1.3) — the isSubmitting progress label is a plain
  // <Text> with no live-region marker, unlike the error banner two lines away in the same
  // component; mirrors LoginForm's own "announces a polite live-region while isSubmitting" test.
  it('marks the saving progress label as a polite live region', async () => {
    await render(
      <ApiKeyForm status={noKeyStatus} isSubmitting onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );

    expect(screen.getByText(labels.saving).props.accessibilityLiveRegion).toBe('polite');
  });

  // iOS half of the same gap — accessibilityLiveRegion has no effect on iOS VoiceOver, so the
  // isSubmitting transition also needs the imperative AccessibilityInfo announcement (mirrors
  // login-form.tsx's "announces 'Signing in…' via AccessibilityInfo when isSubmitting becomes
  // true" test).
  it('announces the saving progress via AccessibilityInfo when isSubmitting becomes true', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await render(
      <ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      rerender(
        <ApiKeyForm status={noKeyStatus} isSubmitting onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
      );
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(labels.saving));
    announceSpy.mockRestore();
  });

  // @s2 — outside of isSubmitting (and with a non-blank key entered, @s5), no progress label
  // is shown and Save stays enabled.
  it('shows no progress label and keeps Save enabled outside of isSubmitting', async () => {
    await render(<ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('API key'), 'sk-test-key');
    });

    expect(screen.queryByText('Saving…')).toBeNull();
    expect(screen.getByRole('button', { name: 'Save', disabled: false })).toBeTruthy();
  });

  // @s4 — pressing Replace on the masked (Content) state reveals the secure input again, so a
  // new key can be entered and submitted via onSave.
  it('reveals the input when Replace is pressed and submits the new key via onSave', async () => {
    const onSave = jest.fn();
    await render(<ApiKeyForm status={savedStatus} onSave={onSave} guidanceUrl={guidanceUrl} labels={labels} />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Replace' }));
    });

    expect(screen.getByLabelText('API key')).toBeTruthy();
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('API key'), 'sk-replacement-key');
    });
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith('sk-replacement-key');
  });

  // Full-review Round 1, Major 2 — a failed *first* save (status.hasKey stays false) must
  // leave the typed key in place once isSubmitting resolves back to false: the effect's
  // `status.hasKey` guard (api-key-form.tsx:76-82) only auto-clears the field on a *successful*
  // replace-save, never on a failed no-key-yet save. Every other isSubmitting-resolution test
  // in this file exercises the Replace/masked path where hasKey is already true — this pins the
  // Empty-state path a mutant deleting that guard would wrongly clear.
  it('keeps the typed key in the field after a failed first (non-Replace) save resolves', async () => {
    const { rerender } = await render(
      <ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('API key'), 'sk-typed-key');
    });

    await act(async () => {
      rerender(
        <ApiKeyForm status={noKeyStatus} isSubmitting onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
      );
    });
    await act(async () => {
      rerender(
        <ApiKeyForm
          status={noKeyStatus}
          isSubmitting={false}
          onSave={jest.fn()}
          guidanceUrl={guidanceUrl}
          labels={labels}
        />,
      );
    });

    expect(screen.getByLabelText('API key').props.value).toBe('sk-typed-key');
  });

  // Mutation Round 2 — the revert guard (api-key-form.tsx:81) must depend on ALL three of
  // wasSubmitting.current, !isSubmitting AND status.hasKey, not just status.hasKey alone: a key
  // becoming available with no submission ever having taken place (e.g. added from another
  // session while this screen is open) must not silently wipe whatever the user is mid-typing.
  it('does not clear the typed key when status.hasKey flips true without ever having submitted', async () => {
    const { rerender } = await render(
      <ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('API key'), 'sk-typed-key');
    });

    await act(async () => {
      rerender(<ApiKeyForm status={savedStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Replace' }));
    });

    expect(screen.getByLabelText('API key').props.value).toBe('sk-typed-key');
  });

  // @s4 — once a replace-save resolves successfully (isSubmitting flips back to false while
  // status still reports hasKey: true), the form reverts to the masked "key saved" state
  // rather than leaving the input open.
  it('reverts to the masked state after a replace-save resolves successfully', async () => {
    const { rerender } = await render(
      <ApiKeyForm status={savedStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Replace' }));
    });
    expect(screen.getByLabelText('API key')).toBeTruthy();
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('API key'), 'sk-replacement-key');
    });

    await act(async () => {
      rerender(
        <ApiKeyForm status={savedStatus} isSubmitting onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
      );
    });
    await act(async () => {
      rerender(<ApiKeyForm status={savedStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);
    });

    expect(screen.queryByLabelText('API key')).toBeNull();
    expect(screen.getByText('OpenAI key saved · Updated Jan 1, 2026')).toBeTruthy();

    // Mutation Round 2 — the field isn't rendered once masked, so the clear itself is only
    // observable on a second interaction: pressing Replace again must reveal a blank input,
    // not the previously-typed (and already-saved) key.
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Replace' }));
    });

    expect(screen.getByLabelText('API key').props.value).toBe('');
  });

  // spec.md:76 — a remove-in-flight (isSubmitting shared with save via useApiKey's
  // runMutation) must disable Replace/Remove on the Content (masked) state too, and show the
  // same progress label, not just the Empty/input branch.
  it('disables Replace and Remove and shows a progress label while isSubmitting on the masked saved state', async () => {
    await render(
      <ApiKeyForm status={savedStatus} isSubmitting onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );

    expect(screen.getByRole('button', { name: 'Replace', disabled: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove', disabled: true })).toBeTruthy();
    expect(screen.getByText('Saving…')).toBeTruthy();
  });

  // A save-failure errorMessage renders as an inline banner and the input stays editable
  // (no masked-saved state appears — status.hasKey is still false).
  it('renders an errorMessage banner in the Empty state and keeps the input editable', async () => {
    await render(
      <ApiKeyForm
        status={noKeyStatus}
        onSave={jest.fn()}
        guidanceUrl={guidanceUrl}
        errorMessage="Couldn't reach the server."
        labels={labels}
      />,
    );

    expect(screen.getByText("Couldn't reach the server.")).toBeTruthy();
    expect(screen.getByLabelText('API key').props.editable).toBe(true);
    expect(screen.queryByText('OpenAI key saved · Updated Jan 1, 2026')).toBeNull();
  });

  // No errorMessage means no banner is rendered.
  it('renders no error banner when errorMessage is absent', async () => {
    await render(<ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);

    expect(screen.queryByRole('alert')).toBeNull();
  });

  // @s14/AC12 — a save or removal error must be announced to assistive tech. The banner's own
  // accessibilityLiveRegion (asserted above via the errorBanner tests) is Android/Web-only;
  // iOS VoiceOver needs the imperative AccessibilityInfo call, mirroring LoginForm's own
  // errorMessage-announcement precedent.
  it('announces the error banner via AccessibilityInfo when errorMessage is set', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(
      <ApiKeyForm
        status={noKeyStatus}
        onSave={jest.fn()}
        guidanceUrl={guidanceUrl}
        errorMessage="That key didn't validate."
        labels={labels}
      />,
    );

    expect(announceSpy).toHaveBeenCalledWith("That key didn't validate.");
    announceSpy.mockRestore();
  });

  // @s14/AC12 — a second, distinct error (e.g. a retry that fails differently, @s7) must be
  // re-announced, not silently swallowed because an announcement already fired once.
  it('announces the error banner again when errorMessage changes to a different value', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await render(
      <ApiKeyForm
        status={noKeyStatus}
        onSave={jest.fn()}
        guidanceUrl={guidanceUrl}
        errorMessage="That key didn't validate."
        labels={labels}
      />,
    );
    expect(announceSpy).toHaveBeenCalledWith("That key didn't validate.");
    announceSpy.mockClear();

    await act(async () => {
      rerender(
        <ApiKeyForm
          status={noKeyStatus}
          onSave={jest.fn()}
          guidanceUrl={guidanceUrl}
          errorMessage="Couldn't reach the server. Try again."
          labels={labels}
        />,
      );
    });

    expect(announceSpy).toHaveBeenCalledWith("Couldn't reach the server. Try again.");
    announceSpy.mockRestore();
  });

  // @s7 — a network_error banner is retryable: once a resubmit succeeds (the parent flips
  // status to saved and clears errorMessage), the form shows the masked saved state instead
  // of the error.
  it('shows the masked saved state once a retried save succeeds after a network_error', async () => {
    const { rerender } = await render(
      <ApiKeyForm
        status={noKeyStatus}
        onSave={jest.fn()}
        guidanceUrl={guidanceUrl}
        errorMessage="Couldn't reach the server. Try again."
        labels={labels}
      />,
    );
    expect(screen.getByText("Couldn't reach the server. Try again.")).toBeTruthy();

    await act(async () => {
      rerender(<ApiKeyForm status={savedStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);
    });

    expect(screen.queryByText("Couldn't reach the server. Try again.")).toBeNull();
    expect(screen.getByText('OpenAI key saved · Updated Jan 1, 2026')).toBeTruthy();
  });

  // @s9 — a failed remove's errorMessage renders alongside the masked saved state (the key
  // is preserved — status.hasKey stays true), not just in the Empty/Replace states.
  it('renders an errorMessage banner alongside the masked saved state', async () => {
    await render(
      <ApiKeyForm
        status={savedStatus}
        onSave={jest.fn()}
        guidanceUrl={guidanceUrl}
        errorMessage="Couldn't remove the key."
        labels={labels}
      />,
    );

    expect(screen.getByText("Couldn't remove the key.")).toBeTruthy();
    expect(screen.getByText('OpenAI key saved · Updated Jan 1, 2026')).toBeTruthy();
  });

  // Mutation Round 2 — the confirmation dialog must start closed; nothing on initial render
  // should prompt for a removal the user hasn't asked for yet.
  it('renders with the removal confirmation dialog closed', async () => {
    await render(
      <ApiKeyForm status={savedStatus} onSave={jest.fn()} onRemove={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );

    expect(screen.queryByText(labels.removeConfirmHeadline)).toBeNull();
  });

  // Content state — pressing Remove opens a confirmation dialog rather than calling
  // onRemove directly (task-11: reuse the SignOut confirm pattern).
  it('opens a confirmation dialog when Remove is pressed, without calling onRemove yet', async () => {
    const onRemove = jest.fn();
    await render(
      <ApiKeyForm
        status={savedStatus}
        onSave={jest.fn()}
        onRemove={onRemove}
        guidanceUrl={guidanceUrl}
        labels={labels}
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Remove' }));
    });

    expect(screen.getByText(labels.removeConfirmHeadline)).toBeTruthy();
    expect(screen.getByText(labels.removeConfirmBody)).toBeTruthy();
    expect(onRemove).not.toHaveBeenCalled();
  });

  // @s8 — confirming the dialog calls onRemove.
  it('calls onRemove when the removal is confirmed in the dialog', async () => {
    const onRemove = jest.fn();
    await render(
      <ApiKeyForm
        status={savedStatus}
        onSave={jest.fn()}
        onRemove={onRemove}
        guidanceUrl={guidanceUrl}
        labels={labels}
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Remove' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: labels.removeConfirmAction }));
    });

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  // Mutation Round 2 — confirming removal must also close the confirmation dialog, not just
  // call onRemove: without this, a mutant flipping the post-confirm setIsConfirmingRemove(false)
  // to true would leave the dialog stuck open and still survive on `onRemove` alone.
  it('closes the confirmation dialog after the removal is confirmed', async () => {
    await render(
      <ApiKeyForm
        status={savedStatus}
        onSave={jest.fn()}
        onRemove={jest.fn()}
        guidanceUrl={guidanceUrl}
        labels={labels}
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Remove' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: labels.removeConfirmAction }));
    });

    expect(screen.queryByText(labels.removeConfirmHeadline)).toBeNull();
  });

  // Mutation Round 2 — onRemove is typed optional (ApiKeyFormProps), so confirming a removal
  // with no onRemove supplied at all must not crash (guards the `onRemove?.()` optional chain).
  it('does not crash confirming a removal when onRemove is not supplied', async () => {
    await render(<ApiKeyForm status={savedStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Remove' }));
    });

    await expect(
      act(async () => {
        fireEvent.press(screen.getByRole('button', { name: labels.removeConfirmAction }));
      }),
    ).resolves.not.toThrow();
  });

  // @s8 — dismissing (cancelling) the dialog keeps the key: onRemove is never called.
  it('does not call onRemove when the confirmation is dismissed', async () => {
    const onRemove = jest.fn();
    await render(
      <ApiKeyForm
        status={savedStatus}
        onSave={jest.fn()}
        onRemove={onRemove}
        guidanceUrl={guidanceUrl}
        labels={labels}
      />,
    );

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Remove' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: labels.removeConfirmCancelAction }));
    });

    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.queryByText(labels.removeConfirmHeadline)).toBeNull();
  });

  // Mutation Round 2 — StyleSheet assertions, following language-selector.test.tsx's
  // toHaveStyle precedent with react-native-unistyles. Guards the flat `form` layout style.
  it('stacks the form contents with the standard vertical gap', async () => {
    await render(<ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);

    const form = screen.getByRole('button', { name: 'Save' }).parent?.parent;

    expect(form).toHaveStyle({ gap: spacing.s4 });
  });

  // Guards the `actionsRow` layout style (Save button + progress label sit in one row).
  it('lays out the actions row as a horizontally centered row with the standard gap', async () => {
    await render(<ApiKeyForm status={noKeyStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);

    const actionsRow = screen.getByRole('button', { name: 'Save' }).parent;

    expect(actionsRow).toHaveStyle({ flexDirection: 'row', alignItems: 'center', gap: spacing.s3 });
  });

  // Guards the `status` typography+color style on the masked "key saved" text.
  it('renders the masked key-saved status with the standard body typography and neutral color', async () => {
    await render(<ApiKeyForm status={savedStatus} onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />);

    expect(screen.getByText('OpenAI key saved · Updated Jan 1, 2026')).toHaveStyle({
      ...typography.bodyMedium,
      color: lightColors.onSurfaceVariant,
    });
  });

  // Guards the `errorBanner` container style (background/radius/padding).
  it('renders the error banner with the error-container background, radius, and padding', async () => {
    await render(
      <ApiKeyForm
        status={noKeyStatus}
        onSave={jest.fn()}
        guidanceUrl={guidanceUrl}
        errorMessage="That key didn't validate."
        labels={labels}
      />,
    );

    expect(screen.getByText("That key didn't validate.").parent).toHaveStyle({
      backgroundColor: lightColors.errorContainer,
      borderRadius: shape.card,
      padding: spacing.s3,
    });
  });

  // Guards the `errorBannerText` typography+color style.
  it('renders the error banner text with the standard body typography and onErrorContainer color', async () => {
    await render(
      <ApiKeyForm
        status={noKeyStatus}
        onSave={jest.fn()}
        guidanceUrl={guidanceUrl}
        errorMessage="That key didn't validate."
        labels={labels}
      />,
    );

    expect(screen.getByText("That key didn't validate.")).toHaveStyle({
      ...typography.bodyMedium,
      color: lightColors.onErrorContainer,
    });
  });

  // Guards the `visuallyHidden` style backing the Loading state's live-region text (off-screen
  // but still mounted, mirrors LoginForm's own visuallyHidden precedent).
  it('keeps the loading-status live-region text visually hidden but mounted', async () => {
    await render(
      <ApiKeyForm status={noKeyStatus} isLoadingStatus onSave={jest.fn()} guidanceUrl={guidanceUrl} labels={labels} />,
    );

    expect(screen.getByText(labels.loadingStatus)).toHaveStyle({
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
    });
  });
});
