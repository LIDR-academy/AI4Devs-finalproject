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
      score: '{{correct}} / {{total}}',
      scorePercent: '{{percent}}%',
      retake: 'Aktivitäten wiederholen',
      backHome: 'Zurück zu meinen Lektionen',
    },
    auth: {
      email: 'E-Mail',
      password: 'Passwort',
      submit: 'Anmelden',
      signingIn: 'Anmeldung läuft…',
      toSignUp: 'Kein Konto? Registrieren',
      toLogIn: 'Schon ein Konto? Anmelden',
      logOut: 'Abmelden',
      logOutConfirmHeadline: 'Abmelden?',
      logOutConfirmBody: 'Du musst dich erneut anmelden, um auf deine Lektionen zuzugreifen.',
      logOutConfirmAction: 'Abmelden',
      logOutCancelAction: 'Abbrechen',
      error: {
        email: 'Bitte gib eine gültige E-Mail-Adresse ein',
        invalidCredentials: 'E-Mail oder Passwort ungültig',
        network: 'Netzwerkfehler',
      },
    },
    settings: {
      title: 'Einstellungen',
      language: {
        heading: 'Sprache',
        a11yLabel: 'Sprache auswählen',
      },
    },
    activity: {
      mcq: {
        correct: 'Richtig',
        incorrect: 'Falsch',
        explanation: 'Erklärung',
        unavailable: 'Diese Frage ist nicht verfügbar',
      },
    },
  },
};
