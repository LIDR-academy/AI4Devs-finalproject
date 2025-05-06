# SPRINT Feature 8: Mejoras Adicionales de Usabilidad y Funcionalidad

* **Objetivo del SPRINT:** Implementar funcionalidades "Could Have" que mejoran la experiencia de usuario (notificaciones, búsqueda, dashboard, exportación).
* **Feature Asociada:** Feature 8: Mejoras Adicionales de Usabilidad y Funcionalidad ([docs/features/feature-08-mejoras-adicionales-usabilidad.md](../features/feature-08-mejoras-adicionales-usabilidad.md))
* **User Stories Incluidas:** Todas son Could Have.
    * [US-41: Recibir Notificaciones Internas sobre Eventos Clave](../us/us-41-recibir-notificaciones-internas-eventos-clave.md) (5 SP)
    * [US-42: Buscar Candidatos por Nombre o Palabra Clave](../us/us-42-buscar-candidatos-nombre-palabra-clave.md) (3 SP)
    * [US-43: Visualizar Dashboard con Métricas Básicas](../us/us-43-visualizar-dashboard-metricas-basicas.md) (3 SP)
    * [US-44: Exportar Información Básica de un Candidato](../us/us-44-exportar-informacion-basica-candidato.md) (2 SP)
* **Total Story Points (Feature):** 13 SP
* **Total Horas Estimadas (Feature):** 66 horas
* **Estimación Promedio por Persona:** ~4.3 SP / 22 horas
* **Duración Estimada del SPRINT:** ~1 semana

## Tareas del SPRINT por Persona

Aquí se listan las Tareas Técnicas (TKs) para esta Feature, con una propuesta de asignación buscando equilibrar la carga.

### Jose Luis (Estimación: ~22 horas / ~4.5 SP)

* [ ] [TK-141: BE-DB: Definir Esquema BBDD para Entidad `Notificacion`](<../tasks/tk-141-BE-DB-definir-schema-bbdd-entidad-notificacion.md>) (2h / 0 SP)
* [ ] [TK-142: BE-Logic: Implementar Lógica Generación Notificaciones en Eventos Clave](<../tasks/tk-142-BE-Logic-implementar-logica-generacion-notificaciones-eventos-clave.md>) (4h / 1 SP)
* [ ] [TK-143: BE-API: Implementar Endpoints API para Gestión Notificaciones (Contar, Listar, Marcar Leídas)](<../tasks/tk-143-BE-API-implementar-endpoints-gestion-notificaciones.md>) (5h / 1 SP)
* [ ] [TK-144: BE-Logic: Implementar Lógica de Negocio para API Gestión Notificaciones](<../tasks/tk-144-BE-Logic-implementar-logica-negocio-api-gestion-notificaciones.md>) (4h / 1 SP)
* [ ] [TK-158: BE-API: Implementar Endpoint API para Exportar Datos Candidatura](<../tasks/tk-158-BE-API-implementar-endpoint-exportar-datos-candidatura.md>) (3h / 1 SP)
* [ ] [TK-159: BE-Logic: Implementar Lógica de Negocio para Generar Exportación (Datos+CV)](<../tasks/tk-159-BE-Logic-implementar-logica-negocio-generar-exportacion-datos-cv.md>) (4h / 1 SP)

### Jesus (Estimación: ~20 horas / ~4.5 SP)

* [ ] [TK-148: BE-API: Implementar Endpoint API para Búsqueda Básica de Candidaturas](<../tasks/tk-148-BE-API-implementar-endpoint-busqueda-basica-candidaturas.md>) (2h / 0 SP)
* [ ] [TK-149: BE-Logic: Implementar Lógica de Negocio para Búsqueda Básica (Multi-campo)](<../tasks/tk-149-BE-Logic-implementar-logica-negocio-busqueda-basica-multi-campo.md>) (4h / 1 SP)
* [ ] [TK-153: BE-API: Implementar Endpoint API para Datos del Dashboard Básico](<../tasks/tk-153-BE-API-implementar-endpoint-datos-dashboard-basico.md>) (2h / 0 SP)
* [ ] [TK-154: BE-Logic: Implementar Lógica de Negocio para Calcular Métricas del Dashboard](<../tasks/tk-154-BE-Logic-implementar-logica-negocio-calcular-metricas-dashboard.md>) (4h / 1 SP)
* [ ] [TK-150: FE-UI: Añadir Campo de Búsqueda Global en Layout Principal](<../tasks/tk-150-FE-UI-anadir-campo-busqueda-global-layout-principal.md>) (2h / 0 SP)
* [ ] [TK-151: FE-UI: Crear Página/Componente para Mostrar Resultados de Búsqueda](<../tasks/tk-151-FE-UI-crear-pagina-componente-mostrar-resultados-busqueda.md>) (4h / 1 SP)

