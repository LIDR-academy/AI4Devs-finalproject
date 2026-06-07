# TSK-3.1: Configuración del SDK de Firebase y Variables de Entorno

- **Historia de Usuario Relacionada:** [US-12: Respaldo Cloud de Tickets e Historial de Eventos](US-12.md)
- **Épica:** Epic 3: Cloud Convenience & Connectivity Flow
- **Capa:** Backend e Infraestructura (Client Setup)
- **Complejidad:** 2 SP
- **Dependencias:** TSK-1.1

## 1. Descripción de la Tarea
Instalar el SDK de Firebase en el cliente frontend y configurar los entornos de desarrollo, pre-producción y producción utilizando variables de entorno protegidas de Vite (`.env`).

## 2. Detalles de Implementación
1. **Instalación:**
   * Añadir dependencia `"firebase": "^10.0.0"` al `package.json`.
2. **Fichero de Configuración:**
   * Crear `src/services/firebase/firebaseConfig.ts` para inicializar la app:
     ```typescript
     import { initializeApp } from 'firebase/app';
     import { getAuth } from 'firebase/auth';
     import { getFirestore } from 'firebase/firestore';
     
     const firebaseConfig = {
       apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
       authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
       projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
       storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
       messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
       appId: import.meta.env.VITE_FIREBASE_APP_ID
     };
     
     export const app = initializeApp(firebaseConfig);
     export const auth = getAuth(app);
     export const firestore = getFirestore(app);
     ```
3. **Variables locales de desarrollo:**
   * Crear `.env.development` con credenciales de prueba seguras.

## 3. Criterios de Aceptación y Pruebas (DoD)
* El proyecto compila limpiamente y no expone claves secretas en texto plano en el repositorio Git (añadir `.env` a `.gitignore`).
* Validar que la aplicación carga el entorno adecuado según se ejecute en desarrollo (`vite`) o producción.
