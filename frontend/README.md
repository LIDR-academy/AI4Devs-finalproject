# 🎨 ZonMatch Frontend

## 📋 **Descripción General**

ZonMatch Frontend es una aplicación web moderna construida con React 18, TypeScript y Material-UI que proporciona una interfaz intuitiva para la plataforma de matchmaking inmobiliario. Ofrece una experiencia de usuario completa para buscar, gestionar y publicar propiedades inmobiliarias.

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
- **React Hook Form** para formularios
- **Yup** para validaciones

### **Estructura de carpetas**
```
src/
├── components/     # Componentes reutilizables
│   ├── CurrencyDisplay.tsx      # Formateo de moneda
│   ├── CurrencyInput.tsx        # Input de moneda
│   ├── FavoriteButton.tsx       # Botón de favoritos
│   ├── ImageUpload.tsx          # Subida de imágenes
│   ├── MyPropertyCard.tsx       # Card para mis propiedades
│   ├── Navbar.tsx               # Navegación principal
│   ├── PropertyCard.tsx         # Card de propiedad
│   ├── PropertySkeleton.tsx     # Skeleton de carga
│   └── RemoveFavoriteButton.tsx # Botón remover favorito
├── pages/          # Páginas de la aplicación
│   ├── CreateProperty.tsx       # Crear propiedad
│   ├── Dashboard.tsx            # Página principal
│   ├── EditProperty.tsx         # Editar propiedad
│   ├── Favorites.tsx            # Lista de favoritos
│   ├── ForgotPassword.tsx       # Recuperar contraseña
│   ├── Login.tsx                # Inicio de sesión
│   ├── MyProperties.tsx         # Mis propiedades
│   ├── PropertyDetail.tsx       # Detalle de propiedad
│   ├── Register.tsx             # Registro de usuario
│   └── ResetPassword.tsx        # Reset de contraseña
├── store/          # Stores de Zustand
│   ├── authStore.ts             # Estado de autenticación
│   ├── favoriteStore.ts         # Estado de favoritos
│   └── propertyStore.ts         # Estado de propiedades
├── services/       # Servicios de API
│   ├── api.ts                   # Cliente API principal
│   └── viewIncrementService.ts  # Servicio de vistas
├── types/          # Tipos TypeScript
│   └── index.ts                 # Definiciones de tipos
├── theme/          # Tema personalizado de MUI
│   └── index.ts                 # Configuración del tema
└── utils/          # Utilidades comunes
    ├── currency.ts              # Utilidades de moneda
    └── favoriteEvents.ts        # Eventos de favoritos
```

## 📱 **Páginas implementadas**

### **🔐 Autenticación**
- **Login** (`/login`): Inicio de sesión con email y contraseña
  - Validación de formularios en tiempo real
  - Manejo de errores y estados de carga
  - Redirección automática tras login exitoso
  - Enlaces a registro y recuperación de contraseña

- **Register** (`/register`): Registro de nuevos usuarios
  - Formulario multi-campo con validación
  - Selección de rol (usuario, agente, admin)
  - Validación de contraseñas coincidentes
  - Manejo de errores de validación

- **ForgotPassword** (`/forgot-password`): Solicitar reset de contraseña
  - Validación de email
  - Integración con backend para envío de token
  - Mensajes de confirmación

- **ResetPassword** (`/reset-password/:token`): Cambiar contraseña con token
  - Validación de token
  - Formulario de nueva contraseña
  - Confirmación de cambio exitoso

### **🏠 Aplicación principal**
- **Dashboard** (`/`): Página principal con lista de propiedades
  - Hero section con call-to-actions
  - Grid de propiedades destacadas
  - Estadísticas de la plataforma
  - Estados de carga con skeletons
  - Manejo de errores

- **PropertyDetail** (`/property/:id`): Detalle completo de propiedad
  - Galería de imágenes con navegación
  - Información detallada de la propiedad
  - Botón de favoritos integrado
  - Formulario de contacto con propietario
  - Incremento automático de vistas
  - Navegación por teclado (flechas)

- **CreateProperty** (`/create-property`): Formulario para crear nuevas propiedades
  - Formulario multi-paso con stepper
  - Subida de múltiples imágenes
  - Selección de amenidades
  - Validación en cada paso
  - Preview de datos antes de enviar

- **EditProperty** (`/edit-property/:id`): Edición de propiedades existentes
  - Carga de datos existentes
  - Formulario completo de edición
  - Gestión de imágenes
  - Actualización de estado y características

- **MyProperties** (`/my-properties`): Gestión de propiedades del usuario
  - Lista de propiedades del usuario
  - Filtros por estado y búsqueda
  - Acciones: editar, eliminar, destacar
  - Cambio de estado de propiedades
  - Menú contextual con opciones

