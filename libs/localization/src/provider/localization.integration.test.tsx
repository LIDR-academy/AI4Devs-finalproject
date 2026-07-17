jest.mock('@helsoft/services', () => ({
  LocalePreferenceService: {
    getStoredLocale: jest.fn().mockResolvedValue(null),
    setStoredLocale: jest.fn().mockResolvedValue(undefined),
  },
}));

import { act, render, screen } from '@testing-library/react';

import { useLocalization } from '../hooks/use-localization';
import { LocalizationProvider } from './localization-provider';

/**
 * Slice-1 integration: device-locale detection → i18next config → provider → hook,
 * with two independent descendants (one standing in for an app screen, one for a
 * shared component) proving the shared config reaches the whole tree identically
 * regardless of platform (@s1/@s3/@s4/@s15).
 */

const ScreenTitle = () => {
  const { t } = useLocalization();
  return <h1>{t('settings.title')}</h1>;
};

const SharedWidget = () => {
  const { t, locale } = useLocalization();
  return (
    <aside>
      <span data-testid="widget-title">{t('settings.title')}</span>
      <span data-testid="widget-locale">{locale}</span>
    </aside>
  );
};

const Switcher = () => {
  const { setLocale } = useLocalization();
  return (
    <button type="button" onClick={() => setLocale('es')}>
      to-spanish
    </button>
  );
};

describe('localization slice-1 integration', () => {
  it('resolves the detected device locale and reaches every descendant', async () => {
    render(
      <LocalizationProvider deviceLocale="pt-BR">
        <ScreenTitle />
        <SharedWidget />
      </LocalizationProvider>,
    );

    expect((await screen.findByRole('heading')).textContent).toBe('Configurações');
    expect(screen.getByTestId('widget-title').textContent).toBe('Configurações');
    expect(screen.getByTestId('widget-locale').textContent).toBe('pt');
  });

  it('propagates a language switch to both app screen and shared component at once', async () => {
    render(
      <LocalizationProvider deviceLocale="en-US">
        <ScreenTitle />
        <SharedWidget />
        <Switcher />
      </LocalizationProvider>,
    );
    expect((await screen.findByRole('heading')).textContent).toBe('Settings');

    await act(async () => {
      screen.getByText('to-spanish').click();
    });

    expect(screen.getByRole('heading').textContent).toBe('Ajustes');
    expect(screen.getByTestId('widget-title').textContent).toBe('Ajustes');
    expect(screen.getByTestId('widget-locale').textContent).toBe('es');
  });
});
