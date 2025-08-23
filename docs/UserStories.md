# Historias de Usuario

## Épica EP-001: Interfaz y Experiencia de Usuario del Portfolio

### HDU-001: Acceso al Chatbot desde el Portfolio
Como visitante del portfolio ya desplegado en almapi.dev,
quiero acceder fácilmente al chatbot desde cualquier sección del sitio,
para que pueda interactuar y obtener información relevante de manera inmediata.

**Criterios de Aceptación:**
- Dado que el usuario visita el portfolio, cuando visualiza cualquier página, entonces debe ver un botón/widget de acceso al chatbot en una posición visible.
- Dado que el usuario hace clic en el botón/widget, cuando se despliega la ventana de chat, entonces puede comenzar a interactuar sin recargar la página.

**Notas Adicionales:**
- El acceso debe ser intuitivo y no intrusivo.
- El portfolio ya está funcionando en almapi.dev, solo se requiere integrar el widget del chatbot.

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
- La interfaz se integrará con el portfolio ya desplegado en almapi.dev.

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
- Dado que el usuario accede al portfolio ya desplegado en almapi.dev, cuando abre el chat, entonces el chatbot debe estar operativo.
- Dado que el sistema detecta una caída, cuando se restablece el servicio, entonces debe notificar al usuario si hubo una interrupción.

**Notas Adicionales:**
- Considerar mensajes de mantenimiento o indisponibilidad.
- El frontend ya está desplegado, la disponibilidad 24/7 se refiere principalmente al backend del chatbot.

**Tareas:**
- Configurar monitoreo de disponibilidad del backend.
- Implementar mensajes automáticos de estado.

---

### HDU-006: Redirección a Recursos Relevantes
Como usuario del chatbot,
quiero recibir enlaces a recursos del portfolio relacionados con mis preguntas,
para que pueda profundizar en la información de interés.

**Criterios de Aceptación:**
- Dado que el usuario pregunta por un proyecto, cuando el chatbot responde, entonces debe incluir un enlace directo a la sección correspondiente del portfolio ya desplegado en almapi.dev.
- Dado que el usuario solicita información adicional, cuando el chatbot responde, entonces debe sugerir recursos relevantes.

**Notas Adicionales:**
- Los enlaces deben ser contextuales y actualizados.
- El portfolio ya está funcionando en almapi.dev, solo se requiere mapear los recursos existentes.

**Tareas:**
- Mapear recursos del portfolio ya desplegado.
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
quiero conocer qué secciones y recursos del portfolio ya desplegado en almapi.dev son los más consultados a través del chatbot,
para que pueda optimizar el contenido y la navegación.

**Criterios de Aceptación:**
- Dado que el usuario accede a enlaces sugeridos, cuando se registra la interacción, entonces el sistema debe contabilizar el acceso a cada recurso.
- Dado que el administrador revisa las estadísticas, cuando accede al panel, entonces puede ver un ranking de recursos y secciones más visitados.

**Notas Adicionales:**
- Ayuda a mejorar la estructura del portfolio ya desplegado.
- Los recursos ya existen en almapi.dev, solo se requiere implementar el tracking.

**Tareas:**
- Implementar tracking de clics en enlaces del portfolio existente.
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

## Épica EP-005: Plataforma y Operación Técnica

### HDU-015: Monitoreo y Alertas del Sistema
Como responsable técnico,
quiero que el sistema cuente con monitoreo y alertas automáticas,
para detectar caídas, errores y anomalías en tiempo real.

**Criterios de Aceptación:**
- El sistema reporta caídas y errores críticos automáticamente.
- Se generan alertas ante anomalías de uso o rendimiento.
- El equipo recibe notificaciones en tiempo real.

**Notas Adicionales:**
- Integrar con servicios como Sentry, Datadog o similar.

**Tareas:**
- Configurar monitoreo de logs y métricas.
- Implementar alertas automáticas por email/Slack.
- Documentar procedimientos de respuesta ante incidentes.

---

