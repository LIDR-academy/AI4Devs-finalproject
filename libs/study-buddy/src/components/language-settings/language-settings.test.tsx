jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
  LOCALE_LABELS: { en: 'English', es: 'Español', pt: 'Português', de: 'Deutsch' },
}));

import { useLocalization } from '@helsoft/localization';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { LanguageSettings } from './language-settings';

const mockUseLocalization = useLocalization as jest.Mock;

type Overrides = Partial<{
  t: (key: string) => string;
  locale: string;
  setLocale: (value: string) => void;
}>;

const localizationValue = (overrides: Overrides = {}) => ({
  t: (key: string) => key,
  locale: 'en',
  setLocale: jest.fn(),
  supportedLocales: ['en', 'es', 'pt', 'de'],
  ...overrides,
});

describe('LanguageSettings', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s5 — lists the four languages by endonym with the active one indicated.
  it('lists the four languages with the active one selected', async () => {
    mockUseLocalization.mockReturnValue(localizationValue({ locale: 'de' }));

    await render(<LanguageSettings />);

    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getByText('Español')).toBeTruthy();
    expect(screen.getByText('Português')).toBeTruthy();
    expect(screen.getByText('Deutsch')).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Deutsch', selected: true })).toBeTruthy();
  });

  // @s6 — selecting a language wires straight through to setLocale (immediate switch).
  it('calls setLocale with the chosen language', async () => {
    const setLocale = jest.fn();
    mockUseLocalization.mockReturnValue(localizationValue({ locale: 'en', setLocale }));

    await render(<LanguageSettings />);
    fireEvent.press(screen.getByText('Español'));

    expect(setLocale).toHaveBeenCalledWith('es');
  });

  it('renders its section heading from a translation key', async () => {
    const t = jest.fn((key: string) => (key === 'settings.language.heading' ? 'Language' : key));
    mockUseLocalization.mockReturnValue(localizationValue({ t }));

    await render(<LanguageSettings />);

    expect(screen.getByText('Language')).toBeTruthy();
    expect(t).toHaveBeenCalledWith('settings.language.heading');
  });
});
