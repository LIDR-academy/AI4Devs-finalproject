# Tickets de Trabajo

---

**IC-001**

**Título:** Implementar botón/widget de acceso al Chatbot en el Portfolio

**Descripción:**
Propósito: Permitir a los usuarios acceder fácilmente al chatbot desde cualquier sección del portfolio ya desplegado en almapi.dev, mejorando la experiencia de usuario y facilitando la interacción inmediata.
Detalles: El botón/widget debe ser visible, no intrusivo y estar presente en todas las páginas del portfolio. Debe abrir la ventana de chat sin recargar la página. Seguir la línea visual del portfolio.
Restricciones: Debe ser responsive y no interferir con otros elementos de navegación.

**Criterios de Aceptación:**
- El botón/widget es visible en todas las páginas del portfolio.
- Al hacer clic, se despliega la ventana de chat sin recargar la página.
- El diseño es consistente con la UI general.

**Pruebas de Validación:**
- Navegar por distintas secciones y verificar la presencia y funcionamiento del botón/widget.
- Prueba en dispositivos móviles y desktop.

**Prioridad:** Must

**Estimación de Esfuerzo:** 2 puntos de historia (S)

**Asignación:** Equipo de Frontend

**Sprint:** 1

**Etiquetas:** UI, Frontend, Accesibilidad, Sprint 1

**Comentarios y Notas:**
- Consultar con UX/UI para validar la ubicación óptima.
- El portfolio ya está desplegado en almapi.dev, solo se requiere integrar el widget del chatbot.

