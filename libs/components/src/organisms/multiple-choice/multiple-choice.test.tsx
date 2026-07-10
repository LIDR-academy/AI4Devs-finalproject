import { fireEvent, render, screen } from '@testing-library/react-native';

import { MultipleChoice, MultipleChoiceLabels, MultipleChoiceOptionView } from './multiple-choice';

const labels: MultipleChoiceLabels = {
  correct: 'Correct!',
  incorrect: 'Not quite',
  explanationHeading: 'Why',
  unavailable: 'This activity is unavailable.',
};

const options: MultipleChoiceOptionView[] = [
  { id: 'opt-a', label: 'Paris' },
  { id: 'opt-b', label: 'Berlin' },
];

describe('MultipleChoice', () => {
  // @s1 — unanswered: the question and every option are visible and enabled, none pre-selected,
  // and no result banner is shown.
  it('renders the question and every option as visible and enabled, with no result banner', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.getByText('What is the capital of France?')).toBeTruthy();
    expect(screen.getByText('Paris')).toBeTruthy();
    expect(screen.getByText('Berlin')).toBeTruthy();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => expect(button.props.accessibilityState.disabled).toBe(false));

    expect(screen.queryByText(labels.correct)).toBeNull();
    expect(screen.queryByText(labels.incorrect)).toBeNull();
  });

  // @s1 — every option is selectable in the unanswered state: tapping one reports its id up.
  it('calls onSelectOption with the tapped option id while unanswered', async () => {
    const onSelectOption = jest.fn();
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        labels={labels}
        onSelectOption={onSelectOption}
      />,
    );

    fireEvent.press(screen.getAllByRole('button')[1]);

    expect(onSelectOption).toHaveBeenCalledWith('opt-b');
  });

  // @s2 — once a selection has been made, the attempt is locked: every option becomes disabled.
  it('locks every option once answered', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-b"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => expect(button.props.accessibilityState.disabled).toBe(true));
  });

  // @s3 — a correct choice marks the selected tile correct (check_circle feedback icon, not
  // color-only) and shows the correct result banner.
  it('marks the selected tile correct and shows the correct banner when the selection matches', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-a"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.getAllByText('check_circle')).toHaveLength(1);
    expect(screen.queryByText('cancel')).toBeNull();
    expect(screen.getByText(labels.correct)).toBeTruthy();
    expect(screen.queryByText(labels.incorrect)).toBeNull();
  });

  // @s4 — an incorrect choice marks the selected tile incorrect, reveals the correct tile
  // alongside it, and shows the incorrect result banner.
  it('marks the selected tile incorrect, reveals the correct tile, and shows the incorrect banner', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-b"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.getAllByText('check_circle')).toHaveLength(1);
    expect(screen.getAllByText('cancel')).toHaveLength(1);
    expect(screen.getByText(labels.incorrect)).toBeTruthy();
    expect(screen.queryByText(labels.correct)).toBeNull();
  });

  // @s5 — when the slide has an explanation, it is displayed together with the result.
  it('shows the explanation heading and text together with the result when provided', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-a"
        explanation="Paris has been the capital since the 12th century."
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.getByText(labels.explanationHeading)).toBeTruthy();
    expect(screen.getByText('Paris has been the capital since the 12th century.')).toBeTruthy();
  });

  // @s5 — absent when no explanation is provided.
  it('does not show an explanation heading when none is provided', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-a"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.queryByText(labels.explanationHeading)).toBeNull();
  });

  // @s6 — once answered, a locked option does not fire onSelectOption on tap (single-select,
  // no re-selection).
  it('does not call onSelectOption when a locked option is tapped', async () => {
    const onSelectOption = jest.fn();
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-a"
        labels={labels}
        onSelectOption={onSelectOption}
      />,
    );

    fireEvent.press(screen.getAllByRole('button')[1]);

    expect(onSelectOption).not.toHaveBeenCalled();
  });

  // @s8 — a slide with no options is Empty: the unavailable notice replaces the question and
  // nothing is selectable.
  it('shows the unavailable notice and nothing selectable when there are no options', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={[]}
        correctOptionId="opt-a"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByText('What is the capital of France?')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByText(labels.correct)).toBeNull();
    expect(screen.queryByText(labels.incorrect)).toBeNull();
  });

  // @s9 — a malformed slide whose correctOptionId is not among its options degrades to the
  // unavailable notice instead of a broken question, and does not crash.
  it('shows the unavailable notice and nothing selectable when correctOptionId is not among the options', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-does-not-exist"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByText('What is the capital of France?')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
