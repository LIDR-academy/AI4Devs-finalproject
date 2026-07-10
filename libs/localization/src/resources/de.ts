import type { TranslationResource } from './en';

/** German bundle. Key-aligned with `en` (compiler-enforced). Copy pending native review (R6). */
export const de: TranslationResource = {
  translation: {
    nav: {
      myLessons: 'Meine Lektionen',
      newLesson: 'Neue Lektion',
      settings: 'Einstellungen',
      lesson: 'Lektion',
      study: 'Lernen',
      results: 'Ergebnisse',
      logIn: 'Anmelden',
      signUp: 'Registrieren',
    },
    home: {
      savedLessons: 'Gespeicherte Lektionen',
      openDemo: 'Demo-Lektion öffnen',
    },
    lessons: {
      count_one: '{{count}} Lektion',
      count_other: '{{count}} Lektionen',
    },
    upload: {
      intro: 'Lade ein PDF hoch, um eine Lektion zu erstellen',
    },
    lesson: {
      title: 'Lektion {{id}}',
      start: 'Lernen beginnen',
      viewResults: 'Ergebnisse ansehen',
    },
    player: {
      intro: 'Folien-Player für Lektion {{id}}',
      finish: 'Lektion abschließen',
    },
    results: {
      summary: 'Ergebnisse für Lektion {{id}}',
      retake: 'Aktivitäten wiederholen',
      backHome: 'Zurück zu meinen Lektionen',
    },
    auth: {
      toSignUp: 'Kein Konto? Registrieren',
      toLogIn: 'Schon ein Konto? Anmelden',
    },
    settings: {
      title: 'Einstellungen',
      language: {
        heading: 'Sprache',
        a11yLabel: 'Sprache auswählen',
      },
    },
  },
};
