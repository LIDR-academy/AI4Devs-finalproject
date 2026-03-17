import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import { LanguageSwitcher } from './LanguageSwitcher';

// Mock i18n for testing
const mockI18n = {
  ...i18n,
  changeLanguage: jest.fn(),
  language: 'ca',
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  hasResourceBundle: jest.fn(() => true),
  getResourceBundle: jest.fn(),
  options: {
    fallbackLng: 'en',
    defaultNS: 'common',
  },
};

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders current language', () => {
    render(
      <I18nextProvider i18n={mockI18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    expect(screen.getByText('Català')).toBeInTheDocument();
    // Avoid brittle emoji assertion (glyphs can differ in environments)
  });

  test('renders language switcher button', () => {
    render(
      <I18nextProvider i18n={mockI18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Català');
  });

  test('opens dropdown when clicked', () => {
    render(
      <I18nextProvider i18n={mockI18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Dropdown should be visible
    expect(screen.getByText('Español')).toBeInTheDocument();
  });

  test('calls i18n.changeLanguage when language is selected', () => {
    render(
      <I18nextProvider i18n={mockI18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    const spanishButton = screen.getByText('Español');
    fireEvent.click(spanishButton);

    expect(mockI18n.changeLanguage).toHaveBeenCalledWith('es');
  });

  test('shows all languages in dropdown', () => {
    render(
      <I18nextProvider i18n={mockI18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Check all languages are displayed in dropdown
    expect(screen.getAllByText('Català')).toHaveLength(2); // One in button, one in dropdown
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('Română')).toBeInTheDocument();
    expect(screen.getByText('Українська')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Français')).toBeInTheDocument();
  });

  test('handles language change with different current language', () => {
    const mockI18nWithSpanish = {
      ...mockI18n,
      language: 'es',
    };

    render(
      <I18nextProvider i18n={mockI18nWithSpanish}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    // Spanish should be displayed as current language
    expect(screen.getByText('Español')).toBeInTheDocument();
  });
});
