# Product Backlog  
Sistema de búsqueda de especialidades médicas y profesionales de la salud

---

## Historias de Usuario

### Visitante (no autenticado)

#### 1. Buscar especialistas por especialidad y ubicación
**Descripción:**  
Como visitante, quiero buscar especialistas por especialidad y ubicación (ciudad y estado), para encontrar médicos adecuados a mis necesidades sin necesidad de registrarme.

**Criterios de aceptación:**  
- [ ] El visitante puede acceder a la búsqueda sin registrarse.
- [ ] El visitante puede filtrar especialistas por especialidad.
- [ ] El visitante puede filtrar especialistas por ciudad y estado.
- [ ] Los resultados muestran información básica del especialista y su ubicación general.
- [ ] La búsqueda responde en menos de 2 segundos.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 2. Ver perfil de especialista          | Secuencial          | El usuario busca y luego puede ver el perfil desde los resultados. |
| 12. Gestionar catálogo de especialidades y filtros | Bloqueante | La búsqueda requiere que el catálogo de especialidades y filtros esté disponible y actualizado. |
| 13. Gestionar direcciones, ciudades y estados | Bloqueante | La búsqueda por ubicación depende de que las ciudades y estados estén correctamente gestionados. |

---

#### 2. Ver perfil de especialista
**Descripción:**  
Como visitante, quiero ver el perfil de un especialista, para conocer su información profesional y ubicación general antes de decidirme a agendar una cita.

**Criterios de aceptación:**  
- [ ] El visitante puede acceder al perfil de cualquier especialista desde los resultados de búsqueda.
- [ ] El perfil muestra información profesional, especialidad y ubicación general (ciudad y estado).
- [ ] Los datos personales sensibles no son visibles para visitantes.
- [ ] El visitante no puede agendar citas ni valorar especialistas sin registrarse.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 1. Buscar especialistas por especialidad y ubicación | Secuencial | El usuario debe realizar una búsqueda antes de acceder al perfil desde los resultados. |
| 10. Gestionar dirección profesional en perfil | Bloqueante | El perfil del especialista requiere que la dirección profesional esté gestionada y actualizada. |
| 11. Gestionar usuarios | Bloqueante | El perfil depende de la gestión y existencia de usuarios especialistas en el sistema. |

---

### Paciente (usuario registrado)

#### 3. Registrar y proteger dirección
**Descripción:**  
Como paciente, quiero registrar mi dirección y que esté protegida, para que solo usuarios autorizados puedan verla.

**Criterios de aceptación:**  
- [ ] El paciente puede registrar su dirección completa.
- [ ] La dirección solo es visible para usuarios autorizados según permisos.
- [ ] El sistema cumple con la normativa de protección de datos personales.
- [ ] El paciente puede editar o eliminar su dirección.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 11. Gestionar usuarios                 | Bloqueante          | La dirección debe estar asociada a un usuario registrado y gestionado por el sistema. |
| 13. Gestionar direcciones, ciudades y estados | Bloqueante | La gestión de direcciones, ciudades y estados debe estar disponible para registrar y proteger la información correctamente. |

---

#### 4. Buscar especialistas y ver perfiles
**Descripción:**  
Como paciente, quiero buscar especialistas y ver sus perfiles, para comparar opciones y tomar decisiones informadas.

**Criterios de aceptación:**  
- [ ] El paciente puede buscar especialistas por especialidad y ubicación.
- [ ] El paciente puede ver perfiles completos de especialistas.
- [ ] El paciente puede comparar información entre especialistas.
- [ ] El paciente puede iniciar el proceso de agendamiento desde el perfil.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 1. Buscar especialistas por especialidad y ubicación | Secuencial | El paciente debe poder realizar búsquedas antes de ver los perfiles. |
| 2. Ver perfil de especialista          | Secuencial          | El paciente accede a los perfiles desde los resultados de búsqueda. |
| 12. Gestionar catálogo de especialidades y filtros | Bloqueante | La búsqueda depende de que el catálogo de especialidades y filtros esté actualizado. |
| 13. Gestionar direcciones, ciudades y estados | Bloqueante | La búsqueda por ubicación depende de la gestión correcta de ciudades y estados. |

