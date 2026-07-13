import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { useLocalization } from '@helsoft/localization';

import { PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID, PdfUploadPanel } from './pdf-upload-panel';

jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

const mockUseLocalization = useLocalization as jest.Mock;

const defaultT = (key: string) => key;

describe('PdfUploadPanel', () => {
  beforeEach(() => {
    mockUseLocalization.mockReturnValue({ t: defaultT });
  });

  // @s7 (AC7) — before any file is picked (usePdfExtraction's 'idle' stage), the pristine/Empty
  // state renders the persistent choose-file control, enabled (so the user can actually get past
  // this state), with no loading/content content shown.
  it('renders the enabled choose-file control in the idle (Empty) state', async () => {
    await render(<PdfUploadPanel state="idle" onChooseFile={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'upload.chooseFile', disabled: false })).toBeTruthy();
    expect(screen.queryByTestId(PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID)).toBeNull();
    expect(screen.queryByText('upload.loading')).toBeNull();
  });

  // @s7 — the Empty state shows the size/page constraints hint.
  it('shows the constraints hint in the idle (Empty) state', async () => {
    await render(<PdfUploadPanel state="idle" onChooseFile={jest.fn()} />);

    expect(screen.getByText('upload.constraintsHint')).toBeTruthy();
  });

  // Mutation-kill — default `t: (key) => key` ignores interpolation args, so a maxMb/maxPages
  // passthrough mutant would go unnoticed by the assertion above. Spy records the exact args.
  it('interpolates the exact maxMb/maxPages values into the constraints hint', async () => {
    const t = jest.fn((key: string) => key);
    mockUseLocalization.mockReturnValue({ t });

    await render(<PdfUploadPanel state="idle" onChooseFile={jest.fn()} maxMb={7} maxPages={15} />);

    expect(t).toHaveBeenCalledWith('upload.constraintsHint', { maxMb: 7, maxPages: 15 });
  });

  // Mutation-kill — pins the panel's default ceilings (must mirror PDF_EXTRACTION_LIMITS).
  it('defaults constraints hint interpolation to 10 MB / 20 pages', async () => {
    const t = jest.fn((key: string) => key);
    mockUseLocalization.mockReturnValue({ t });

    await render(<PdfUploadPanel state="idle" onChooseFile={jest.fn()} />);

    expect(t).toHaveBeenCalledWith('upload.constraintsHint', { maxMb: 10, maxPages: 20 });
  });

  // @s7 — no error is shown in the Empty state.
  it('shows no error in the idle (Empty) state', async () => {
    await render(<PdfUploadPanel state="idle" onChooseFile={jest.fn()} />);

    expect(screen.queryByText('upload.retryAction')).toBeNull();
  });

  // @s5 — the Loading state renders an indeterminate progress affordance and disables the
  // choose-file control until the request resolves.
  it('renders an indeterminate progress indicator and loading copy in the loading state', async () => {
    await render(<PdfUploadPanel state="loading" onChooseFile={jest.fn()} />);

    expect(screen.getByTestId(PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID)).toBeTruthy();
    expect(screen.getByText('upload.loading')).toBeTruthy();
  });

  // @s5 — the choose-file control is disabled while loading, so the in-flight request can't be
  // interrupted by picking another file.
  it('disables the choose-file control in the loading state', async () => {
    await render(<PdfUploadPanel state="loading" onChooseFile={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'upload.chooseFile', disabled: true })).toBeTruthy();
  });

  // @s16 (WCAG 4.1.3) — RN's `accessibilityLiveRegion` is Android/Web-only, but it's a first,
  // cheap signal that the visible loading copy is a live region, not just static text.
  it('exposes a polite live region on the loading text', async () => {
    await render(<PdfUploadPanel state="loading" onChooseFile={jest.fn()} />);

    expect(screen.getByText('upload.loading').props.accessibilityLiveRegion).toBe('polite');
  });

  // @s16 — same iOS-parity gap `login-form.tsx` already documents: `accessibilityLiveRegion` has
  // no effect on iOS VoiceOver, so the imperative, cross-platform `AccessibilityInfo` API must
  // fire directly when the loading state becomes active.
  it('announces the loading copy via AccessibilityInfo when the loading state becomes active', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await render(<PdfUploadPanel state="idle" onChooseFile={jest.fn()} />);
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      rerender(<PdfUploadPanel state="loading" onChooseFile={jest.fn()} />);
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith('upload.loading'));

    announceSpy.mockRestore();
  });

  // @s6 — the Content state renders the success summary: filename, page count, image count.
  it('renders the filename, page count, and image count in the content state', async () => {
    await render(
      <PdfUploadPanel
        state="content"
        onChooseFile={jest.fn()}
        filename="notes.pdf"
        pageCount={12}
        imageCount={3}
      />,
    );

    expect(screen.getByText('notes.pdf')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  // N5 (accessibility review round-1 fix) — each summary field is grouped into a single
  // `accessible` node with a composed `accessibilityLabel`, so a screen reader announces one
  // coherent "File: notes.pdf" stop instead of two disconnected "File" / "notes.pdf" stops.
  it('groups the filename and page-count summary rows into one accessible label each', async () => {
    await render(
      <PdfUploadPanel state="content" onChooseFile={jest.fn()} filename="notes.pdf" pageCount={12} imageCount={3} />,
    );

    expect(screen.getByLabelText('upload.filenameLabel: notes.pdf')).toBeTruthy();
    expect(screen.getByLabelText('upload.pageCountLabel: 12')).toBeTruthy();
  });

  // N5 — the image-count row uses the wiring layer's already-pluralized announcement
  // (`upload.imageCount_one`/`_other`, task-13) when supplied, instead of a plain "Images: 3".
  it('uses the given imageCountAnnouncement as the image-count row accessible label', async () => {
    await render(
      <PdfUploadPanel
        state="content"
        onChooseFile={jest.fn()}
        filename="notes.pdf"
        pageCount={12}
        imageCount={3}
        imageCountAnnouncement="3 images extracted"
      />,
    );

    expect(screen.getByLabelText('3 images extracted')).toBeTruthy();
  });

  // N5 — without an explicit announcement, the image-count row still gets a composed label
  // rather than staying two disconnected stops.
  it('falls back to a composed label/value announcement when imageCountAnnouncement is omitted', async () => {
    await render(
      <PdfUploadPanel state="content" onChooseFile={jest.fn()} filename="notes.pdf" pageCount={12} imageCount={3} />,
    );

    expect(screen.getByLabelText('upload.imageCountLabel: 3')).toBeTruthy();
  });

  // @s6 — the Content state exposes a continue affordance that invokes onContinue when pressed.
  it('calls onContinue when the continue affordance is pressed in the content state', async () => {
    const onContinue = jest.fn();
    await render(
      <PdfUploadPanel
        state="content"
        onChooseFile={jest.fn()}
        filename="notes.pdf"
        pageCount={12}
        imageCount={3}
        onContinue={onContinue}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'upload.continue' }));

    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  // The Content state does not show the loading affordance.
  it('does not render the loading indicator in the content state', async () => {
    await render(
      <PdfUploadPanel state="content" onChooseFile={jest.fn()} filename="notes.pdf" pageCount={1} imageCount={0} />,
    );

    expect(screen.queryByTestId(PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID)).toBeNull();
  });

  // @s8-@s13 (error-code family) — the Error state renders the message passed for the current
  // error code and a retry affordance.
  it('renders the given error message and a retry affordance in the error state', async () => {
    await render(
      <PdfUploadPanel
        state="error"
        onChooseFile={jest.fn()}
        errorMessage="This PDF has too many pages (max 20)"
      />,
    );

    const errorText = screen.getByText('This PDF has too many pages (max 20)');
    expect(errorText.parent?.props.accessibilityRole).toBe('alert');
    expect(screen.getByRole('button', { name: 'upload.retryAction' })).toBeTruthy();
  });

  // @s16 (WCAG 4.1.3) — the error banner text is also an assertive live region (Android/Web),
  // mirroring `login-form.tsx`'s established error-banner pattern.
  it('exposes an assertive live region on the error banner text', async () => {
    await render(
      <PdfUploadPanel state="error" onChooseFile={jest.fn()} errorMessage="Network error" />,
    );

    expect(screen.getByText('Network error').props.accessibilityLiveRegion).toBe('assertive');
  });

  // @s16 — iOS-parity: the imperative, cross-platform AccessibilityInfo API fires directly when
  // an error message is set, since accessibilityLiveRegion has no effect on iOS VoiceOver.
  it('announces the error message via AccessibilityInfo when the error state renders', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(
      <PdfUploadPanel state="error" onChooseFile={jest.fn()} errorMessage="Network error" />,
    );

    expect(announceSpy).toHaveBeenCalledWith('Network error');

    announceSpy.mockRestore();
  });

  // Mutation-kill guard (mirrors login-form's precedent) — a later error replacing an earlier one
  // (e.g. a retry that fails differently) must be re-announced, not silently swallowed by a
  // dependency array that only fires once.
  it('announces the error message again when it changes to a different value', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await render(
      <PdfUploadPanel state="error" onChooseFile={jest.fn()} errorMessage="Network error" />,
    );
    expect(announceSpy).toHaveBeenCalledWith('Network error');
    announceSpy.mockClear();

    await act(async () => {
      rerender(
        <PdfUploadPanel
          state="error"
          onChooseFile={jest.fn()}
          errorMessage="This PDF has too many pages (max 20)"
        />,
      );
    });

    expect(announceSpy).toHaveBeenCalledWith('This PDF has too many pages (max 20)');

    announceSpy.mockRestore();
  });

  // Retry affordance wiring — pressing it invokes onRetry.
  it('calls onRetry when the retry affordance is pressed in the error state', async () => {
    const onRetry = jest.fn();
    await render(
      <PdfUploadPanel
        state="error"
        onChooseFile={jest.fn()}
        errorMessage="Network error"
        onRetry={onRetry}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'upload.retryAction' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // "Panel returns to a usable state" (spec's Error row) — choosing a different file stays
  // available; the choose-file control is not disabled by an error.
  it('keeps the choose-file control enabled in the error state', async () => {
    await render(
      <PdfUploadPanel state="error" onChooseFile={jest.fn()} errorMessage="Network error" />,
    );

    expect(screen.getByRole('button', { name: 'upload.chooseFile', disabled: false })).toBeTruthy();
  });

  // The Error state does not show the loading affordance.
  it('does not render the loading indicator in the error state', async () => {
    await render(
      <PdfUploadPanel state="error" onChooseFile={jest.fn()} errorMessage="Network error" />,
    );

    expect(screen.queryByTestId(PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID)).toBeNull();
  });

  // Review round-1 fix (design finding #1, spec.md's per-code Error contract table) — only two of
  // the eight `PdfExtractionErrorCode`s (`network_error`, `extraction_failed`) are genuinely
  // retryable; the wiring layer computes `canRetry` from the current code, and the panel just
  // suppresses the affordance when it's false, since the persistent choose-file control is already
  // the correct recovery action for the rest.
  it('does not render the retry affordance in the error state when canRetry is false', async () => {
    await render(
      <PdfUploadPanel
        state="error"
        onChooseFile={jest.fn()}
        errorMessage="Choose a smaller file"
        canRetry={false}
      />,
    );

    expect(screen.queryByRole('button', { name: 'upload.retryAction' })).toBeNull();
  });

  // Mutation-kill guard (review round-1 Part B #1) — the existing "shown when idle" tests above
  // pass equally for a `state === 'idle' ? … : null` mutant hard-coded to `true ? … : null` (the
  // hint would then leak into every other state too); these assert the hint's absence everywhere
  // else.
  it.each(['loading', 'content', 'error'] as const)('does not show the constraints hint in the %s state', async (state) => {
    await render(
      <PdfUploadPanel
        state={state}
        onChooseFile={jest.fn()}
        filename="notes.pdf"
        pageCount={1}
        imageCount={0}
        errorMessage="Network error"
      />,
    );

    expect(screen.queryByText('upload.constraintsHint')).toBeNull();
  });

  // Mutation-kill guard (review round-1 Part B #1) — same gap for the content summary: the
  // existing "shown in content" tests never assert its absence in the other three states.
  it.each(['idle', 'loading', 'error'] as const)('does not show the content summary in the %s state', async (state) => {
    await render(
      <PdfUploadPanel state={state} onChooseFile={jest.fn()} errorMessage="Network error" />,
    );

    expect(screen.queryByText('upload.filenameLabel')).toBeNull();
    expect(screen.queryByText('upload.pageCountLabel')).toBeNull();
    expect(screen.queryByText('upload.imageCountLabel')).toBeNull();
  });
});
