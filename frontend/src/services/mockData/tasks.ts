import { Task, TaskStatus } from '../../types';
import { getUserName } from './users';

export const mockTasks: Task[] = [
  // Tareas en backlog
  {
    id: 1,
    subject: 'Implementar sistema de notificaciones push',
    description: 'Desarrollar funcionalidad para enviar notificaciones push a usuarios móviles cuando se actualice el estado de sus tareas.',
    status: TaskStatus.BACKLOG,
    priority: 1,
    assignedTo: 4, // Carlos Martínez (Marketing)
    functional: 'https://docs.company.com/notificaciones-push.pdf',
    department: 2, // Marketing
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-10'),
    priorityOrder: 1
  },
  {
    id: 2,
    subject: 'Optimización de base de datos de clientes',
    description: 'Mejorar el rendimiento de las consultas de la base de datos de clientes para reducir tiempos de carga.',
    status: TaskStatus.BACKLOG,
    priority: 2,
    assignedTo: 6, // David Hernández (Ventas)
    functional: 'https://docs.company.com/optimizacion-bd.pdf',
    department: 3, // Ventas
    createdAt: new Date('2025-01-08'),
    updatedAt: new Date('2025-01-08'),
    sprints: 3,
    loadFactor: 2,
    priorityOrder: 2
  },
  {
    id: 3,
    subject: 'Dashboard de métricas de RRHH',
    description: 'Crear dashboard para visualizar métricas clave de recursos humanos como rotación, satisfacción y productividad.',
    status: TaskStatus.BACKLOG,
    priority: 3,
    assignedTo: 8, // Roberto Moreno (RRHH)
    functional: 'https://docs.company.com/dashboard-rrhh.pdf',
    department: 4, // RRHH
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-05'),
    priorityOrder: 3
  },

  // Tareas planificadas
  {
    id: 4,
    subject: 'Integración con sistema de facturación',
    description: 'Conectar el sistema actual con el nuevo sistema de facturación para automatizar el proceso.',
    status: TaskStatus.TODO,
    priority: 1,
    assignedTo: 9, // Patricia Jiménez (Finanzas)
    functional: 'https://docs.company.com/integracion-facturacion.pdf',
    department: 5, // Finanzas
    createdAt: new Date('2025-01-03'),
    updatedAt: new Date('2025-01-12'),
    sprints: 5,
    loadFactor: 3,
    team: 1, // Dev 01
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-03-03'),
    priorityOrder: 1
  },
  {
    id: 5,
    subject: 'Portal de autoservicio para empleados',
    description: 'Desarrollar portal donde los empleados puedan gestionar sus datos personales, solicitar vacaciones y consultar nóminas.',
    status: TaskStatus.TODO,
    priority: 2,
    assignedTo: 8, // Roberto Moreno (RRHH)
    functional: 'https://docs.company.com/portal-empleados.pdf',
    department: 4, // RRHH
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-11'),
    sprints: 8,
    loadFactor: 2,
    team: 3, // Dev 04
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-04-26'),
    priorityOrder: 2
  },

  // Tareas en progreso
  {
    id: 6,
    subject: 'Módulo de gestión de inventario',
    description: 'Implementar módulo para gestión completa de inventario con alertas de stock mínimo y reportes.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 10, // Fernando Ruiz (Operaciones)
    functional: 'https://docs.company.com/gestion-inventario.pdf',
    department: 6, // Operaciones
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2025-01-13'),
    sprints: 6,
    loadFactor: 2,
    team: 2, // Dev 03
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-02-26'),
    priorityOrder: 1
  },
  {
    id: 7,
    subject: 'Sistema de tickets de soporte',
    description: 'Desarrollar sistema completo de gestión de tickets de soporte al cliente con asignación automática.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 11, // Mónica Vázquez (Atención al Cliente)
    functional: 'https://docs.company.com/tickets-soporte.pdf',
    department: 7, // Atención al Cliente
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2025-01-13'),
    sprints: 4,
    loadFactor: 1,
    team: 4, // Dev 05
    startDate: new Date('2024-12-20'),
    endDate: new Date('2025-02-14'),
    priorityOrder: 1
  },

  // Tareas completadas
  {
    id: 8,
    subject: 'Migración a nueva versión de framework',
    description: 'Actualizar el framework principal de la aplicación a la última versión estable.',
    status: TaskStatus.DONE,
    priority: 1,
    assignedTo: 1, // Juan Pérez (Tecnología)
    functional: 'https://docs.company.com/migracion-framework.pdf',
    department: 1, // Tecnología
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-12-20'),
    sprints: 3,
    loadFactor: 2,
    team: 5, // Dev 06
    startDate: new Date('2024-11-15'),
    endDate: new Date('2024-12-20'),
    priorityOrder: 1
  },

  // Más tareas para tener variedad
  {
    id: 9,
    subject: 'API de integración con redes sociales',
    description: 'Desarrollar API para integrar publicaciones automáticas en redes sociales.',
    status: TaskStatus.BACKLOG,
    priority: 3,
    assignedTo: 5, // Laura Rodríguez (Marketing)
    department: 2, // Marketing
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-01-12'),
    priorityOrder: 4
  },
  {
    id: 10,
    subject: 'Módulo de análisis de ventas',
    description: 'Crear módulo para análisis detallado de ventas con gráficos y reportes personalizables.',
    status: TaskStatus.TODO,
    priority: 2,
    assignedTo: 7, // Sara González (Ventas)
    functional: 'https://docs.company.com/analisis-ventas.pdf',
    department: 3, // Ventas
    createdAt: new Date('2025-01-11'),
    updatedAt: new Date('2025-01-11'),
    sprints: 4,
    loadFactor: 1,
    team: 11, // Equipo Externo 1
    startDate: new Date('2025-02-15'),
    endDate: new Date('2025-04-11'),
    priorityOrder: 3
  },
  {
    id: 11,
    subject: 'Sistema de evaluación de desempeño',
    description: 'Implementar sistema digital para evaluaciones de desempeño de empleados.',
    status: TaskStatus.DOING,
    priority: 2,
    assignedTo: 8, // Roberto Moreno (RRHH)
    functional: 'https://docs.company.com/evaluacion-desempeno.pdf',
    department: 4, // RRHH
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2025-01-10'),
    sprints: 5,
    loadFactor: 2,
    team: 6, // Dev 07
    startDate: new Date('2024-12-15'),
    endDate: new Date('2025-03-07'),
    priorityOrder: 2
  },
  {
    id: 12,
    subject: 'Automatización de reportes financieros',
    description: 'Automatizar la generación de reportes financieros mensuales y trimestrales.',
    status: TaskStatus.DONE,
    priority: 1,
    assignedTo: 9, // Patricia Jiménez (Finanzas)
    functional: 'https://docs.company.com/reportes-financieros.pdf',
    department: 5, // Finanzas
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2024-12-10'),
    sprints: 4,
    loadFactor: 1,
    team: 7, // Dev 08
    startDate: new Date('2024-11-01'),
    endDate: new Date('2024-12-10'),
    priorityOrder: 1
  },

  // === PROYECTOS ACTUALES CONVERTIDOS A TAREAS ===
  // Estos proyectos reemplazan los datos de currentProjects.ts

  // Dev 01 (equipo 1)
  {
    id: 101,
    subject: 'Portal Cliente v2.1',
    description: 'Actualización mayor del portal de clientes con nuevas funcionalidades de autoservicio.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/portal-cliente-v2.pdf',
    department: 3, // Comercial
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 6,
    loadFactor: 1.0,
    team: 1,
    startDate: new Date('2025-01-05'),
    endDate: new Date('2025-02-15'),
    priorityOrder: 1
  },
  {
    id: 102,
    subject: 'API Pagos Móviles',
    description: 'Desarrollo de API para integración con sistemas de pagos móviles.',
    status: TaskStatus.TODO,
    priority: 2,
    assignedTo: 9, // Patricia Jiménez
    functional: 'https://docs.company.com/api-pagos-moviles.pdf',
    department: 5, // Finanzas
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-13'),
    sprints: 5,
    loadFactor: 0.5,
    team: 1,
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-02-28'),
    priorityOrder: 2
  },

  // Dev 03 (equipo 2)
  {
    id: 103,
    subject: 'Migración Base Datos',
    description: 'Migración completa de la base de datos principal a nueva infraestructura cloud.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/migracion-bd.pdf',
    department: 1, // IT
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 8,
    loadFactor: 1.5,
    team: 2,
    startDate: new Date('2024-12-15'),
    endDate: new Date('2025-02-10'),
    priorityOrder: 1
  },
  {
    id: 104,
    subject: 'Dashboard Ejecutivo',
    description: 'Dashboard de métricas ejecutivas en tiempo real.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 13, // Ana Torres
    functional: 'https://docs.company.com/dashboard-ejecutivo.pdf',
    department: 8, // Dirección
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2025-01-13'),
    sprints: 3,
    loadFactor: 0.5,
    team: 2,
    startDate: new Date('2025-01-10'),
    endDate: new Date('2025-01-31'),
    priorityOrder: 1
  },

  // Dev 04 (equipo 3)
  {
    id: 105,
    subject: 'App Móvil Empleados',
    description: 'Aplicación móvil para empleados con funcionalidades de autogestión.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 8, // Roberto Moreno
    functional: 'https://docs.company.com/app-movil-empleados.pdf',
    department: 4, // RRHH
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2025-01-13'),
    sprints: 12,
    loadFactor: 1.2,
    team: 3,
    startDate: new Date('2024-12-20'),
    endDate: new Date('2025-03-15'),
    priorityOrder: 1
  },

  // Dev 05 (equipo 4)
  {
    id: 106,
    subject: 'Sistema Inventario',
    description: 'Sistema completo de gestión de inventario con alertas y reportes.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 10, // Fernando Ruiz
    functional: 'https://docs.company.com/sistema-inventario.pdf',
    department: 6, // Operaciones
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2025-01-13'),
    sprints: 10,
    loadFactor: 1.0,
    team: 4,
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-02-20'),
    priorityOrder: 1
  },
  {
    id: 107,
    subject: 'Integración CRM',
    description: 'Integración con sistema CRM externo para unificar datos de clientes.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 6, // David Hernández
    functional: 'https://docs.company.com/integracion-crm.pdf',
    department: 3, // Comercial
    createdAt: new Date('2024-12-20'),
    updatedAt: new Date('2025-01-13'),
    sprints: 3,
    loadFactor: 0.8,
    team: 4,
    startDate: new Date('2025-01-15'),
    endDate: new Date('2025-02-05'),
    priorityOrder: 2
  },

  // Dev 06 (equipo 5)
  {
    id: 108,
    subject: 'Prototipo IoT',
    description: 'Desarrollo de prototipo para integración con dispositivos IoT.',
    status: TaskStatus.DOING,
    priority: 2,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/prototipo-iot.pdf',
    department: 1, // Innovación (usamos IT)
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 8,
    loadFactor: 0.8,
    team: 5,
    startDate: new Date('2025-01-08'),
    endDate: new Date('2025-03-10'),
    priorityOrder: 1
  },

  // Dev 07 (equipo 6)
  {
    id: 109,
    subject: 'Plataforma E-learning',
    description: 'Plataforma de capacitación online para empleados.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 8, // Roberto Moreno
    functional: 'https://docs.company.com/plataforma-elearning.pdf',
    department: 4, // RRHH
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 15,
    loadFactor: 1.0,
    team: 6,
    startDate: new Date('2024-11-15'),
    endDate: new Date('2025-02-28'),
    priorityOrder: 1
  },
  {
    id: 110,
    subject: 'Optimización Web',
    description: 'Optimización de rendimiento del sitio web corporativo.',
    status: TaskStatus.TODO,
    priority: 2,
    assignedTo: 4, // Carlos Martínez
    functional: 'https://docs.company.com/optimizacion-web.pdf',
    department: 2, // Marketing
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-13'),
    sprints: 3,
    loadFactor: 0.6,
    team: 6,
    startDate: new Date('2025-01-22'),
    endDate: new Date('2025-02-12'),
    priorityOrder: 2
  },

  // Dev 08 (equipo 7)
  {
    id: 111,
    subject: 'Sistema Facturación',
    description: 'Nuevo sistema de facturación electrónica integrado.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 9, // Patricia Jiménez
    functional: 'https://docs.company.com/sistema-facturacion.pdf',
    department: 5, // Finanzas
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 10,
    loadFactor: 1.3,
    team: 7,
    startDate: new Date('2024-12-10'),
    endDate: new Date('2025-02-25'),
    priorityOrder: 1
  },

  // Dev 09 (equipo 8)
  {
    id: 112,
    subject: 'Marketplace B2B',
    description: 'Plataforma de marketplace para transacciones B2B.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 7, // Sara González
    functional: 'https://docs.company.com/marketplace-b2b.pdf',
    department: 3, // Comercial
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 12,
    loadFactor: 1.2,
    team: 8,
    startDate: new Date('2024-11-20'),
    endDate: new Date('2025-01-30'),
    priorityOrder: 1
  },
  {
    id: 113,
    subject: 'API Analytics',
    description: 'API para análisis de datos y métricas de marketing.',
    status: TaskStatus.DOING,
    priority: 2,
    assignedTo: 5, // Laura Rodríguez
    functional: 'https://docs.company.com/api-analytics.pdf',
    department: 2, // Marketing
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 10,
    loadFactor: 0.7,
    team: 8,
    startDate: new Date('2025-01-05'),
    endDate: new Date('2025-03-20'),
    priorityOrder: 2
  },

  // Dev 10 (equipo 9)
  {
    id: 114,
    subject: 'Portal Proveedores',
    description: 'Portal web para gestión de proveedores y licitaciones.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 10, // Fernando Ruiz
    functional: 'https://docs.company.com/portal-proveedores.pdf',
    department: 6, // Operaciones
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2025-01-13'),
    sprints: 8,
    loadFactor: 1.1,
    team: 9,
    startDate: new Date('2025-01-03'),
    endDate: new Date('2025-03-01'),
    priorityOrder: 1
  },

  // Dev 11 (equipo 10)
  {
    id: 115,
    subject: 'Sistema Reservas',
    description: 'Sistema de reservas para salas y recursos corporativos.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 10, // Fernando Ruiz
    functional: 'https://docs.company.com/sistema-reservas.pdf',
    department: 6, // Operaciones
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 10,
    loadFactor: 0.9,
    team: 10,
    startDate: new Date('2024-12-05'),
    endDate: new Date('2025-02-15'),
    priorityOrder: 1
  },
  {
    id: 116,
    subject: 'Chat Bot IA',
    description: 'Chatbot con inteligencia artificial para atención al cliente.',
    status: TaskStatus.TODO,
    priority: 2,
    assignedTo: 11, // Mónica Vázquez
    functional: 'https://docs.company.com/chatbot-ia.pdf',
    department: 7, // Atención Cliente
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2025-01-13'),
    sprints: 6,
    loadFactor: 0.5,
    team: 10,
    startDate: new Date('2025-01-12'),
    endDate: new Date('2025-02-28'),
    priorityOrder: 2
  },

  // === EQUIPOS EXTERNOS (11-20) ===

  // Equipo Externo 1 (equipo 11)
  {
    id: 117,
    subject: 'Desarrollo Frontend',
    description: 'Desarrollo de interfaces de usuario modernas con React.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/desarrollo-frontend.pdf',
    department: 1, // IT
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2025-01-13'),
    sprints: 8,
    loadFactor: 1.2,
    team: 11,
    startDate: new Date('2024-12-01'),
    endDate: new Date('2025-02-10'),
    priorityOrder: 1
  },
  {
    id: 118,
    subject: 'Testing Automatizado',
    description: 'Implementación de suite de testing automatizado completa.',
    status: TaskStatus.TODO,
    priority: 2,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/testing-automatizado.pdf',
    department: 1, // Calidad (usamos IT)
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 6,
    loadFactor: 0.5,
    team: 11,
    startDate: new Date('2025-01-18'),
    endDate: new Date('2025-03-05'),
    priorityOrder: 2
  },

  // Equipo Externo 2 (equipo 12)
  {
    id: 119,
    subject: 'Migración Cloud',
    description: 'Migración completa de infraestructura a servicios cloud.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/migracion-cloud.pdf',
    department: 1, // IT
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 16,
    loadFactor: 1.2,
    team: 12,
    startDate: new Date('2024-11-25'),
    endDate: new Date('2025-03-15'),
    priorityOrder: 1
  },

  // Equipo Externo 3 (equipo 13)
  {
    id: 120,
    subject: 'ERP Customización',
    description: 'Customización del sistema ERP para procesos específicos.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 9, // Patricia Jiménez
    functional: 'https://docs.company.com/erp-customizacion.pdf',
    department: 5, // Finanzas
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 18,
    loadFactor: 1.5,
    team: 13,
    startDate: new Date('2024-10-15'),
    endDate: new Date('2025-01-30'),
    priorityOrder: 1
  },
  {
    id: 121,
    subject: 'Seguridad Audit',
    description: 'Auditoría completa de seguridad y implementación de mejoras.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/seguridad-audit.pdf',
    department: 1, // IT
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 6,
    loadFactor: 0.5,
    team: 13,
    startDate: new Date('2025-01-08'),
    endDate: new Date('2025-02-20'),
    priorityOrder: 2
  },

  // Resto de equipos externos con proyectos variados
  {
    id: 122,
    subject: 'UX/UI Redesign',
    description: 'Rediseño completo de experiencia de usuario.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 4, // Carlos Martínez
    functional: 'https://docs.company.com/ux-ui-redesign.pdf',
    department: 2, // Marketing
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 12,
    loadFactor: 0.9,
    team: 14,
    startDate: new Date('2025-01-10'),
    endDate: new Date('2025-04-15'),
    priorityOrder: 1
  },

  {
    id: 123,
    subject: 'Data Warehouse',
    description: 'Implementación de almacén de datos corporativo.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/data-warehouse.pdf',
    department: 1, // BI (usamos IT)
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 14,
    loadFactor: 1.5,
    team: 15,
    startDate: new Date('2024-12-15'),
    endDate: new Date('2025-03-30'),
    priorityOrder: 1
  },

  {
    id: 124,
    subject: 'API Gateway',
    description: 'Implementación de gateway para gestión centralizada de APIs.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/api-gateway.pdf',
    department: 1, // IT
    createdAt: new Date('2024-10-15'),
    updatedAt: new Date('2025-01-13'),
    sprints: 8,
    loadFactor: 1.0,
    team: 16,
    startDate: new Date('2024-11-30'),
    endDate: new Date('2025-01-25'),
    priorityOrder: 1
  },
  {
    id: 125,
    subject: 'Microservicios',
    description: 'Migración a arquitectura de microservicios.',
    status: TaskStatus.TODO,
    priority: 2,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/microservicios.pdf',
    department: 1, // IT
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 10,
    loadFactor: 0.8,
    team: 16,
    startDate: new Date('2025-01-20'),
    endDate: new Date('2025-04-10'),
    priorityOrder: 2
  },

  {
    id: 126,
    subject: 'Blockchain POC',
    description: 'Prueba de concepto con tecnología blockchain.',
    status: TaskStatus.DOING,
    priority: 2,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/blockchain-poc.pdf',
    department: 1, // Innovación (usamos IT)
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2025-01-13'),
    sprints: 10,
    loadFactor: 1.3,
    team: 17,
    startDate: new Date('2025-01-05'),
    endDate: new Date('2025-03-20'),
    priorityOrder: 1
  },

  {
    id: 127,
    subject: 'DevOps Pipeline',
    description: 'Implementación de pipeline de integración y despliegue continuo.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/devops-pipeline.pdf',
    department: 1, // IT
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 8,
    loadFactor: 1.0,
    team: 18,
    startDate: new Date('2024-12-20'),
    endDate: new Date('2025-02-28'),
    priorityOrder: 1
  },
  {
    id: 128,
    subject: 'Monitoring Setup',
    description: 'Configuración de sistema de monitoreo y alertas.',
    status: TaskStatus.TODO,
    priority: 2,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/monitoring-setup.pdf',
    department: 1, // IT
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-13'),
    sprints: 3,
    loadFactor: 0.6,
    team: 18,
    startDate: new Date('2025-01-25'),
    endDate: new Date('2025-02-15'),
    priorityOrder: 2
  },

  {
    id: 129,
    subject: 'Machine Learning',
    description: 'Implementación de modelos de machine learning para análisis predictivo.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/machine-learning.pdf',
    department: 1, // BI (usamos IT)
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 20,
    loadFactor: 1.1,
    team: 19,
    startDate: new Date('2025-01-02'),
    endDate: new Date('2025-05-30'),
    priorityOrder: 1
  },

  {
    id: 130,
    subject: 'Legacy Modernization',
    description: 'Modernización de sistemas legacy críticos.',
    status: TaskStatus.DOING,
    priority: 1,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/legacy-modernization.pdf',
    department: 1, // IT
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2025-01-13'),
    sprints: 20,
    loadFactor: 1.4,
    team: 20,
    startDate: new Date('2024-10-01'),
    endDate: new Date('2025-01-28'),
    priorityOrder: 1
  },
  {
    id: 131,
    subject: 'Performance Tuning',
    description: 'Optimización de rendimiento de aplicaciones críticas.',
    status: TaskStatus.TODO,
    priority: 2,
    assignedTo: 1, // Juan Pérez
    functional: 'https://docs.company.com/performance-tuning.pdf',
    department: 1, // IT
    createdAt: new Date('2025-01-05'),
    updatedAt: new Date('2025-01-13'),
    sprints: 5,
    loadFactor: 0.5,
    team: 20,
    startDate: new Date('2025-02-01'),
    endDate: new Date('2025-03-15'),
    priorityOrder: 2
  }
];

