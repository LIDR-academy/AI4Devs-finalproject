# Avance de trabajo proyecto Buscadoc

```mermaid
gantt
    dateFormat  YYYY-MM-DD
    title       Buscadoc

    section 1. Crear carpeta backend e inicializar proyecto con npm
    ... :done, des1, 2025-08-19, 0.5h

    section 2. Montar la base de datos PostgreSQL según lo definido en el PRD
    ... :done, 2025-08-19, 1h

    section 3. Generar la migración de la base de datos para su ejecución (usando Prisma)
    ... :done, 2025-08-20, 2h

    section 4. Instalar las dependencias necesarias en backend (Node.js, Express.js, Prisma, Auth.js, etc.)
    ... :done, 2025-08-21, 1h

    section 5. Configurar el entorno de desarrollo para backend (variables de entorno, archivo .env)
    ... :done, 2025-08-21, 1h

    section 6. Tickets Buscar especialistas por especialidad y ubicación [US-1]
    Diseñar el endpoint de búsqueda de especialistas :done, des6.1, 2025-08-22, 1h
    Implementar la lógica de consulta para búsqueda de especialistas :done, des6.2, 2025-08-22, 2h
    Agregar validaciones de entrada para filtros :done, des6.3, 2025-08-23, 1h
    Configurar paginación y tiempos óptimos :done, des6.4, 2025-08-23, 1h
    Documentar el endpoint de búsqueda :done, des6.5, 2025-08-24, 1h
    Crear pruebas unitarias endpoint búsqueda :done, des6.6, 2025-08-24, 1h

    section 7. Ver perfil de especialista [US-2]
    Diseñar el endpoint para consultar el perfil de especialista :des7.1, 2025-08-25, 1h
    Implementar la lógica de consulta del perfil de especialista :des7.2, 2025-08-25, 2h
    Agregar validaciones para ocultar datos personales sensibles :des7.3, 2025-08-26, 1h
    Documentar el endpoint de perfil de especialista :des7.4, 2025-08-26, 1h
    Crear pruebas unitarias para el endpoint de perfil de especialista :des7.5, 2025-08-27, 1h

    section 8. Buscar especialistas y ver perfiles [US-4]
    Diseñar el endpoint de búsqueda de especialistas para pacientes :des8.1, 2025-08-27, 1h
    Implementar la lógica de consulta en el backend para búsqueda y comparación :des8.2, 2025-08-27, 2h
    Diseñar el endpoint para consultar el perfil completo de especialista :des8.3, 2025-08-28, 1h
    Implementar la lógica de consulta del perfil completo en el backend :des8.4, 2025-08-28, 2h
    Agregar validaciones y controles de acceso para mostrar información sensible :des8.5, 2025-08-29, 1h
    Documentar los endpoints de búsqueda y perfil de especialista para pacientes :des8.6, 2025-08-29, 1h
    Crear pruebas unitarias para los endpoints de búsqueda y perfil de especialista :des8.7, 2025-08-30, 1h

    section 9. Agendar cita con especialista [US-5]
    Diseñar el endpoint para agendar cita con especialista :des9.1, 2025-08-30, 1h
    Implementar la lógica de agendamiento de cita con especialista :des9.2, 2025-08-30, 2h
    Validar disponibilidad y conflictos de horario al agendar cita :des9.3, 2025-08-31, 1h
    Documentar el endpoint para agendar cita con especialista :des9.4, 2025-08-31, 1h
    Documentar el endpoint para agendar cita con especialista :des9.5, 2025-09-01, 1h
    Crear pruebas unitarias para el endpoint de agendar cita con especialista :des9.6, 2025-09-01, 1h

    section 10. Gestionar agenda y disponibilidad [US-8]
    Diseñar el endpoint para gestionar agenda y disponibilidad :des10.1, 2025-09-02, 1h
    Implementar la lógica para definir y modificar disponibilidad :des10.2, 2025-09-02, 2h
    Implementar la lógica para consultar citas agendadas y disponibilidad actual :des10.3, 2025-09-03, 2h
    Implementar la lógica para confirmar o rechazar citas agendadas :des10.4, 2025-09-04, 1h
    Documentar los endpoints para gestión de agenda y disponibilidad :des10.5, 2025-09-04, 1h
    Crear pruebas unitarias para los endpoints de gestión de agenda y disponibilidad :des10.6, 2025-09-05, 1h

    section 11. Ver listado de próximas citas [US-9]
    Diseñar el endpoint para ver listado de próximas citas :des11.1, 2025-09-05, 1h
    Implementar la lógica para consultar el listado de próximas citas :des11.2, 2025-09-05, 2h
    Documentar el endpoint para ver próximas citas :des11.3, 2025-09-06, 1h
    Crear pruebas unitarias para el endpoint de próximas citas :des11.4, 2025-09-06, 1h
    Ticket de despliegue inicial del sistema Buscadoc :des11.5, 2025-09-07, 2h

    section 12. Crear la carpeta frontend e inicializar el proyecto con npm
    Crear carpeta frontend e inicializar proyecto con npm :des12, 2025-09-07, 0.5h

    section 13. Instalar dependencias necesarias en frontend
    Instalar dependencias frontend :des13, 2025-09-08, 1h

    section 14. Configurar entorno de desarrollo frontend
    Configurar entorno de desarrollo frontend :des14, 2025-09-08, 1h

    section 15. Buscar especialistas por especialidad y ubicación [Frontend]
    Maquetar layout base de la aplicación :des15.1, 2025-09-09, 2h
    Maquetar vista de búsqueda de especialistas :des15.2, 2025-09-09, 2h
    Implementar lógica de consumo de API para búsqueda :des15.3, 2025-09-10, 2h
    Configurar internacionalización en español (búsqueda) :des15.4, 2025-09-10, 1h
    Documentar componente/vista de búsqueda :des15.5, 2025-09-11, 1h
    Crear pruebas end-to-end búsqueda especialistas :des15.6, 2025-09-11, 1h

    section 16. Ver perfil de especialista [Frontend]
    Maquetar vista de perfil de especialista :des16.1, 2025-09-12, 2h
    Implementar lógica de consumo de API perfil especialista :des16.2, 2025-09-12, 2h
    Configurar internacionalización en español (perfil) :des16.3, 2025-09-13, 1h
    Documentar componente/vista de perfil especialista :des16.4, 2025-09-13, 1h
    Crear pruebas end-to-end perfil especialista :des16.5, 2025-09-14, 1h

    section 17. Buscar especialistas y ver perfiles (pacientes autenticados) [Frontend]
    Maquetar vista de búsqueda avanzada pacientes :des17.1, 2025-09-14, 2h
    Implementar lógica de consumo de API búsqueda avanzada :des17.2, 2025-09-15, 2h
    Maquetar y consumir perfil completo especialista :des17.3, 2025-09-15, 2h
    Configurar internacionalización en español (búsqueda y perfil pacientes) :des17.4, 2025-09-16, 1h
    Documentar componentes búsqueda avanzada y perfil completo :des17.5, 2025-09-16, 1h
    Crear pruebas end-to-end búsqueda avanzada y perfil completo :des17.6, 2025-09-17, 1h

    section 18. Agendar cita con especialista [Frontend]
    Maquetar vista de agendamiento de cita :des18.1, 2025-09-17, 2h
    Implementar lógica de consumo de API y confirmación de cita :des18.2, 2025-09-18, 2h
    Configurar internacionalización en español (agendamiento) :des18.3, 2025-09-18, 1h
    Documentar componente/vista de agendamiento de cita :des18.4, 2025-09-19, 1h
    Crear pruebas end-to-end agendamiento de cita :des18.5, 2025-09-19, 1h

    section 19. Gestionar agenda y disponibilidad (médicos) [Frontend]
    Maquetar vista de gestión de agenda y disponibilidad :des19.1, 2025-09-20, 2h
    Implementar lógica de consumo de API agenda/disponibilidad :des19.2, 2025-09-20, 2h
    Configurar internacionalización en español (agenda/disponibilidad) :des19.3, 2025-09-21, 1h
    Documentar componente/vista de gestión de agenda :des19.4, 2025-09-21, 1h
    Crear pruebas end-to-end gestión de agenda y disponibilidad :des19.5, 2025-09-22, 1h

    section 20. Ver listado de próximas citas (médicos) [Frontend]
    Maquetar vista de próximas citas médicos :des20.1, 2025-09-22, 2h
    Implementar lógica de consumo de API próximas citas :des20.2, 2025-09-23, 2h
    Configurar internacionalización en español (próximas citas) :des20.3, 2025-09-23, 1h
    Documentar componente/vista de próximas citas :des20.4, 2025-09-24, 1h
    Crear pruebas end-to-end próximas citas :des20.5, 2025-09-24, 1h

    section 21. Pruebas unitarias básicas backend y frontend
    Crear pruebas unitarias módulos principales :des21, 2025-09-25, 4h

    section 22. Configurar y documentar proceso de despliegue inicial
    Configurar y documentar despliegue inicial :des22, 2025-09-26, 3h
```