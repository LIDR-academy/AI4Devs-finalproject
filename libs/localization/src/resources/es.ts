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
      // task-13/Slice-3 — native Spanish translations (replaces the Slice-2 verbatim-English stub).
      constraintsHint: 'Máximo {{maxMb}} MB, {{maxPages}} páginas',
      retryAction: 'Intentar de nuevo',
      imageCount_one: '{{count}} imagen extraída',
      imageCount_other: '{{count}} imágenes extraídas',
      error: {
        unsupportedType: 'Solo se admiten archivos PDF',
        fileTooLarge: 'Este archivo es demasiado grande (máx. 10 MB)',
        tooManyPages: 'Este PDF tiene demasiadas páginas (máx. 20)',
        scannedNotSupported: 'Este PDF parece escaneado; todavía no podemos leer su texto',
        corrupt: 'No se pudo abrir este PDF',
        extractionFailed: 'Ocurrió un error al leer tu PDF',
        network: 'Error de red',
        unauthenticated: 'Inicia sesión para subir el archivo',
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
