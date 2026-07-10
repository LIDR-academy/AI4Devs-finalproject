/**
 * English — the authoritative base bundle and runtime fallback.
 * Every other locale bundle is typed as `TranslationResource` (derived from this
 * file) so the compiler enforces that all bundles stay key-aligned with `en`.
 * The full key set is filled in during the migration slice (task-10/11).
 */
export const en = {
  translation: {
    settings: {
      title: 'Settings',
      language: {
        heading: 'Language',
        a11yLabel: 'Choose a language',
      },
    },
  },
};

export type TranslationResource = typeof en;