**Enlaces o Referencias:**
- [HDU-001 en UserStories.md](./UserStories.md)
- [PRD.md sección Experiencia de Usuario](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-002**

**Título:** Desarrollar interfaz de chat profesional y responsiva

**Descripción:**
Propósito: Implementar la interfaz de usuario del chatbot para permitir la interacción con los usuarios.
Detalles: Desarrollar una interfaz de chat profesional y atractiva que se integre con el backend. **Primera entrega mediante Streamlit para cumplir con el hito, integración en almapi.dev como objetivo secundario.**
Restricciones: Debe ser responsive, accesible y seguir las mejores prácticas de UX/UI.

**Criterios de Aceptación:**
- La interfaz de chat mantiene la identidad visual del portfolio.
- Permite enviar y recibir mensajes en tiempo real.
- Es usable en dispositivos móviles y desktop.

**Pruebas de Validación:**
- Pruebas de usabilidad en distintos dispositivos.
- Validación de accesibilidad (teclado, lectores de pantalla).

**Prioridad:** Must

**Estimación de Esfuerzo:** 5 puntos de historia (M)

**Asignación:** Equipo de Frontend

**Sprint:** 1

**Etiquetas:** UI, Frontend, Chat, Accesibilidad, Sprint 1

**Comentarios y Notas:**
- Revisar buenas prácticas de diseño conversacional.
- La interfaz se integrará con el portfolio ya desplegado en almapi.dev.

**Enlaces o Referencias:**
- [HDU-002 en UserStories.md](./UserStories.md)
- [PRD.md sección Experiencia de Usuario](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-003**

**Título:** Integrar modelo de lenguaje natural para respuestas profesionales

**Descripción:**
Propósito: Permitir que el chatbot responda en lenguaje natural sobre la experiencia profesional, proyectos y habilidades del usuario.
Detalles: Integrar un modelo LLM (ej: GPT, Claude) con acceso a la base de conocimiento estructurada (RAG). Validar la calidad y relevancia de las respuestas.
Restricciones: Cumplir con políticas de privacidad y no exponer datos sensibles.

**Criterios de Aceptación:**
- El chatbot responde coherente y relevante a preguntas sobre experiencia y proyectos.
- Las respuestas se basan en información verificada.

**Pruebas de Validación:**
- Pruebas de preguntas frecuentes y casos límite.
- Validación de respuestas por el usuario propietario.

**Prioridad:** Must

**Estimación de Esfuerzo:** 8 puntos de historia (L)

**Asignación:** Equipo de Backend / IA

**Sprint:** 2

**Etiquetas:** Backend, IA, NLP, RAG, Sprint 2

**Comentarios y Notas:**
- Revisar integración con fuentes de datos (LinkedIn, GitHub, etc).

**Enlaces o Referencias:**
- [HDU-003 en UserStories.md](./UserStories.md)
- [PRD.md sección ChatBot IA Personalizado](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-004**

**Título:** Implementar soporte multiidioma en el chatbot

**Descripción:**
Propósito: Permitir que usuarios internacionales interactúen con el chatbot en su idioma preferido, mejorando la accesibilidad y alcance global.
Detalles: El sistema debe detectar o permitir seleccionar idioma (al menos español e inglés en MVP). Las respuestas deben generarse en el idioma seleccionado.
Restricciones: Mantener coherencia y calidad en traducciones.

**Criterios de Aceptación:**
- El usuario puede seleccionar idioma y recibir respuestas en ese idioma.
- El cambio de idioma es inmediato y sin errores.

**Pruebas de Validación:**
- Pruebas de cambio de idioma en la interfaz y en las respuestas.
- Validación de traducción automática y manual.

**Prioridad:** Should

**Estimación de Esfuerzo:** 8 puntos de historia (L)

**Asignación:** Equipo de Backend / IA

**Sprint:** 2

**Etiquetas:** Backend, IA, Multiidioma, Sprint 2

**Comentarios y Notas:**
- Considerar integración con servicios de traducción.

**Enlaces o Referencias:**
- [HDU-004 en UserStories.md](./UserStories.md)
- [PRD.md sección ChatBot IA Personalizado](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-005**

**Título:** Garantizar disponibilidad 24/7 del chatbot

**Descripción:**
Propósito: Asegurar que el chatbot esté siempre disponible para los usuarios, sin restricciones horarias.
Detalles: Implementar monitoreo de disponibilidad, alertas ante caídas y mensajes automáticos de mantenimiento o indisponibilidad.
Restricciones: El sistema debe ser tolerante a fallos y recuperarse automáticamente.

**Criterios de Aceptación:**
- El chatbot está operativo en todo momento salvo mantenimientos programados.
- El usuario es notificado si el servicio no está disponible.

**Pruebas de Validación:**
- Simulación de caídas y recuperación del servicio.
- Verificación de mensajes automáticos de estado.

**Prioridad:** Must

**Estimación de Esfuerzo:** 2 puntos de historia (S)

**Asignación:** Equipo de DevOps / Backend

**Sprint:** 1

**Etiquetas:** Infraestructura, Backend, Disponibilidad, Sprint 1

**Comentarios y Notas:**
- Definir procedimientos de mantenimiento y recuperación.

**Enlaces o Referencias:**
- [HDU-005 en UserStories.md](./UserStories.md)
- [PRD.md sección ChatBot IA Personalizado](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-006**

**Título:** Implementar redirección a recursos relevantes del portfolio

**Descripción:**
Propósito: Mejorar la experiencia del usuario sugiriendo enlaces a recursos y secciones relevantes del portfolio según sus preguntas.
Detalles: Mapear recursos del portfolio y desarrollar lógica para sugerencias automáticas en las respuestas del chatbot.
Restricciones: Los enlaces deben ser actualizados y contextuales.

**Criterios de Aceptación:**
- El chatbot sugiere enlaces relevantes en las respuestas.
- Los enlaces llevan a la sección correcta del portfolio.

**Pruebas de Validación:**
- Pruebas de preguntas sobre proyectos y validación de enlaces sugeridos.
- Verificación de actualización de enlaces.

**Prioridad:** Should

**Estimación de Esfuerzo:** 5 puntos de historia (M)

**Asignación:** Equipo de Backend / Frontend

**Sprint:** 2

**Etiquetas:** Backend, Frontend, UX, Sugerencias, Sprint 2

**Comentarios y Notas:**
- Mantener un mapeo actualizado de recursos.

**Enlaces o Referencias:**
- [HDU-006 en UserStories.md](./UserStories.md)
- [PRD.md sección ChatBot IA Personalizado](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-007**

**Título:** Registrar y analizar preguntas frecuentes del chatbot

**Descripción:**
Propósito: Permitir el registro y análisis de las preguntas más frecuentes para identificar temas de interés y mejorar la base de conocimiento.
Detalles: Implementar sistema de logging de preguntas y panel de análisis de frecuencia.
Restricciones: Cumplir con normativas de privacidad de datos.

**Criterios de Aceptación:**
- El sistema registra todas las preguntas realizadas.
- El panel muestra un ranking de preguntas frecuentes.

**Pruebas de Validación:**
- Pruebas de registro y visualización de preguntas en el panel.

**Prioridad:** Must

**Estimación de Esfuerzo:** 5 puntos de historia (M)

**Asignación:** Equipo de Backend / Data

**Sprint:** 2

**Etiquetas:** Backend, Data, Análisis, Estadísticas, Sprint 2

**Comentarios y Notas:**
- Revisar cumplimiento de privacidad.

**Enlaces o Referencias:**
- [HDU-007 en UserStories.md](./UserStories.md)
- [PRD.md sección Sistema de Análisis y Estadísticas](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-008**

**Título:** Medir satisfacción del usuario con el chatbot

**Descripción:**
Propósito: Obtener feedback de los usuarios sobre la utilidad de las respuestas del chatbot para identificar oportunidades de mejora.
Detalles: Implementar sistema de feedback y visualización de métricas de satisfacción en el panel de administración.
Restricciones: El feedback debe ser fácil de proporcionar y anónimo.

**Criterios de Aceptación:**
- El usuario puede calificar la utilidad de cada respuesta.
- El panel muestra métricas agregadas de satisfacción.

**Pruebas de Validación:**
- Pruebas de envío de feedback y visualización en el panel.

**Prioridad:** Should

**Estimación de Esfuerzo:** 5 puntos de historia (M)

**Asignación:** Equipo de Backend / Data

**Sprint:** 2

**Etiquetas:** Backend, Data, Feedback, UX, Sprint 2

**Comentarios y Notas:**
- Incluir opción de comentarios adicionales.

**Enlaces o Referencias:**
- [HDU-008 en UserStories.md](./UserStories.md)
- [PRD.md sección Sistema de Análisis y Estadísticas](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-009**

**Título:** Identificar temas con baja satisfacción de usuario

**Descripción:**
Propósito: Detectar áreas donde los usuarios no quedan conformes con las respuestas para priorizar mejoras en la base de conocimiento y el modelo.
Detalles: Analizar feedback negativo y generar reportes de temas críticos en el panel de administración.
Restricciones: Mantener anonimato y privacidad de los usuarios.

**Criterios de Aceptación:**
- El sistema asocia feedback negativo a temas específicos.
- El panel muestra reportes de temas con mayor insatisfacción.

**Pruebas de Validación:**
- Pruebas de feedback negativo y visualización de reportes.

**Prioridad:** Could

**Estimación de Esfuerzo:** 2 puntos de historia (S)

**Asignación:** Equipo de Backend / Data

**Sprint:** 3

**Etiquetas:** Backend, Data, Feedback, Mejora Continua, Sprint 3

**Comentarios y Notas:**
- Priorizar actualización de la base de conocimiento en estos temas.

**Enlaces o Referencias:**
- [HDU-009 en UserStories.md](./UserStories.md)
- [PRD.md sección Sistema de Análisis y Estadísticas](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-010**

**Título:** Analizar secciones y recursos más consultados del portfolio

**Descripción:**
Propósito: Identificar qué secciones y recursos del portfolio son los más consultados a través del chatbot para optimizar el contenido y la navegación.
Detalles: Implementar tracking de clics en enlaces sugeridos y desarrollar visualización de recursos más consultados en el panel.
Restricciones: Cumplir con normativas de privacidad.

**Criterios de Aceptación:**
- El sistema contabiliza el acceso a cada recurso sugerido.
- El panel muestra un ranking de recursos y secciones más visitados.

**Pruebas de Validación:**
- Pruebas de tracking y visualización de recursos en el panel.

**Prioridad:** Could

**Estimación de Esfuerzo:** 2 puntos de historia (S)

**Asignación:** Equipo de Backend / Data

**Sprint:** 3

**Etiquetas:** Backend, Data, UX, Estadísticas, Sprint 3

**Comentarios y Notas:**
- Ayuda a mejorar la estructura del portfolio.

**Enlaces o Referencias:**
- [HDU-010 en UserStories.md](./UserStories.md)
- [PRD.md sección Sistema de Análisis y Estadísticas](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-011**

**Título:** Analizar stack tecnológico y rubros de interés de los usuarios

**Descripción:**
Propósito: Analizar qué tecnologías y sectores industriales son los más consultados para adaptar el contenido y destacar áreas de mayor demanda.
Detalles: Clasificar consultas por tecnología e industria y generar reportes de tendencias en el panel de administración.
Restricciones: Mantener privacidad de los datos.

**Criterios de Aceptación:**
- El sistema registra y clasifica consultas por tecnología e industria.
- El panel muestra tendencias y reportes de interés.

**Pruebas de Validación:**
- Pruebas de clasificación y visualización de tendencias.

**Prioridad:** Could

**Estimación de Esfuerzo:** 2 puntos de historia (S)

**Asignación:** Equipo de Backend / Data

**Sprint:** 3

**Etiquetas:** Backend, Data, Estadísticas, Tendencias, Sprint 3

**Comentarios y Notas:**
- Orientar la estrategia de posicionamiento profesional.

**Enlaces o Referencias:**
- [HDU-011 en UserStories.md](./UserStories.md)
- [PRD.md sección Sistema de Análisis y Estadísticas](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-012**

**Título:** Medir métricas de conversión y generación de leads

**Descripción:**
Propósito: Medir la tasa de conversión de interacciones a contactos o leads para evaluar el impacto del chatbot en la generación de oportunidades.
Detalles: Implementar registro de leads y desarrollar panel de conversión con métricas y origen de los leads.
Restricciones: Cumplir con normativas de privacidad y protección de datos.

**Criterios de Aceptación:**
- El sistema registra acciones de contacto y las contabiliza como leads.
- El panel muestra la tasa de conversión y el origen de cada lead.

**Pruebas de Validación:**
- Pruebas de registro y visualización de leads en el panel.

**Prioridad:** Should

**Estimación de Esfuerzo:** 5 puntos de historia (M)

**Asignación:** Equipo de Backend / Data

**Sprint:** 3

**Etiquetas:** Backend, Data, Leads, Conversión, Sprint 3

**Comentarios y Notas:**
- Ayuda a medir el ROI del sistema.

**Enlaces o Referencias:**
- [HDU-012 en UserStories.md](./UserStories.md)
- [PRD.md sección Sistema de Análisis y Estadísticas](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-013**

**Título:** Garantizar cumplimiento de privacidad y seguridad de datos

**Descripción:**
Propósito: Cumplir con normativas de privacidad y seguridad (GDPR/CCPA) para proteger la información de usuarios y administradores.
Detalles: Redactar políticas de privacidad y seguridad, implementar mecanismos de consentimiento y configurar acceso seguro a datos.
Restricciones: Cumplimiento legal obligatorio.

**Criterios de Aceptación:**
- El sistema informa sobre el uso y protección de datos.
- El administrador puede actualizar términos de privacidad y seguridad.

**Pruebas de Validación:**
- Revisión legal de políticas y mecanismos implementados.
- Pruebas de consentimiento y acceso seguro.

**Prioridad:** Must

**Estimación de Esfuerzo:** 8 puntos de historia (L)

**Asignación:** Equipo de Backend / Legal / DevOps

**Sprint:** 1

**Etiquetas:** Seguridad, Legal, Backend, Privacidad, Sprint 1

**Comentarios y Notas:**
- Incluir cumplimiento con GDPR/CCPA.

**Enlaces o Referencias:**
- [HDU-013 en UserStories.md](./UserStories.md)
- [PRD.md sección Privacidad y Seguridad](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-014**

**Título:** Implementar sistema de actualización y mejora continua del chatbot

**Descripción:**
Propósito: Permitir la actualización y mejora continua de la base de conocimiento y el modelo del chatbot para mantener la precisión y relevancia de las respuestas.
Detalles: Implementar sistema de actualización de KB, validar mejoras en ambiente de pruebas y documentar cambios y versiones. Incluir mecanismos de rollback y backup.
Restricciones: Mantener la calidad y coherencia de las respuestas tras cada actualización.

**Criterios de Aceptación:**
- El chatbot refleja los cambios tras actualizar la base de conocimiento.
- Se mantiene la calidad y coherencia tras nuevas versiones.

**Pruebas de Validación:**
- Pruebas de actualización y rollback en ambiente de pruebas.
- Validación de documentación de cambios.

**Prioridad:** Should

**Estimación de Esfuerzo:** 8 puntos de historia (L)

**Asignación:** Equipo de Backend / IA / DevOps

**Sprint:** 3

**Etiquetas:** Backend, IA, DevOps, Mejora Continua, Sprint 3

**Comentarios y Notas:**
- Incluir mecanismos de rollback y backup.

**Enlaces o Referencias:**
- [HDU-014 en UserStories.md](./UserStories.md)
- [PRD.md sección Mejora Continua](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-015**

**Título:** Pruebas de carga y rendimiento del sistema

**Descripción:**
Propósito: Validar que el sistema soporte la carga esperada de usuarios y consultas simultáneas sin degradar la experiencia.
Detalles: Realizar pruebas de estrés sobre el backend, chatbot y base de datos. Identificar cuellos de botella y optimizar recursos.
Restricciones: Las pruebas deben realizarse en un entorno controlado y no afectar a usuarios reales.

**Criterios de Aceptación:**
- El sistema soporta el número objetivo de usuarios concurrentes.
- Se identifican y documentan los límites de rendimiento.
- Se proponen y aplican optimizaciones si es necesario.

**Pruebas de Validación:**
- Simulación de carga con herramientas como k6, JMeter o Artillery.
- Monitoreo de recursos y tiempos de respuesta.

**Prioridad:** Must

**Estimación de Esfuerzo:** 3 puntos de historia (M)

**Asignación:** Equipo de Backend / DevOps

**Sprint:** 3

**Etiquetas:** Backend, DevOps, Testing, Rendimiento, Sprint 3

**Comentarios y Notas:**
- Documentar resultados y acciones tomadas.

**Enlaces o Referencias:**
- [PRD.md sección Métricas de Éxito](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-016**

**Título:** Pruebas de seguridad y vulnerabilidades

**Descripción:**
Propósito: Garantizar que el sistema es seguro frente a ataques comunes y protege los datos de los usuarios.
Detalles: Realizar pruebas de penetración, revisión de OWASP Top 10 y validación de políticas de acceso.
Restricciones: Las pruebas deben ser éticas y no comprometer datos reales.

**Criterios de Aceptación:**
- No se detectan vulnerabilidades críticas en el sistema.
- Se documentan y corrigen hallazgos de seguridad.
- El sistema cumple con las normativas de privacidad.
- Cloud Armor está configurado y funcionando correctamente.
- Threat detection system detecta amenazas en tiempo real.
- Prompt injection protection está activa y funcionando.
- Security Command Center está configurado y monitoreando.
- OWASP Top 10 for LLM compliance está verificado.

**Pruebas de Validación:**
- Escaneo de vulnerabilidades con herramientas como OWASP ZAP, Snyk o similares.
- Pruebas manuales de acceso y roles.

**Prioridad:** Must

**Estimación de Esfuerzo:** 3 puntos de historia (M)

**Asignación:** Equipo de Backend / Seguridad

**Sprint:** 3

**Etiquetas:** Backend, Seguridad, Testing, Sprint 3

**Comentarios y Notas:**
- Incluir pruebas de inyección, XSS, CSRF, etc.

**Enlaces o Referencias:**
- [PRD.md sección Privacidad y Seguridad](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-017**

**Título:** Estrategia y pruebas de backup y recuperación

**Descripción:**
Propósito: Asegurar que toda la información crítica del sistema puede ser respaldada y restaurada ante fallos o incidentes.
Detalles: Definir y probar procedimientos de backup automático de base de datos, logs y configuraciones clave.
Restricciones: Los backups deben ser cifrados y almacenados de forma segura.

**Criterios de Aceptación:**
- Se realizan backups automáticos periódicos.
- Se valida la restauración exitosa de un backup.
- Los backups cumplen con normativas de privacidad.

**Pruebas de Validación:**
- Simulación de pérdida de datos y recuperación.
- Revisión de logs de backup y restauración.

**Prioridad:** Must

**Estimación de Esfuerzo:** 2 puntos de historia (S)

**Asignación:** Equipo de Backend / DevOps

**Sprint:** 3

**Etiquetas:** Backend, DevOps, Backup, Seguridad, Sprint 3

**Comentarios y Notas:**
- Documentar la política de retención y restauración.

**Enlaces o Referencias:**
- [PRD.md sección Mantenimiento](./PRD.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---

**IC-018**

**Título:** Implementación de control de costos y gestión de presupuesto

**Descripción:**
Propósito: Implementar sistema robusto de control de costos para prevenir gastos excesivos y optimizar recursos en GCP.
Detalles: Configurar budgets mensuales, implementar alertas automáticas, configurar cuotas de recursos, implementar modo de emergencia y dashboard de monitoreo de costos.
Restricciones: Debe integrarse con GCP Billing API y proporcionar alertas en tiempo real.

**Criterios de Aceptación:**
- Budget mensual configurado con alertas en 50%, 80% y 100%.
- Sistema de alertas automáticas implementado (Pub/Sub, email, Slack).
- Cuotas de recursos configuradas por servicio.
- Modo de emergencia automático al exceder 100% del presupuesto.
- Dashboard de monitoreo de costos en tiempo real.
- Rate limiting basado en costos implementado.
- Notificaciones de emergencia configuradas.

**Pruebas de Validación:**
- Simulación de exceso de presupuesto.
- Validación de alertas automáticas.
- Testing de modo de emergencia.
- Verificación de cuotas de recursos.
- Validación de dashboard de costos.

**Prioridad:** Must

**Estimación de Esfuerzo:** 6 puntos de historia (M)

**Asignación:** DevOps Engineer

**Sprint:** 2

**Etiquetas:** DevOps, GCP, Costos, Budget, Sprint 2

**Comentarios y Notas:**
- Integrar con GCP Billing API.
- Configurar notificaciones de emergencia.
- Implementar métricas de eficiencia de costos.

**Enlaces o Referencias:**
- [tech-solution.md sección Control de Costos](./tech-solution.md)

**Historial de Cambios:**
- 21/07/2025: Creado por IA

---
