jest.mock('@helsoft/services', () => ({
  LocalePreferenceService: {
    getStoredLocale: jest.fn(),
    setStoredLocale: jest.fn(),
  },
}));

import { LocalePreferenceService } from '@helsoft/services';
import { act, render, screen } from '@testing-library/react';

import { useLocalization } from '../hooks/use-localization';
import { LocalizationProvider } from './localization-provider';

const service = LocalePreferenceService as jest.Mocked<typeof LocalePreferenceService>;

const Consumer = () => {
  const { t, locale, setLocale } = useLocalization();
  return (
    <div>
      <span>{t('settings.title')}</span>
      <span data-testid="locale">{locale}</span>
      <button type="button" onClick={() => setLocale('es')}>
        to-spanish
      </button>
    </div>
  );
};

describe('LocalizationProvider persistence + precedence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    service.getStoredLocale.mockResolvedValue(null);
    service.setStoredLocale.mockResolvedValue(undefined);
  });

  // @s7 — a previously persisted preference is used on (re)launch.
  it('launches in the saved preference on relaunch', async () => {
    service.getStoredLocale.mockResolvedValue('pt');

    render(
      <LocalizationProvider deviceLocale="en-US">
        <Consumer />
      </LocalizationProvider>,
    );

    expect(await screen.findByText('Configurações')).toBeTruthy();
    expect(screen.getByTestId('locale').textContent).toBe('pt');
  });

  // @s8 — a saved preference wins over the device locale.
  it('prefers the saved locale over the device locale', async () => {
    service.getStoredLocale.mockResolvedValue('es');

    render(
      <LocalizationProvider deviceLocale="de-DE">
        <Consumer />
      </LocalizationProvider>,
    );

    expect(await screen.findByText('Ajustes')).toBeTruthy();
    expect(screen.getByTestId('locale').textContent).toBe('es');
  });

  // @s12 — with no usable saved preference, resolution degrades to device detection.
  it('falls back to device detection when there is no saved preference', async () => {
    service.getStoredLocale.mockResolvedValue(null);

    render(
      <LocalizationProvider deviceLocale="es-ES">
        <Consumer />
      </LocalizationProvider>,
    );

    expect(await screen.findByText('Ajustes')).toBeTruthy();
    expect(screen.getByTestId('locale').textContent).toBe('es');
  });

  // @s6 — selecting a language switches immediately AND persists the choice.
  it('setLocale switches the UI immediately and persists the choice', async () => {
    render(
      <LocalizationProvider deviceLocale="en-US">
        <Consumer />
      </LocalizationProvider>,
    );
    expect(await screen.findByText('Settings')).toBeTruthy();

    await act(async () => {
      screen.getByText('to-spanish').click();
    });

    expect(screen.getByText('Ajustes')).toBeTruthy();
    expect(service.setStoredLocale).toHaveBeenCalledWith('es');
  });

  // Open decision + FO1 — a failed save still applies in-memory and is logged, never thrown.
  it('applies the selection in-memory and logs when the save fails', async () => {
    service.setStoredLocale.mockRejectedValue(new Error('storage unavailable'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <LocalizationProvider deviceLocale="en-US">
        <Consumer />
      </LocalizationProvider>,
    );
    await screen.findByText('Settings');

    await act(async () => {
      screen.getByText('to-spanish').click();
    });

    expect(screen.getByText('Ajustes')).toBeTruthy();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
