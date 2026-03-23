## **Propósito**

El planifications-service gestiona la **definición de plantillas operativas** y la **materialización programada** de ejecuciones (services): crea y mantiene expediciones/plantillas basadas en rutas aprobadas, genera planificaciones para ventanas de fechas (materializando instancias ejecutables de servicio sobre las cuales los pasajeros pueden reservar), aplica reglas de capacidad y negocio, y orquesta la asignación/planificación operativa (incluyendo intentos de asignación automática) en coordinación con operadores y motores de optimización; actúa como el puente entre la definición estática (ruta/expedition) y la ejecución operativa (service) y publica los eventos necesarios para que bookings, ops y facturación actúen.

**Alcance**

* **Modelar expediciones/plantillas**: definir templates derivados de una route\_snapshot que contienen las paradas activas, ventanas horarias recurrentes y reglas (capacidad, ventanas de servicio, paradas activas).

* **Generar planificaciones**: materializar esos templates en un calendario concreto (rango de fechas, excepciones, días no laborables) y crear las instancias operativas (Service) para cada ejecución.

* **Orquestar asignaciones**: intentar asignar recursos operativos (vehículo/conductor) según reglas y/o sugerencias del brainer-service y publicar ServiceScheduled / AsignacionHecha.

* **Gestionar cambios**: re-planificar y propagar cambios cuando la expedición o la ruta cambian (por ejemplo actualizar snapshots), o cuando reservas/operaciones requieren reconfiguración.

* **Soportar estados y jobs**: exponer jobs asíncronos (plan generation jobs) y mantener trazabilidad de la generación y actualizaciones de servicios.

* **Publicar eventos** que permitan a booking-service, traffic-control, operators-service y billing-service reaccionar a la creación, actualización, cancelación o asignación de servicios.

**Entidades conceptuales**

**Expedition (Expedición / Template):** entidad que representa la **plantilla operativa** basada en una route\_snapshot: define qué paradas son activas, el orden, configuraciones por parada (dwell, alias, reglas de pick-up/drop-off) y parámetros recurrentes (p. ej. días de la semana, horario base). La Expedition es la unidad reutilizable que describe “cómo” se ejecuta una ruta de forma repetida y sirve como insumo para generar planificaciones concretas.

**Planification (Planificación / Planning):** objeto que describe la **intención de materializar una Expedition** en un conjunto de Service para una ventana de fechas concreta (ej.: del 1 al 30 de junio), incluyendo excepciones, reglas de repetición y parámetros operativos; la Planification orquesta el job que generará las Service (las instancias ejecutables) y mantiene el estado del proceso de generación/actualización.

**Service (Instancia / Servicio):** la **instancia ejecutable** concreta resultante de materializar una Planification (o preparada directamente para un service\_id ya existente): representa un recorrido en una fecha/hora concreta con su conjunto de route\_stops fijado, capacidad y estado operativo (scheduled, confirmed, running, completed, cancelled). Las Service son a las que los pasajeros realmente reservan y en las que se asignan vehículos/conductores.

**ServiceAssignment (Asignación):** representa el resultado de intentar asignar recursos operativos a un Service: contiene la referencia al vehículo y conductor asignados, el estado de la asignación (pending, assigned, rejected), las razones/proveedores de la decisión (ej. heurística local o sugerencia del brainer-service) y sirve para auditar y coordinar la ejecución con operators-service.

**RouteSnapshotReference (vínculo lógico):** una entidad conceptual que liga la Expedition o Service con la route\_snapshot usada para construirla; garantiza que la materialización se base en la geometría y configuración correctas, preservando reproducibilidad. (Se modela como referencia en Expedition/Service.)

**PlanGenerationJob (Job de generación):** representa el trabajo asíncrono que toma una Planification/Expedition y materializa las Service para un rango de fechas, incluyendo estado del job, intentos, errores y resultados; permite reintentos controlados, observabilidad del proceso y rollback si es necesario.

**CapacityRule / AllocationRule:** entidad que encapsula las políticas de capacidad y reglas de asignación aplicables a una Expedition o Planification (por ejemplo plazas máximas, reglas por segmento, restricciones por cliente), utilizada tanto para validar la generación de servicios como para guiar la asignación automática y para evaluar si nuevas reservas pueden aceptarse.

**PlanificationHistory / AuditEntry:** registro append-only que captura cambios relevantes sobre Expedition, Planification, Service y asignaciones (creaciones, publicaciones, actualizaciones, cancelaciones), usado para trazabilidad, soporte y para detectar impactos cuando se ajusta una planificación.