---

#### 5. Agendar cita con especialista
**Descripción:**  
Como paciente, quiero agendar una cita con un especialista, para reservar una consulta de manera sencilla.

**Criterios de aceptación:**  
- [ ] El paciente puede seleccionar fecha y hora disponibles.
- [ ] El paciente recibe confirmación de la cita agendada.
- [ ] El sistema valida que no haya conflictos de horario.
- [ ] El paciente puede cancelar o reprogramar la cita.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 4. Buscar especialistas y ver perfiles | Secuencial          | El paciente debe ver el perfil del especialista antes de agendar una cita. |
| 8. Gestionar agenda y disponibilidad   | Bloqueante          | La agenda y disponibilidad del especialista deben estar gestionadas para mostrar fechas y horas disponibles. |
| 11. Gestionar usuarios                 | Bloqueante          | La cita debe estar asociada a un usuario paciente y un usuario especialista. |

---

#### 6. Valorar especialista después de consulta
**Descripción:**  
Como paciente, quiero valorar a un especialista después de una consulta, para compartir mi experiencia y ayudar a otros usuarios.

**Criterios de aceptación:**  
- [ ] El paciente puede dejar una valoración y comentario solo después de la consulta.
- [ ] La valoración se asocia al perfil del especialista.
- [ ] El paciente puede editar o eliminar su valoración.
- [ ] Las valoraciones cumplen con las políticas de contenido del sistema.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 5. Agendar cita con especialista       | Secuencial          | Solo se puede valorar después de haber tenido una cita con el especialista. |
| 2. Ver perfil de especialista          | Secuencial          | La valoración se muestra en el perfil del especialista. |
| 11. Gestionar usuarios                 | Bloqueante          | La valoración debe estar asociada a usuarios registrados. |

---

#### 7. Recibir notificaciones y recordatorios de citas
**Descripción:**  
Como paciente, quiero recibir notificaciones y recordatorios sobre mis citas, para no olvidar mis compromisos médicos.

**Criterios de aceptación:**  
- [ ] El paciente recibe notificaciones automáticas por correo electrónico y/o en la plataforma.
- [ ] El paciente recibe recordatorios antes de la cita.
- [ ] El paciente puede configurar preferencias de notificación.
- [ ] Las notificaciones cumplen con la normativa de protección de datos.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 5. Agendar cita con especialista       | Secuencial          | Las notificaciones y recordatorios dependen de la existencia de citas agendadas. |
| 11. Gestionar usuarios                 | Bloqueante          | Las notificaciones deben estar asociadas a usuarios registrados. |

---

### Médico Especialista

#### 8. Gestionar agenda y disponibilidad
**Descripción:**  
Como médico especialista, quiero gestionar mi agenda y disponibilidad, para organizar mis consultas y confirmar o rechazar citas.

**Criterios de aceptación:**  
- [ ] El médico puede definir y modificar su disponibilidad.
- [ ] El médico puede confirmar o rechazar citas agendadas.
- [ ] El sistema notifica al paciente sobre cambios en la cita.
- [ ] El médico puede bloquear fechas por motivos personales.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 11. Gestionar usuarios                 | Bloqueante          | La agenda debe estar asociada a un usuario especialista gestionado en el sistema. |
| 5. Agendar cita con especialista       | Secuencial          | La gestión de agenda y disponibilidad afecta la posibilidad de agendar citas. |

---

#### 9. Ver listado de próximas citas
**Descripción:**  
Como médico especialista, quiero ver el listado de mis próximas citas, para planificar mi día de trabajo.

