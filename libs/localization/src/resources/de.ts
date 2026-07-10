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
      chooseFile: 'PDF auswählen',
      loading: 'Wird extrahiert…',
      filenameLabel: 'Datei',
      pageCountLabel: 'Seiten',
      imageCountLabel: 'Bilder',
      continue: 'Weiter',
      // Slice-2 stub, duplicating the en copy so check-types' key-alignment stays green — native
      // German review of these strings is task-13/Slice-3 scope.
      constraintsHint: 'Max {{maxMb}} MB, {{maxPages}} pages',
      retryAction: 'Try again',
      error: {
        unsupportedType: 'Only PDF files are supported',
        fileTooLarge: 'This file is too large (max 10 MB)',
        tooManyPages: 'This PDF has too many pages (max 20)',
        scannedNotSupported: "This looks like a scanned PDF; we can't read its text yet",
        corrupt: "This PDF couldn't be opened",
        extractionFailed: 'Something went wrong while reading your PDF',
        network: 'Network error',
        unauthenticated: 'Please sign in to upload',
      },
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
  },
};
