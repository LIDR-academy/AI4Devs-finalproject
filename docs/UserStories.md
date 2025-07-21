# Historias de Usuario

## Épica EP-001: Interfaz y Experiencia de Usuario del Portfolio

### HDU-001: Acceso al Chatbot desde el Portfolio
Como visitante del portfolio,
quiero acceder fácilmente al chatbot desde cualquier sección del sitio,
para que pueda interactuar y obtener información relevante de manera inmediata.

**Criterios de Aceptación:**
- Dado que el usuario visita el portfolio, cuando visualiza cualquier página, entonces debe ver un botón/widget de acceso al chatbot en una posición visible.
- Dado que el usuario hace clic en el botón/widget, cuando se despliega la ventana de chat, entonces puede comenzar a interactuar sin recargar la página.

**Notas Adicionales:**
- El acceso debe ser intuitivo y no intrusivo.

**Tareas:**
- Diseñar el botón/widget de acceso.
- Implementar el despliegue del chat.
- Asegurar visibilidad en todas las secciones del portfolio.

---

### HDU-002: Interfaz de Chat Intuitiva
Como usuario del chatbot,
quiero una interfaz de chat clara y profesional,
para que la experiencia de interacción sea agradable y eficiente.

**Criterios de Aceptación:**
- Dado que el usuario abre el chat, cuando visualiza la interfaz, entonces debe ver un diseño consistente con el portfolio.
- Dado que el usuario escribe una pregunta, cuando envía el mensaje, entonces debe recibir una respuesta en la misma ventana.

**Notas Adicionales:**
- Debe ser responsive y accesible.

**Tareas:**
- Diseñar la interfaz de chat.
- Implementar el sistema de mensajes.
- Validar compatibilidad móvil y desktop.

---

## Épica EP-002: Chatbot IA y Sistema RAG

### HDU-003: Respuestas en Lenguaje Natural sobre Experiencia Profesional
Como usuario del chatbot,
quiero recibir respuestas en lenguaje natural sobre la experiencia profesional del propietario,
para que pueda conocer su trayectoria y habilidades de forma clara.

**Criterios de Aceptación:**
- Dado que el usuario realiza una pregunta sobre experiencia laboral, cuando el chatbot responde, entonces la respuesta debe ser coherente y relevante.
- Dado que el usuario solicita detalles de un proyecto, cuando el chatbot responde, entonces debe proporcionar información específica del proyecto.

**Notas Adicionales:**
- El sistema debe extraer información de fuentes verificadas.

**Tareas:**
- Integrar modelo de lenguaje natural.
- Configurar acceso a la base de conocimiento.
- Validar calidad de respuestas.

---

### HDU-004: Soporte Multiidioma
Como usuario internacional,
quiero interactuar con el chatbot en mi idioma preferido,
para que la experiencia sea personalizada y comprensible.

**Criterios de Aceptación:**
- Dado que el usuario selecciona un idioma, cuando interactúa con el chatbot, entonces todas las respuestas deben estar en ese idioma.
- Dado que el usuario cambia de idioma, cuando realiza una nueva consulta, entonces el chatbot debe responder en el nuevo idioma seleccionado.

**Notas Adicionales:**
- Incluir al menos español e inglés en el MVP.

**Tareas:**
- Implementar detección y selección de idioma.
- Traducir mensajes y respuestas.
- Validar consistencia multilingüe.

---

### HDU-005: Disponibilidad 24/7
Como usuario,
quiero que el chatbot esté disponible en cualquier momento,
para que pueda obtener información sin restricciones horarias.

**Criterios de Aceptación:**
- Dado que el usuario accede al portfolio, cuando abre el chat, entonces el chatbot debe estar operativo.
- Dado que el sistema detecta una caída, cuando se restablece el servicio, entonces debe notificar al usuario si hubo una interrupción.

**Notas Adicionales:**
- Considerar mensajes de mantenimiento o indisponibilidad.

**Tareas:**
- Configurar monitoreo de disponibilidad.
- Implementar mensajes automáticos de estado.

---

### HDU-006: Redirección a Recursos Relevantes
Como usuario del chatbot,
quiero recibir enlaces a recursos del portfolio relacionados con mis preguntas,
para que pueda profundizar en la información de interés.

**Criterios de Aceptación:**
- Dado que el usuario pregunta por un proyecto, cuando el chatbot responde, entonces debe incluir un enlace directo a la sección correspondiente del portfolio.
- Dado que el usuario solicita información adicional, cuando el chatbot responde, entonces debe sugerir recursos relevantes.

**Notas Adicionales:**
- Los enlaces deben ser contextuales y actualizados.

**Tareas:**
- Mapear recursos del portfolio.
- Integrar sugerencias automáticas en respuestas.