**Criterios de aceptación:**  
- [ ] El médico puede ver un listado actualizado de sus próximas citas.
- [ ] El listado muestra información relevante del paciente y la cita.
- [ ] El médico puede filtrar citas por fecha y estado.
- [ ] El acceso a datos personales cumple con la normativa de protección de datos.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 8. Gestionar agenda y disponibilidad   | Secuencial          | El listado depende de la gestión de la agenda y disponibilidad del médico. |
| 5. Agendar cita con especialista       | Secuencial          | Las citas deben estar agendadas para que aparezcan en el listado. |
| 11. Gestionar usuarios                 | Bloqueante          | El acceso a la información de citas requiere usuarios registrados y gestionados. |

---

#### 10. Gestionar dirección profesional en perfil
**Descripción:**  
Como médico especialista, quiero gestionar mi dirección profesional en mi perfil, para que los pacientes puedan encontrarme y contactarme según mi ubicación.

**Criterios de aceptación:**  
- [ ] El médico puede registrar y editar su dirección profesional.
- [ ] La dirección es visible para pacientes y visitantes según permisos.
- [ ] El sistema valida la dirección ingresada.
- [ ] El médico puede ocultar su dirección si lo desea.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 11. Gestionar usuarios                 | Bloqueante          | La dirección profesional debe estar asociada a un usuario especialista gestionado. |
| 13. Gestionar direcciones, ciudades y estados | Bloqueante | La gestión de direcciones, ciudades y estados debe estar disponible para registrar y mostrar la información correctamente. |
| 2. Ver perfil de especialista          | Secuencial          | La dirección profesional se muestra en el perfil del especialista.|

---

### Administrador del sistema

#### 11. Gestionar usuarios
**Descripción:**  
Como administrador, quiero gestionar usuarios (crear, editar o eliminar cuentas), para mantener el sistema actualizado y seguro.

**Criterios de aceptación:**  
- [ ] El administrador puede crear, editar y eliminar cuentas de usuarios.
- [ ] El sistema valida los datos ingresados.
- [ ] El administrador puede activar o desactivar cuentas.
- [ ] El sistema registra auditoría de cambios realizados.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 3. Registrar y proteger dirección      | Secuencial          | La gestión de usuarios permite asociar direcciones a los usuarios registrados. |
| 5. Agendar cita con especialista       | Secuencial          | Las citas requieren usuarios gestionados para asociar pacientes y especialistas. |
| 10. Gestionar dirección profesional en perfil | Secuencial    | La dirección profesional está vinculada a usuarios especialistas gestionados. |

---

#### 12. Gestionar catálogo de especialidades y filtros
**Descripción:**  
Como administrador, quiero gestionar el catálogo de especialidades y filtros, para asegurar que la información esté vigente.

**Criterios de aceptación:**  
- [ ] El administrador puede agregar, editar y eliminar especialidades.
- [ ] El administrador puede gestionar filtros de búsqueda.
- [ ] Los cambios se reflejan en tiempo real en el sistema.
- [ ] El sistema valida que no existan duplicados.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 1. Buscar especialistas por especialidad y ubicación | Bloqueante | La búsqueda depende de que el catálogo de especialidades y filtros esté actualizado. |
| 4. Buscar especialistas y ver perfiles | Bloqueante         | Los pacientes requieren un catálogo actualizado para buscar y comparar especialistas. |

---

#### 13. Gestionar direcciones, ciudades y estados
**Descripción:**  
Como administrador, quiero poder gestionar las direcciones, ciudades y estados de los usuarios, para mantener la información actualizada y precisa en el sistema.

