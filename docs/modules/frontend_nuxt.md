# Módulo Frontend: Especificación Técnica

## 1. Stack Tecnológico
- **Framework Principal:** Nuxt.js 3 (Vue 3)
- **Lenguaje:** TypeScript
- **Estilado:** Tailwind CSS (Recomendado para desarrollo rápido)
- **Gestión de Estado:** Pinia
- **Cliente HTTP:** $fetch / ohmyfetch (Nativo de Nuxt)
- **Comunicación Real-time:** Socket.io-client

## 2. Objetivo
Proveer una interfaz de usuario reactiva, rápida y optimizada para SEO (en las partes públicas) que permita a arquitectos y clientes visualizar planos, gestionar proyectos y colaborar en tiempo real. Actúa como consumidor de la API Backend.

## 3. Patrones y Buenas Prácticas
- **Atomic Design Simplificado:** Organización de componentes en base a su complejidad (atoms, molecules, organisms) dentro de la carpeta `components`.
- **Composables (Hooks):** Toda lógica de negocio reutilizable (auth, gestión de planos, lógica de sockets) se extrae a la carpeta `composables/` para mantener los componentes limpios ("Skinny Components").
- **Tipado Estricto:** Uso de interfaces compartidas para modelos de datos (Proyecto, Usuario, Pin).
- **Middlewares:** Para protección de rutas (AuthGuard) y redirecciones.

## 4. Estructura de Directorios Propuesta

```bash
frontend/
├── assets/             # Recursos estáticos (imágenes, fuentes, css global)
├── components/         # Componentes Vue (Auto-importados)
│   ├── common/         # Botones, Modales, Inputs genéricos
│   ├── layout/         # Header, Sidebar
│   └── viewer/         # Componentes específicos del visor de planos (Canvas, Layers control)
├── composables/        # Lógica de negocio encapsulada (Hooks)
│   ├── useAuth.ts
│   ├── usePlans.ts
│   └── useSocket.ts    # Lógica de conexión websocket
├── layouts/            # Plantillas de diseño (Default, Auth, Dashboard)
├── middleware/         # Guardas de navegación (ej. auth.ts)
├── pages/              # Rutas de la aplicación (File-system routing)
│   ├── index.vue       # Landing
│   ├── login.vue
│   └── dashboard/
│       ├── index.vue
│       └── project/
│           └── [id].vue # Visor del proyecto
├── plugins/            # Configuraciones iniciales (Socket.io, librerías UI)
├── public/             # Archivos públicos estáticos
├── stores/             # Estado global con Pinia
│   ├── user.ts
│   └── ui.ts
├── types/              # Definiciones TypeScript
└── nuxt.config.ts      # Configuración del framework
```

## 5. Estrategia de Comunicación
- **API REST:** El frontend se comunica con `http://api.trace.com/api/v1` mediante proxys de Nuxt o llamadas directas con token JWT.
- **WebSockets:** Conexión persistente para recibir eventos como `PLAN_PROCESSED` o `NEW_COMMENT`.
