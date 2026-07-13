jest.mock('@helsoft/services', () => ({
  LocalePreferenceService: {
    getStoredLocale: jest.fn().mockResolvedValue(null),
    setStoredLocale: jest.fn().mockResolvedValue(undefined),
  },
}));

import type { Locale } from '@helsoft/types';
import { render, screen } from '@testing-library/react';

import { LocalizationProvider } from '../provider/localization-provider';
import { useLocalization } from './use-localization';

const InterpolatingConsumer = () => {
  const { t } = useLocalization();
  return <span>{t('lesson.title', { id: '7' })}</span>;
};

const LocaleConsumer = () => {
  const { locale } = useLocalization();
  return <span>locale:{locale}</span>;
};

describe('useLocalization', () => {
  // @s10 — the hook forwards interpolation options straight through to i18next; the values are
  // NOT dropped, so `lesson.title` renders with the id injected.
  it('forwards interpolation options to the translation', async () => {
    render(
      <LocalizationProvider initialLocale="en">
        <InterpolatingConsumer />
      </LocalizationProvider>,
    );

    expect(await screen.findByText('Lesson 7')).toBeTruthy();
  });

  // The active locale is guarded at the i18next boundary: if i18n reports a language that is not
  // one of the supported locales, the hook exposes the fallback locale rather than an unchecked cast.
  it('falls back to the fallback locale when i18n reports an unsupported language', async () => {
    render(
      <LocalizationProvider initialLocale={'fr' as Locale}>
        <LocaleConsumer />
      </LocalizationProvider>,
    );

    expect(await screen.findByText('locale:en')).toBeTruthy();
  });
});