**Criterios de aceptación:**  
- [ ] El administrador puede agregar, editar y eliminar direcciones, ciudades y estados.
- [ ] El sistema valida la información ingresada.
- [ ] Los cambios se reflejan en los perfiles de usuarios y especialistas.
- [ ] El sistema registra auditoría de cambios realizados.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 1. Buscar especialistas por especialidad y ubicación | Bloqueante | La búsqueda por ubicación depende de la gestión correcta de ciudades y estados. |
| 3. Registrar y proteger dirección      | Bloqueante          | La gestión de direcciones es necesaria para registrar y proteger la información del paciente. |
| 10. Gestionar dirección profesional en perfil | Bloqueante    | La dirección profesional del especialista depende de la gestión de direcciones y ciudades. |

---

#### 14. Monitorear actividad del sistema
**Descripción:**  
Como administrador, quiero monitorear la actividad del sistema, para supervisar el funcionamiento general y detectar incidencias.

**Criterios de aceptación:**  
- [ ] El administrador puede acceder a reportes de actividad.
- [ ] El sistema muestra métricas clave (búsquedas, citas agendadas, valoraciones).
- [ ] El administrador puede filtrar reportes por fecha y usuario.
- [ ] El sistema alerta sobre incidencias relevantes.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 5. Agendar cita con especialista       | Secuencial          | El monitoreo incluye métricas sobre citas agendadas. |
| 6. Valorar especialista después de consulta | Secuencial     | El monitoreo incluye métricas sobre valoraciones realizadas por pacientes. |
| 1. Buscar especialistas por especialidad y ubicación | Secuencial | El monitoreo incluye métricas sobre búsquedas realizadas por usuarios. |

---

### Tareas técnicas y opcionales

#### 15. Implementar pruebas unitarias
**Descripción:**  
Como desarrollador, quiero implementar pruebas unitarias para los módulos principales, para asegurar la calidad del código.

**Criterios de aceptación:**  
- [ ] Se implementan pruebas unitarias para los módulos principales.
- [ ] Las pruebas cubren al menos el 80% del código crítico.
- [ ] Las pruebas se ejecutan automáticamente en cada despliegue.
- [ ] Los resultados de las pruebas son accesibles para el desarrollador.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 5. Agendar cita con especialista       | Secuencial          | Las pruebas unitarias deben validar la lógica de agendamiento de citas. |
| 8. Gestionar agenda y disponibilidad   | Secuencial          | Es necesario probar la gestión de agenda y disponibilidad de los especialistas. |
| 11. Gestionar usuarios                 | Secuencial          | Las pruebas deben cubrir la gestión de usuarios para asegurar la integridad del sistema. |

---

#### 16. Maquetar vistas principales del sistema
**Descripción:**  
Como desarrollador, quiero maquetar las vistas principales del sistema, para definir la estructura visual y de navegación.

**Criterios de aceptación:**  
- [ ] Se crean prototipos visuales de las vistas principales.
- [ ] El maquetado respeta la estructura definida en el PRD.
- [ ] Las vistas son responsivas y accesibles.
- [ ] El maquetado facilita la integración con el backend.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 1. Buscar especialistas por especialidad y ubicación | Secuencial | La vista de búsqueda debe estar maquetada para que los usuarios puedan interactuar con ella. |
| 2. Ver perfil de especialista          | Secuencial          | El perfil del especialista requiere una vista maquetada para mostrar la información. |
| 4. Buscar especialistas y ver perfiles | Secuencial          | Los pacientes necesitan vistas para comparar y seleccionar especialistas. |

---

#### 17. Implementar internacionalización en frontend
**Descripción:**  
Como desarrollador, quiero implementar la internacionalización en el frontend, para soportar múltiples idiomas.

**Criterios de aceptación:**  
- [ ] El sistema soporta al menos dos idiomas.
- [ ] Los textos son gestionados mediante archivos de traducción.
- [ ] El usuario puede cambiar el idioma desde la interfaz.
- [ ] La internacionalización no afecta la funcionalidad principal.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 16. Maquetar vistas principales del sistema | Secuencial      | Las vistas deben estar preparadas para mostrar textos en diferentes idiomas. |
| 1. Buscar especialistas por especialidad y ubicación | Secuencial | La búsqueda debe estar disponible en todos los idiomas soportados. |
| 2. Ver perfil de especialista          | Secuencial          | El perfil debe mostrar información en el idioma seleccionado por el usuario. |