### HDU-016: Logging Centralizado y Auditoría
Como responsable de seguridad,
quiero que todas las acciones relevantes del sistema queden registradas en logs centralizados,
para facilitar auditoría, trazabilidad y análisis forense.

**Criterios de Aceptación:**
- Todas las acciones críticas quedan registradas con timestamp y usuario.
- Los logs se almacenan de forma segura y centralizada.
- Se pueden consultar y filtrar logs por tipo de evento.

**Notas Adicionales:**
- Cumplir con normativas de privacidad y retención de datos.

**Tareas:**
- Implementar logging estructurado en backend y frontend.
- Configurar almacenamiento seguro de logs.
- Crear panel de consulta de logs para admins.

---

### HDU-017: Fallback Inteligente para IA
Como usuario del chatbot,
quiero que el sistema tenga un mecanismo de fallback cuando la IA no pueda responder,
para que siempre reciba una respuesta útil o una notificación clara.

**Criterios de Aceptación:**
- Si la IA no puede generar respuesta, se muestra un mensaje amigable al usuario.
- El sistema registra los fallos de la IA para análisis posterior.
- Se sugiere al usuario opciones alternativas o contacto humano si es necesario.

**Notas Adicionales:**
- El fallback debe ser transparente y no afectar la experiencia general.

**Tareas:**
- Implementar lógica de fallback en el pipeline de IA.
- Registrar todos los casos de fallback para análisis.
- Validar la experiencia de usuario en estos casos.

---

### HDU-018: Sistema de Control de Costos y Budgets

**Como** desarrollador del sistema,
**Quiero** un sistema completo de control de costos y gestión de presupuesto
**Para** mantener los costos mensuales bajo $40 USD y optimizar el uso de recursos GCP

**Criterios de Aceptación:**
- Sistema de monitoreo de costos en tiempo real implementado
- Alertas automáticas configuradas para umbrales de 50%, 80% y 100%
- Modo de emergencia funcional para control de costos excesivos
- Dashboard de métricas de uso y costos operativo
- Límites de recursos configurados para todos los servicios
- Sistema de cache multi-nivel implementado y funcional
- Optimización de prompts para reducir tokens por request
- Configuración de modelos LLM más económicos (Gemini Flash)
- Embeddings locales implementados como alternativa GRATIS
- Vector search optimizado con estrategia híbrida

**Notas Adicionales:**
- Prioridad crítica para el MVP
- Debe integrarse con GCP Billing API
- Debe proporcionar alertas en tiempo real
- Debe mantener la calidad del sistema RAG

**Historias de Usuario Relacionadas:**
- HDU-019: Sistema de Cache Inteligente
- HDU-020: Optimización de Modelos LLM
- HDU-021: Monitoreo y Alertas de Costos

**Tareas:**
1. Configurar sistema de monitoreo de costos en tiempo real
2. Implementar alertas automáticas por umbrales
3. Configurar modo de emergencia automático
4. Implementar dashboard de métricas
5. Configurar límites de recursos por servicio
6. Implementar sistema de cache multi-nivel
7. Optimizar prompts para reducir tokens
8. Configurar modelos LLM económicos
9. Implementar embeddings locales
10. Optimizar vector search
11. Testing de todas las optimizaciones
12. Documentación del sistema implementado

---

### HDU-019: Sistema de Cache Inteligente

**Como** usuario del sistema RAG,
**Quiero** respuestas rápidas y económicas
**Para** obtener información profesional sin esperas y con costos mínimos

**Criterios de Aceptación:**
- Cache Redis en memoria configurado y funcional
- Cache en Cloud Storage implementado para persistencia
- Base de datos local SQLite para cache de queries frecuentes
- Estrategia de TTL adaptativo por frecuencia de uso
- Sistema de priorización de cache por tipo de query
- Cache de embeddings implementado para evitar regeneración
- Cache de resultados de vector search funcional
- Métricas de cache hit rate implementadas
- Sistema de invalidación de cache inteligente
- Cache warming para queries más frecuentes

