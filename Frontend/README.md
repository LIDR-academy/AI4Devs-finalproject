# BGA Business System

Sistema de Gestión Integral para BGA - Consultoría Estratégica y Operativa

## 🚀 Características Principales

- **Dashboard Intuitivo**: Panel de control con métricas clave y visualizaciones
- **Gestión de Proyectos**: Administración completa del ciclo de vida de proyectos
- **Sistema de Tareas**: Vista Kanban y lista con gestión avanzada de tareas
- **KPIs en Tiempo Real**: Seguimiento de indicadores de rendimiento
- **Gestión Financiera**: Control de gastos, viáticos y presupuestos
- **Informes Semanales**: Generación automática de reportes
- **Gestión Documental**: Archivo organizado de documentos de proyecto
- **Múltiples Temas**: Sistema de temas con modo oscuro/claro
- **Responsive Design**: Adaptado para desktop, tablet y móvil

## 🛠 Tecnologías Utilizadas

- **Frontend**: Nuxt 3, Vue 3, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Charts**: Chart.js + vue-chartjs
- **Icons**: Heroicons
- **Utilities**: VueUse, Day.js

## 📋 Requisitos Previos

- Node.js 18.0.0 o superior
- npm o yarn

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd bga-business-system
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   # o
   yarn dev
   ```

5. **Acceder a la aplicación**
   ```
   http://localhost:3000
   ```

## 🔐 Credenciales de Demo

Para acceder al sistema en modo demostración:

- **Email**: admin@bga.com
- **Contraseña**: admin123

## 📁 Estructura del Proyecto

```
bga-business-system/
├── assets/
│   └── css/
│       └── main.css           # Estilos globales
├── components/
│   ├── ui/                    # Componentes UI reutilizables
│   ├── AppSidebar.vue         # Barra lateral de navegación
│   ├── AppHeader.vue          # Encabezado principal
│   ├── AppLoading.vue         # Componente de carga
│   └── AppToast.vue           # Sistema de notificaciones
├── layouts/
│   ├── auth.vue               # Layout para autenticación
│   └── default.vue            # Layout principal
├── middleware/
│   ├── auth.ts                # Middleware de autenticación
│   └── admin.ts               # Middleware de autorización
├── pages/
│   ├── projects/              # Páginas de proyectos
│   ├── tasks/                 # Páginas de tareas
│   ├── finance/               # Páginas financieras
│   ├── index.vue              # Dashboard principal
│   ├── login.vue              # Página de login
│   └── settings.vue           # Configuración
├── plugins/
│   └── settings.client.ts     # Plugin de configuración
├── stores/
│   ├── auth.ts                # Store de autenticación
│   ├── projects.ts            # Store de proyectos
│   ├── tasks.ts               # Store de tareas
│   ├── finance.ts             # Store financiero
│   └── settings.ts            # Store de configuración
├── nuxt.config.ts             # Configuración de Nuxt
├── tailwind.config.js         # Configuración de Tailwind
└── package.json
```

## 🎨 Sistema de Temas

El sistema incluye múltiples temas predefinidos:

- **BGA Azul** (predeterminado)
- **BGA Oscuro**
- **Púrpura Moderno**
- **Esmeralda**
- **Corporativo**

### Personalización de Temas

Para crear un nuevo tema, edita el archivo `stores/settings.ts` y agrega tu configuración en el array `availableThemes`.

## 📊 Características del Dashboard

### Métricas Principales
- Proyectos activos
- Tareas pendientes
- Retorno promedio (3:1)
- Eficiencia operativa

### Visualizaciones
- Gráfico de progreso de proyectos
- Tendencias de KPIs
- Actividad reciente
- Acciones rápidas

## 🔍 Gestión de Proyectos

### Funcionalidades
- Vista de grid y lista
- Filtros avanzados por estado, cliente, gerente
- Fases del proyecto con seguimiento
- KPIs específicos por proyecto
- Gestión de equipo
- Documentos asociados

### Estados de Proyecto
- Planificación
- En Progreso
- Revisión
- Completado
- En Pausa

## ✅ Sistema de Tareas

### Vista Kanban
- Columnas por estado
- Drag & drop (futuro)
- Filtros por prioridad, asignado, proyecto
- Indicadores visuales de vencimiento

### Vista Lista
- Tabla con filtros avanzados
- Ordenación por columnas
- Acciones en lote
- Exportación de datos

### Prioridades
- Baja
- Media
- Alta
- Urgente

## 💰 Gestión Financiera

### Gastos
- Categorización automática
- Flujo de aprobación
- Comprobantes digitales
- Reportes por período

### Viáticos
- Cálculo automático (presencial/remoto)
- Aprobación por jerarquía
- Seguimiento de pagos
- Historial completo

### Categorías de Gastos
- Transporte
- Alojamiento
- Comidas
- Materiales
- Otros

## 📈 KPIs y Reportes

### Indicadores Principales
- Eficiencia operativa
- Satisfacción del cliente
- Reducción de costos
- Incremento en ventas

### Reportes Automáticos
- Informes semanales
- Reportes financieros
- Análisis de tendencias
- Exportación en múltiples formatos

## 🔒 Seguridad y Roles

### Roles de Usuario
- **Admin**: Acceso completo
- **Manager**: Gestión de proyectos y equipos
- **Consultant**: Acceso a tareas y reportes
- **Client**: Vista limitada de proyectos

### Autenticación
- Login seguro con JWT
- Middleware de protección de rutas
- Sesiones persistentes
- Logout automático

## 🌐 Responsive Design

La aplicación está optimizada para:
- **Desktop**: Experiencia completa con sidebar
- **Tablet**: Navegación adaptada
- **Mobile**: Interfaz táctil optimizada

## 🔧 Configuración Avanzada

### Variables de Entorno
```env
NUXT_API_BASE=http://localhost:3001
NUXT_PUBLIC_APP_NAME=BGA Business System
```

### Configuración de Tailwind
El archivo `tailwind.config.js` incluye:
- Colores personalizados de BGA
- Animaciones específicas
- Componentes reutilizables
- Modo oscuro

## 🚀 Despliegue

### Modo Producción
```bash
npm run build
npm run preview
```

### Deploy en Vercel/Netlify
1. Conectar repositorio
2. Configurar variables de entorno
3. Deploy automático

### Deploy en servidor propio
```bash
npm run build
npm run start
```

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Coverage
npm run test:coverage
```

## 📝 Contribución

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -am 'Agregar nueva característica'`)
4. Push a la branch (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🤝 Soporte

Para soporte técnico:
- Email: soporte@bga.com
- Documentación: [docs.bga.com](https://docs.bga.com)
- Issues: GitHub Issues

## 🔄 Roadmap

### v2.0 (Próximamente)
- [ ] Integración con API real
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Drag & drop en Kanban
- [ ] Reportes avanzados con BI
- [ ] Integración con herramientas externas
- [ ] App móvil nativa
- [ ] Colaboración en tiempo real

### v1.1 (En desarrollo)
- [ ] Mejoras en gráficos
- [ ] Más opciones de exportación
- [ ] Optimizaciones de rendimiento
- [ ] Nuevos temas
- [ ] Funciones de búsqueda avanzada

---

**Desarrollado con ❤️ para BGA Consultoría Estratégica**
