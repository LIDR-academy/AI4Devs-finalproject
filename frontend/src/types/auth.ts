export const APP_ROLES = ['COLABORADOR', 'ADMIN'] as const

export type AppRole = (typeof APP_ROLES)[number]