**Notas Adicionales:**
- Debe reducir costos de API en al menos 60%
- Debe mantener cache hit rate superior al 80%
- Debe funcionar en todos los niveles de cache
- Debe ser transparente para el usuario final

**Historias de Usuario Relacionadas:**
- HDU-018: Sistema de Control de Costos y Budgets
- HDU-020: Optimización de Modelos LLM

**Tareas:**
1. Configurar Redis para cache en memoria
2. Implementar cache en Cloud Storage
3. Configurar base de datos local SQLite
4. Implementar estrategia de TTL adaptativo
5. Configurar priorización de cache por tipo
6. Implementar cache de embeddings
7. Implementar cache de vector search
8. Configurar métricas de cache hit rate
9. Implementar invalidación inteligente
10. Configurar cache warming
11. Testing del sistema de cache
12. Monitoreo de performance

---

### HDU-020: Optimización de Modelos LLM

**Como** desarrollador del sistema,
**Quiero** usar modelos LLM más económicos sin comprometer calidad
**Para** reducir costos de generación de texto manteniendo la precisión del RAG

**Criterios de Aceptación:**
- Gemini 1.5 Flash configurado como modelo principal
- Ollama local implementado como fallback GRATIS
- Sistema de fallback automático entre modelos funcional
- Templates de prompts optimizados implementados
- Límites estrictos de tokens por tipo de query configurados
- Remoción automática de palabras innecesarias en prompts
- Contexto histórico limitado a 200 caracteres máximo
- Sistema de priorización de modelos por costo/performance
- Métricas de tokens utilizados por request implementadas
- Testing de calidad de respuestas con modelos económicos

**Notas Adicionales:**
- Debe reducir costos de LLM en al menos 50%
- Debe mantener calidad de respuestas superior al 90%
- Debe implementar fallback automático
- Debe optimizar prompts al máximo

**Historias de Usuario Relacionadas:**
- HDU-018: Sistema de Control de Costos y Budgets
- HDU-019: Sistema de Cache Inteligente

**Tareas:**
1. Configurar Gemini 1.5 Flash como modelo principal
2. Implementar Ollama local como fallback
3. Configurar sistema de fallback automático
4. Implementar templates de prompts optimizados
5. Configurar límites de tokens por tipo
6. Implementar remoción de palabras innecesarias
7. Limitar contexto histórico
8. Configurar priorización de modelos
9. Implementar métricas de tokens
10. Testing de calidad de respuestas
11. Validación de fallback
12. Optimización continua

---

### HDU-021: Monitoreo y Alertas de Costos

**Como** administrador del sistema,
**Quiero** monitorear costos en tiempo real y recibir alertas automáticas
**Para** prevenir gastos excesivos y optimizar el uso de recursos

**Criterios de Aceptación:**
- Dashboard de costos en tiempo real implementado
- Métricas de uso por servicio configuradas
- Alertas automáticas por umbrales de costo implementadas
- Notificaciones por email, Slack y Telegram configuradas
- Modo de emergencia automático funcional
- Métricas de cache hit rate visibles
- Análisis de patrones de uso implementado
- Recomendaciones de optimización automáticas
- Historial de costos y tendencias implementado
- Integración con Cloud Monitoring y Logging

**Notas Adicionales:**
- Debe proporcionar visibilidad completa de costos
- Debe alertar antes de exceder límites
- Debe integrarse con herramientas de comunicación del equipo
- Debe generar recomendaciones automáticas

**Historias de Usuario Relacionadas:**
- HDU-018: Sistema de Control de Costos y Budgets
- HDU-019: Sistema de Cache Inteligente

**Tareas:**
1. Implementar dashboard de costos en tiempo real
2. Configurar métricas por servicio
3. Implementar alertas automáticas por umbrales
4. Configurar notificaciones por múltiples canales
5. Implementar modo de emergencia automático
6. Configurar métricas de cache hit rate
7. Implementar análisis de patrones de uso
8. Configurar recomendaciones automáticas
9. Implementar historial de costos
10. Integrar con Cloud Monitoring
11. Testing del sistema de alertas
12. Configuración de canales de notificación