---

## Épica EP-003: Sistema de Análisis y Estadísticas

### HDU-007: Registro y Análisis de Preguntas Frecuentes
Como administrador del sistema,
quiero registrar y analizar las preguntas más frecuentes realizadas al chatbot,
para que pueda identificar los temas de mayor interés y mejorar la base de conocimiento.

**Criterios de Aceptación:**
- Dado que los usuarios interactúan con el chatbot, cuando se almacena cada pregunta, entonces el sistema debe generar un ranking de preguntas frecuentes.
- Dado que el administrador revisa las estadísticas, cuando accede al panel, entonces debe visualizar los temas más consultados.

**Notas Adicionales:**
- Permite priorizar mejoras en áreas de mayor demanda.

**Tareas:**
- Implementar registro de preguntas.
- Desarrollar panel de análisis de frecuencia.

---

### HDU-008: Medición de Satisfacción del Usuario
Como administrador del sistema,
quiero medir la satisfacción de los usuarios con las respuestas del chatbot,
para que pueda identificar oportunidades de mejora en la experiencia.

**Criterios de Aceptación:**
- Dado que el usuario recibe una respuesta, cuando se le solicita feedback, entonces puede calificar la utilidad de la respuesta.
- Dado que el administrador revisa los resultados, cuando accede al panel, entonces debe ver métricas de satisfacción agregadas.

**Notas Adicionales:**
- Incluir opción de comentarios adicionales.

**Tareas:**
- Implementar sistema de feedback.
- Integrar métricas en el panel de administración.

---

### HDU-009: Identificación de Temas con Baja Satisfacción
Como administrador del sistema,
quiero identificar los temas en los que los usuarios no quedan conformes con las respuestas,
para que pueda mejorar la información y el modelo en esas áreas.

**Criterios de Aceptación:**
- Dado que el usuario califica negativamente una respuesta, cuando se registra el feedback, entonces el sistema debe asociar la insatisfacción al tema correspondiente.
- Dado que el administrador revisa el panel, cuando visualiza los reportes, entonces puede ver los temas con mayor insatisfacción.

**Notas Adicionales:**
- Permite priorizar actualizaciones de la base de conocimiento.

**Tareas:**
- Analizar feedback negativo.
- Generar reportes de temas críticos.

---

### HDU-010: Análisis de Secciones y Recursos Más Consultados
Como administrador del sistema,
quiero conocer qué secciones y recursos del portfolio son los más consultados a través del chatbot,
para que pueda optimizar el contenido y la navegación.

**Criterios de Aceptación:**
- Dado que el usuario accede a enlaces sugeridos, cuando se registra la interacción, entonces el sistema debe contabilizar el acceso a cada recurso.
- Dado que el administrador revisa las estadísticas, cuando accede al panel, entonces puede ver un ranking de recursos y secciones más visitados.

**Notas Adicionales:**
- Ayuda a mejorar la estructura del portfolio.

**Tareas:**
- Implementar tracking de clics en enlaces.
- Desarrollar visualización de recursos más consultados.

---

### HDU-011: Análisis de Stack Tecnológico y Rubros de Interés
Como administrador del sistema,
quiero analizar qué tecnologías y sectores industriales son los más consultados por los usuarios,
para que pueda adaptar el contenido y destacar las áreas de mayor demanda.

**Criterios de Aceptación:**
- Dado que el usuario pregunta por tecnologías o industrias, cuando el chatbot responde, entonces el sistema debe registrar el tipo de consulta.
- Dado que el administrador revisa el panel, cuando visualiza los reportes, entonces puede ver tendencias en stack tecnológico y rubros de interés.

**Notas Adicionales:**
- Permite orientar la estrategia de posicionamiento profesional.

**Tareas:**
- Clasificar consultas por tecnología e industria.
- Generar reportes de tendencias.

---

### HDU-012: Métricas de Conversión y Leads
Como administrador del sistema,
quiero medir la tasa de conversión de interacciones a contactos o leads,
para que pueda evaluar el impacto del chatbot en la generación de oportunidades.

**Criterios de Aceptación:**
- Dado que el usuario solicita contacto o información adicional, cuando se registra la acción, entonces el sistema debe contabilizarla como lead.
- Dado que el administrador revisa las métricas, cuando accede al panel, entonces puede ver la tasa de conversión y el origen del lead.

**Notas Adicionales:**
- Ayuda a medir el ROI del sistema.

**Tareas:**
- Implementar registro de leads.
- Desarrollar panel de conversión.

---

## Épica EP-004: Mantenimiento, Seguridad y Privacidad

