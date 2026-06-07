# TSK-3.4: Administrador de Sincronización Bidireccional (Sync Manager)

- **Historia de Usuario Relacionada:** [US-12: Respaldo Cloud de Tickets e Historial de Eventos](US-12.md)
- **Épica:** Epic 3: Cloud Convenience & Connectivity Flow
- **Capa:** Frontend (Sync Logic)
- **Complejidad:** 5 SP
- **Dependencias:** TSK-1.2, TSK-3.2

## 1. Descripción de la Tarea
Implementar el motor de sincronización que concilie los tickets de la base de datos local (Dexie.js) con la base de datos de la nube (Firestore) tras la autenticación del usuario. Debe resolver conflictos mediante la estrategia de "El último en escribir gana" (Last-Write-Wins) y migrar los tickets anónimos existentes.

## 2. Detalles de Implementación
1. **Lógica de Conciliación:**
   * Crear `src/services/db/SyncManager.ts`.
   * Implementar `migrateAnonymousTickets(uid: string): Promise<void>`:
     * Lee todos los registros de Dexie con `syncStatus !== 'synced'`.
     * Convierte y asocia el `userId = uid` a los registros.
     * Los escribe en Firestore en bloque (`writeBatch`).
     * Actualiza el estado local de IndexedDB a `'synced'`.
2. **Sincronización en Background:**
   * Escuchar eventos de red (`online`). Al restaurar la conexión, buscar registros modificados en IndexedDB (`syncStatus: 'pending-update'`) y subirlos a la nube.
   * Utilizar la propiedad `lastUpdated` (marca de tiempo epoch) para decidir la precedencia de datos en caso de diferencias entre local y nube.

## 3. Criterios de Aceptación y Pruebas (DoD)
* Fichero de test `src/services/db/SyncManager.test.ts`:
  * Validar la migración exitosa de 3 tickets anónimos al iniciar sesión con una cuenta real.
  * Validar resolución de conflicto: Si un ticket local tiene `lastUpdated` anterior al de la nube, el registro local es sobreescrito con los datos de la nube. Si es posterior, el de la nube se actualiza.