---

### HDU-022: Optimización de Embeddings y Vector Search

**Como** desarrollador del sistema RAG,
**Quiero** embeddings locales GRATIS y vector search optimizado
**Para** reducir costos de procesamiento de texto manteniendo la precisión

**Criterios de Aceptación:**
- Modelo Hugging Face all-MiniLM-L6-v2 implementado localmente
- Cache de embeddings implementado y funcional
- Estrategia híbrida de vector search implementada
- Búsqueda aproximada configurada para queries normales
- Búsqueda exacta solo para queries críticas
- Límite de resultados configurado a máximo 5 por query
- Priorización de resultados por relevancia implementada
- Cache de resultados de búsqueda funcional
- Métricas de performance de embeddings implementadas
- Testing de precisión de embeddings locales vs cloud

**Notas Adicionales:**
- Debe reducir costos de embeddings en al menos 70%
- Debe mantener precisión de búsqueda superior al 95%
- Debe ser transparente para el usuario final
- Debe implementar estrategia híbrida inteligente

**Historias de Usuario Relacionadas:**
- HDU-018: Sistema de Control de Costos y Budgets
- HDU-019: Sistema de Cache Inteligente

**Tareas:**
1. Implementar modelo Hugging Face localmente
2. Configurar cache de embeddings
3. Implementar estrategia híbrida de vector search
4. Configurar búsqueda aproximada para queries normales
5. Configurar búsqueda exacta para queries críticas
6. Limitar resultados a máximo 5 por query
7. Implementar priorización por relevancia
8. Configurar cache de resultados de búsqueda
9. Implementar métricas de performance
10. Testing de precisión vs cloud
11. Validación de estrategia híbrida
12. Optimización continua

---

### HDU-023: Testing y Validación de Optimizaciones

**Como** desarrollador del sistema,
**Quiero** validar que todas las optimizaciones funcionen correctamente
**Para** asegurar que la reducción de costos no comprometa la calidad

**Criterios de Aceptación:**
- Tests unitarios para todos los servicios de optimización implementados
- Tests de integración para cache multi-nivel implementados
- Tests de performance para modelos LLM económicos implementados
- Tests de precisión para embeddings locales implementados
- Tests de escalabilidad para sistema de cache implementados
- Tests de fallback entre modelos LLM implementados
- Tests de límites de costo y alertas implementados
- Tests de modo de emergencia implementados
- Tests de calidad de respuestas con prompts optimizados
- Tests de stress para validar límites de costo

**Notas Adicionales:**
- Debe mantener coverage de código superior al 90%
- Debe validar que no se degrade la calidad
- Debe probar todos los escenarios de fallback
- Debe validar límites de costo en todos los casos

**Historias de Usuario Relacionadas:**
- HDU-018: Sistema de Control de Costos y Budgets
- HDU-019: Sistema de Cache Inteligente
- HDU-020: Optimización de Modelos LLM

**Tareas:**
1. Implementar tests unitarios para servicios de optimización
2. Implementar tests de integración para cache
3. Implementar tests de performance para LLM
4. Implementar tests de precisión para embeddings
5. Implementar tests de escalabilidad para cache
6. Implementar tests de fallback entre modelos
7. Implementar tests de límites de costo
8. Implementar tests de modo de emergencia
9. Implementar tests de calidad de respuestas
10. Implementar tests de stress
11. Validar coverage de código
12. Documentar resultados de testing

---

### HDU-024: Documentación y Capacitación en Optimización

**Como** miembro del equipo de desarrollo,
**Quiero** documentación completa y capacitación en optimización de costos
**Para** poder implementar y mantener las estrategias de optimización

