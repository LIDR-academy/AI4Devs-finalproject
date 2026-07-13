jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useLessonGeneration: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({ useLocalization: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

import { useLessonGeneration } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { LessonGeneration } from './lesson-generation';

const mockUseLessonGeneration = useLessonGeneration as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

const hookValue = (overrides: Partial<ReturnType<typeof useLessonGeneration>> = {}) => ({
  stage: 'idle' as const,
  currentStep: 'reading' as const,
  result: undefined,
  error: undefined,
  generate: jest.fn(),
  retry: jest.fn(),
  ...overrides,
});

describe('LessonGeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockUseLocalization.mockReturnValue(localizationValue());
  });

  // @s1 — composition state defaults to "both".
  it('defaults the composition selection to both', async () => {
    mockUseLessonGeneration.mockReturnValue(hookValue());

    await render(<LessonGeneration documentId="doc-1" />);

    expect(
      screen.getByRole('radio', { name: 'generation.composition.both', checked: true }),
    ).toBeTruthy();
  });

  // @s2 — choosing a different composition updates the selected value.
  it('updates the selected composition when a different option is chosen', async () => {
    mockUseLessonGeneration.mockReturnValue(hookValue());

    await render(<LessonGeneration documentId="doc-1" />);
    await act(async () => {
      fireEvent.press(screen.getByRole('radio', { name: 'generation.composition.activityOnly' }));
    });

    expect(
      screen.getByRole('radio', { name: 'generation.composition.activityOnly', checked: true }),
    ).toBeTruthy();
  });

  // @s16 — Generate is unavailable until a documentId is available.
  it('disables Generate when no documentId has been extracted yet', async () => {
    mockUseLessonGeneration.mockReturnValue(hookValue());

    await render(<LessonGeneration documentId={undefined} />);

    expect(
      screen.getByRole('button', { name: 'generation.generate', disabled: true }),
    ).toBeTruthy();
  });

  // @s3/@s6 — pressing Generate with an extracted document calls the hook's generate with the
  // documentId and the selected composition.
  it('calls generate with the documentId and the selected composition when Generate is pressed', async () => {
    const generate = jest.fn();
    mockUseLessonGeneration.mockReturnValue(hookValue({ generate }));

    await render(<LessonGeneration documentId="doc-1" />);
    fireEvent.press(screen.getByRole('button', { name: 'generation.generate', disabled: false }));

    expect(generate).toHaveBeenCalledWith({ documentId: 'doc-1', composition: 'both' });
  });

  // @s14 — the Loading state shows the progress stepper.
  it('shows the Loading state while stage is generating', async () => {
    mockUseLessonGeneration.mockReturnValue(
      hookValue({ stage: 'generating', currentStep: 'attaching' }),
    );

    await render(<LessonGeneration documentId="doc-1" />);

    expect(
      screen.getByLabelText('generation.step.attaching, generation.step.status.current'),
    ).toBeTruthy();
  });

  // @s17 — the Content state shows the ready summary and hands the deck to the player.
  it('shows the ready summary and navigates to the player when the CTA is pressed', async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    mockUseLessonGeneration.mockReturnValue(
      hookValue({
        stage: 'content',
        result: {
          lessonId: 'lesson-1',
          title: 'Photosynthesis',
          composition: 'both',
          slides: [
            {
              id: 's1',
              lessonId: 'lesson-1',
              title: 'Intro',
              content: 'Welcome',
              position: 0,
              kind: 'instructional',
            },
            {
              id: 's2',
              lessonId: 'lesson-1',
              title: 'Intro 2',
              content: 'More',
              position: 1,
              kind: 'instructional',
            },
            {
              id: 's3',
              lessonId: 'lesson-1',
              title: 'Intro 3',
              content: 'Even more',
              position: 2,
              kind: 'instructional',
            },
          ],
        },
      }),
    );

    await render(<LessonGeneration documentId="doc-1" />);
    fireEvent.press(screen.getByRole('button', { name: 'generation.ready.openInPlayer' }));

    expect(push).toHaveBeenCalledWith({
      pathname: '/lesson/[id]/player',
      params: { id: 'lesson-1' },
    });
  });

  // task-13, @s15 — the Error state: readable message + the per-code recovery affordance.
  describe('Error state (task-13)', () => {
    // rate_limited/timeout/generation_failed/network_error -> Retry, re-invoking retry().
    it('shows the retry action for a retryable code and calls retry() when pressed', async () => {
      const retry = jest.fn();
      mockUseLessonGeneration.mockReturnValue(
        hookValue({ stage: 'error', error: 'timeout', retry }),
      );

      await render(<LessonGeneration documentId="doc-1" />);
      fireEvent.press(screen.getByRole('button', { name: 'generation.error.action.retry' }));

      expect(screen.getByText('generation.error.timeout')).toBeTruthy();
      expect(retry).toHaveBeenCalledTimes(1);
    });

    // missing_key/invalid_key -> go to Settings.
    it('shows the settings action for missing_key and navigates to Settings when pressed', async () => {
      const push = jest.fn();
      mockUseRouter.mockReturnValue({ push });
      mockUseLessonGeneration.mockReturnValue(hookValue({ stage: 'error', error: 'missing_key' }));

      await render(<LessonGeneration documentId="doc-1" />);
      fireEvent.press(screen.getByRole('button', { name: 'generation.error.action.settings' }));

      expect(screen.getByText('generation.error.missingKey')).toBeTruthy();
      expect(push).toHaveBeenCalledWith('/settings');
    });

    // unauthenticated -> sign in.
    it('shows the sign-in action for unauthenticated and navigates to login when pressed', async () => {
      const push = jest.fn();
      mockUseRouter.mockReturnValue({ push });
      mockUseLessonGeneration.mockReturnValue(
        hookValue({ stage: 'error', error: 'unauthenticated' }),
      );

      await render(<LessonGeneration documentId="doc-1" />);
      fireEvent.press(screen.getByRole('button', { name: 'generation.error.action.signIn' }));

      expect(push).toHaveBeenCalledWith('/login');
    });

    // document_not_ready -> re-upload guidance only, no action button here (the sibling
    // PdfUpload panel's persistent choose-file control is the actual recovery action).
    it('shows the document_not_ready message with no recovery action button', async () => {
      mockUseLessonGeneration.mockReturnValue(
        hookValue({ stage: 'error', error: 'document_not_ready' }),
      );

      await render(<LessonGeneration documentId="doc-1" />);

      expect(screen.getByText('generation.error.documentNotReady')).toBeTruthy();
      expect(screen.queryByRole('button', { name: /error\.action/ })).toBeNull();
    });
  });
});
