import { render, screen } from '@testing-library/react-native';

import { RadioGroup } from './radio-group';

const options = [
  { value: 'short', label: 'Short lesson' },
  { value: 'standard', label: 'Standard lesson' },
  { value: 'deep', label: 'Deep dive' },
];

describe('RadioGroup', () => {
  // Regression guard (traced from lesson-generation-panel e2e failure): a `role="radio"` must
  // expose `aria-checked` on web, which React Native Web only derives from
  // `accessibilityState.checked` — not `selected`. Assert the prop directly so a future
  // regression back to `selected` fails here instead of surfacing only in Storybook e2e.
  it('exposes accessibilityState.checked (not selected) matching the active option', async () => {
    await render(<RadioGroup options={options} value="standard" onChange={jest.fn()} />);

    expect(screen.getByText('Standard lesson').props.accessibilityState).toBeUndefined();
    const selectedOption = screen.getByRole('radio', { name: 'Standard lesson' });
    expect(selectedOption.props.accessibilityState).toMatchObject({
      checked: true,
      disabled: false,
      selected: undefined,
    });

    const unselectedOption = screen.getByRole('radio', { name: 'Short lesson' });
    expect(unselectedOption.props.accessibilityState).toMatchObject({
      checked: false,
      disabled: false,
      selected: undefined,
    });
  });

  // task-15/@s19 — the group itself needs an accessible name (WCAG 1.3.1/4.1.2) so assistive
  // tech announces what the radio options belong to, not just each option's own label. A true
  // `getByRole('radiogroup', { name })` query throws on this markup for the same reason
  // documented in `language-selector.test.tsx` (the container isn't `accessible={true}`), so the
  // label is asserted directly on the labelled node, mirroring that precedent.
  it('exposes an accessible label for the group when accessibilityLabel is provided', async () => {
    await render(
      <RadioGroup
        options={options}
        value="standard"
        onChange={jest.fn()}
        accessibilityLabel="Lesson content"
      />,
    );

    const group = screen.getByLabelText('Lesson content');
    expect(group.props.accessibilityRole).toBe('radiogroup');
  });
});
