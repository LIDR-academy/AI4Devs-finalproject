jest.mock('@helsoft/localization', () => ({
  useLocalization: () => ({
    t: (key: string) => key,
  }),
}));

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { layout, lightColors, spacing, typography } from '@helsoft/components';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Platform } from 'react-native';

import { OpenEnded } from './open-ended';

/** Collect Text nodes whose only content is an empty string (omit-empty guards). */
const collectEmptyTextNodes = (node: unknown, out: unknown[] = []): unknown[] => {
  if (node == null) return out;
  if (Array.isArray(node)) {
    for (const child of node) collectEmptyTextNodes(child, out);
    return out;
  }
  if (typeof node === 'object') {
    const record = node as { type?: unknown; children?: unknown };
    if (record.type === 'Text') {
      const kids = record.children;
      if (
        kids === '' ||
        kids == null ||
        (Array.isArray(kids) && (kids.length === 0 || kids.every((c) => c === '')))
      ) {
        out.push(node);
      }
    }
    if ('children' in record) collectEmptyTextNodes(record.children, out);
  }
  return out;
};

const I18N = {
  submit: 'activity.openEnded.submit',
  yourAnswer: 'activity.openEnded.yourAnswer',
  modelAnswer: 'activity.openEnded.modelAnswer',
  explanationHeading: 'activity.openEnded.explanationHeading',
  unavailable: 'activity.openEnded.unavailable',
  answerInput: 'activity.openEnded.answerInput',
} as const;

const defaultProps = {
  prompt: 'What is photosynthesis?',
  modelAnswer: 'Conversion of light energy into chemical energy.',
  maxLength: 2000,
  onSubmit: jest.fn(),
};

const answerInput = () => screen.getByLabelText(I18N.answerInput);
const submitButton = () => screen.getByRole('button', { name: I18N.submit });

const typeAnswer = async (text: string) => {
  await act(async () => {
    fireEvent.changeText(answerInput(), text);
  });
};

const pressSubmit = async () => {
  await act(async () => {
    fireEvent.press(submitButton());
  });
};

