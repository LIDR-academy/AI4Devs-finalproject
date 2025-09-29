# Buscadoc Frontend

Plataforma médica moderna para conectar pacientes con doctores especializados. Interfaz de usuario desarrollada con React 19.1, Next.js 15.5.4 y Tailwind CSS.

## Descripción

Buscadoc es una aplicación web que facilita la conexión entre pacientes y profesionales médicos especializados. La plataforma permite el registro de pacientes, búsqueda de doctores por especialidad, gestión de citas médicas, y visualización de perfiles médicos detallados a través de una interfaz intuitiva, responsive y completamente multiidioma.

## Funcionalidades Principales

### Páginas y Componentes Implementados

- **Perfil de Doctor**: Vista detallada con información completa, horarios, ubicación y reseñas paginadas
- **Sistema de Reserva de Citas**: Interfaz completa para agendar citas médicas con selección de horarios
- **Agenda Médica**: Visualización y gestión de citas programadas
- **Edición de Horarios**: Panel para que los doctores configuren su disponibilidad
- **Sistema de Autenticación**: Login y registro de usuarios con validación
- **Búsqueda de Doctores**: Filtros avanzados por especialidad, ubicación y disponibilidad
- **Filtros Médicos**: Sistema dinámico de filtrado y búsqueda

### Características Técnicas

- **Internacionalización Completa**: Soporte total para español e inglés con cambio dinámico
- **Paginación Avanzada**: Implementada en reseñas y listados con navegación intuitiva
- **Layout Unificado**: MainLayout con NavBar y Footer consistentes en toda la aplicación
- **Sistema de Calificaciones**: Componente de estrellas interactivo para valoraciones
- **Filtros Dinámicos**: Búsqueda en tiempo real con múltiples criterios
- **Componentes UI Personalizados**: Basados en shadcn/ui con diseño consistente
- **Responsive Design**: Optimizado para todos los dispositivos y breakpoints

## Estructura del Proyecto