### David (Estimación: ~24 horas / ~4 SP)

* [ ] [TK-145: FE-UI: Añadir Indicador Notificaciones (Campana+Badge) a Layout Principal](<../tasks/tk-145-FE-UI-anadir-indicador-notificaciones-layout-principal.md>) (2h / 0 SP)
* [ ] [TK-146: FE-UI: Crear Componente Panel/Lista de Notificaciones](<../tasks/tk-146-FE-UI-crear-componente-panel-lista-notificaciones.md>) (4h / 1 SP)
* [ ] [TK-147: FE-Logic: Implementar Lógica Frontend para API Notificaciones](<../tasks/tk-147-FE-Logic-implementar-logica-frontend-api-notificaciones.md>) (5h / 1 SP)
* [ ] [TK-152: FE-Logic: Implementar Lógica Frontend para Búsqueda (Llamada API y Navegación)](<../tasks/tk-152-FE-Logic-implementar-logica-frontend-busqueda-llamada-api-navegacion.md>) (4h / 1 SP)
* [ ] [TK-155: FE-UI: Crear Página/Componente Dashboard Básico](<../tasks/tk-155-FE-UI-crear-pagina-componente-dashboard-basico.md>) (2h / 0 SP)
* [ ] [TK-156: FE-UI: Implementar Widgets de Métricas (Números y Gráfico Básico)](<../tasks/tk-156-FE-UI-implementar-widgets-metricas-numeros-grafico-basico.md>) (5h / 1 SP)
* [ ] [TK-157: FE-Logic: Implementar Lógica Frontend para API del Dashboard](<../tasks/tk-157-FE-Logic-implementar-logica-frontend-api-dashboard.md>) (2h / 0 SP)
* [ ] [TK-160: FE-UI: Añadir Botón "Exportar Datos" a Vista Detalle Candidatura](<../tasks/tk-160-FE-UI-anadir-boton-exportar-datos-detalle-candidatura.md>) (1h / 0 SP)
* [ ] [TK-161: FE-Logic: Implementar Lógica Frontend para Iniciar Descarga Exportación](<../tasks/tk-161-FE-Logic-implementar-logica-frontend-iniciar-descarga-exportacion.md>) (1h / 0 SP)

## Coordinación y Dependencias Clave

* **Notificaciones (US-41):** Implica DB (TK-141), BE Logic (TK-142, 144), BE API (TK-143), FE UI (TK-145, 146) y FE Logic (TK-147). Requiere coordinación transversal.
* **Búsqueda (US-42):** Implica BE API (TK-148), BE Logic (TK-149), FE UI (TK-150, 151) y FE Logic (TK-152).
* **Dashboard (US-43):** Implica BE API (TK-153), BE Logic (TK-154), FE UI (TK-155, 156) y FE Logic (TK-157).
* **Exportar (US-44):** Implica BE API (TK-158), BE Logic (TK-159), FE UI (TK-160) y FE Logic (TK-161). Depende del almacenamiento de CVs (TK-043 en Feature 3).

## Entregable del SPRINT (Definition of Done para la Feature 8)

* El esquema de base de datos para notificaciones está creado.
* Los endpoints y lógica backend para gestionar notificaciones, búsqueda básica de candidatos, obtener datos del dashboard y exportar datos/CV están implementados.
* La lógica backend para generar notificaciones en eventos clave está implementada.
* La interfaz de usuario y la lógica frontend para visualizar y gestionar notificaciones están implementadas.
* La interfaz de usuario y la lógica frontend para buscar candidatos y mostrar resultados están implementadas.
* La interfaz de usuario y la lógica frontend para visualizar el dashboard básico están implementadas.
* La interfaz de usuario y la lógica frontend para exportar datos de candidato están implementadas.
* Las funcionalidades de notificaciones, búsqueda, dashboard y exportación están disponibles en el ATS MVP.
* Todas las pruebas unitarias y de integración relevantes para esta Feature han pasado.

---