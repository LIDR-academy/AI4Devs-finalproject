# Setup del Frontend

## 📋 Prerequisitos

- Node.js 18+ y npm
- Backend corriendo en `http://localhost:3000`

## 🚀 Instalación

1. **Instalar dependencias**:
```bash
cd frontend
npm install
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
```

Editar `.env` si es necesario:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

3. **Iniciar servidor de desarrollo**:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Dependencias Principales

- **React 18** - UI Framework
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **React Router** - Routing
- **TanStack Query** - Estado del servidor
- **Zustand** - Estado global
- **React Hook Form + Zod** - Formularios y validación
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP
- **@heroicons/react** - Iconos

## 🏗️ Estructura Creada

```
frontend/
├── src/
│   ├── components/
│   │   └── layout/          # Header, Sidebar, Layout, ProtectedRoute
│   ├── contexts/
│   │   └── AuthContext.tsx  # Contexto de autenticación
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.tsx    # Página de login
│   │   └── Dashboard.tsx    # Dashboard principal
│   ├── routes/
│   │   └── AppRoutes.tsx    # Configuración de rutas
│   ├── services/
│   │   └── auth.service.ts  # Servicio de autenticación
│   ├── store/
│   │   └── authStore.ts     # Store de autenticación (Zustand)
│   ├── types/
│   │   └── index.ts         # Tipos TypeScript
│   └── utils/
│       └── api.ts           # Cliente Axios configurado
├── public/
│   └── vite.svg
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## ✅ Funcionalidades Implementadas

- ✅ Configuración de React + TypeScript + Vite
- ✅ Configuración de Tailwind CSS con paleta médica
- ✅ Sistema de routing con React Router
- ✅ Autenticación con JWT
- ✅ Estado global con Zustand
- ✅ Context API para autenticación
- ✅ Protected Routes con verificación de roles
- ✅ Layout con Header y Sidebar
- ✅ Página de Login funcional
- ✅ Dashboard básico
- ✅ Integración con API backend
- ✅ Manejo de errores y loading states
- ✅ Interceptores de Axios para tokens

## 🔐 Autenticación

El sistema de autenticación incluye:
- Login con username/password
- Almacenamiento de token en localStorage
- Verificación automática de token al iniciar
- Logout funcional
- Protección de rutas
- Verificación de roles

## 🎨 Estilos

Se utiliza Tailwind CSS con una paleta de colores médicos:
- `medical-primary`: #2C5F7C
- `medical-secondary`: #4A90A4
- `medical-accent`: #6BB6B8
- `medical-success`: #5CB85C
- `medical-warning`: #F0AD4E
- `medical-danger`: #D9534F

## 📝 Próximos Pasos

1. Instalar dependencias: `npm install`
2. Iniciar el backend en `http://localhost:3000`
3. Iniciar el frontend: `npm run dev`
4. Acceder a `http://localhost:5173`
5. Hacer login con credenciales del backend

## 🐛 Troubleshooting

### Error: Cannot find module '@heroicons/react'
```bash
npm install @heroicons/react
```

### Error: Cannot connect to API
- Verificar que el backend esté corriendo en `http://localhost:3000`
- Verificar la variable `VITE_API_URL` en `.env`

### Error: Port 5173 already in use
```bash
# Cambiar el puerto en vite.config.ts o matar el proceso
lsof -ti:5173 | xargs kill -9
```