export const getTaskStage = (task: Task): TaskStatus => {
  if (task.status === TaskStatus.DONE) {
    return TaskStatus.DONE;
  }
  
  if (task.status === TaskStatus.DOING || task.status === TaskStatus.DEMO) {
    return task.status;
  }
  
  if (task.team && task.startDate && task.endDate && task.sprints) {
    return TaskStatus.TODO;
  }
  
  if (task.sprints && task.functional) {
    return TaskStatus.TODO;
  }
  
  return TaskStatus.BACKLOG;
};

export const getTasksWithStage = (): Task[] => {
  return mockTasks.map(task => ({
    ...task,
    status: task.status || getTaskStage(task),
    assignedToName: task.assignedTo ? getUserName(task.assignedTo) : undefined,
    // En datos mock asignamos nombres directamente - en producción vendrán del backend
    departmentName: task.department === 1 ? 'Tecnología' :
                   task.department === 2 ? 'Marketing' :
                   task.department === 3 ? 'Ventas' :
                   task.department === 4 ? 'Recursos Humanos' :
                   task.department === 5 ? 'Finanzas' :
                   task.department === 6 ? 'Operaciones' :
                   task.department === 7 ? 'Atención al Cliente' :
                   task.department === 8 ? 'Producto' :
                   'Sin departamento'
  }));
}; 