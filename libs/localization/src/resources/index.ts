import type { Resource } from 'i18next';

import { de } from './de';
import { en } from './en';
import { es } from './es';
import { pt } from './pt';

/**
 * i18next resource map keyed by locale. Adding a locale is config-only:
 * drop a `<locale>.ts` bundle and register it here (and in SUPPORTED_LOCALES).
 */
export const resources: Resource = { en, es, pt, de };

export type { TranslationResource } from './en';
