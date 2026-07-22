import type { Complexity, Priority, UpcomingFeature } from './types'

export const complexityOptions: Array<{ value: Complexity; label: string }> = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
]

export const priorityOptions: Array<{ value: Priority; label: string }> = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
]

export const defaultUpcomingFeatures: UpcomingFeature[] = [
  {
    key: 'user-registration',
    title: 'Registro y acceso de usuarios',
    description: 'Alta de cuentas, login seguro, recuperacion de contrasena y gestion de perfil.',
    priority: 'HIGH',
  },
  {
    key: 'ai-chat-assistant',
    title: 'Chat IA para sugerencias',
    description: 'Asistente conversacional para mejorar alcance, riesgos, fases y decisiones de estimacion.',
    priority: 'HIGH',
  },
  {
    key: 'what-if-simulator',
    title: 'Simulador de escenarios',
    description: 'Comparar escenarios what-if cambiando roles, complejidad y modelo de IA antes de estimar.',
    priority: 'MEDIUM',
  },
  {
    key: 'jira-github-sync',
    title: 'Integracion Jira/GitHub',
    description: 'Importar epicas/issues y mapear roadmap estimado con tareas reales de implementacion.',
    priority: 'MEDIUM',
  },
  {
    key: 'team-collaboration',
    title: 'Colaboracion de equipo',
    description: 'Comentarios, menciones, historial de cambios y aprobaciones sobre cada estimacion.',
    priority: 'MEDIUM',
  },
  {
    key: 'alerts-and-monitoring',
    title: 'Alertas y monitoreo de desvios',
    description: 'Notificaciones cuando cambian supuestos criticos o cuando costos reales superan la estimacion.',
    priority: 'MEDIUM',
  },
]
