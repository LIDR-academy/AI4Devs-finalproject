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
    brand: {
      name: 'AI Study Buddy',
    },
    nav: {
      myLessons: 'My lessons',
      newLesson: 'New lesson',
      settings: 'Settings',
      openAccountMenu: 'Open {{label}} account menu',
      lesson: 'Lesson',
      study: 'Study',
      results: 'Results',
      logIn: 'Log in',
      signUp: 'Sign up',
    },
    home: {
      savedLessons: 'Saved lessons',
      openDemo: 'Open demo lesson',
      loading: 'Loading saved lessons…',
      empty: 'No saved lessons yet. Create one to get started.',
      error: "We couldn't load your lessons.",
      retry: 'Try again',
      openLesson: 'Open {{title}}',
      createdDate: '{{date}}',
      delete: {
        action: 'Delete {{title}}',
        confirmHeadline: 'Delete this lesson?',
        confirmBody: 'This permanently removes the lesson and its progress.',
        confirmAction: 'Delete',
        cancelAction: 'Cancel',
        failed: "We couldn't delete that lesson.",
      },
    },
    // pending-pdfs-generate task-9 — upload-screen PDF list copy (@s20).
    pdfList: {
      heading: 'Your PDFs',
      loading: 'Loading your PDFs…',
      empty: 'No extracted PDFs yet. Upload one to get started.',
      error: "We couldn't load your PDFs.",
      retry: 'Try again',
      status: {
        ready: 'Ready to generate',
        failed: 'Generation failed',
        generated: 'Lesson ready',
      },
      action: {
        generate: 'Generate',
        retry: 'Retry',
        openLesson: 'Open lesson',
        generateA11y: 'Generate {{filename}}',
        retryA11y: 'Retry {{filename}}',
        openLessonA11y: 'Open lesson for {{filename}}',
      },
      createdDate: '{{date}}',
      pageCount: '{{count}} pages',
      delete: {
        action: 'Delete {{filename}}',
        confirmHeadline: 'Delete this PDF?',
        confirmBody: 'This permanently removes the PDF and its extracted data.',
        confirmAction: 'Delete',
        cancelAction: 'Cancel',
        failed: "We couldn't delete that PDF.",
      },
    },
    lessons: {
      count_one: '{{count}} lesson',
      count_other: '{{count}} lessons',
    },
    entitlements: {
      error: {
        message: "We couldn't load your plan.",
        retry: 'Try again',
      },
    },
    upload: {
      intro: 'Upload a PDF to generate a lesson',
      // ai-key-management task-12 (Slice 2) — the ApiKeyGate guard-rail copy; added ahead of
      // task-13 for the same compiler-parity reason as the other apiKey.* keys.
      apiKeyRequired: {
        message: 'An API key is required to generate lessons.',
        action: 'Add API key',
      },
      chooseFile: 'Choose a PDF',
      dialogHeadline: 'Upload PDF',
      dialogClose: 'Close',
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
    // ai-lesson-generation task-9 (Slice 1) — LessonGenerationPanel's chrome copy (composition
    // picker, Generate action, progress step labels, ready-state summary). Error-state copy
    // (`generation.error.*`) is Slice-2/task-13, added with the Error state itself.
    generation: {
      dialogHeadline: 'Generate lesson',
      composition: {
        heading: 'Lesson content',
        instructionalOnly: 'Instructional only',
        activityOnly: 'Activity only',
        both: 'Both',
      },
      generate: 'Generate lesson',
      step: {
        reading: 'Reading content',
        generating: 'Generating slides',
        attaching: 'Attaching images',
        // review.md round-1 finding #1 (blocker) — the GenerationProgress step's a11y-label
        // status suffix, previously hardcoded English inside the molecule itself.
        status: {
          done: 'done',
          current: 'current',
          upcoming: 'upcoming',
        },
      },
      ready: {
        slideCount_one: '{{count}} slide generated',
        slideCount_other: '{{count}} slides generated',
        composition: 'Composition: {{composition}}',
        openInPlayer: 'Open in player',
      },
      // task-13 (Slice 2) — one message key per GenerationErrorCode (spec.md's Error contract
      // table names these keys verbatim) + the recovery-affordance action labels.
      error: {
        missingKey: 'An API key is required to generate lessons.',
        invalidKey: 'Your API key was rejected. Check it in Settings.',
        rateLimited: "You've hit the provider's rate limit. Try again in a moment.",
        timeout: 'Generation took too long. Try again.',
        generationFailed: 'Something went wrong while generating your lesson. Try again.',
        documentNotReady: "This document isn't ready yet. Please re-upload your PDF.",
        network: 'Network error. Try again.',
        unauthenticated: 'Please sign in to generate a lesson.',
        persistFailed: 'Your lesson could not be saved. Try again.',
        action: {
          retry: 'Try again',
          settings: 'Go to Settings',
          signIn: 'Sign in',
        },
      },
    },
    lesson: {
      title: 'Lesson {{id}}',
      start: 'Start studying',
      viewResults: 'View results',
    },
    player: {
      loading: 'Loading lesson…',
      next: 'Next',
      back: 'Back',
      slideOf: 'Slide {{current}} of {{total}}',
      empty: {
        message: 'This lesson has no slides yet.',
      },
      error: {
        message: "Couldn't load this lesson.",
        retry: 'Retry',
      },
    },
    results: {
      score: '{{correct}} / {{total}}',
      scorePercent: '{{percent}}%',
      scoreAnnouncement: '{{score}}, {{percent}}',
      retake: 'Retake activities',
      backHome: 'Back to my lessons',
      completeHeadline: 'Lesson complete',
      completeBody: "You've reached the end of this lesson.",
      saveFailed: "Couldn't save this attempt",
      retrySave: 'Try again',
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
      // ai-key-management task-8 (Slice 1) — added ahead of task-13 (Slice 3) out of the
      // `TranslationResource` type's compiler-enforced parity: es/pt/de are typed against
      // this exact shape, so these keys had to land (translated) in all four bundles
      // together rather than as an en-only stub. Task-13 still owns the full i18n slice
      // (copy review + extending migration-coverage.test.ts's key-existence guard for
      // api-key-form/api-key-settings).
      apiKey: {
        inputLabel: 'API key',
        save: 'Save',
        saving: 'Saving…',
        // Full-review Round 1, Major 4 — announced to assistive tech while the initial status
        // fetch is in flight (WCAG 4.1.3); not shown visually (mirrors auth.signingIn).
        loadingStatus: 'Checking your API key status…',
        replace: 'Replace',
        remove: 'Remove',
        savedStatus: '{{provider}} key saved · Updated {{date}}',
        // ai-key-management task-11 (Slice 2) — added ahead of task-13 for the same
        // compiler-parity reason as task-8's original apiKey.* keys: es/pt/de are typed
        // against this exact shape, so ApiKeyForm's new Empty/Error/Remove-confirm labels
        // had to land (translated) in all four bundles together. Task-13 still owns the
        // full i18n slice (copy review + migration-coverage.test.ts extension).
        guidance: "Don't have a key? Get one from Groq",
        removeConfirmHeadline: 'Remove API key?',
        removeConfirmBody: "You'll need to add a new key to generate lessons again.",
        // Full-review Round 1, Minor 6 — distinct from `remove` (the trigger button) to avoid
        // a duplicate-accessible-name collision between the two controls.
        removeConfirmAction: 'Confirm removal',
        removeConfirmCancelAction: 'Cancel',
        error: {
          network: "Couldn't reach the server. Try again.",
          // ai-key-management task-13 (Slice 3) — spec.md Open decision 3: the defensive
          // service-layer backstop for a blank/whitespace-only key (validation_error). No
          // current caller reaches this through the UI (ApiKeyForm disables Save until a
          // non-blank key is entered, @s5) — reserved for any future consumer of
          // ApiKeyForm's `error` prop, mirroring AuthErrorCode's own unreachable-but-defined
          // validation_error precedent.
          empty: 'Enter your API key.',
        },
      },
    },
    activity: {
      mcq: {
        submit: 'Submit',
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
      openEnded: {
        submit: 'Submit',
        yourAnswer: 'Your answer',
        modelAnswer: 'Model answer',
        explanationHeading: 'Why',
        unavailable: 'This activity is unavailable',
        answerInput: 'Your response',
      },
      flashcard: {
        reveal: 'Reveal answer',
        recalled: 'Recalled',
        notRecalled: 'Not recalled',
        recalledConfirmed: 'Marked recalled',
        notRecalledConfirmed: 'Marked not recalled',
        answerHeading: 'Answer',
        explanationHeading: 'Why',
        unavailable: 'This activity is unavailable',
      },
    },
  },
};

export type TranslationResource = typeof en;
