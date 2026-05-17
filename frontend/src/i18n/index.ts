import { createI18n } from 'vue-i18n'
import { es, type MessageSchema } from '@/i18n/locales/es'

const supportedLocales = ['es'] as const
export type Locale = (typeof supportedLocales)[number]

const loadedLocales = new Set<Locale>(['es'])

const localeLoaders: Record<Locale, () => Promise<MessageSchema>> = {
  es: async () => es,
}

export const i18n = createI18n<[MessageSchema], Locale>({
  legacy: false,
  locale: 'es',
  fallbackLocale: 'es',
  messages: {
    es,
  },
})

export async function loadLocaleMessages(locale: Locale): Promise<void> {
  if (loadedLocales.has(locale)) {
    return
  }

  const messages = await localeLoaders[locale]()
  i18n.global.setLocaleMessage(locale, messages)
  loadedLocales.add(locale)
}

export function setI18nLanguage(locale: Locale): void {
  i18n.global.locale = locale
  globalThis.document?.documentElement.setAttribute('lang', locale)
}

export async function initializeI18n(locale: Locale = 'es'): Promise<void> {
  await loadLocaleMessages(locale)
  setI18nLanguage(locale)
}
