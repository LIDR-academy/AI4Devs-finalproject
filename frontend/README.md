# Frontend - Sistema Integral de Gestión Quirúrgica

Aplicación frontend desarrollada con React + TypeScript + Vite.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/      # Componentes reutilizables
│   │   └── layout/      # Componentes de layout (Header, Sidebar, etc.)
│   ├── contexts/        # Contextos de React (AuthContext, etc.)
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Páginas de la aplicación
│   │   └── auth/        # Páginas de autenticación
│   ├── routes/          # Configuración de rutas
│   ├── services/        # Servicios API
│   ├── store/           # Estado global (Zustand)
│   ├── types/           # Tipos TypeScript
│   └── utils/           # Utilidades
├── public/              # Archivos estáticos
└── index.html           # HTML principal
```

## 🛠️ Tecnologías

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router** - Routing
- **TanStack Query** - Gestión de estado del servidor
- **Zustand** - Estado global
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP

## 🔐 Autenticación

La autenticación se maneja mediante:
- JWT tokens almacenados en localStorage
- Context API para estado de autenticación
- Protected routes con verificación de roles

## 🎨 Estilos

Se utiliza Tailwind CSS con una paleta de colores médicos personalizada:
- `medical-primary`: Azul médico principal (#2C5F7C)
- `medical-secondary`: Azul médico secundario (#4A90A4)
- `medical-accent`: Turquesa médico (#6BB6B8)

## 📝 Variables de Entorno

Crear archivo `.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 🧪 Testing

```bash
npm run test          # Ejecutar tests
npm run test:ui      # UI de tests
npm run test:coverage # Coverage
```

## 📦 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run lint` - Linter
- `npm run test` - Tests
