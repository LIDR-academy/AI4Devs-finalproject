# 🎨 ZonMatch Frontend

## 🚀 **Inicio Rápido**

### **1. Instalar dependencias**
```bash
npm install
```

### **2. Configurar variables de entorno**
```bash
cp env.example .env
# Editar .env con la URL del backend
```

### **3. Levantar en desarrollo**
```bash
npm run dev
```

### **4. Build para producción**
```bash
npm run build
npm run preview
```

## 🌐 **URLs de acceso**
- **Desarrollo**: http://localhost:3000
- **Backend API**: http://localhost:3001 (configurable en .env)

## 🏗️ **Arquitectura**

### **Tecnologías utilizadas**
- **React 18** + **TypeScript** para la interfaz
- **Vite** como bundler y dev server
- **Material-UI (MUI)** para componentes de UI
- **Zustand** para manejo de estado global
- **React Router DOM** para navegación
- **Axios** para llamadas a la API

### **Estructura de carpetas**
```
src/
├── components/     # Componentes reutilizables
├── pages/          # Páginas de la aplicación
├── store/          # Stores de Zustand
├── services/       # Servicios de API
├── types/          # Tipos TypeScript
├── theme/          # Tema personalizado de MUI
└── utils/          # Utilidades comunes
```

## 📱 **Páginas implementadas**

### **Autenticación**
- **Login**: Inicio de sesión con email y contraseña
- **Register**: Registro de nuevos usuarios
- **ForgotPassword**: Solicitar reset de contraseña
- **ResetPassword**: Cambiar contraseña con token

### **Aplicación principal**
- **Dashboard**: Página principal con lista de propiedades
- **CreateProperty**: Formulario para crear nuevas propiedades
- **Navbar**: Navegación principal con menú de usuario

## 🔧 **Comandos de desarrollo**

### **Scripts disponibles**
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linting con ESLint
npm run type-check   # Verificar tipos TypeScript
```

### **Comandos útiles**
```bash
# Desarrollo con hot reload
npm run dev

# Verificar tipos TypeScript
npx tsc --noEmit

# Build y preview
npm run build
npm run preview

# Limpiar cache
rm -rf node_modules package-lock.json
npm install
```

## 🎨 **Tema y estilos**

### **Material-UI personalizado**
- **Tema principal**: Colores corporativos de ZonMatch
- **Componentes**: Botones, inputs, cards personalizados
- **Responsive**: Diseño adaptativo para móvil y desktop
- **Tipografía**: Sistema de fuentes consistente

### **CSS global**
- **Reset CSS**: Normalización de estilos entre navegadores
- **Variables CSS**: Colores y espaciados centralizados
- **Utilidades**: Clases helper para espaciado y layout

## 📊 **Estado global (Zustand)**

### **AuthStore**
- **Estado**: Usuario autenticado, token, loading
- **Acciones**: Login, logout, register, checkAuth
- **Persistencia**: Token guardado en localStorage

### **PropertyStore**
- **Estado**: Lista de propiedades, loading, filtros
- **Acciones**: Fetch properties, create property, filters
- **Cache**: Propiedades en memoria para mejor UX

## 🔌 **Integración con API**

### **Servicios implementados**
- **AuthService**: Login, registro, logout
- **PropertyService**: CRUD de propiedades
- **PasswordResetService**: Reset de contraseñas

### **Configuración de Axios**
- **Base URL**: Configurable desde variables de entorno
- **Interceptors**: Manejo automático de tokens JWT
- **Error handling**: Manejo centralizado de errores HTTP

## 🚀 **Despliegue**

### **Build de producción**
```bash
# Generar build optimizado
npm run build

# Preview del build
npm run preview

# Servir archivos estáticos
npx serve dist
```

### **Docker**
```bash
# Construir imagen
docker build -t zonmatch-frontend .

# Ejecutar contenedor
docker run -p 3000:3000 zonmatch-frontend
```

## 🧪 **Testing**

### **Ejecutar tests**
```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 🔧 **Configuración**

### **Variables de entorno**
```env
# Backend API
VITE_API_URL=http://localhost:3001

# Entorno
VITE_NODE_ENV=development

# Características
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### **Vite config**
- **Aliases**: Rutas cortas para imports
- **Proxy**: Redirección de API calls en desarrollo
- **Build**: Optimizaciones para producción
- **Polyfills**: Soporte para crypto en macOS

## 📱 **Responsive Design**

### **Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### **Componentes adaptativos**
- **Navbar**: Menú hamburguesa en móvil
- **Grid**: Layout flexible para diferentes tamaños
- **Forms**: Campos apilados en móvil

## 🚧 **Próximas funcionalidades**

- [ ] **Chat en tiempo real** con WebSockets
- [ ] **Mapas interactivos** con Google Maps
- [ ] **Sistema de favoritos** y comparación
- [ ] **Notificaciones push** en tiempo real
- [ ] **Modo offline** con Service Workers
- [ ] **PWA** para instalación en móviles

## 📚 **Documentación adicional**
- [README Principal](../READMEZONEMATCH.md)
- [Backend README](../backend/README.md)
- [Guía de instalación](../INSTALACION.md)

## 🆘 **Soporte**

Si encuentras problemas:
1. Verifica que el backend esté corriendo
2. Revisa la consola del navegador para errores
3. Confirma que las variables de entorno estén configuradas
4. Limpia el cache del navegador

**¡El frontend está listo para crear experiencias increíbles! 🎨✨**
