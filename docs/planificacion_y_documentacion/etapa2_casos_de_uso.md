# Etapa 2: Casos de Uso

## Resumen

El sistema de búsqueda de especialidades médicas y profesionales de la salud está diseñado para facilitar la localización, comparación y contacto con especialistas, optimizando la experiencia tanto para pacientes como para médicos y administradores. Se identifican distintos tipos de usuarios: Visitante (no autenticado), Paciente (registrado), Médico Especialista y Administrador del sistema.

### Casos de uso principales

- **Buscar especialistas:** Permite a visitantes y pacientes localizar médicos por especialidad, ubicación y otros filtros.
- **Ver perfil de especialista:** Permite consultar información detallada de los médicos, accesible tanto para visitantes como para pacientes.
- **Agendar cita:** Los pacientes pueden reservar una consulta con el especialista seleccionado.
- **Valorar especialista:** Tras la consulta, los pacientes pueden dejar opiniones y valoraciones.
- **Recibir notificaciones y recordatorios:** El sistema envía avisos automáticos a pacientes y médicos sobre citas y eventos importantes.
- **Gestionar agenda:** Los médicos pueden administrar su disponibilidad y confirmar o rechazar citas.
- **Ver citas agendadas:** Los médicos pueden consultar el listado de sus próximas consultas.
- **Gestionar usuarios:** El administrador puede crear, editar o eliminar cuentas de médicos y pacientes.
- **Gestionar especialidades y filtros:** El administrador mantiene actualizado el catálogo de especialidades, ubicaciones y otros filtros.
- **Monitorear actividad del sistema:** El administrador supervisa el funcionamiento general y la actividad relevante del sistema.

### Consideraciones de acceso

- Los visitantes pueden buscar especialistas y ver perfiles sin necesidad de registro.
- El resto de funcionalidades requieren autenticación y permisos según el rol del usuario, incluyendo los datos de contacto del paciente y Médico Especialista.

---

## Diagrama de Casos de Uso

```mermaid
flowchart TD
    Visitante((Visitante))
    Paciente((Paciente))
    Medico((Médico Especialista))
    Admin((Administrador))
    
    UC1[Buscar especialistas]
    UC2[Ver perfil de especialista]
    UC3[Agendar cita]
    UC4[Valorar especialista]
    UC5[Recibir notificaciones y recordatorios]
    UC6[Gestionar agenda]
    UC7[Ver citas agendadas]
    UC8[Gestionar usuarios]
    UC9[Gestionar especialidades y filtros]
    UC10[Monitorear actividad del sistema]
    
    Visitante --> UC1
    Visitante --> UC2

    Paciente --> UC1
    Paciente --> UC2
    Paciente --> UC3
    Paciente --> UC4
    Paciente --> UC5
    
    Medico --> UC6
    Medico --> UC7
    Medico --> UC5
    
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    
    UC1 -.-> |<<include>>| UC2
    UC2 -.-> |<<include>>| UC3
```

---