# HU-012 — Gestión de suscripciones a notificaciones

## 1. Validación de la información existente

| Aspecto | Estado |
|---------|--------|
| **Título** | Correcto y alineado con el backlog: *Gestión de suscripciones a notificaciones*. |
| **Formato “Como… quiero… para…”** | Correcto en el backlog; la redacción refinada lo mantiene en una sola frase sin notas al pie en el cuerpo de la historia. |
| **Estimación (S/M/L)** | **M** coherente con el backlog; no se modifica. |
| **Prioridad** | **Media** coherente con el backlog; no se modifica. |
| **Inconsistencias detectadas** | **UC-08**, modelo §2 y **OpenAPI** alineados: **GET** `/api/notifications/subscriptions` (paginado, filtro opcional `estadoSuscripcion`, esquema de ítem y página) y **PATCH** `/api/notifications/subscriptions/{subscriptionId}` con cuerpo `{ "estadoSuscripcion": "ACTIVA" \| "CANCELADA" }`, respuesta **200** idempotente y errores **Problem** (ver [openapi.yaml](../api/openapi.yaml)). La implementación en **notification-service** debe mantenerse acorde a ese contrato. |
| **Tamaño / división** | Acotada a gestión **ADMIN** sobre **SUSCRIPTOR** y pantalla prevista; reportes avanzados, exportaciones o motor de plantillas de correo quedan fuera. |

---

## 2. Historia refinada

| Campo | Valor |
|-------|--------|
| **ID** | HU-012 |
| **Épica** | Administración |
| **Título** | Gestión de suscripciones a notificaciones |
| **Estimación de complejidad** | M |
| **Prioridad** | Media |

**Historia de usuario**

Como usuario con rol administrador, quiero consultar y gestionar los registros de suscripción a notificaciones por correo, para administrar el servicio y las necesidades de privacidad descritas en el modelo de datos del producto.

- **Entregable de la historia:** Capacidad para un **ADMIN** autenticado de **listar** suscriptores de notificaciones y **cambiar su estado de suscripción** entre **ACTIVA** y **CANCELADA** según las reglas del modelo de datos del MVP, expuesta a través de la API detrás del gateway con JWT y reflejada en la aplicación en la ruta de administración prevista para suscripciones; sin implementar en esta historia el envío de correos ni el consumo de eventos de catálogo.

### Alcance

#### Incluye

- **Consulta administrativa** de registros de **SUSCRIPTOR** (correo y estado de suscripción acorde al modelo lógico descrito en documentación de datos) para usuarios con rol **ADMIN**, vía API en el prefijo de notificaciones bajo el **API Gateway** con **Bearer** válido, coherente con el listado resumido en el contrato HTTP publicado.
- **Transiciones de estado** permitidas en el MVP según modelo de datos: pasar una suscripción a **CANCELADA** desde la gestión administrativa y **reactivar** una suscripción previamente **CANCELADA** volviendo a **ACTIVA**, alineado con la regla de que el alta público no reactiva filas canceladas y que la reactivación corresponde solo a administración.
- **Interfaz de administración** en la ruta prevista en el diseño de experiencia para el perfil **ADMIN** (gestión de suscripciones), con manejo básico de listado, errores de autorización y confirmación o feedback acorde a las convenciones del frontend del proyecto.
- Cumplimiento de la matriz de roles: solo **ADMIN** accede a estas operaciones; colaborador y público quedan excluidos.

#### Queda fuera de esta historia

- **Alta pública** de suscripción por correo sin autenticación (**UC-02**, **HU-004**): ya cubierta; esta historia no duplica el POST público.
- **Notificación por correo** al crear ficha, consumo de **Kafka**, persistencia de **EVENTO_CATALOGO** y envíos (**UC-09**, **HU-007**): la gestión de suscriptores no implementa la cola ni el SMTP de avisos.
- **Rate limiting, captcha u otro endurecimiento** del endpoint público de alta: riesgo aceptado en MVP según documentación de modelo de datos; no es objeto de esta historia.
- **Maestros taxonómicos del catálogo** (**UC-07**, **HU-011**): no forman parte del dominio de suscripción.
- **Eliminación física** de filas **SUSCRIPTOR**: explícitamente **fuera** del MVP; la baja operativa es solo **CANCELADA**. Políticas futuras de anonimización o archivo de históricos de envío quedan fuera de esta historia.

### Dependencias

- **Autenticación OIDC y JWT** con rol **ADMIN** (**HU-001**): requisito para invocar endpoints protegidos del gateway hacia **notification-service**.
- **Existencia del modelo y persistencia** de **SUSCRIPTOR** en el esquema **notification** y alta pública previa o datos de prueba (**HU-004**), de modo que la lista y las transiciones de estado tengan filas sobre las que operar.
- **API Gateway** enrutando el prefijo de notificaciones con validación de JWT para rutas autenticadas, según arquitectura descrita en el readme.
- Alineación del contrato **OpenAPI** y de la implementación en **notification-service** para **GET** administrativo y **PATCH** de estado (cerrados en refinamiento; ver [openapi.yaml](../api/openapi.yaml)).