- **Favorites** (`/favorites`): Lista de propiedades favoritas
  - Paginación de favoritos
  - Integración con sistema de favoritos
  - Estados vacío y de carga
  - Resumen de favoritos

## 🧩 **Componentes principales**

### **🏷️ CurrencyDisplay & CurrencyInput**
- Formateo automático de monedas (MXN, USD, EUR)
- Máscaras de entrada para valores monetarios
- Soporte para diferentes locales
- Validación de entrada numérica

### **❤️ Sistema de Favoritos**
- **FavoriteButton**: Botón toggle para agregar/quitar favoritos
- **RemoveFavoriteButton**: Botón específico para remover
- Sincronización en tiempo real entre componentes
- Estados de carga y error
- Redirección a login si no está autenticado

### **📸 ImageUpload**
- Subida múltiple de imágenes
- Preview y reordenamiento
- Selección de imagen principal
- Validación de tipos y tamaños
- Barra de progreso de subida

### **🏠 PropertyCard & MyPropertyCard**
- Cards responsivos para propiedades
- Información completa: precio, ubicación, características
- Integración con sistema de favoritos
- Acciones contextuales (editar, eliminar, etc.)
- Estados de carga con skeletons

### **🧭 Navbar**
- Navegación responsiva
- Menú hamburguesa en móvil
- Menú de usuario con avatar
- Enlaces condicionales según autenticación
- Integración con rutas protegidas

## 🔧 **Estado global (Zustand)**

### **🔐 AuthStore**
```typescript
interface AuthState {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  setUser: (user: IUser) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}
```

### **🏠 PropertyStore**
```typescript
interface PropertyState {
  properties: IProperty[];
  userProperties: IProperty[];
  currentProperty: IProperty | null;
  filters: IPropertyFilters;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
}

interface PropertyActions {
  fetchProperties: () => Promise<void>;
  fetchUserProperties: () => Promise<void>;
  createProperty: (propertyData: any) => Promise<IProperty>;
  updatePropertyComplete: (id: string, data: IProperty) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
  updatePropertyStatus: (id: string, status: string) => Promise<void>;
  // ... más acciones
}
```

### **❤️ FavoriteStore**
```typescript
interface FavoriteState {
  favorites: IProperty[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationState;
}

interface FavoriteActions {
  fetchFavorites: (page?: number, limit?: number) => Promise<void>;
  addToFavorites: (propertyId: string) => Promise<boolean>;
  removeFromFavorites: (propertyId: string) => Promise<boolean>;
  checkFavoriteStatus: (propertyId: string) => Promise<boolean>;
  getFavoritesForProperties: (propertyIds: string[]) => Promise<string[]>;
  clearError: () => void;
  clearFavorites: () => void;
}
```

## 🔌 **Integración con API**

### **🌐 Servicios implementados**
- **ApiService**: Cliente HTTP centralizado con Axios
  - Interceptors para tokens JWT
  - Manejo automático de errores
  - Configuración base de URLs
  - Headers de autenticación

- **ViewIncrementService**: Servicio para incrementar vistas
  - Singleton pattern
  - Prevención de incrementos duplicados
  - Integración con PropertyDetail

### **🔧 Configuración de Axios**
```typescript
// Interceptor de request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Manejar token expirado
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
```

## 🎨 **Tema y estilos**

### **🎨 Material-UI personalizado**
- **Tema principal**: Colores corporativos de ZonMatch
- **Paleta de colores**:
  - Primary: Azul corporativo
  - Secondary: Grises elegantes
  - Success: Verde para estados positivos
  - Error: Rojo para errores
  - Warning: Naranja para advertencias

- **Componentes personalizados**:
  - Botones con estilos consistentes
  - Inputs con validación visual
  - Cards con sombras y hover effects
  - Typography con jerarquía clara

### **📱 Responsive Design**
- **Breakpoints**:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

- **Componentes adaptativos**:
  - Navbar: Menú hamburguesa en móvil
  - Grid: Layout flexible para diferentes tamaños
  - Forms: Campos apilados en móvil
  - Cards: Tamaños adaptativos

### **🎭 CSS global**
- **Reset CSS**: Normalización entre navegadores
- **Variables CSS**: Colores y espaciados centralizados
- **Utilidades**: Clases helper para espaciado y layout
- **Animaciones**: Transiciones suaves y efectos hover

## 🛡️ **Seguridad y validación**

### **🔐 Autenticación**
- JWT tokens almacenados en localStorage
- Rutas protegidas con componentes HOC
- Verificación de roles para acciones específicas
- Logout automático en token expirado

### **✅ Validación de formularios**
- Validación en tiempo real con React Hook Form
- Esquemas de validación con Yup
- Mensajes de error contextuales
- Prevención de envío con datos inválidos