describe('OpenEnded', () => {
  beforeEach(() => {
    defaultProps.onSubmit = jest.fn();
  });

  // @s1
  it('renders unanswered with editable multiline input, enabled Submit, model hidden, no self-mark', async () => {
    await render(<OpenEnded {...defaultProps} />);

    expect(screen.getByText(defaultProps.prompt)).toBeTruthy();

    const input = answerInput();
    expect(input.props.value).toBe('');
    expect(input.props.editable).not.toBe(false);
    expect(input.props.multiline).toBe(true);

    expect(submitButton().props.accessibilityState?.disabled).not.toBe(true);

    expect(screen.queryByText(defaultProps.modelAnswer)).toBeNull();
    expect(screen.queryByText(I18N.yourAnswer)).toBeNull();
    expect(screen.queryByText(I18N.modelAnswer)).toBeNull();
    expect(screen.queryByText('Recalled')).toBeNull();
    expect(screen.queryByText('Not recalled')).toBeNull();
  });

  // @s1 — typing updates draft
  it('updates the draft when text changes while unanswered', async () => {
    await render(<OpenEnded {...defaultProps} />);

    await typeAnswer('light → sugar');

    expect(answerInput().props.value).toBe('light → sugar');
  });

  // @s2
  it('locks input, reveals model answer, keeps learner text, no grade/self-mark on submit', async () => {
    const onSubmit = jest.fn();
    await render(<OpenEnded {...defaultProps} onSubmit={onSubmit} />);

    await typeAnswer('plants make food from light');
    await pressSubmit();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('plants make food from light');

    expect(answerInput().props.editable).toBe(false);
    expect(submitButton().props.accessibilityState.disabled).toBe(true);

    expect(screen.getByText(I18N.yourAnswer)).toBeTruthy();
    expect(screen.getByText('plants make food from light')).toBeTruthy();
    expect(screen.getByText(I18N.modelAnswer)).toBeTruthy();
    expect(screen.getByText(defaultProps.modelAnswer)).toBeTruthy();

    expect(screen.queryByText('Correct')).toBeNull();
    expect(screen.queryByText('Incorrect')).toBeNull();
    expect(screen.queryByText('Recalled')).toBeNull();
    expect(screen.queryByText('Not recalled')).toBeNull();
  });

  // @s3
  it('shows explanation alongside the model answer after submit', async () => {
    await render(<OpenEnded {...defaultProps} explanation="Key process in plants." />);

    expect(screen.queryByText('Key process in plants.')).toBeNull();

    await typeAnswer('x');
    await pressSubmit();

    expect(screen.getByText(I18N.explanationHeading)).toBeTruthy();
    expect(screen.getByText('Key process in plants.')).toBeTruthy();
  });

  // @s4
  it('ignores edit and resubmit after submit', async () => {
    const onSubmit = jest.fn();
    await render(<OpenEnded {...defaultProps} onSubmit={onSubmit} />);

    await typeAnswer('first answer');
    await pressSubmit();
    expect(onSubmit).toHaveBeenCalledTimes(1);

    // TextField keeps onChangeText when disabled — call it to exercise the locked guard
    // (fireEvent alone is mutation-blind; Button strips onPress when disabled).
    expect(answerInput().props.onChangeText).toEqual(expect.any(Function));
    await act(async () => {
      answerInput().props.onChangeText!('tampered');
    });
    await pressSubmit();

    expect(answerInput().props.value).toBe('first answer');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // @s4 — rehydrate stays locked
  it('rehydrates locked with submitted text and model answer visible', async () => {
    const onSubmit = jest.fn();
    await render(
      <OpenEnded {...defaultProps} initialSubmittedAnswer="prior answer" onSubmit={onSubmit} />,
    );

    expect(answerInput().props.value).toBe('prior answer');
    expect(answerInput().props.editable).toBe(false);
    expect(screen.getByText(defaultProps.modelAnswer)).toBeTruthy();
    expect(submitButton().props.accessibilityState.disabled).toBe(true);

    await pressSubmit();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // @s10
  it('does not submit on Enter/submitEditing; draft can include newline', async () => {
    const onSubmit = jest.fn();
    await render(<OpenEnded {...defaultProps} onSubmit={onSubmit} />);

    await typeAnswer('line one');

    await act(async () => {
      fireEvent(answerInput(), 'submitEditing');
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(answerInput().props.editable).not.toBe(false);
    expect(screen.queryByText(defaultProps.modelAnswer)).toBeNull();

    await typeAnswer('line one\nline two');
    expect(answerInput().props.value).toBe('line one\nline two');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // @s5 — empty submit still reveals + locks; omit empty learner-body Text
  it('reveals the model answer and locks on empty submit without empty learner Text', async () => {
    const onSubmit = jest.fn();
    const { toJSON } = await render(<OpenEnded {...defaultProps} onSubmit={onSubmit} />);

    expect(answerInput().props.value).toBe('');
    await pressSubmit();

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('');
    expect(answerInput().props.editable).toBe(false);
    expect(submitButton().props.accessibilityState.disabled).toBe(true);
    expect(screen.getByText(I18N.yourAnswer)).toBeTruthy();
    expect(screen.getByText(I18N.modelAnswer)).toBeTruthy();
    expect(screen.getByText(defaultProps.modelAnswer)).toBeTruthy();
    expect(collectEmptyTextNodes(toJSON())).toHaveLength(0);
  });

  // @s7
  it('shows unavailable notice and nothing interactive when unavailable', async () => {
    const onSubmit = jest.fn();
    await render(<OpenEnded {...defaultProps} unavailable onSubmit={onSubmit} />);

    expect(screen.getByText(I18N.unavailable)).toBeTruthy();
    expect(screen.queryByLabelText(I18N.answerInput)).toBeNull();
    expect(screen.queryByRole('button', { name: I18N.submit })).toBeNull();
    expect(screen.queryByText(defaultProps.prompt)).toBeNull();
    expect(screen.queryByText(defaultProps.modelAnswer)).toBeNull();

    expect(onSubmit).not.toHaveBeenCalled();
  });

  // review-slice — reuse TextField for standalone multiline (not raw RN TextInput chrome)
  it('reuses TextField for the answer field instead of a raw TextInput', () => {
    const source = readFileSync(join(__dirname, 'open-ended.tsx'), 'utf8');

    expect(source).toMatch(/TextField/);
    expect(source).toMatch(/from '@helsoft\/components'/);
    expect(source).not.toMatch(/\bTextInput\b/);
    expect(source).not.toMatch(/styles\.input/);
  });

  // @s9 — accessible name on the answer input
  it('exposes an accessible name on the answer input', async () => {
    await render(<OpenEnded {...defaultProps} />);

    expect(screen.getByLabelText(I18N.answerInput)).toBeTruthy();
  });

  // @s9 — Submit meets touch-target via Button hitSlop
  it('exposes a Submit hitSlop that reaches the touch-target token', async () => {
    await render(<OpenEnded {...defaultProps} />);

    const { hitSlop } = submitButton().props;
    const BUTTON_MEDIUM_HEIGHT = 40;
    expect(hitSlop.top + hitSlop.bottom + BUTTON_MEDIUM_HEIGHT).toBeGreaterThanOrEqual(
      layout.touchTarget,
    );
  });

  // @s9 — locked state reflected for AT
  it('sets accessibilityState.disabled on the input when locked', async () => {
    await render(<OpenEnded {...defaultProps} />);
    expect(answerInput().props.accessibilityState?.disabled).not.toBe(true);

    await render(<OpenEnded {...defaultProps} initialSubmittedAnswer="prior" />);
    expect(answerInput().props.accessibilityState.disabled).toBe(true);
  });

  // @s9 — model-answer reveal announced + polite live region
  it('announces the model-answer reveal once on submit with a polite live region', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<OpenEnded {...defaultProps} />);
    expect(announceSpy).not.toHaveBeenCalled();

    await typeAnswer('essay');
    await pressSubmit();

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(I18N.modelAnswer));
    expect(announceSpy).toHaveBeenCalledTimes(1);

    const modelHeading = screen.getByText(I18N.modelAnswer);
    expect(modelHeading.parent?.props.accessibilityLiveRegion).toBe('polite');

    announceSpy.mockRestore();
  });

  // @s9 — Android relies on live region alone
  it('does not call announceForAccessibility on Android once submitted', async () => {
    const originalOS = Platform.OS;
    Platform.OS = 'android';
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<OpenEnded {...defaultProps} initialSubmittedAnswer="seed" />);

    expect(announceSpy).not.toHaveBeenCalled();
    expect(screen.getByText(I18N.modelAnswer).parent?.props.accessibilityLiveRegion).toBe('polite');

    announceSpy.mockRestore();
    Platform.OS = originalOS;
  });

  // Mutation — StyleSheet token layout (kills ObjectLiteral → {} survivors)
  it('applies spacing and typography tokens on content and comparison layout', async () => {
    await render(
      <OpenEnded
        {...defaultProps}
        explanation="Key process in plants."
        initialSubmittedAnswer="prior"
      />,
    );

    expect(screen.getByTestId('open-ended-root')).toHaveStyle({ gap: spacing.s4 });
    expect(screen.getByText(defaultProps.prompt)).toHaveStyle({
      ...typography.titleLarge,
      color: lightColors.onSurface,
    });
    expect(screen.getByTestId('open-ended-comparison')).toHaveStyle({ gap: spacing.s3 });
    expect(screen.getByTestId('open-ended-your-answer')).toHaveStyle({ gap: spacing.s1 });
    expect(screen.getByTestId('open-ended-model-answer')).toHaveStyle({ gap: spacing.s1 });
    expect(screen.getByText(I18N.yourAnswer)).toHaveStyle({
      ...typography.titleSmall,
      color: lightColors.onSurfaceVariant,
    });
    expect(screen.getByText(I18N.modelAnswer)).toHaveStyle({
      ...typography.titleSmall,
      color: lightColors.onSurfaceVariant,
    });
    expect(screen.getByText('prior')).toHaveStyle({
      ...typography.bodyMedium,
      color: lightColors.onSurface,
    });
    expect(screen.getByText(defaultProps.modelAnswer)).toHaveStyle({
      ...typography.bodyMedium,
      color: lightColors.onSurface,
    });
    expect(screen.getByTestId('open-ended-explanation')).toHaveStyle({ gap: spacing.s1 });
    expect(screen.getByText(I18N.explanationHeading)).toHaveStyle({
      ...typography.titleSmall,
      color: lightColors.onSurfaceVariant,
    });
  });
});
