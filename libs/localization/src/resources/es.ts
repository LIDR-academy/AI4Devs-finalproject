import type { TranslationResource } from './en';

/** Spanish bundle. Key-aligned with `en` (compiler-enforced). Copy pending native review (R6). */
export const es: TranslationResource = {
  translation: {
    nav: {
      myLessons: 'Mis lecciones',
      newLesson: 'Nueva lección',
      settings: 'Ajustes',
      lesson: 'Lección',
      study: 'Estudiar',
      results: 'Resultados',
      logIn: 'Iniciar sesión',
      signUp: 'Registrarse',
    },
    home: {
      savedLessons: 'Lecciones guardadas',
      openDemo: 'Abrir lección de ejemplo',
    },
    lessons: {
      count_one: '{{count}} lección',
      count_other: '{{count}} lecciones',
    },
    upload: {
      intro: 'Sube un PDF para generar una lección',
      chooseFile: 'Elige un PDF',
      loading: 'Extrayendo…',
      filenameLabel: 'Archivo',
      pageCountLabel: 'Páginas',
      imageCountLabel: 'Imágenes',
      continue: 'Continuar',
      // Slice-2 stub, duplicating the en copy so check-types' key-alignment stays green — native
      // Spanish review of these strings is task-13/Slice-3 scope.
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
      title: 'Lección {{id}}',
      start: 'Empezar a estudiar',
      viewResults: 'Ver resultados',
    },
    player: {
      intro: 'Reproductor de diapositivas de la lección {{id}}',
      finish: 'Finalizar lección',
    },
    results: {
      summary: 'Resultados de la lección {{id}}',
      retake: 'Repetir actividades',
      backHome: 'Volver a mis lecciones',
    },
    auth: {
      email: 'Correo electrónico',
      password: 'Contraseña',
      submit: 'Iniciar sesión',
      signingIn: 'Iniciando sesión…',
      toSignUp: '¿No tienes cuenta? Regístrate',
      toLogIn: '¿Ya tienes cuenta? Inicia sesión',
      logOut: 'Cerrar sesión',
      logOutConfirmHeadline: '¿Cerrar sesión?',
      logOutConfirmBody: 'Tendrás que iniciar sesión de nuevo para acceder a tus lecciones.',
      logOutConfirmAction: 'Cerrar sesión',
      logOutCancelAction: 'Cancelar',
      error: {
        email: 'Introduce un correo electrónico válido',
        invalidCredentials: 'Correo electrónico o contraseña incorrectos',
        network: 'Error de red',
      },
    },
    settings: {
      title: 'Ajustes',
      language: {
        heading: 'Idioma',
        a11yLabel: 'Elige un idioma',
      },
    },
  },
};
