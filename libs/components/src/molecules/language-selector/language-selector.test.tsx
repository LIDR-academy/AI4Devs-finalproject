import { fireEvent, render, screen } from '@testing-library/react-native';

import { LanguageSelector } from './language-selector';

const options = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'de', label: 'Deutsch' },
];

describe('LanguageSelector', () => {
  // @s5 — lists the four provided languages, each in its own name.
  it('renders every provided option label', async () => {
    await render(<LanguageSelector options={options} value="de" onChange={jest.fn()} />);

    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getByText('Español')).toBeTruthy();
    expect(screen.getByText('Português')).toBeTruthy();
    expect(screen.getByText('Deutsch')).toBeTruthy();
  });

  // @s5 — the active language is indicated (accessibilityState.selected).
  it('marks the active option as selected', async () => {
    await render(<LanguageSelector options={options} value="de" onChange={jest.fn()} />);

    expect(screen.getByRole('radio', { name: 'Deutsch', selected: true })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'English', selected: false })).toBeTruthy();
  });

  // @s5/@s13 — the active state is conveyed by a non-color indicator (a check icon), not color alone.
  it('shows a check indicator only on the active option', async () => {
    await render(<LanguageSelector options={options} value="de" onChange={jest.fn()} />);

    expect(screen.getAllByText('check')).toHaveLength(1);
  });

  it('calls onChange with the selected value when an option is pressed', async () => {
    const onChange = jest.fn();
    await render(<LanguageSelector options={options} value="de" onChange={onChange} />);

    fireEvent.press(screen.getByText('Español'));

    expect(onChange).toHaveBeenCalledWith('es');
  });

  it('does not call onChange when disabled', async () => {
    const onChange = jest.fn();
    await render(<LanguageSelector options={options} value="de" onChange={onChange} disabled />);

    fireEvent.press(screen.getByText('Español'));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('applies the group accessibility label', async () => {
    await render(
      <LanguageSelector options={options} value="de" onChange={jest.fn()} accessibilityLabel="Choose a language" />,
    );

    expect(screen.getByLabelText('Choose a language')).toBeTruthy();
  });
});
