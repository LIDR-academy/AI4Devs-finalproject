# TSK-3.3: Sincronización en Nube de Contactos y Grupos Frecuentes

- **Historia de Usuario Relacionada:** [US-11: Sincronización Cloud de Amigos y Grupos Frecuentes](US-11.md)
- **Épica:** Epic 3: Cloud Convenience & Connectivity Flow
- **Capa:** Frontend & Backend (Firestore DB)
- **Complejidad:** 3 SP
- **Dependencias:** TSK-3.2

## 1. Descripción de la Tarea
Permitir a los usuarios registrados guardar su agenda local de contactos y grupos de pago frecuentes en Firestore, permitiendo recuperarlos al cambiar de dispositivo.

## 2. Detalles de Implementación
1. **Integración con Firestore:**
   * Crear `src/services/firebase/contactsFirestore.ts`.
   * Implementar `syncContactsToCloud(contacts: Participant[]): Promise<void>` que guarde la libreta de direcciones en la ruta `/users/{uid}/contacts`.
   * Implementar `fetchContactsFromCloud(): Promise<Participant[]>` que recupere la libreta al iniciar sesión.
2. **Manejo Offline de Contactos:**
   * Los contactos se leen y escriben en IndexedDB (`db.participants`) primero, y el Sync Manager encolará la subida a Firestore si no hay cobertura de red activa.

## 3. Criterios de Aceptación y Pruebas (DoD)
* Fichero de test `src/services/firebase/contactsFirestore.test.ts` que valide:
  * Solo los usuarios autenticados y no anónimos pueden escribir en la colección `/users/{uid}/contacts`.
  * La lectura de contactos desde Firestore mezcla y actualiza correctamente la tabla local de participantes sin duplicados.
