jest.mock('@helsoft/services', () => ({
  LocalePreferenceService: {
    getStoredLocale: jest.fn().mockResolvedValue(null),
    setStoredLocale: jest.fn().mockResolvedValue(undefined),
  },
}));

import { render, screen } from '@testing-library/react';

import { LocalizationProvider } from '../provider/localization-provider';
import { useLocalization } from './use-localization';

const InterpolatingConsumer = () => {
  const { t } = useLocalization();
  return <span>{t('lesson.title', { id: '7' })}</span>;
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
});
