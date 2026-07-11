import { readFileSync } from 'fs';
import { join } from 'path';

import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { OpenEnded } from './open-ended';
import type { OpenEndedLabels } from './open-ended.types';

const labels: OpenEndedLabels = {
  submit: 'Submit',
  yourAnswer: 'Your answer',
  modelAnswer: 'Model answer',
  explanationHeading: 'Why',
  unavailable: 'Unavailable',
  answerInput: 'Your response',
};

const defaultProps = {
  prompt: 'What is photosynthesis?',
  modelAnswer: 'Conversion of light energy into chemical energy.',
  maxLength: 2000,
  labels,
  onSubmit: jest.fn(),
};

const answerInput = () => screen.getByLabelText(labels.answerInput);
const submitButton = () => screen.getByRole('button', { name: labels.submit });

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
    expect(screen.queryByText(labels.yourAnswer)).toBeNull();
    expect(screen.queryByText(labels.modelAnswer)).toBeNull();
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

    expect(screen.getByText(labels.yourAnswer)).toBeTruthy();
    expect(screen.getByText('plants make food from light')).toBeTruthy();
    expect(screen.getByText(labels.modelAnswer)).toBeTruthy();
    expect(screen.getByText(defaultProps.modelAnswer)).toBeTruthy();

    expect(screen.queryByText('Correct')).toBeNull();
    expect(screen.queryByText('Incorrect')).toBeNull();
    expect(screen.queryByText('Recalled')).toBeNull();
    expect(screen.queryByText('Not recalled')).toBeNull();
  });

  // @s3
  it('shows explanation alongside the model answer after submit', async () => {
    await render(
      <OpenEnded {...defaultProps} explanation="Key process in plants." />,
    );

    expect(screen.queryByText('Key process in plants.')).toBeNull();

    await typeAnswer('x');
    await pressSubmit();

    expect(screen.getByText(labels.explanationHeading)).toBeTruthy();
    expect(screen.getByText('Key process in plants.')).toBeTruthy();
  });

  // @s4
  it('ignores edit and resubmit after submit', async () => {
    const onSubmit = jest.fn();
    await render(<OpenEnded {...defaultProps} onSubmit={onSubmit} />);

    await typeAnswer('first answer');
    await pressSubmit();
    expect(onSubmit).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.changeText(answerInput(), 'tampered');
    });
    await pressSubmit();

    expect(answerInput().props.value).toBe('first answer');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // @s4 — rehydrate stays locked
  it('rehydrates locked with submitted text and model answer visible', async () => {
    const onSubmit = jest.fn();
    await render(
      <OpenEnded
        {...defaultProps}
        initialSubmittedAnswer="prior answer"
        onSubmit={onSubmit}
      />,
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

  it('shows unavailable notice and nothing interactive when unavailable', async () => {
    const onSubmit = jest.fn();
    await render(<OpenEnded {...defaultProps} unavailable onSubmit={onSubmit} />);

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByLabelText(labels.answerInput)).toBeNull();
    expect(screen.queryByRole('button', { name: labels.submit })).toBeNull();

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
});
