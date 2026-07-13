jest.mock('@helsoft/localization', () => ({ useLocalization: jest.fn() }));

import { useLocalization } from '@helsoft/localization';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { LessonGenerationPanel } from './lesson-generation-panel';

const mockUseLocalization = useLocalization as jest.Mock;

const localizationValue = (overrides: Partial<ReturnType<typeof useLocalization>> = {}) => ({
  t: (key: string, options?: Record<string, unknown>) =>
    options ? `${key}:${JSON.stringify(options)}` : key,
  locale: 'en' as const,
  setLocale: jest.fn(),
  supportedLocales: ['en', 'es', 'pt', 'de'] as const,
  ...overrides,
});

describe('LessonGenerationPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalization.mockReturnValue(localizationValue());
  });

  describe('Empty state', () => {
    // @s1 — the picker offers all three compositions and reflects the selected one.
    it('renders the composition picker with all three options and the selected one', async () => {
      await render(
        <LessonGenerationPanel
          state="empty"
          composition="both"
          onCompositionChange={jest.fn()}
          canGenerate={false}
          onGenerate={jest.fn()}
        />,
      );

      // A true getByRole('radiogroup') query throws on RadioGroup's markup (documented
      // limitation, see language-selector.test.tsx) — the radio/radiogroup role split is
      // RadioGroup's own contract (task-9: "roles inherited; fuller a11y in task-15").
      expect(
        screen.getByRole('radio', { name: 'generation.composition.instructionalOnly' }),
      ).toBeTruthy();
      expect(
        screen.getByRole('radio', { name: 'generation.composition.activityOnly' }),
      ).toBeTruthy();
      expect(
        screen.getByRole('radio', { name: 'generation.composition.both', checked: true }),
      ).toBeTruthy();
    });

    // @s2 — choosing a different option calls back with the raw RadioGroup value.
    it('calls onCompositionChange when a different option is chosen', async () => {
      const onCompositionChange = jest.fn();
      await render(
        <LessonGenerationPanel
          state="empty"
          composition="both"
          onCompositionChange={onCompositionChange}
          canGenerate={false}
          onGenerate={jest.fn()}
        />,
      );

      fireEvent.press(
        screen.getByRole('radio', { name: 'generation.composition.instructionalOnly' }),
      );

      expect(onCompositionChange).toHaveBeenCalledWith('instructional-only');
    });

    // @s16 — Generate is disabled until an extracted document is available.
    it('disables Generate when canGenerate is false', async () => {
      await render(
        <LessonGenerationPanel
          state="empty"
          composition="both"
          onCompositionChange={jest.fn()}
          canGenerate={false}
          onGenerate={jest.fn()}
        />,
      );

      expect(
        screen.getByRole('button', { name: 'generation.generate', disabled: true }),
      ).toBeTruthy();
    });

    it('enables Generate and calls onGenerate once an extracted document is available', async () => {
      const onGenerate = jest.fn();
      await render(
        <LessonGenerationPanel
          state="empty"
          composition="both"
          onCompositionChange={jest.fn()}
          canGenerate={true}
          onGenerate={onGenerate}
        />,
      );

      const button = screen.getByRole('button', { name: 'generation.generate', disabled: false });
      fireEvent.press(button);

      expect(onGenerate).toHaveBeenCalledTimes(1);
    });

    // task-15/@s19 — the picker exposes an accessible group label (WCAG 1.3.1/4.1.2), not just
    // per-option labels, so assistive tech announces what the radio options belong to.
    it('gives the composition picker an accessible group label', async () => {
      await render(
        <LessonGenerationPanel
          state="empty"
          composition="both"
          onCompositionChange={jest.fn()}
          canGenerate={false}
          onGenerate={jest.fn()}
        />,
      );

      const group = screen.getByLabelText('generation.composition.heading');
      expect(group.props.accessibilityRole).toBe('radiogroup');
    });

    it('shows no progress and no error in the Empty state', async () => {
      await render(
        <LessonGenerationPanel
          state="empty"
          composition="both"
          onCompositionChange={jest.fn()}
          canGenerate={false}
          onGenerate={jest.fn()}
        />,
      );

      expect(screen.queryByText('generation.step.reading')).toBeNull();
    });
  });

  describe('Loading state', () => {
    // @s14 — shows the multi-step progress with the current step; picker + Generate disabled.
    it('shows the progress steps and disables the picker and Generate', async () => {
      await render(
        <LessonGenerationPanel
          state="loading"
          composition="both"
          onCompositionChange={jest.fn()}
          canGenerate={true}
          onGenerate={jest.fn()}
          currentStep="generating"
        />,
      );

      expect(screen.getByText('generation.step.reading')).toBeTruthy();
      expect(screen.getAllByText('generation.step.generating').length).toBeGreaterThan(0);
      expect(screen.getByText('generation.step.attaching')).toBeTruthy();
      expect(screen.getByLabelText('generation.step.generating, current')).toBeTruthy();
      expect(
        screen.getByRole('radio', { name: 'generation.composition.both', disabled: true }),
      ).toBeTruthy();
      expect(
        screen.getByRole('button', { name: 'generation.generate', disabled: true }),
      ).toBeTruthy();
    });
  });

  describe('Content state', () => {
    // @s17 — a ready summary (slide count + composition) and a CTA to open the player.
    it('shows the ready summary and calls onOpenInPlayer when the CTA is pressed', async () => {
      const onOpenInPlayer = jest.fn();
      await render(
        <LessonGenerationPanel
          state="content"
          composition="both"
          onCompositionChange={jest.fn()}
          canGenerate={true}
          onGenerate={jest.fn()}
          slideCount={6}
          onOpenInPlayer={onOpenInPlayer}
        />,
      );

      expect(screen.getByText('generation.ready.slideCount:{"count":6}')).toBeTruthy();
      fireEvent.press(screen.getByRole('button', { name: 'generation.ready.openInPlayer' }));

      expect(onOpenInPlayer).toHaveBeenCalledTimes(1);
    });

    // @s17 — the ready summary also names the chosen composition, per spec.md's UI-states table
    // ("Deck-ready summary (slide count + composition)").
    it('shows the chosen composition alongside the slide count', async () => {
      await render(
        <LessonGenerationPanel
          state="content"
          composition="instructional-only"
          onCompositionChange={jest.fn()}
          canGenerate={true}
          onGenerate={jest.fn()}
          slideCount={4}
          onOpenInPlayer={jest.fn()}
        />,
      );

      expect(
        screen.getByText(
          'generation.ready.composition:{"composition":"generation.composition.instructionalOnly"}',
        ),
      ).toBeTruthy();
    });
  });

  // task-13, @s15 — the Error state: readable message + the recovery affordance the wiring
  // layer decided for the current GenerationErrorCode; panel returns to a usable state.
  describe('Error state', () => {
    // @s15 — the error message is announced to assistive tech (role=alert + assertive live
    // region, mirrors PdfUploadPanel; fuller a11y in task-15).
    it('renders the error message with an alert role and assertive live region', async () => {
      await render(
        <LessonGenerationPanel
          state="error"
          composition="both"
          onCompositionChange={jest.fn()}
          canGenerate={true}
          onGenerate={jest.fn()}
          errorMessage="Generation timed out. Try again."
        />,
      );

      const errorText = screen.getByText('Generation timed out. Try again.');
      expect(errorText.parent?.props.accessibilityRole).toBe('alert');
      expect(errorText.props.accessibilityLiveRegion).toBe('assertive');
    });

    // @s15 — a code with a recovery affordance (e.g. Retry) shows a labeled action button that
    // calls onErrorAction when pressed.
    it('shows the recovery action button and calls onErrorAction when pressed', async () => {
      const onErrorAction = jest.fn();
      await render(
        <LessonGenerationPanel
          state="error"
          composition="both"
          onCompositionChange={jest.fn()}
          canGenerate={true}
          onGenerate={jest.fn()}
          errorMessage="Generation timed out. Try again."
          errorActionLabel="generation.error.action.retry"
          onErrorAction={onErrorAction}
        />,
      );

      fireEvent.press(screen.getByRole('button', { name: 'generation.error.action.retry' }));

      expect(onErrorAction).toHaveBeenCalledTimes(1);
    });

    // @s15 — a code with no actionable affordance here (document_not_ready — the re-upload
    // control is the always-visible sibling PdfUpload panel) renders no action button at all.
    it('shows no recovery action button when errorActionLabel is omitted', async () => {
      await render(
        <LessonGenerationPanel
          state="error"
          composition="both"
          onCompositionChange={jest.fn()}
          canGenerate={true}
          onGenerate={jest.fn()}
          errorMessage="This document isn't ready yet. Please re-upload it."
        />,
      );

      expect(screen.queryByRole('button', { name: /error\.action/ })).toBeNull();
    });

    // "Panel returns to a usable state" (spec's Error row) — the picker and Generate stay
    // enabled in the Error state, so the learner can adjust composition and try again directly.
    it('keeps the picker and Generate enabled in the Error state', async () => {
      await render(
        <LessonGenerationPanel
          state="error"
          composition="both"
          onCompositionChange={jest.fn()}
          canGenerate={true}
          onGenerate={jest.fn()}
          errorMessage="Network error"
        />,
      );

      expect(
        screen.getByRole('radio', { name: 'generation.composition.both', disabled: false }),
      ).toBeTruthy();
      expect(
        screen.getByRole('button', { name: 'generation.generate', disabled: false }),
      ).toBeTruthy();
    });

    // The Error state shows neither the progress stepper nor the content summary.
    it('shows no progress steps and no content summary in the Error state', async () => {
      await render(
        <LessonGenerationPanel
          state="error"
          composition="both"
          onCompositionChange={jest.fn()}
          canGenerate={true}
          onGenerate={jest.fn()}
          errorMessage="Network error"
        />,
      );

      expect(screen.queryByText('generation.step.reading')).toBeNull();
      expect(screen.queryByText('generation.ready.openInPlayer')).toBeNull();
    });
  });
});