### HDU-013: Cumplimiento de Privacidad y Seguridad
Como usuario y administrador,
quiero que el sistema cumpla con normativas de privacidad y seguridad,
para que mi información esté protegida y el uso de datos sea transparente.

**Criterios de Aceptación:**
- Dado que el usuario interactúa con el chatbot, cuando se recopilan datos, entonces el sistema debe informar sobre el uso y protección de los mismos.
- Dado que el administrador revisa la configuración, cuando accede a las políticas, entonces debe poder actualizar los términos de privacidad y seguridad.

**Notas Adicionales:**
- Incluir cumplimiento con GDPR/CCPA.

**Tareas:**
- Redactar políticas de privacidad y seguridad.
- Implementar mecanismos de consentimiento.
- Configurar acceso seguro a datos.

---

### HDU-014: Actualización y Mejora Continua del Sistema
Como administrador del sistema,
quiero actualizar y mejorar continuamente la base de conocimiento y el modelo del chatbot,
para que las respuestas sean cada vez más precisas y relevantes.

**Criterios de Aceptación:**
- Dado que se identifican áreas de mejora, cuando se actualiza la base de conocimiento, entonces el chatbot debe reflejar los cambios en sus respuestas.
- Dado que se lanza una nueva versión del modelo, cuando se despliega, entonces debe mantenerse la calidad y coherencia de las respuestas.

**Notas Adicionales:**
- Incluir mecanismos de rollback y backup.

**Tareas:**
- Implementar sistema de actualización de KB.
- Validar mejoras en ambiente de pruebas.
- Documentar cambios y versiones.

---

# Backlog de Producto

A continuación se presenta el backlog priorizado utilizando la metodología MoSCoW, junto con la estimación de impacto, urgencia, complejidad, riesgos y esfuerzo para cada historia de usuario.

| Código | Épica | Título | MoSCoW | Impacto/Valor | Urgencia | Complejidad | Riesgos/Dependencias | Talla | Puntos |
|--------|-------|--------|--------|--------------|----------|-------------|---------------------|-------|--------|
| HDU-001 | EP-001 | Acceso al Chatbot desde el Portfolio | Must | Alto | Alta | S | Baja (depende de diseño UI) | S | 2 |
| HDU-002 | EP-001 | Interfaz de Chat Intuitiva | Must | Alto | Alta | M | Media (depende de HDU-001) | M | 5 |
| HDU-003 | EP-002 | Respuestas en Lenguaje Natural sobre Experiencia Profesional | Must | Muy Alto | Muy Alta | L | Alta (NLP, calidad datos) | L | 8 |
| HDU-004 | EP-002 | Soporte Multiidioma | Should | Alto | Media | L | Media (depende de HDU-003) | L | 8 |
| HDU-005 | EP-002 | Disponibilidad 24/7 | Must | Alto | Alta | S | Baja (infraestructura) | S | 2 |
| HDU-006 | EP-002 | Redirección a Recursos Relevantes | Should | Medio | Media | M | Baja (depende de HDU-003) | M | 5 |
| HDU-007 | EP-003 | Registro y Análisis de Preguntas Frecuentes | Must | Alto | Alta | M | Media (depende de HDU-003) | M | 5 |
| HDU-008 | EP-003 | Medición de Satisfacción del Usuario | Should | Medio | Media | M | Media (depende de HDU-007) | M | 5 |
| HDU-009 | EP-003 | Identificación de Temas con Baja Satisfacción | Could | Medio | Baja | S | Baja (depende de HDU-008) | S | 2 |
| HDU-010 | EP-003 | Análisis de Secciones y Recursos Más Consultados | Could | Medio | Baja | S | Baja (depende de HDU-006) | S | 2 |
| HDU-011 | EP-003 | Análisis de Stack Tecnológico y Rubros de Interés | Could | Medio | Baja | S | Baja (depende de HDU-007) | S | 2 |
| HDU-012 | EP-003 | Métricas de Conversión y Leads | Should | Alto | Media | M | Media (depende de HDU-007) | M | 5 |
| HDU-013 | EP-004 | Cumplimiento de Privacidad y Seguridad | Must | Muy Alto | Muy Alta | L | Alta (legal, privacidad) | L | 8 |
| HDU-014 | EP-004 | Actualización y Mejora Continua del Sistema | Should | Alto | Media | L | Media (depende de HDU-007, HDU-013) | L | 8 |

**Leyenda MoSCoW:**
- Must: Imprescindible
- Should: Debería tenerse
- Could: Podría tenerse
- Won't: No se implementará ahora

**Notas:**
- El esfuerzo está estimado en tallas de camiseta (XS=1, S=2, M=5, L=8, XL=13+ puntos de historia).
- Las dependencias indican qué historias deben completarse antes de abordar la siguiente.