### Riesgos

- **Deriva contrato / código:** con **OpenAPI** ya detallado, el riesgo residual es que futuros cambios en SPA o servicio no actualicen el YAML o los DTOs en paralelo.
- **Privacidad y minimización:** el MVP no amplía la recogida más allá del **correo** y los campos del modelo (**estado**, marcas temporales); la UI **ADMIN** no debe pedir ni exponer datos personales adicionales; coherencia con [readme.md](../../readme.md) §3.5 y con el contrato OpenAPI.

### Aclaraciones cerradas (contrato HTTP)

- **Rutas y verbos:** **PATCH** sobre el recurso `/api/notifications/subscriptions/{subscriptionId}` con cuerpo `{ "estadoSuscripcion": "ACTIVA" \| "CANCELADA" }`; respuesta **200** con el ítem actual (`subscriptionId`, `email`, `estadoSuscripcion`, `altaEn`, `confirmadoEn`, `bajaEn`).
- **GET administrativo:** paginación `page` / `size` (misma forma de página que maestros de catálogo en OpenAPI), filtro opcional `estadoSuscripcion`, orden por defecto en servidor **altaEn** descendente.
- **Idempotencia:** si el estado solicitado ya es el persistido, **PATCH** responde **200** con el ítem sin tratarlo como error.

## 3. Criterios de aceptación (BDD)

### Referencias

**UC-08**; modelo de datos §2 (**estado_suscripcion**, **ACTIVA**, **CANCELADA**, transiciones y rol **ADMIN**); readme (jerarquía de páginas **ADMIN**, ruta de gestión de suscripciones); **OpenAPI** `/api/notifications/subscriptions` (**GET**) y `/api/notifications/subscriptions/{subscriptionId}` (**PATCH**); **HU-004** como dependencia de datos de suscripción pública.

### Escenario 1 — Listado solo para administrador

- **Dado que** existen uno o más registros de suscriptor en el sistema  
- **Cuando** un usuario con rol **ADMIN** autenticado accede a la gestión de suscripciones o al listado vía API con token válido  
- **Entonces** puede ver el listado paginado o acotado según lo acordado en el contrato cerrado, con los campos necesarios para gestión y sin exponer operaciones de administración a roles no administradores.

### Escenario 2 — Cancelar suscripción activa

- **Dado que** existe un suscriptor en estado **ACTIVA**  
- **Cuando** un **ADMIN** solicita **PATCH** con `estadoSuscripcion` **CANCELADA** según el contrato  
- **Entonces** el estado pasa a **CANCELADA** sin borrar la fila, el registro deja de considerarse válido para envíos futuros según la regla de negocio de suscripción válida, y la respuesta es coherente con el contrato (códigos y cuerpo definidos).

### Escenario 3 — Reactivar suscripción cancelada

- **Dado que** existe un suscriptor en estado **CANCELADA** y el alta público no permite reactivación por ese canal  
- **Cuando** un **ADMIN** solicita **PATCH** con `estadoSuscripcion` **ACTIVA** según el contrato  
- **Entonces** el estado vuelve a **ACTIVA** y el suscriptor puede ser tenido en cuenta de nuevo como destinatario válido según las reglas de notificación por alta de ficha cuando esas notificaciones estén implementadas, sin que el flujo público haya modificado el estado por sí solo.

## 4. Evaluación INVEST (resumen)

| Criterio | Comentario |
|----------|------------|
| **Independiente** | Parcialmente: depende de identidad **ADMIN** y de existencia de datos de **HU-004**; el valor es independiente de **HU-007** una vez definido el modelo de estados. |
| **Negociable** | Parcialmente: el contrato base (GET + PATCH, paginación, idempotencia) ya está fijado en **OpenAPI**; pueden negociarse extensiones (filtros adicionales, orden explícito vía query) sin contradecir el MVP. |
| **Valiosa** | Sí: cumplimiento de **UC-08** y cierre del ciclo de privacidad y operación sobre suscriptores descrito en documentación de datos. |
| **Estimable** | Sí: backlog **M**; la incertidumbre baja al cerrar OpenAPI y verbos de transición. |
| **Small** | Tamaño medio acotado a listado y transiciones de estado más pantalla admin; reportes o analítica ampliarían el alcance. |
| **Testable** | Sí: verificable por API con JWT de **ADMIN**, por estados en base de datos y por pruebas de interfaz de la ruta de administración. |

## 5. Esfuerzo estimado de implementación

Orden de magnitud **medio** para **notification-service** (consulta paginada, transiciones de estado con validaciones, seguridad por rol, pruebas) más **frontend** (vista en ruta de administración, tabla o listado, acciones y manejo de errores) y actualización del contrato **OpenAPI** donde falte detalle. Cifra concreta de persona-días: **no fijada en fuentes**; depende del equipo.
