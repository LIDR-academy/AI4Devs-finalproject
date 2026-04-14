# Modelo de casos de uso — MyTreeLibrary

Documento de análisis alineado con la descripción del producto en [readme.md](../../readme.md) y con las reglas de negocio acordadas (tres tipos de usuario, notificaciones por correo, IA).

## Diagrama (PlantUML)

Fichero fuente: [use-case-model.puml](use-case-model.puml).

Para visualizarlo: extensión PlantUML en el IDE, [plantuml.com](https://www.plantuml.com/plantuml) o CLI `plantuml use-case-model.puml`.

## Actores

| Actor | Descripción |
|-------|-------------|
| **Público** | Visitante sin sesión en la plataforma. |
| **Colaborador** | Usuario autenticado que participa en el catálogo de árboles. Generaliza a Público (disponen de los mismos casos de uso públicos). |
| **Administrador** | Usuario autenticado con permisos de gestión. Generaliza a Colaborador. |
| **Sistema (MyTreeLibrary)** | Ejecución automática interna (p. ej. envío de correos tras eventos de negocio). |
| **Proveedor de IA** | Sistema externo: identificación orientativa y chat. |
| **Servidor SMTP** | Sistema externo para entrega de correo. |

## Resumen de casos de uso

| ID | Nombre | Actor principal | Autenticación | Objetivo / resultado |
|----|--------|-----------------|---------------|----------------------|
| UC-01 | Consultar árboles publicados y mapa | Público | No | Visualizar fichas y localización de ejemplares públicos. |
| UC-02 | Registrarse para recibir notificaciones (e-mail) | Público | No | Alta de suscripción por correo (sin cuenta de Colaborador), según flujo de confirmación definido en implementación. |
| UC-03 | Registrar árbol | Colaborador | **Sí** | Crear ficha con datos, fotos y ubicación; opcionalmente publicar para consulta pública. |
| UC-04 | Modificar árboles registrados por el usuario | Colaborador | **Sí** | Actualizar solo los árboles dados de alta por ese colaborador. |
| UC-05 | Identificar árbol asistido por IA (imagen) | Colaborador | **Sí** | Extensión opcional en UC-03 / UC-04: sugerencia orientativa de especie a partir de imagen (no sustituye validación experta). |
| UC-06 | Consultar asistente IA (chat) | Colaborador | **Sí** | Interacción conversacional con el asistente. |
| UC-07 | Gestionar tablas de catálogo (maestros) | Administrador | **Sí** | Administrar datos de referencia (p. ej. taxonomía, vocabularios) que alimentan el catálogo. |
| UC-08 | Gestionar solicitudes de notificación | Administrador | **Sí** | Dejar inactivas o eliminar registros de suscripción a notificaciones. |
| UC-09 | Notificar por correo a suscriptores | Sistema | N/A | Tras la **alta** (creación) de ficha de árbol, informar por e-mail a suscriptores activos. En el MVP **no** se notifica por modificaciones posteriores (regla R7). |

## Relaciones UML aplicadas

| Relación | Uso en el modelo |
|----------|------------------|
| **Generalización de actores** | Colaborador → Público; Administrador → Colaborador (el especializado hereda el comportamiento del general). |
| **«extend»** | UC-05 extiende UC-03 y UC-04 en puntos de extensión donde el usuario aporta o revisa imagen para identificación asistida. |
| **«include»** | UC-03 incluye UC-09: tras el alta de árbol se dispara el proceso de notificación (puede ser no-op si no hay destinatarios). UC-04 **no** incluye UC-09 en el MVP (las modificaciones no generan correo a suscriptores). |

## Reglas y supuestos explícitos

1. **Autenticación:** UC-03 … UC-08 requieren usuario autenticado (Keycloak / JWT en la arquitectura prevista). UC-01 y UC-02 son anónimos.
2. **UC-09 y modificaciones:** en el MVP **solo el alta** (UC-03) dispara notificación a suscriptores; las ediciones (UC-04) **no** lo hacen (regla R7 en [data-model.md](../data-model/data-model.md)).
3. **UC-07 “tablas de catálogo”:** se entienden **maestros de dominio** gestionados por administración; no confundir con el CRUD de árboles del colaborador (UC-03 / UC-04).
