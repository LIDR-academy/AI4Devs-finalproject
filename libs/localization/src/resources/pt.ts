import type { TranslationResource } from './en';

/** Portuguese bundle. Key-aligned with `en` (compiler-enforced). Copy pending native review (R6). */
export const pt: TranslationResource = {
  translation: {
    nav: {
      myLessons: 'Minhas lições',
      newLesson: 'Nova lição',
      settings: 'Configurações',
      lesson: 'Lição',
      study: 'Estudar',
      results: 'Resultados',
      logIn: 'Entrar',
      signUp: 'Cadastrar',
    },
    home: {
      savedLessons: 'Lições salvas',
      openDemo: 'Abrir lição de demonstração',
    },
    lessons: {
      count_one: '{{count}} lição',
      count_other: '{{count}} lições',
    },
    upload: {
      intro: 'Envie um PDF para gerar uma lição',
      chooseFile: 'Escolha um PDF',
      loading: 'Extraindo…',
      filenameLabel: 'Arquivo',
      pageCountLabel: 'Páginas',
      imageCountLabel: 'Imagens',
      continue: 'Continuar',
      // Slice-2 stub, duplicating the en copy so check-types' key-alignment stays green — native
      // Portuguese review of these strings is task-13/Slice-3 scope.
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
      title: 'Lição {{id}}',
      start: 'Começar a estudar',
      viewResults: 'Ver resultados',
    },
    player: {
      intro: 'Reprodutor de slides da lição {{id}}',
      finish: 'Concluir lição',
    },
    results: {
      summary: 'Resultados da lição {{id}}',
      retake: 'Refazer atividades',
      backHome: 'Voltar às minhas lições',
    },
    auth: {
      email: 'E-mail',
      password: 'Senha',
      submit: 'Entrar',
      signingIn: 'Entrando…',
      toSignUp: 'Não tem conta? Cadastre-se',
      toLogIn: 'Já tem conta? Entre',
      logOut: 'Sair',
      logOutConfirmHeadline: 'Sair da conta?',
      logOutConfirmBody: 'Você precisará entrar novamente para acessar suas lições.',
      logOutConfirmAction: 'Sair',
      logOutCancelAction: 'Cancelar',
      error: {
        email: 'Informe um e-mail válido',
        invalidCredentials: 'E-mail ou senha inválidos',
        network: 'Erro de rede',
      },
    },
    settings: {
      title: 'Configurações',
      language: {
        heading: 'Idioma',
        a11yLabel: 'Escolha um idioma',
      },
    },
  },
};
