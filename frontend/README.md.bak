# Frontend Buscadoc

Este proyecto implementa el frontend del sistema Buscadoc, siguiendo  las mejores prácticas de seguridad, internacionalización y calidad de código.

## Estructura del proyecto

```
frontend/
│
├── src/
│   ├── components/      # Componentes Vue reutilizables
│   ├── views/           # Vistas principales (páginas)
│   ├── services/        # Servicios para consumo de API y lógica de negocio
│   ├── router/          # Configuración de rutas (Vue Router)
│   └── locales/         # Archivos de internacionalización (i18n)
│
├── .env                 # Variables de entorno (no subir al repositorio)
├── .eslintrc.js         # Configuración ESLint
├── .prettierrc          # Configuración Prettier
├── package.json         # Dependencias y scripts
├── cypress/             # Pruebas end-to-end
│   ├── e2e/             # Archivos de pruebas E2E
│   └── cypress.config.js
├── docs/                # Documentación técnica y tickets
└── .github/
    └── workflows/       # Configuración CI/CD (GitHub Actions)
```

## Variables de entorno

Configura el archivo `.env` en la raíz de `frontend` con los siguientes valores de ejemplo:

```env
VUE_APP_API_URL=http://localhost:3000
VUE_APP_I18N_LOCALE=es
VUE_APP_FIREBASE_API_KEY=your_firebase_api_key
VUE_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VUE_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
VUE_APP_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VUE_APP_FIREBASE_APP_ID=your_firebase_app_id
```

> **Nota:** No subas el archivo `.env` al repositorio. Consulta la documentación para variables adicionales.

## Instalación y desarrollo

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Ejecuta el entorno de desarrollo:
   ```bash
   npm run dev
   ```
3. Ejecuta pruebas E2E con Cypress:
   ```bash
   npm run test:e2e
   ```
4. Lint y formato de código:
   ```bash
   npm run lint
   npm run format
   ```
5. Despliegue de producción:
   ```bash
   npm run build
   ```

## Pruebas end-to-end

Las pruebas E2E se encuentran en la carpeta `cypress/e2e/`. Utiliza Cypress para validar los flujos principales del sistema.

## Arquitectura

- **Componentes clave:**  
  - Portal público, portal paciente, portal médico, panel de administración.
  - Consumo de API REST para casos de uso: búsqueda, agendamiento, gestión de agenda, valoración, gestión de usuarios y especialidades.
- **Internacionalización:**  
  - Configurada con `vue-i18n`, español por defecto y soporte para inglés.
- **Seguridad y LFPDPPP:**  
  - Cumple con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México).
  - Los datos personales se gestionan de forma segura y conforme a la normativa.

## Referencias y documentación

- [Product Requirement Document](../docs/product_requirement_document.md)
- [Diagrama de arquitectura](../docs/planificacion_y_documentacion/diagramas/diagrama_visual_arquitectura.md)
- [Modelo de datos](../docs/planificacion_y_documentacion/diagramas/modelo_de_datos.md)
- [Tickets de implementación](./docs/tickets/tickets_12-14.md)

---
