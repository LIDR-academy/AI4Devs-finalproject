export const buildProjectData = () => {
  const suffix = Date.now()

  return {
    projectName: `MVP E2E ${suffix}`,
    projectDescription: 'Plataforma para validar flujo E2E completo de estimacion con roadmap y costos.',
    useCaseTitle: `Generar roadmap ${suffix}`,
    useCaseDescription:
      'El sistema debe construir fases, horas, costos y riesgos para un proyecto nuevo con contexto funcional.',
  }
}