### **🛡️ Protección de rutas**
```typescript
// Ruta protegida
<Route 
  path="/create-property" 
  element={
    <RoleRoute allowedRoles={['user', 'agent', 'admin']}>
      <CreateProperty />
    </RoleRoute>
  } 
/>

// Ruta pública con redirección
<Route 
  path="/login" 
  element={isAuthenticated ? <Navigate to="/" /> : <Login />} 
/>
```

## 🔧 **Comandos de desarrollo**

### **📦 Scripts disponibles**
```bash
npm run dev          # Servidor de desarrollo con hot reload
npm run build        # Build optimizado para producción
npm run preview      # Preview del build de producción
npm run lint         # Linting con ESLint
npm run lint:fix     # Linting con corrección automática
npm run type-check   # Verificar tipos TypeScript
```

### **🛠️ Comandos útiles**
```bash
# Desarrollo con hot reload
npm run dev

# Verificar tipos TypeScript
npx tsc --noEmit

# Build y preview
npm run build
npm run preview

# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install

# Análisis del bundle
npm run build -- --analyze
```

## 🚀 **Despliegue**

### **🏗️ Build de producción**
```bash
# Generar build optimizado
npm run build

# Preview del build
npm run preview

# Servir archivos estáticos
npx serve dist
```

### **🐳 Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

```bash
# Construir imagen
docker build -t zonmatch-frontend .

# Ejecutar contenedor
docker run -p 3000:3000 zonmatch-frontend
```

## 🧪 **Testing**

### **🔬 Ejecutar tests**
```bash
# Tests unitarios
npm run test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Tests de integración
npm run test:integration
```

## ⚙️ **Configuración**

### **🌍 Variables de entorno**
```env
# Backend API
VITE_API_URL=http://localhost:3001

# Aplicación
VITE_APP_NAME=ZonMatch
VITE_APP_VERSION=1.0.0

# Entorno
VITE_NODE_ENV=development

# Características
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### **⚡ Vite config**
- **Aliases**: Rutas cortas para imports (`@/` para `src/`)
- **Proxy**: Redirección de API calls en desarrollo
- **Build**: Optimizaciones para producción
- **Polyfills**: Soporte para crypto en macOS
- **HMR**: Hot Module Replacement para desarrollo

## 📊 **Características avanzadas**

### **🔄 Estado reactivo**
- Zustand para manejo de estado global
- Selectores optimizados para evitar re-renders
- Persistencia de estado en localStorage
- Sincronización entre componentes

### **🎯 Optimizaciones de rendimiento**
- Lazy loading de componentes
- Memoización con React.memo
- useCallback para funciones estables
- useMemo para cálculos costosos
- Code splitting automático

### **♿ Accesibilidad**
- Navegación por teclado
- ARIA labels y roles
- Focus management
- Contraste de colores adecuado
- Screen reader support

### **📱 PWA Ready**
- Service Worker configurado
- Manifest.json para instalación
- Offline support básico
- Caching estratégico

## 🔮 **Próximas funcionalidades**

- [ ] **Chat en tiempo real** con WebSockets
- [ ] **Mapas interactivos** con Google Maps/OpenStreetMap
- [ ] **Búsqueda avanzada** con filtros complejos
- [ ] **Notificaciones push** en tiempo real
- [ ] **Modo offline** completo con Service Workers
- [ ] **PWA** para instalación en móviles
- [ ] **Tests E2E** con Playwright
- [ ] **Storybook** para documentación de componentes
- [ ] **Internacionalización** (i18n) multi-idioma
- [ ] **Tema oscuro** toggle

## 📚 **Documentación adicional**

- [README Principal](../READMEZONEMATCH.md)
- [Backend README](../backend/README.md)
- [Guía de instalación](../INSTALACION.md)
- [Arquitectura del sistema](../docs/arquitectura/)

## 🆘 **Soporte y troubleshooting**

### **🔧 Problemas comunes**

1. **Error de conexión con backend**:
   - Verificar que el backend esté corriendo en puerto 3001
   - Revisar la variable `VITE_API_URL` en `.env`

2. **Errores de TypeScript**:
   - Ejecutar `npm run type-check` para ver errores
   - Verificar que los tipos estén correctamente importados

3. **Problemas de build**:
   - Limpiar cache: `rm -rf node_modules package-lock.json && npm install`
   - Verificar que todas las dependencias estén instaladas

4. **Errores de linting**:
   - Ejecutar `npm run lint:fix` para corrección automática
   - Revisar configuración de ESLint

### **🐛 Debug**
```bash
# Modo debug con logs detallados
VITE_DEBUG=true npm run dev

# Análisis del bundle
npm run build -- --analyze

# Verificar dependencias
npm audit
```

## 🤝 **Contribución**

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](../LICENSE) para más detalles.

---

*ZonMatch Frontend - Donde la tecnología se encuentra con el hogar perfecto* 🏠✨