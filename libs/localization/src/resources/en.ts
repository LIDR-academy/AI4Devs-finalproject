/**
 * English — the authoritative base bundle and runtime fallback.
 * Every other locale bundle is typed as `TranslationResource` (derived from this
 * file) so the compiler enforces that all bundles stay key-aligned with `en`.
 *
 * `lesson.title` proves interpolation (AC11/@s10) and `lessons.count_*` proves
 * pluralization (AC12/@s11, i18next v4 one/other suffix convention).
 */
export const en = {
  translation: {
    nav: {
      myLessons: 'My lessons',
      newLesson: 'New lesson',
      settings: 'Settings',
      lesson: 'Lesson',
      study: 'Study',
      results: 'Results',
      logIn: 'Log in',
      signUp: 'Sign up',
    },
    home: {
      savedLessons: 'Saved lessons',
      openDemo: 'Open demo lesson',
    },
    lessons: {
      count_one: '{{count}} lesson',
      count_other: '{{count}} lessons',
    },
    upload: {
      intro: 'Upload a PDF to generate a lesson',
      chooseFile: 'Choose a PDF',
      loading: 'Extracting…',
      filenameLabel: 'File',
      pageCountLabel: 'Pages',
      imageCountLabel: 'Images',
      continue: 'Continue',
      constraintsHint: 'Max {{maxMb}} MB, {{maxPages}} pages',
      retryAction: 'Try again',
      // Success-summary image count (@s6/@s15, task-13) — i18next one/other pluralization,
      // mirroring `lessons.count_*`.
      imageCount_one: '{{count}} image extracted',
      imageCount_other: '{{count}} images extracted',
      // fileTooLarge/tooManyPages spell out the limit as plain text for now (matching
      // PDF_EXTRACTION_LIMITS's locked 10 MB / 20 pages) — interpolating {{maxMb}}/{{maxPages}}
      // into every error message, not just the constraints hint, is task-13/Slice-3 scope.
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
      title: 'Lesson {{id}}',
      start: 'Start studying',
      viewResults: 'View results',
    },
    player: {
      intro: 'Slide player for lesson {{id}}',
      finish: 'Finish lesson',
    },
    results: {
      summary: 'Results for lesson {{id}}',
      retake: 'Retake activities',
      backHome: 'Back to my lessons',
    },
    auth: {
      email: 'Email',
      password: 'Password',
      submit: 'Log in',
      signingIn: 'Signing in…',
      toSignUp: 'No account? Sign up',
      toLogIn: 'Already have an account? Log in',
      logOut: 'Log out',
      logOutConfirmHeadline: 'Log out?',
      logOutConfirmBody: "You'll need to sign in again to access your lessons.",
      logOutConfirmAction: 'Log out',
      logOutCancelAction: 'Cancel',
      error: {
        email: 'Enter a valid email address',
        invalidCredentials: 'Invalid email or password',
        network: 'Network error',
      },
    },
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