\`\`\`
buscadoc-frontend/
├── public/                     # Archivos estáticos públicos
├── src/                        # Código fuente de la aplicación
│   ├── components/             # Componentes reutilizables
│   │   ├── ui/                 # Componentes UI base (shadcn/ui)
│   │   ├── AppointmentBooking.tsx  # Sistema de reserva de citas
│   │   ├── DoctorCard.tsx      # Tarjeta de doctor para listados
│   │   ├── EditSchedule.tsx    # Editor de horarios médicos
│   │   ├── Login.tsx           # Componente de inicio de sesión
│   │   ├── MainLayout.tsx      # Layout principal con NavBar/Footer
│   │   ├── MedicalAgenda.tsx   # Agenda médica
│   │   ├── MedicalFilters.tsx  # Filtros de búsqueda médica
│   │   └── Register.tsx        # Componente de registro
│   ├── data/                   # Datos mock y configuraciones
│   │   └── mockDoctors.js      # Datos de ejemplo para desarrollo
│   ├── i18n/                   # Configuración de internacionalización
│   │   ├── en.json             # Traducciones en inglés
│   │   ├── es.json             # Traducciones en español
│   │   └── index.js            # Configuración de i18next
│   ├── pages/                  # Páginas principales de la aplicación
│   │   └── DoctorProfile.tsx   # Perfil detallado de doctor
│   ├── services/               # Servicios para comunicación con APIs
│   │   ├── api.js              # Configuración base de Axios
│   │   ├── authService.js      # Servicios de autenticación
│   │   ├── doctorService.js    # Servicios relacionados con doctores
│   │   └── patientService.js   # Servicios relacionados con pacientes
│   ├── styles/                 # Estilos globales
│   │   └── tailwind.css        # Configuración de Tailwind CSS
│   ├── App.tsx                 # Componente principal de la aplicación
│   └── main.jsx                # Punto de entrada de la aplicación
├── .env.example                # Variables de entorno de ejemplo
├── .eslintrc.js                # Configuración de ESLint
├── .gitignore                  # Archivos ignorados por Git
├── index.html                  # Template HTML principal
├── package.json                # Dependencias y scripts del proyecto
├── postcss.config.js           # Configuración de PostCSS
├── tailwind.config.js          # Configuración de Tailwind CSS
├── tsconfig.json               # Configuración de TypeScript
└── vite.config.js              # Configuración de Vite
\`\`\`

### Descripción de Carpetas

- **`src/components/`**: Componentes reutilizables organizados por funcionalidad
- **`src/components/ui/`**: Componentes UI base basados en shadcn/ui para consistencia visual
- **`src/data/`**: Datos mock para desarrollo y testing de componentes
- **`src/i18n/`**: Sistema completo de internacionalización con soporte para español e inglés
- **`src/pages/`**: Páginas principales de la aplicación con funcionalidad completa
- **`src/services/`**: Servicios para la comunicación con APIs backend, organizados por funcionalidad
- **`src/styles/`**: Estilos globales y configuración de Tailwind CSS con colores personalizados

## Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

\`\`\`bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# App Configuration
REACT_APP_NAME=Buscadoc
REACT_APP_VERSION=1.0.0

# Development
REACT_APP_ENV=development
\`\`\`

### Variables Disponibles

- **`NEXT_PUBLIC_API_BASE_URL`**: URL base del API backend (accesible en cliente y servidor)
- **`REACT_APP_NAME`**: Nombre de la aplicación
- **`REACT_APP_VERSION`**: Versión actual de la aplicación
- **`REACT_APP_ENV`**: Entorno de ejecución (development/production)

## Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

\`\`\`bash
# Clonar el repositorio
git clone <repository-url>
cd buscadoc-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones
\`\`\`

### Desarrollo

\`\`\`bash
# Iniciar servidor de desarrollo
npm run dev

# El servidor estará disponible en http://localhost:5173
\`\`\`

### Scripts Disponibles

- **`npm run dev`**: Inicia el servidor de desarrollo con hot reload
- **`npm run build`**: Construye la aplicación para producción
- **`npm run preview`**: Previsualiza la build de producción localmente
- **`npm run lint`**: Ejecuta ESLint para verificar el código
- **`npm run lint:fix`**: Corrige automáticamente errores de ESLint
- **`npm run format`**: Formatea el código con Prettier

## Ejemplos de Componentes en Uso

### Sistema de Internacionalización

\`\`\`tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('doctorProfile.title')}</h1>
      <p>{t('doctorProfile.description')}</p>
    </div>
  );
}
\`\`\`

### Componente de Paginación

\`\`\`tsx
// Ejemplo de uso del sistema de paginación implementado
const [currentPage, setCurrentPage] = useState(1);
const reviewsPerPage = 3;

const paginatedReviews = reviews.slice(
  (currentPage - 1) * reviewsPerPage,
  currentPage * reviewsPerPage
);

// Renderizado con controles de navegación
<PaginationControls 
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>
\`\`\`

### Uso de Componentes UI

\`\`\`tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function ExampleComponent() {
  return (
    <Card>
      <CardHeader>
        <h2>Título de la tarjeta</h2>
      </CardHeader>
      <CardContent>
        <Button variant="default" size="lg">
          Acción Principal
        </Button>
      </CardContent>
    </Card>
  );
}
\`\`\`

## Compilación y Puesta a Producción

### Build de Producción

\`\`\`bash
# Generar build optimizada
npm run build

# Los archivos se generarán en la carpeta 'dist/'
\`\`\`

### Configuración de Despliegue

#### Variables de Entorno de Producción

\`\`\`bash
# Configuración específica para producción
NEXT_PUBLIC_API_BASE_URL=https://api.buscadoc.com
REACT_APP_ENV=production
\`\`\`

#### Consideraciones Especiales

- Configurar CORS en el backend para el dominio de producción
- Verificar que todas las rutas de API estén correctamente configuradas
- Asegurar que las traducciones estén completas para ambos idiomas
- Validar el funcionamiento del sistema de paginación con datos reales

### Despliegue

La aplicación puede desplegarse en cualquier servicio de hosting estático:

#### Vercel (Recomendado)
\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
\`\`\`

#### Netlify
\`\`\`bash
# Build command: npm run build
# Publish directory: dist
\`\`\`

#### Servidor Web Tradicional
\`\`\`bash
# Subir contenido de la carpeta 'dist/' al servidor
# Configurar servidor para SPA (Single Page Application)
\`\`\`

## Arquitectura

### Stack Tecnológico Actualizado

- **Frontend Framework**: React 19.1 con JSX/TSX
- **Meta Framework**: Next.js 15.5.4 para SSR y optimizaciones
- **Build Tool**: Vite 6.0 para desarrollo y build optimizado
- **Styling**: Tailwind CSS 3.4 con configuración personalizada
- **UI Components**: shadcn/ui con Radix UI primitives
- **HTTP Client**: Axios para comunicación con APIs
- **Internacionalización**: react-i18next con detección automática de idioma
- **Routing**: React Router DOM 6.28 (configurado pero no activo en v0)
- **Icons**: Heroicons y Lucide React
- **Linting**: ESLint con configuración para React y TypeScript
- **Formatting**: Prettier con plugin para Tailwind
- **Analytics**: Vercel Analytics para métricas de rendimiento

### Dependencias Principales

\`\`\`json
{
  "dependencies": {
    "next": "15.5.4",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^0.468.0",
    "tailwind-merge": "^2.5.4",
    "tailwindcss-animate": "^1.0.7",
    "@vercel/analytics": "^1.4.1"
  }
}
\`\`\`

### Patrones de Diseño Implementados

- **Component-Based Architecture**: Componentes reutilizables y modulares
- **Service Layer**: Separación de lógica de API en servicios dedicados
- **Responsive Design**: Mobile-first con breakpoints de Tailwind
- **Internationalization**: Soporte multiidioma desde el diseño inicial
- **Type Safety**: TypeScript para mayor robustez del código
- **Atomic Design**: Componentes organizados desde elementos básicos hasta páginas completas
- **Props Interface**: Interfaces TypeScript bien definidas para cada componente
- **Accessibility**: Implementación de ARIA labels y navegación por teclado
- **Performance**: Lazy loading y optimizaciones de renderizado

### Paleta de Colores Personalizada

La aplicación utiliza una paleta de colores específica para Buscadoc:

- **Federal Blue**: `#1e3a8a` - Color principal para elementos importantes
- **Honolulu Blue**: `#0ea5e9` - Color secundario para acciones
- **Pacific Cyan**: `#06b6d4` - Color de acento para destacar información

