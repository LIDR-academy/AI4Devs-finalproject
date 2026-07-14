jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useLessonGeneration: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({ useLocalization: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

/** Capture panel props so tests can invoke handlers even when UI gates them. */
const capturedPanelProps: {
  current?: {
    onGenerate: () => void;
    canGenerate: boolean;
    onCompositionChange: (value: string) => void;
    onErrorAction?: () => void;
    errorActionLabel?: string;
  };
} = {};
jest.mock('@helsoft/components', () => {
  const actual = jest.requireActual('@helsoft/components') as typeof import('@helsoft/components');
  return {
    ...actual,
    LessonGenerationPanel: (props: Parameters<typeof actual.LessonGenerationPanel>[0]) => {
      capturedPanelProps.current = props;
      return actual.LessonGenerationPanel(props);
    },
  };
});

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
    const generate = jest.fn();
    mockUseLessonGeneration.mockReturnValue(hookValue({ generate }));

    await render(<LessonGeneration documentId={undefined} />);

    expect(
      screen.getByRole('button', { name: 'generation.generate', disabled: true }),
    ).toBeTruthy();
    // Mutation: `if (!documentId) return` → false — disabled press must still not generate.
    fireEvent.press(screen.getByRole('button', { name: 'generation.generate' }));
    expect(generate).not.toHaveBeenCalled();
  });

  // Mutation: `if (!documentId) return` → `if (false) return` — callback body must no-op
  // when documentId is missing/empty even if onGenerate is invoked (panel canGenerate alone
  // does not exercise the guard).
  it('does not call generate when onGenerate runs without a documentId', async () => {
    const generate = jest.fn();
    mockUseLessonGeneration.mockReturnValue(hookValue({ generate }));

    await render(<LessonGeneration documentId={undefined} />);
    expect(capturedPanelProps.current?.canGenerate).toBe(false);
    await act(async () => {
      capturedPanelProps.current?.onGenerate();
    });
    expect(generate).not.toHaveBeenCalled();
  });

  // Mutation: same guard — empty string documentId must also no-op generate.
  it('does not call generate when onGenerate runs with an empty documentId', async () => {
    const generate = jest.fn();
    mockUseLessonGeneration.mockReturnValue(hookValue({ generate }));

    await render(<LessonGeneration documentId="" />);
    expect(capturedPanelProps.current?.canGenerate).toBe(false);
    await act(async () => {
      capturedPanelProps.current?.onGenerate();
    });
    expect(generate).not.toHaveBeenCalled();
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

    // @s2 — persist_failed → localized message + retry only; no player CTA for an unpersisted deck.
    it('shows persist_failed with retry and no open-in-player affordance', async () => {
      const retry = jest.fn();
      const push = jest.fn();
      mockUseRouter.mockReturnValue({ push });
      mockUseLessonGeneration.mockReturnValue(
        hookValue({ stage: 'error', error: 'persist_failed', retry }),
      );

      await render(<LessonGeneration documentId="doc-1" />);

      expect(screen.getByText('generation.error.persistFailed')).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'generation.ready.openInPlayer' })).toBeNull();
      fireEvent.press(screen.getByRole('button', { name: 'generation.error.action.retry' }));
      expect(retry).toHaveBeenCalledTimes(1);
      expect(push).not.toHaveBeenCalled();
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

  // @s2/@s3 — player CTA only navigates when a real persisted lessonId is present.
  it('does not open the player when the result has an empty lessonId', async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    mockUseLessonGeneration.mockReturnValue(
      hookValue({
        stage: 'content',
        result: {
          lessonId: '',
          title: 'Unpersisted',
          composition: 'both',
          slides: [],
        },
      }),
    );

    await render(<LessonGeneration documentId="doc-1" />);
    fireEvent.press(screen.getByRole('button', { name: 'generation.ready.openInPlayer' }));

    expect(push).not.toHaveBeenCalled();
  });

  // Mutation: handleOpenInPlayer deps → [] — must see the latest result.lessonId after rerender.
  it('navigates with the latest lessonId after the result updates', async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    mockUseLessonGeneration.mockReturnValue(
      hookValue({
        stage: 'content',
        result: {
          lessonId: 'lesson-old',
          title: 'Old',
          composition: 'both',
          slides: [],
        },
      }),
    );

    const { rerender } = await render(<LessonGeneration documentId="doc-1" />);

    mockUseLessonGeneration.mockReturnValue(
      hookValue({
        stage: 'content',
        result: {
          lessonId: 'lesson-new',
          title: 'New',
          composition: 'both',
          slides: [],
        },
      }),
    );
    await rerender(<LessonGeneration documentId="doc-1" />);

    fireEvent.press(screen.getByRole('button', { name: 'generation.ready.openInPlayer' }));

    expect(push).toHaveBeenCalledWith({
      pathname: '/lesson/[id]/player',
      params: { id: 'lesson-new' },
    });
  });

  // Mutation: drop `.trim()` — whitespace-only lessonId must not navigate.
  it('does not open the player when the result lessonId is only whitespace', async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    mockUseLessonGeneration.mockReturnValue(
      hookValue({
        stage: 'content',
        result: {
          lessonId: '   ',
          title: 'Whitespace id',
          composition: 'both',
          slides: [],
        },
      }),
    );

    await render(<LessonGeneration documentId="doc-1" />);
    fireEvent.press(screen.getByRole('button', { name: 'generation.ready.openInPlayer' }));

    expect(push).not.toHaveBeenCalled();
  });

  // Mutation: drop `.trim()` — surrounding whitespace must be stripped before nav.
  it('trims lessonId before navigating to the player', async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    mockUseLessonGeneration.mockReturnValue(
      hookValue({
        stage: 'content',
        result: {
          lessonId: '  lesson-1  ',
          title: 'Trimmed',
          composition: 'both',
          slides: [],
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

  // Mutation: `result?.lessonId.trim()` / `result.lessonId?.trim()` — missing result/id must not throw.
  it('does not throw when opening the player with a missing lessonId on the result', async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    mockUseLessonGeneration.mockReturnValue(
      hookValue({
        stage: 'content',
        result: {
          lessonId: undefined as unknown as string,
          title: 'No id',
          composition: 'both',
          slides: [],
        },
      }),
    );

    await render(<LessonGeneration documentId="doc-1" />);
    expect(() => {
      fireEvent.press(screen.getByRole('button', { name: 'generation.ready.openInPlayer' }));
    }).not.toThrow();
    expect(push).not.toHaveBeenCalled();
  });

  // Mutation: `result.lessonId?.trim()` without optional on result — undefined result must not throw.
  it('does not throw when opening the player with an undefined result', async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    mockUseLessonGeneration.mockReturnValue(
      hookValue({
        stage: 'content',
        result: undefined,
      }),
    );

    await render(<LessonGeneration documentId="doc-1" />);
    expect(() => {
      fireEvent.press(screen.getByRole('button', { name: 'generation.ready.openInPlayer' }));
    }).not.toThrow();
    expect(push).not.toHaveBeenCalled();
  });

  // pending-pdfs-generate task-10 — onGenerated fires once on success (@s9 wiring).
  describe('onGenerated (task-10)', () => {
    const readyResult = {
      lessonId: 'lesson-1',
      title: 'Photosynthesis',
      composition: 'both' as const,
      slides: [],
    };

    // @s9 — fires exactly once when generation reaches Content/ready.
    it('fires onGenerated once when stage becomes content with a lessonId', async () => {
      const onGenerated = jest.fn();
      mockUseLessonGeneration.mockReturnValue(hookValue({ stage: 'idle' }));
      const { rerender } = await render(
        <LessonGeneration documentId="doc-1" onGenerated={onGenerated} />,
      );

      expect(onGenerated).not.toHaveBeenCalled();

      mockUseLessonGeneration.mockReturnValue(hookValue({ stage: 'content', result: readyResult }));
      await act(async () => {
        rerender(<LessonGeneration documentId="doc-1" onGenerated={onGenerated} />);
      });

      expect(onGenerated).toHaveBeenCalledTimes(1);
    });

    it('does not fire onGenerated while stage is idle', async () => {
      const onGenerated = jest.fn();
      mockUseLessonGeneration.mockReturnValue(hookValue({ stage: 'idle' }));

      await render(<LessonGeneration documentId="doc-1" onGenerated={onGenerated} />);

      expect(onGenerated).not.toHaveBeenCalled();
    });

    it('does not fire onGenerated while stage is generating', async () => {
      const onGenerated = jest.fn();
      mockUseLessonGeneration.mockReturnValue(
        hookValue({ stage: 'generating', currentStep: 'reading' }),
      );

      await render(<LessonGeneration documentId="doc-1" onGenerated={onGenerated} />);

      expect(onGenerated).not.toHaveBeenCalled();
    });

    it('does not fire onGenerated while stage is error', async () => {
      const onGenerated = jest.fn();
      mockUseLessonGeneration.mockReturnValue(hookValue({ stage: 'error', error: 'timeout' }));

      await render(<LessonGeneration documentId="doc-1" onGenerated={onGenerated} />);

      expect(onGenerated).not.toHaveBeenCalled();
    });

    it('does not re-fire onGenerated on a re-render with the same lessonId', async () => {
      const onGenerated = jest.fn();
      mockUseLessonGeneration.mockReturnValue(hookValue({ stage: 'content', result: readyResult }));
      const { rerender } = await render(
        <LessonGeneration documentId="doc-1" onGenerated={onGenerated} />,
      );
      expect(onGenerated).toHaveBeenCalledTimes(1);

      await act(async () => {
        rerender(<LessonGeneration documentId="doc-1" onGenerated={onGenerated} />);
      });

      expect(onGenerated).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onGenerated is omitted and stage is content', async () => {
      mockUseLessonGeneration.mockReturnValue(hookValue({ stage: 'content', result: readyResult }));

      await expect(render(<LessonGeneration documentId="doc-1" />)).resolves.toBeTruthy();
    });

    // Same gate as handleOpenInPlayer — empty/whitespace lessonId must not fire.
    it('does not fire onGenerated when result lessonId is empty or whitespace', async () => {
      const onGenerated = jest.fn();
      mockUseLessonGeneration.mockReturnValue(
        hookValue({
          stage: 'content',
          result: { ...readyResult, lessonId: '   ' },
        }),
      );

      await render(<LessonGeneration documentId="doc-1" onGenerated={onGenerated} />);

      expect(onGenerated).not.toHaveBeenCalled();
    });

    // Mutation: drop `lessonId === lastAnnounced` guard — new callback identity must not re-fire.
    it('does not re-fire onGenerated when only the callback identity changes', async () => {
      const calls: string[] = [];
      mockUseLessonGeneration.mockReturnValue(hookValue({ stage: 'content', result: readyResult }));

      const { rerender } = await render(
        <LessonGeneration
          documentId="doc-1"
          onGenerated={() => {
            calls.push('a');
          }}
        />,
      );
      expect(calls).toEqual(['a']);

      await act(async () => {
        rerender(
          <LessonGeneration
            documentId="doc-1"
            onGenerated={() => {
              calls.push('b');
            }}
          />,
        );
      });

      expect(calls).toEqual(['a']);
    });
  });

  // Mutation: invalid composition must not update selection (`isLessonComposition` → true).
  it('ignores composition changes that are not valid LessonComposition values', async () => {
    mockUseLessonGeneration.mockReturnValue(hookValue());

    await render(<LessonGeneration documentId="doc-1" />);
    await act(async () => {
      capturedPanelProps.current?.onCompositionChange('not-a-composition');
    });

    expect(
      screen.getByRole('radio', { name: 'generation.composition.both', checked: true }),
    ).toBeTruthy();
  });

  // Mutation: composition-change deps `[]` → `["Stryker…"]` — callback identity must stay stable.
  it('keeps a stable onCompositionChange identity across rerenders', async () => {
    mockUseLessonGeneration.mockReturnValue(hookValue());
    const { rerender } = await render(<LessonGeneration documentId="doc-1" />);
    const first = capturedPanelProps.current?.onCompositionChange;

    await act(async () => {
      rerender(<LessonGeneration documentId="doc-1" />);
    });

    expect(capturedPanelProps.current?.onCompositionChange).toBe(first);
  });

  // Mutation: recovery default `""` / `recovery === 'none'` label guard / signIn `else if (true)`.
  it('keeps errorActionLabel undefined and does not navigate for document_not_ready', async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    mockUseLocalization.mockReturnValue(
      localizationValue({
        t: (key: string) => {
          if (typeof key !== 'string') throw new Error(`t() called with ${String(key)}`);
          return key;
        },
      }),
    );
    mockUseLessonGeneration.mockReturnValue(
      hookValue({ stage: 'error', error: 'document_not_ready' }),
    );

    await render(<LessonGeneration documentId="doc-1" />);

    expect(capturedPanelProps.current?.errorActionLabel).toBeUndefined();
    await act(async () => {
      capturedPanelProps.current?.onErrorAction?.();
    });
    expect(push).not.toHaveBeenCalled();
  });

  it('keeps errorActionLabel undefined when there is no error', async () => {
    mockUseLocalization.mockReturnValue(
      localizationValue({
        t: (key: string) => {
          if (typeof key !== 'string') throw new Error(`t() called with ${String(key)}`);
          return key;
        },
      }),
    );
    mockUseLessonGeneration.mockReturnValue(hookValue({ stage: 'idle' }));

    await expect(render(<LessonGeneration documentId="doc-1" />)).resolves.toBeTruthy();
    expect(capturedPanelProps.current?.errorActionLabel).toBeUndefined();
  });
});