---

#### 18. Documentar la API
**Descripción:**  
Como desarrollador, quiero documentar la API, para facilitar la integración con el frontend.

**Criterios de aceptación:**  
- [ ] Se documentan todos los endpoints de la API.
- [ ] La documentación incluye ejemplos de uso y respuestas esperadas.
- [ ] La documentación está disponible para el frontend.
- [ ] La documentación se actualiza con cada cambio relevante en la API.

**Dependencias:**  
| ID y Título de la historia relacionada | Tipo de dependencia | Explicación de la dependencia |
|----------------------------------------|---------------------|------------------------------|
| 1. Buscar especialistas por especialidad y ubicación | Secuencial | La API debe exponer los endpoints necesarios para la búsqueda de especialistas. |
| 5. Agendar cita con especialista       | Secuencial          | La API debe documentar los endpoints para agendar y gestionar citas. |
| 11. Gestionar usuarios                 | Secuencial          | La documentación debe incluir los endpoints para la gestión de usuarios. |


---

## Historias de Usuario para el MVP

| Tipo de usuario         | Historia de usuario                                      | Estado           |
|------------------------|----------------------------------------------------------|:----------------:|
| Visitante              | Buscar especialistas por especialidad y ubicación        | Incluida en MVP  |
| Visitante              | Ver perfil de especialista                               | Incluida en MVP  |
| Paciente               | Buscar especialistas y ver perfiles                      | Incluida en MVP  |
| Paciente               | Agendar cita con especialista                            | Incluida en MVP  |
| Médico Especialista    | Gestionar agenda y disponibilidad                        | Incluida en MVP  |
| Médico Especialista    | Ver listado de próximas citas                            | Incluida en MVP  |
| Paciente               | Registrar y proteger dirección                           | Excluida/Pendiente |
| Paciente               | Recibir notificaciones y recordatorios de citas          | Excluida/Pendiente |
| Médico Especialista    | Gestionar dirección profesional en perfil                | Excluida/Pendiente |
| Administrador          | Gestionar usuarios                                       | Excluida/Pendiente |
| Administrador          | Gestionar catálogo de especialidades y filtros           | Excluida/Pendiente |
| Administrador          | Gestionar direcciones, ciudades y estados                | Excluida/Pendiente |
| Paciente               | Valorar especialista después de consulta                 | Excluida/Pendiente |
| Administrador          | Monitorear actividad del sistema                         | Excluida/Pendiente |
| Desarrollador          | Implementar pruebas unitarias                            | Excluida/Pendiente |
| Desarrollador          | Maquetar vistas principales del sistema                  | Excluida/Pendiente |
| Desarrollador          | Implementar internacionalización en frontend             | Excluida/Pendiente |
| Desarrollador          | Documentar la API                                        | Excluida/Pendiente |

---

## Estimación de esfuerzo y recursos

**Recursos disponibles:**  
- 1 ingeniero en desarrollo de software  
- Herramienta de apoyo: GitHub Copilot  
- Trabajo individual, sin equipo adicional  
- Experiencia en desarrollo backend y frontend

---

