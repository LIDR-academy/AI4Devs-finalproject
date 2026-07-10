jest.mock('@helsoft/services', () => ({
  LocalePreferenceService: {
    getStoredLocale: jest.fn().mockResolvedValue(null),
    setStoredLocale: jest.fn().mockResolvedValue(undefined),
  },
}));

import { act, render, screen } from '@testing-library/react';

import { useLocalization } from '../hooks/use-localization';
import { LocalizationProvider } from './localization-provider';

const Consumer = () => {
  const { t, locale, supportedLocales } = useLocalization();
  return (
    <div>
      <span>{t('settings.title')}</span>
      <span data-testid="locale">{locale}</span>
      <span data-testid="supported">{supportedLocales.join(',')}</span>
    </div>
  );
};

const Switcher = () => {
  const { t, setLocale } = useLocalization();
  return (
    <div>
      <span>{t('settings.title')}</span>
      <button type="button" onClick={() => setLocale('de')}>
        switch
      </button>
    </div>
  );
};

describe('LocalizationProvider + useLocalization', () => {
  // @s1 — a descendant translates the active locale through the hook (not i18next directly).
  it('renders the active-locale translation to a descendant', async () => {
    render(
      <LocalizationProvider initialLocale="es">
        <Consumer />
      </LocalizationProvider>,
    );

    expect(await screen.findByText('Ajustes')).toBeTruthy();
    expect(screen.getByTestId('locale').textContent).toBe('es');
  });

  it('defaults to English when no initial or device locale is given', async () => {
    render(
      <LocalizationProvider>
        <Consumer />
      </LocalizationProvider>,
    );

    expect(await screen.findByText('Settings')).toBeTruthy();
    expect(screen.getByTestId('locale').textContent).toBe('en');
  });

  // @s3 — the provider auto-detects a supported (region-tagged) device locale.
  it('resolves the initial locale from a supported device tag', async () => {
    render(
      <LocalizationProvider deviceLocale="pt-BR">
        <Consumer />
      </LocalizationProvider>,
    );

    expect(await screen.findByText('Configurações')).toBeTruthy();
    expect(screen.getByTestId('locale').textContent).toBe('pt');
  });

  // @s4 — an unsupported device locale falls back to English.
  it('falls back to English for an unsupported device tag', async () => {
    render(
      <LocalizationProvider deviceLocale="fr-FR">
        <Consumer />
      </LocalizationProvider>,
    );

    expect(await screen.findByText('Settings')).toBeTruthy();
    expect(screen.getByTestId('locale').textContent).toBe('en');
  });

  it('exposes the supported locale set through the hook', async () => {
    render(
      <LocalizationProvider>
        <Consumer />
      </LocalizationProvider>,
    );

    const supported = await screen.findByTestId('supported');
    expect(supported.textContent).toBe('en,es,pt,de');
  });

  it('setLocale changes the active language', async () => {
    render(
      <LocalizationProvider initialLocale="en">
        <Switcher />
      </LocalizationProvider>,
    );
    expect(await screen.findByText('Settings')).toBeTruthy();

    await act(async () => {
      screen.getByText('switch').click();
    });

    expect(screen.getByText('Einstellungen')).toBeTruthy();
  });

  it('throws when useLocalization is used outside the provider', () => {
    const Orphan = () => {
      useLocalization();
      return null;
    };
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Orphan />)).toThrow('useLocalization must be used within a LocalizationProvider');

    spy.mockRestore();
  });
});
