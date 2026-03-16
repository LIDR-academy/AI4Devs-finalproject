# SDD — Etapa 5 Diseño y Construcción (IA-First)

## Estado del documento

Etapa 5 — Diseño y Construcción
Estado CERRADA
Avance Etapa 5 100%

---

## 1. Proposito de la Etapa 5

La Etapa 5 tiene como objetivo traducir la arquitectura y el modelado funcional definidos en las etapas anteriores en un diseño técnico implementable, manteniendo un enfoque IA-first.

Esta etapa define

 stack tecnológico
 estilo arquitectónico
 diseño de componentes
 contratos de eventos
 modelo de datos
 interfaces API
 estrategia de persistencia
 estrategia de pruebas
 backlog inicial de implementación

---

## 2. Principios IA-First

 ninguna decisión técnica sin justificación funcional
 separación estricta entre reglas duras y automatizaciones
 diseño orientado a eventos
 tolerancia a fallas (integradores desacoplados)
 trazabilidad completa (eventos + auditoría)
 todo debe ser construible y validable con apoyo de IA

---

## 3. Stack tecnológico definido

### Backend

 PHP 8+
 Framework Laravel
 Servidor Apache
 Arquitectura monolito modular

### Frontend

 Angular
 Tableros Kanban configurables por área

### Base de datos

 MySQL
 Modelo relacional normalizado (3FN)

### Integraciones

 Correo Office365 vía Microsoft Graph (MVP)
 WhatsApp Business API (diseñado, fuera de MVP)

### Autenticación

 Usuario y contraseña
 API externa corporativa para permisos
 Recaptcha v3

---

## 4. Alcance MVP vs Post-MVP

### Incluido en MVP

 Ingreso y comunicación por correo
 Gestión completa de casos
 Ciclos de vida configurables
 Asignaciones por área y responsable
 Kanban por área
 SLA multi-hito
 Cierre automático por inactividad (14 días)
 Encuestas al cierre (correo)
 IA en modo mixto (umbral 0.85)
 Auditoría completa

### Fuera de MVP (pero diseñado)

 Ingreso y respuesta por WhatsApp
 Encuestas enviadas por WhatsApp
 Otros canales futuros

---

## 5. Diseño de componentes

Componentes principales

 Core de Casos
 Ciclo de Vida
 Asignaciones
 Comunicaciones
 Integrador Correo
 Integrador WhatsApp (post-MVP)
 SLA y Métricas
 Cierre Automático
 Encuestas
 Asistente IA
 Configuración

Todos los componentes se comunican mediante eventos internos.

---

## 6. Diseño de eventos

Estructura base

 event_id
 event_type
 event_version
 occurred_at
 producer
 correlation_id
 payload

Eventos principales

 CasoCreado
 EstadoCambiado
 TransicionRechazada
 AreaAsignada
 ResponsableAsignado
 MensajeRegistrado
 PrimeraAccionRegistrada
 TiempoImputado
 SLAProximoAVencer
 SLAIncumplido
 CasoCerrado
 EncuestaRespondida
 SugerenciaGenerada

---

## 7. Modelo de datos (resumen)

### Entidades principales

 pais
 tipo_identificador
 contacto
 caso
 mensaje
 evidencia
 caso_estado_historial
 caso_asignacion_historial
 imputacion_tiempo
 encuesta
 encuesta_respuesta
 sugerencia_ia
 evento_log
 evento_consumo

### Reglas clave

 país registrado en contacto y caso
 RUT validado por módulo 11 y almacenado con formato xx.xxx.xxx-x
 NIT almacenado como texto numérico sin formato
 1 caso activo por contacto (todo caso no cerrado)
 caso cerrado nunca se reabre

---

## 8. Kanban configurable

 Tableros configurables por área
 Columnas asociadas a estados del ciclo
 Drag & drop solicita transición
 Motor de ciclo valida reglas duras

---

## 9. SLA multi-hito

 Modelo basado en hitos
 Hitos configurables por tipo de trabajo
 4 hitos estándar disponibles
 Alertas por vencer e incumplimiento
 SLA no cambia estados automáticamente

---

## 10. Encuestas

 Siempre se envían al cerrar un caso
 Canal de envío

   WhatsApp → link por WhatsApp (post-MVP)
   Otros casos → link por correo
 Respuesta sin login

---

## 11. IA (modo mixto)

 Solo genera sugerencias
 Nunca ejecuta reglas duras
 Umbral 0.85

    = 0.85 preselección automática
    0.85 requiere confirmación del usuario
 Sugerencias auditable

---

## 12. Estrategia de pruebas

 Unitarias reglas de negocio y validaciones
 Integración módulos y eventos
 End-to-End

   creación y gestión de casos
   kanban y transiciones
   correo entrante
   cierre automático
   encuestas
 Pruebas de idempotencia
 Pruebas de seguridad

---

## 13. Backlog inicial (resumen)

 Migraciones y catálogos
 Core de casos
 Ciclo de vida
 Asignaciones
 Comunicaciones UI
 Kanban Angular
 Integración correo (Graph)
 SLA y alertas
 Cierre automático
 Encuestas
 IA sugerencias

---

## 14. Resultado de la Etapa 5

Al finalizar esta etapa se cuenta con

 diseño técnico completo
 arquitectura estable y escalable
 contratos claros
 modelo de datos listo
 backlog implementable
 definición clara de MVP y post-MVP

---

## Estado global de etapas

 Etapa 1 — Descubrimiento 100%
 Etapa 2 — Especificación Funcional 100%
 Etapa 3 — Modelado Funcional 100%
 Etapa 4 — Arquitectura y Componentes 100%
 Etapa 5 — Diseño y Construcción 100%

---

## Próximo paso

Iniciar Etapa 6 — Ejecución  Construcción
