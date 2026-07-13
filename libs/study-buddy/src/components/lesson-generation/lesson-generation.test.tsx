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
      screen.getByRole('radio', { name: 'generation.composition.both', selected: true }),
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
      screen.getByRole('radio', { name: 'generation.composition.activityOnly', selected: true }),
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

    expect(screen.getByLabelText('generation.step.attaching, current')).toBeTruthy();
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
});