| ID y Título de la historia de usuario                           | Estimación de esfuerzo (horas) | Estado             |
|-----------------------------------------------------------------|-------------------------------|--------------------|
| 1. Buscar especialistas por especialidad y ubicación             | 8                             | Incluida en MVP    |
| 2. Ver perfil de especialista                                   | 6                             | Incluida en MVP    |
| 4. Buscar especialistas y ver perfiles                          | 8                             | Incluida en MVP    |
| 5. Agendar cita con especialista                                | 10                            | Incluida en MVP    |
| 8. Gestionar agenda y disponibilidad                            | 10                            | Incluida en MVP    |
| 9. Ver listado de próximas citas                                | 6                             | Incluida en MVP    |
| 3. Registrar y proteger dirección                               | 6                             | Excluida/Pendiente |
| 7. Recibir notificaciones y recordatorios de citas              | 8                             | Excluida/Pendiente |
| 10. Gestionar dirección profesional en perfil                   | 6                             | Excluida/Pendiente |
| 11. Gestionar usuarios                                          | 8                             | Excluida/Pendiente |
| 12. Gestionar catálogo de especialidades y filtros              | 8                             | Excluida/Pendiente |
| 13. Gestionar direcciones, ciudades y estados                   | 8                             | Excluida/Pendiente |
| 6. Valorar especialista después de consulta                     | 6                             | Excluida/Pendiente |
| 14. Monitorear actividad del sistema                            | 8                             | Excluida/Pendiente |
| 15. Implementar pruebas unitarias                               | 10                            | Excluida/Pendiente |
| 16. Maquetar vistas principales del sistema                     | 8                             | Excluida/Pendiente |
| 17. Implementar internacionalización en frontend                | 8                             | Excluida/Pendiente |
| 18. Documentar la API                                           | 6                             | Excluida/Pendiente |

**Total estimado de horas: 48hrs (MVP) / 140hrs (Total)**

## Evaluación de costo-beneficio

| ID y Título de la historia de usuario                | Valor para el usuario | Esfuerzo (horas) | Prioridad | Simplificación posible |
|------------------------------------------------------|----------------------|------------------|----------|-----------------------|
| 1. Buscar especialistas por especialidad y ubicación | Alto                 | 8                | 1        | No                    |
| 2. Ver perfil de especialista                        | Alto                 | 6                | 2        | No                    |
| 4. Buscar especialistas y ver perfiles               | Alto                 | 8                | 3        | No                    |
| 5. Agendar cita con especialista                    | Muy alto             | 10               | 4        | No                    |
| 8. Gestionar agenda y disponibilidad                | Muy alto             | 10               | 5        | No                    |
| 9. Ver listado de próximas citas                    | Medio                | 6                | 6        | Sí, mostrar solo citas próximas sin filtros avanzados |

**Notas:**
- Todas las historias seleccionadas son esenciales para la interacción entre paciente y médico.
- La funcionalidad de ver próximas citas puede simplificarse mostrando solo las citas más cercanas, sin filtros avanzados.

## Matriz MoSCoW de Historias de Usuario

| ID y Título de la historia de usuario                | MoSCoW        | Incluida en MVP |
|------------------------------------------------------|---------------|-----------------|
| 1. Buscar especialistas por especialidad y ubicación | Must have     | Sí              |
| 2. Ver perfil de especialista                        | Must have     | Sí              |
| 4. Buscar especialistas y ver perfiles               | Must have     | Sí              |
| 5. Agendar cita con especialista                    | Must have     | Sí              |
| 8. Gestionar agenda y disponibilidad                | Must have     | Sí              |
| 9. Ver listado de próximas citas                    | Should have   | Sí              |
| 3. Registrar y proteger dirección                   | Could have    | No              |
| 7. Recibir notificaciones y recordatorios de citas  | Could have    | No              |
| 10. Gestionar dirección profesional en perfil       | Could have    | No              |
| 11. Gestionar usuarios                              | Could have    | No              |
| 12. Gestionar catálogo de especialidades y filtros  | Could have    | No              |
| 13. Gestionar direcciones, ciudades y estados       | Could have    | No              |
| 6. Valorar especialista después de consulta         | Could have    | No              |
| 14. Monitorear actividad del sistema                | Won't have    | No              |
| 15. Implementar pruebas unitarias                   | Won't have    | No              |
| 16. Maquetar vistas principales del sistema         | Won't have    | No              |
| 17. Implementar internacionalización en frontend    | Won't have    | No              |
| 18. Documentar la API                              | Won't have    | No              |

