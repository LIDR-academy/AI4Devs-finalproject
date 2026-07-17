import { fireEvent, render, screen, within } from '@testing-library/react-native';

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

  // @s13 — the check indicator sits inside the *active* option specifically, and no inactive option
  // carries it (ties the non-color cue to the selected row, not merely "a check exists somewhere").
  it('places the check indicator inside the active option only', async () => {
    await render(<LanguageSelector options={options} value="pt" onChange={jest.fn()} />);

    const active = screen.getByRole('radio', { name: 'Português', selected: true });
    expect(within(active).getByText('check')).toBeTruthy();

    const inactive = screen.getByRole('radio', { name: 'English', selected: false });
    expect(within(inactive).queryByText('check')).toBeNull();
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
      <LanguageSelector
        options={options}
        value="de"
        onChange={jest.fn()}
        accessibilityLabel="Choose a language"
      />,
    );

    expect(screen.getByLabelText('Choose a language')).toBeTruthy();
  });

  // @s13 — regression guard for the literal `accessibilityRole` prop value only. It does NOT prove
  // that native (iOS/Android) assistive tech perceives the "radiogroup" grouping: a true
  // `getByRole('radiogroup')` query throws on this markup, because the container is intentionally
  // never marked `accessible={true}` (doing so would very likely make VoiceOver treat it as one
  // opaque leaf and stop recursing into the four `radio` children below, per RN's own accessibility
  // model — see the "Known limitation" in spec.md's FO2 and tdd.md's Phase 6). So the prop is
  // asserted directly on the labelled node, not via a `byRole` query, and this test's job is only to
  // catch a future accidental change/removal of that prop value — not to certify WCAG 1.3.1/4.1.2
  // group semantics for the container.
  it('exposes a radiogroup role for the container', async () => {
    await render(
      <LanguageSelector
        options={options}
        value="de"
        onChange={jest.fn()}
        accessibilityLabel="Choose a language"
      />,
    );

    expect(screen.getByLabelText('Choose a language').props.accessibilityRole).toBe('radiogroup');
  });

  // @s13 — every option exposes an accessible radio role + label; exactly one is announced selected.
  it('exposes a radio role and label for every option with a single selected', async () => {
    await render(<LanguageSelector options={options} value="pt" onChange={jest.fn()} />);

    for (const option of options) {
      expect(screen.getByRole('radio', { name: option.label })).toBeTruthy();
    }
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.getByRole('radio', { name: 'Português', selected: true })).toBeTruthy();
    expect(screen.queryAllByRole('radio', { selected: true })).toHaveLength(1);
  });

  // @s13 — options are disabled for assistive tech when the group is disabled.
  it('announces options as disabled when the group is disabled', async () => {
    await render(<LanguageSelector options={options} value="de" onChange={jest.fn()} disabled />);

    expect(screen.getByRole('radio', { name: 'Deutsch', disabled: true })).toBeTruthy();
  });

  // The group is laid out from tokens (self-stretch + gap), not left unstyled — so the
  // list fills its container with consistent spacing. Guards the flat `group` style object.
  it('lays out the group from spacing tokens', async () => {
    await render(
      <LanguageSelector
        options={options}
        value="de"
        onChange={jest.fn()}
        accessibilityLabel="langs"
      />,
    );

    expect(screen.getByLabelText('langs')).toHaveStyle({ alignSelf: 'stretch', gap: 8 });
  });

  // Each option is a token-driven row (icon trailing the label), not an unstyled block.
  // Guards the flat, unconditional `option` layout style.
  it('lays out each option as a spaced row', async () => {
    await render(<LanguageSelector options={options} value="de" onChange={jest.fn()} />);

    expect(screen.getByRole('radio', { name: 'Deutsch' })).toHaveStyle({
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    });
  });

  // The active option's label carries the heavier title typography (not just color), so the
  // selection reads even without color (@s13). Guards the `label` style object.
  it('renders the active label with the heavier title typography', async () => {
    await render(<LanguageSelector options={options} value="de" onChange={jest.fn()} />);

    expect(screen.getByText('Deutsch')).toHaveStyle({ fontWeight: '600', fontSize: 16 });
  });
});