**Criterios de Aceptación:**
- Documentación técnica de todas las optimizaciones implementadas
- Guías de usuario para monitoreo de costos creadas
- Manual de troubleshooting para problemas de costo creado
- Documentación de configuración de límites y alertas creada
- Guías de escalabilidad y crecimiento de costos creadas
- Capacitación del equipo en uso del dashboard de costos
- Documentación de mejores prácticas para desarrollo
- Guías de optimización continua de costos creadas
- Documentación de incidentes y resoluciones creada
- Wiki interno con toda la información de costos actualizada

**Notas Adicionales:**
- Debe ser accesible para todo el equipo
- Debe incluir ejemplos prácticos
- Debe ser mantenida y actualizada regularmente
- Debe incluir capacitación práctica

**Historias de Usuario Relacionadas:**
- HDU-018: Sistema de Control de Costos y Budgets
- HDU-021: Monitoreo y Alertas de Costos

**Tareas:**
1. Crear documentación técnica de optimizaciones
2. Crear guías de usuario para monitoreo
3. Crear manual de troubleshooting
4. Documentar configuración de límites y alertas
5. Crear guías de escalabilidad
6. Capacitar equipo en uso de dashboard
7. Documentar mejores prácticas
8. Crear guías de optimización continua
9. Documentar incidentes y resoluciones
10. Actualizar wiki interno
11. Revisar y validar documentación
12. Capacitar equipo en nuevas funcionalidades

---

## 3. Epics y Historias de Usuario

A continuación se presenta el backlog priorizado utilizando la metodología MoSCoW, junto con la estimación de impacto, urgencia, complejidad, riesgos y esfuerzo para cada historia de usuario.

| Código | Épica | Título | MoSCoW | Impacto/Valor | Urgencia | Complejidad | Riesgos/Dependencias | Talla | Puntos |
|--------|-------|--------|--------|--------------|----------|-------------|---------------------|-------|--------|
| HDU-001 | EP-001 | Acceso al Chatbot (Streamlit + almapi.dev) | Must | Alto | Alta | S | Baja (depende de diseño UI) | S | 2 |
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
| HDU-015 | EP-005 | Monitoreo y Alertas del Sistema | Must | Alto | Alta | S | Baja (infraestructura) | S | 2 |
| HDU-016 | EP-005 | Logging Centralizado y Auditoría | Must | Alto | Alta | M | Media (depende de HDU-015) | M | 5 |
| HDU-017 | EP-005 | Fallback Inteligente para IA | Must | Alto | Alta | S | Baja (infraestructura) | S | 2 |
| HDU-018 | EP-005 | Sistema de Control de Costos y Budgets | Must | Muy Alto | Muy Alta | L | Alta (costos, infraestructura) | L | 8 |
| HDU-019 | EP-005 | Sistema de Cache Inteligente | Should | Alto | Media | L | Media (depende de HDU-018) | L | 8 |
| HDU-020 | EP-005 | Optimización de Modelos LLM | Should | Alto | Media | L | Media (depende de HDU-018, HDU-019) | L | 8 |
| HDU-021 | EP-005 | Monitoreo y Alertas de Costos | Should | Medio | Media | M | Media (depende de HDU-018, HDU-019) | M | 5 |
| HDU-022 | EP-005 | Optimización de Embeddings y Vector Search | Should | Alto | Media | L | Media (depende de HDU-018, HDU-019) | L | 8 |
| HDU-023 | EP-005 | Testing y Validación de Optimizaciones | Should | Alto | Media | L | Media (depende de HDU-018, HDU-019, HDU-020) | L | 8 |
| HDU-024 | EP-005 | Documentación y Capacitación en Optimización | Should | Alto | Media | L | Media (depende de HDU-018, HDU-021) | L | 8 |

**Leyenda MoSCoW:**
- Must: Imprescindible
- Should: Debería tenerse
- Could: Podría tenerse
- Won't: No se implementará ahora

**Notas:**
- El esfuerzo está estimado en tallas de camiseta (XS=1, S=2, M=5, L=8, XL=13+ puntos de historia).
- Las dependencias indican qué historias deben completarse antes de abordar la siguiente.