### Guías de Uso

#### Sistema de Internacionalización

\`\`\`bash
# Agregar nuevas traducciones
# 1. Editar src/i18n/es.json y src/i18n/en.json
# 2. Usar la clave en el componente con useTranslation
# 3. El cambio de idioma es automático en toda la aplicación
\`\`\`

#### Agregar Nuevos Componentes UI

\`\`\`bash
# 1. Crear el componente en src/components/ui/
# 2. Seguir el patrón de shadcn/ui con Radix primitives
# 3. Exportar desde el index correspondiente
# 4. Documentar props y variantes disponibles
\`\`\`

#### Trabajar con Datos Mock

\`\`\`bash
# Los datos mock están en src/data/mockDoctors.js
# Estructura consistente para desarrollo y testing
# Incluye datos en ambos idiomas para internacionalización
\`\`\`

## API Integration

### Servicios Implementados

- **authService.js**: Manejo de autenticación y tokens
- **doctorService.js**: CRUD de doctores y búsquedas
- **patientService.js**: Gestión de pacientes y citas

### Estructura de Datos Esperada

\`\`\`javascript
// Ejemplo de estructura de doctor
{
  id: "string",
  name: "string",
  specialty: "string",
  experience: "number",
  rating: "number",
  reviews: "array",
  schedule: "object",
  location: "object"
}
\`\`\`

### Endpoints Utilizados

- `GET /api/doctors` - Lista de doctores con filtros
- `GET /api/doctors/:id` - Perfil detallado de doctor
- `POST /api/appointments` - Crear nueva cita
- `GET /api/appointments` - Lista de citas del usuario

## Testing

### Guía para Escribir Tests

\`\`\`bash
# Estructura recomendada para tests
src/
├── __tests__/
│   ├── components/
│   ├── pages/
│   └── services/

# Patrones de testing recomendados:
# 1. Tests unitarios para componentes individuales
# 2. Tests de integración para flujos completos
# 3. Tests de accesibilidad con @testing-library/jest-dom
# 4. Tests de internacionalización para ambos idiomas
\`\`\`

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados.
