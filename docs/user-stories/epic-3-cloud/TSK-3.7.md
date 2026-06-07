# TSK-3.7: Reglas de Seguridad de Base de Datos y Despliegue de Firebase

- **Historia de Usuario Relacionada:** [US-12: Respaldo Cloud de Tickets e Historial de Eventos](US-12.md)
- **Épica:** Epic 3: Cloud Convenience & Connectivity Flow
- **Capa:** Backend e Infraestructura (Seguridad)
- **Complejidad:** 2 SP
- **Dependencias:** TSK-3.3, TSK-3.4

## 1. Descripción de la Tarea
Escribir las reglas de acceso de Cloud Firestore (`firestore.rules`) y los flujos de despliegue automatizados para asegurar el cumplimiento del RGPD, impidiendo que ningún usuario lea o manipule datos que no le pertenecen.

## 2. Detalles de Implementación
1. **Reglas de Firestore (`firestore.rules`):**
   * Definir que los documentos en `/tickets/{ticketId}` solo puedan ser leídos, modificados o borrados si el `request.auth.uid` coincide con el campo `userId` del documento.
   * Definir que la ruta `/users/{uid}/contacts` sea 100% privada para el usuario autenticado con ese mismo `uid`.
2. **Despliegue:**
   * Configurar `firebase.json` y los scripts de build en `package.json` para empaquetar y subir las reglas y funciones en un solo comando: `npm run deploy`.

## 3. Criterios de Aceptación y Pruebas (DoD)
* Test suite de reglas de seguridad (`tests/firestore-rules.test.ts`) ejecutado mediante el emulador de Firebase, comprobando:
  * Un usuario no autenticado no puede leer ningún ticket.
  * El Usuario A no puede acceder a un ticket del Usuario B (retorna error `PERMISSION_DENIED`).
  * Un usuario autenticado puede leer y escribir sus propios tickets con normalidad.
