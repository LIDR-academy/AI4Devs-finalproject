# TSK-2.7: Recuperación Automática de Sesiones y Borrado de Datos Locales

- **Historia de Usuario Relacionada:** [US-09: Pantalla de Dictado al Camarero e Historial de Sesión Local](US-09.md)
- **Épica:** Epic 2: Advanced Reparto, Rounding & Gamification Flow
- **Capa:** Frontend (Persistence Logic)
- **Complejidad:** 2 SP
- **Dependencias:** TSK-1.2, TSK-1.6

## 1. Descripción de la Tarea
Añadir control de guardado de emergencia de la sesión activa en el almacenamiento local permanente ante cierres accidentales del navegador y proporcionar un menú en la configuración de la app para vaciar todo el historial e IndexedDB de forma segura según el RGPD.

## 2. Detalles de Implementación
1. **Auto-guardado ante cierre (BeforeUnload):**
   * Guardar la clave `active_ticket_id` en `localStorage` ante el evento `window.addEventListener('beforeunload')`.
2. **Banner de Recuperación:**
   * Al iniciar la aplicación, si `localStorage.getItem('active_ticket_id')` no está vacío, consultar en IndexedDB si el ticket está incompleto.
   * Mostrar un banner emergente: *"Tienes una cuenta a medias del restaurante X. ¿Quieres reanudarla?"* con opciones de Reanudar y Descartar.
3. **Limpieza General de Datos:**
   * Implementar función `clearAllLocalData()` que purgue todas las tablas de IndexedDB y vacíe el `localStorage`.

## 3. Criterios de Aceptación y Pruebas (DoD)
* Fichero de test `src/services/db/Recovery.test.ts` que valide:
  * Si la sesión se cierra a la mitad, al volver a inicializar la base de datos se puede recuperar el estado reactivo completo.
  * Ejecutar el borrado de datos elimina físicamente los registros y vacía las tablas de IndexedDB, comprobándolo mediante `db.tickets.count() === 0`.
