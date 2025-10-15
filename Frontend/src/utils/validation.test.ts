import { renderHook } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';
import { useValidation } from './validation';
import React from 'react';

const renderWithI18n = (hook: () => any, language = 'ca') => {
  i18n.changeLanguage(language);
  
  return renderHook(hook, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      React.createElement(I18nextProvider, { i18n }, children)
    ),
  });
};

describe('useValidation', () => {
  test('returns validation functions in current language', () => {
    const { result } = renderWithI18n(() => useValidation(), 'ca');

    expect(typeof result.current.required).toBe('function');
    expect(typeof result.current.email).toBe('function');
    expect(typeof result.current.minLength).toBe('function');
    expect(typeof result.current.range).toBe('function');
    expect(typeof result.current.maxLength).toBe('function');
    expect(typeof result.current.numeric).toBe('function');
  });

  test('required returns translated message in Catalan', () => {
    const { result } = renderWithI18n(() => useValidation(), 'ca');

    const message = result.current.required('email');
    expect(message).toBe('El camp email és obligatori');
  });

  test('required returns translated message in Spanish', () => {
    const { result } = renderWithI18n(() => useValidation(), 'es');

    const message = result.current.required('nombre');
    expect(message).toBe('El campo nombre es obligatorio');
  });

  test('required returns translated message in English', () => {
    const { result } = renderWithI18n(() => useValidation(), 'en');

    const message = result.current.required('password');
    expect(message).toBe('The field password is required');
  });

  test('email returns translated message in current language', () => {
    const { result } = renderWithI18n(() => useValidation(), 'ca');

    const message = result.current.email();
    expect(message).toBe('Format d\'email invàlid');
  });

  test('email returns translated message in French', () => {
    const { result } = renderWithI18n(() => useValidation(), 'fr');

    const message = result.current.email();
    expect(message).toBe('Format d\'email invalide');
  });

  test('minLength returns translated message with parameters', () => {
    const { result } = renderWithI18n(() => useValidation(), 'ca');

    const message = result.current.minLength(8);
    expect(message).toBe('Mínim 8 caràcters');
  });

  test('minLength returns translated message in Romanian', () => {
    const { result } = renderWithI18n(() => useValidation(), 'ro');

    const message = result.current.minLength(6);
    expect(message).toBe('Minimum 6 caractere');
  });

  test('maxLength returns translated message with parameters', () => {
    const { result } = renderWithI18n(() => useValidation(), 'es');

    const message = result.current.maxLength(50);
    expect(message).toBe('Máximo 50 caracteres');
  });

  test('range returns translated message with parameters', () => {
    const { result } = renderWithI18n(() => useValidation(), 'en');

    const message = result.current.range(18, 65);
    expect(message).toBe('Must be between 18 and 65');
  });

  test('range returns translated message in Ukrainian', () => {
    const { result } = renderWithI18n(() => useValidation(), 'uk');

    const message = result.current.range(1, 10);
    expect(message).toBe('Має бути від 1 до 10');
  });

  test('numeric returns translated message in current language', () => {
    const { result } = renderWithI18n(() => useValidation(), 'ca');

    const message = result.current.numeric();
    expect(message).toBe('Ha de ser un número');
  });

  test('numeric returns translated message in French', () => {
    const { result } = renderWithI18n(() => useValidation(), 'fr');

    const message = result.current.numeric();
    expect(message).toBe('Doit être un nombre');
  });

  test('phone returns translated message in current language', () => {
    const { result } = renderWithI18n(() => useValidation(), 'es');

    const message = result.current.phone();
    expect(message).toBe('Formato de teléfono inválido');
  });

  test('phone returns translated message in English', () => {
    const { result } = renderWithI18n(() => useValidation(), 'en');

    const message = result.current.phone();
    expect(message).toBe('Invalid phone format');
  });

  test('date returns translated message in current language', () => {
    const { result } = renderWithI18n(() => useValidation(), 'ca');

    const message = result.current.date();
    expect(message).toBe('Format de data invàlid');
  });

  test('date returns translated message in Romanian', () => {
    const { result } = renderWithI18n(() => useValidation(), 'ro');

    const message = result.current.date();
    expect(message).toBe('Format de dată invalid');
  });

  test('time returns translated message in current language', () => {
    const { result } = renderWithI18n(() => useValidation(), 'uk');

    const message = result.current.time();
    expect(message).toBe('Невірний формат часу');
  });

  test('time returns translated message in French', () => {
    const { result } = renderWithI18n(() => useValidation(), 'fr');

    const message = result.current.time();
    expect(message).toBe('Format d\'heure invalide');
  });
});
