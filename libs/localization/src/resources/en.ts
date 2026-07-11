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
    activity: {
      mcq: {
        correct: 'Correct',
        incorrect: 'Incorrect',
        explanation: 'Explanation',
        unavailable: 'This question is unavailable',
      },
      matching: {
        submit: 'Submit',
        correct: 'All correct!',
        incorrect: 'Not quite',
        correctPair: 'correct',
        incorrectPair: 'incorrect',
        explanationHeading: 'Why',
        summary: '{{correct}} of {{total}} correct',
        unavailable: 'This activity is unavailable',
      },
      fillInTheBlank: {
        submit: 'Submit',
        correct: 'Correct!',
        incorrect: 'Incorrect',
        explanationHeading: 'Why',
        unavailable: 'This activity is unavailable',
        blankInput: 'Fill in the blank',
      },
    },
  },
};

export type TranslationResource = typeof en;
