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
});
