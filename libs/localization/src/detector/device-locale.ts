/**
 * Reduce a device locale tag to its base language subtag, lowercased:
 * `pt-BR` → `pt`, `de-AT` → `de`, `EN` → `en`.
 *
 * Pure and platform-agnostic: the app reads the raw tag from `expo-localization`
 * (`getLocales()[0].languageTag`) and passes it in, so this lib never imports a
 * native module (AC13/R1).
 */
export const toBaseSubtag = (tag: string): string => tag.split('-')[0].toLowerCase();