---

**Leyenda MoSCoW:**  
- Must have: Imprescindible para el funcionamiento básico del sistema.  
- Should have: Importante, pero puede implementarse con una versión simplificada.  
- Could have: Deseable, pero puede postergarse.  
- Won't have: No se incluirá en esta versión.

## Tareas técnicas y opcionales priorizadas ("Nice to have")

Las siguientes tareas técnicas y opcionales se ubican al final del backlog y solo se abordarán si el tiempo lo permite tras completar el MVP.

| ID y Título de la historia de usuario                | Prioridad "Nice to have" | Motivo de priorización |
|------------------------------------------------------|-------------------------|-----------------------|
| 3. Registrar y proteger dirección                   | Alta                    | Mejora la privacidad y experiencia del paciente. |
| 7. Recibir notificaciones y recordatorios de citas  | Alta                    | Aumenta el compromiso y reduce ausencias. |
| 10. Gestionar dirección profesional en perfil       | Media                   | Facilita la localización de especialistas. |
| 11. Gestionar usuarios                              | Media                   | Permite administración avanzada del sistema. |
| 12. Gestionar catálogo de especialidades y filtros  | Media                   | Mantiene la información actualizada y relevante. |
| 13. Gestionar direcciones, ciudades y estados       | Media                   | Mejora la precisión de búsquedas y perfiles. |
| 6. Valorar especialista después de consulta         | Baja                    | Añade valor social y reputacional. |
| 14. Monitorear actividad del sistema                | Baja                    | Útil para administración y mejora continua. |
| 15. Implementar pruebas unitarias                   | Baja                    | Mejora la calidad y mantenibilidad del código. |
| 16. Maquetar vistas principales del sistema         | Baja                    | Facilita el desarrollo frontend y experiencia de usuario. |
| 17. Implementar internacionalización en frontend    | Baja                    | Permite soporte multilenguaje. |
| 18. Documentar la API                              | Baja                    | Facilita integración y mantenimiento técnico. |

---

**Nota:**  
Estas tareas no son imprescindibles para la primera versión funcional del sistema, pero aportan valor adicional y pueden ser consideradas en futuras iteraciones según disponibilidad de

## Preparación para la generación de tickets

Para facilitar la creación de tickets en el sistema de gestión de tareas, se verifica que cada historia/tarea cumpla con los siguientes requisitos:

- Descripción clara y concisa.
- Criterios de aceptación definidos.
- Estimación de esfuerzo en horas.
- Tabla de dependencias actualizada.
- División en subtareas si la historia es extensa.

---

### Historias de usuario listas para ticketización

| ID y Título de la historia de usuario                | Descripción clara | Criterios de aceptación | Estimación de esfuerzo | Dependencias | Subtareas necesarias |
|------------------------------------------------------|-------------------|------------------------|-----------------------|--------------|---------------------|
| 1. Buscar especialistas por especialidad y ubicación | ✔                 | ✔                      | ✔                     | ✔            | No                  |
| 2. Ver perfil de especialista                        | ✔                 | ✔                      | ✔                     | ✔            | No                  |
| 4. Buscar especialistas y ver perfiles               | ✔                 | ✔                      | ✔                     | ✔            | No                  |
| 5. Agendar cita con especialista                    | ✔                 | ✔                      | ✔                     | ✔            | No                  |
| 8. Gestionar agenda y disponibilidad                | ✔                 | ✔                      | ✔                     | ✔            | No                  |
| 9. Ver listado de próximas citas                    | ✔                 | ✔                      | ✔                     | ✔            | No                  |

---

**Nota:**  
Todas las historias del MVP están listas para ser convertidas en tickets. Las historias excluidas/pendientes pueden requerir división en subtareas y revisión adicional antes de su ticketización.

