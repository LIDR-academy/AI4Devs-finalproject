---
name: backend-architect
description: "Backend Architect, Implementar Backend, Arquitectura Backend, Backend Implementation. Diseña e implementa historias técnicas de backend y bases de datos, gestiona su ciclo de vida y coordina con testing y frontend."
license: Apache-2.0
metadata:
  author: bytelovers
  version: "3.3"
---
[ACTIVATION]

Esta skill se activa cuando la tarea o el contexto del usuario requiere realizar acciones sobre backend-architect o incluye las siguientes palabras clave/desencadenadores:
**Triggers:** backend architect, implementar backend, arquitectura backend, backend implementation

---

[RULES]

1. **Strict Clean Architecture:** Separar la capa de dominio, aplicación e infraestructura.
2. **REST API Best Practices:** Usar códigos de estado HTTP correctos, nombres de recursos en plural y validación estricta de payloads.

---

[GATES]

| Condición | Acción | Destino / Fase |
| :--- | :--- | :--- |
| Falta de validación de entrada en endpoints | Implementar middleware de validación | Middleware |
| Integración de backend solicitada | Escribir lógica de servicios y endpoints de API | Código |


---

[HARNESS]

1. **Límites de Payload:** Todo endpoint de escritura debe validar el tamaño máximo del payload entrante para evitar denegación de servicio (DoS).
2. **Validación de Tipos de Entrada:** Las entradas a los controladores deben sanitizarse y validarse usando esquemas estrictos de tipado antes de pasar a la capa de aplicación.
3. **Manejo Centralizado de Errores:** Todos los errores no capturados deben ser gestionados por un middleware centralizado que devuelva un formato JSON consistente.
4. **No Filtración de Stacktraces:** Las respuestas de error en producción jamás deben exponer stacktraces o detalles de infraestructura interna.
5. **Aislamiento de Infraestructura:** La capa de dominio no debe depender de ninguna librería de base de datos o framework HTTP específico.
6. **Manejo de Transacciones:** Las operaciones de escritura que afecten a múltiples entidades deben ejecutarse dentro del contexto de una transacción atómica.
7. **Control de Conexiones:** Toda conexión a base de datos o servicio externo debe usar pool de conexiones y timeouts configurados.
8. **Seguridad de Cabeceras:** El servidor debe incluir cabeceras de seguridad HTTP estándar y políticas de CORS explícitas y restrictivas.
9. **Autenticación Obligatoria:** Todas las rutas, excepto las marcadas explícitamente como públicas, deben validar un token de autenticación válido.
10. **Autorización Basada en Roles (RBAC):** Cada acción sobre recursos sensibles debe verificar que el usuario autenticado tiene los permisos requeridos.
11. **Paginación Obligatoria:** Los endpoints que devuelvan listas de recursos deben implementar paginación con un límite máximo por defecto.
12. **Idempotencia en Escrituras:** Las mutaciones críticas (por ejemplo, cobros, creación de transacciones únicas) deben soportar llaves de idempotencia.
13. **Procedimiento de Autoverificación - Capas:** Validar que los imports en la capa de dominio no apunten a controladores o infraestructura.
14. **Procedimiento de Autoverificación - Códigos de Estado:** Comprobar que los códigos HTTP devueltos se ajustan a la semántica adecuada (200 OK, 201 Created, 400 Bad Request, etc.).
15. **Procedimiento de Autoverificación - Leaks de Recursos:** Asegurar que todos los file streams, sockets y conexiones se cierren explícitamente en bloques `finally`.
16. **Procedimiento de Autoverificación - Sanitización:** Comprobar que no hay interpolaciones SQL crudas para evitar inyección SQL.
17. **Procedimiento de Autoverificación - Logs de Seguridad:** Validar que no se escriban contraseñas o tokens en los ficheros de log.
18. **Procedimiento de Autoverificación - Manejo de Nulos:** Asegurar que los campos nulos en base de datos están mapeados correctamente a valores opcionales en el código.
19. **Procedimiento de Autoverificación - Variables de Entorno:** Verificar que todas las configuraciones sensibles se leen de variables de entorno y no de constantes hardcodeadas.
20. **Límite de Seguridad:** Máximo 3 intentos de autoverificación y auto-corrección. Si tras 3 intentos no se cumplen las condiciones, detener la ejecución y escalar la alerta.

---

[STEPS]

### Solo Mode (Interactivo / Usuario)
1. Revisar el backlog técnico y el esquema de base de datos.
2. Escribir los controladores, casos de uso y adaptadores de infraestructura para los endpoints requeridos.
3. Proteger las rutas con controles de autenticación y autorización y registrar en el contrato.

### Orchestrated Mode (Coordinado / SDD Pipeline)
1. Implementar los endpoints definidos en el contrato de API.
2. Actualizar el código fuente en `src/backend/` y validar su consistencia.
3. Escribir los cambios y actualizar el contrato.

---

[OUTPUT]

Al completar su ejecución, la skill debe:
1. Generar los artefactos y archivos resultantes especificados en su modo de ejecución.
2. Escribir/Actualizar un contrato de estado en el archivo de estado de la skill (especificado por la configuración de la tarea o en Engram). El formato del contrato debe cumplir con el esquema definido en:
   - [contract.d.ts](references/contract.d.ts)

---

[REFERENCES]

- [contract.d.ts](references/contract.d.ts) — Interfaz TypeScript del contrato de datos de la skill.
- [db-architect](file:///Users/develop/Workspace/Courses/LidrCo/AI4Devs/AI4Devs-finalproject/.agents/skills/db-architect/SKILL.md) — Proveedor del esquema de datos.
- [api-spec.md](references/api-spec.md) — Estándares y especificaciones de endpoints.
