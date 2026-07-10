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
    activity: {
      mcq: {
        correct: 'Correto',
        incorrect: 'Incorreto',
        explanation: 'Explicação',
        unavailable: 'Esta pergunta não está disponível',
      },
    },
  },
};
