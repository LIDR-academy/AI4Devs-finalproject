## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**

Geovanni Duarte Guerrero    

### **0.2. Nombre del proyecto:**

Jaarvi
### **0.3. Descripción breve del proyecto:**

App movil asistente de viajes

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto

Jaarvi es un asistente de viajes móvil que te ayuda a **planificar y ejecutar** un viaje como si viajaras con alguien muy experimentado en el destino. Te acompaña en dos momentos: **antes del viaje** (para armar un itinerario realista) y **durante el viaje** (para guiarte en la ejecución con pasos claros y decisiones prácticas), reduciendo errores, fricción y costos derivados del desconocimiento, y adaptándose a tus gustos y restricciones.


### **1.1. Objetivo:**

> Propósito del producto. Qué valor aporta, qué soluciona, y para quién.

Disminuir el desgaste de planear y llevar a cabo un viaje, para que el viajero aproveche mejor su tiempo y dinero. Jaarvi busca **reducir la incertidumbre**, **evitar errores costosos** y **mejorar la seguridad y eficiencia** con recomendaciones editables antes del viaje y asistencia práctica en el momento de ejecutar el itinerario, de forma que la experiencia sea más fluida, divertida y memorable.

### **1.2. Características y funcionalidades principales:**

* **Cobertura por fases (MVP)**: aunque la visión es “conocer todas las ciudades”, Jaarvi debe ser viable desde el inicio trabajando con una **cobertura inicial acotada** (por ejemplo: un set de ciudades/destinos) y ampliándola progresivamente a medida que se validan flujos y calidad de recomendaciones.

* **Planeación anticipada (pre-viaje) [MVP: Manual / Fase 2: IA]**: con base en las ciudades que el usuario quiere visitar, la cantidad de días y sus preferencias/restricciones (presupuesto, ritmo, intereses, límites de tiempo), Jaarvi debe proponer un plan inicial **fácil de editar** para viajes largos (por ejemplo Europa), que incluya:
  * agenda sugerida por día (pipeline de días) y actividades por día,
  * integraciones lógicas de traslados (vuelos, trenes, buses) y **hospedajes** en el timeline,
  * edición manual rápida (reordenar, reemplazar, eliminar, ajustar tiempos y costos) cuando el usuario no esté de acuerdo.
  
  (MVP: el usuario construye el itinerario manualmente; Fase 2: opción de generación con IA)

* **Planeación en destino (inicio del día) [MVP: Manual / Fase 2: IA]**: estando en el sitio y al iniciar el día, Jaarvi debe construir o ajustar un itinerario de actividades adaptado a la situación real (ubicación, tiempos, presupuesto, energía, horarios). Además de listar lugares, debe incorporar recomendaciones accionables sobre dinámicas culturales/económicas cuando aplique, por ejemplo: "En Turquía conviene negociar el vuelo en globo en el sitio; mejor en efectivo y, si es posible, en liras turcas". 
  
  (MVP: usuario ajusta manualmente; Fase 2: refresh automático con IA y recomendaciones contextuales con conjunto pequeño pero sólido de recomendaciones por destino, ampliable después)

* **Transparencia y control**: cuando Jaarvi recomiende una actividad o decisión, debe mostrar de forma simple el “por qué” (tiempo estimado, costo aproximado, distancia, conveniencia) y permitir cambiarlo en un par de acciones. Esto es clave para confianza y para que el usuario no se bloquee si una recomendación no encaja.

* **Asistencia en ejecución (en tiempo real)**: con base en itinerario, contexto, ubicación, tiempos, costos y preferencias, Jaarvi debe ayudar a ejecutar el plan con pasos claros para resolver situaciones comunes de forma eficiente y segura (por ejemplo: la mejor forma de ir del aeropuerto al hotel) y permitir al viajero armar o modificar una actividad en el momento.

* **Guía paso a paso por actividad (modo “Hoy”)**: cada día del viaje es un compendio de actividades. Jaarvi debe actuar como quien ya las hizo antes y conoce los problemas comunes, ofreciendo:

  * mapas con feedback en tiempo real de la ubicación en la ruta,
  * indicaciones explícitas con puntos de referencia (orientadas a caminar), por ejemplo: “Deberías estar viendo una panadería llamada HORNITOS; cruza por esa calle a la derecha”,
  * micro-instrucciones operativas por hitos (máquinas de tickets, trasbordos, accesos), por ejemplo: “Llegaste a la máquina de tickets; cambia idioma a español y compra el pase de 3 días…”.

  En Fase 2, este valor debe concentrarse en un set de "playbooks" de alto impacto (aeropuerto→hotel, transporte público y pases, pagos/moneda, errores comunes), en vez de intentar cubrir todos los casos desde el día 1.

* **Notificaciones y gestión del tiempo**: Jaarvi debe poder recordarle al usuario cuándo salir, cuánto falta para el siguiente hito o cierre de un lugar y ayudarle a mantener el día dentro de tiempos realistas.

* **Plan B**: si el plan original no es viable (cierres, clima, cansancio, presupuesto), Jaarvi debe sugerir alternativas equivalentes y permitir cambiar el día sin rehacer todo.

* **Actividades obligatorias por día (configurables)**: el sistema debe soportar actividades “obligatorias” configuradas (seed) a nivel de datos. Un ejemplo típico es “Dormir / Dónde dormir”, pero podría ser otra según el producto. Jaarvi debe marcar si cada actividad obligatoria está **pendiente** o **resuelta** y permitir enlazar evidencia (por ejemplo, una reserva) o una nota (por ejemplo, “me quedo en casa de mi amigo Luis” o “noche en bus/vuelo”).

* La app almacena documentación relévante para los viajeros, como tickets, permisos, documentos asociados a cada actividad del itinerario de viaje.

MONETIZACION

* Jaarvi es también un afiliado a los distintos comercios que venden productos y servicios del ámbito turístico (vuelos, tours, entradas a museos, esenciales). En el MVP, estas recomendaciones deben ser **contextuales y no intrusivas**, priorizando la utilidad y la confianza del usuario.

### **1.5. Estrategia de MVP y despliegue por fases**

Jaarvi adopta una estrategia de **desarrollo incremental por fases** para validar el modelo de negocio y garantizar calidad antes de escalar funcionalidades complejas.

#### **Fase 1: MVP - Creación Manual de Itinerarios (Enfoque Inicial)**

El MVP se centra en **permitir a los usuarios crear y gestionar itinerarios manualmente** a través de una interfaz intuitiva, sin depender de generación automática por IA.

**Funcionalidades Incluidas en MVP**:
- ✅ Gestión de viajes (crear, editar, eliminar viajes con múltiples destinos)
- ✅ Creación manual de itinerarios día por día
- ✅ CRUD completo de actividades (agregar, editar, reordenar, eliminar)
- ✅ Validaciones básicas (conflictos de tiempo, seguimiento de presupuesto)
- ✅ Bóveda de documentos (subir y vincular tickets, reservas, permisos)
- ✅ Modo "Hoy" (visualización del día actual con actividades)
- ✅ Navegación externa a mapas (v1: deep links a Google/Apple Maps)
- ✅ Notificaciones básicas (recordatorios de hora de salida)

**Funcionalidades Excluidas del MVP** (Fase 2):
- ❌ Generación automática de itinerarios con IA
- ❌ Sugerencias de actividades con IA
- ❌ Optimización automática de rutas
- ❌ Plan B automático basado en IA
- ❌ Playbooks dinámicos con recomendaciones contextuales de IA

**Razón Estratégica**:
1. **Validación temprana**: Probar la propuesta de valor core (organización de viajes) sin complejidad de IA
2. **Reducción de riesgo técnico**: Evitar dependencias de servicios externos costosos (Amazon Bedrock) hasta validar demanda
3. **Iteración rápida**: Ajustar UX/UI basado en feedback real antes de invertir en IA
4. **Control de costos**: MVP más económico de operar sin llamadas a LLMs

#### **Fase 2: IA Asistida - Generación y Optimización**

Una vez validado el MVP, se incorporan capacidades de IA para **reducir fricción en la planificación**:
- 🤖 Generación automática de itinerarios basada en preferencias
- 🤖 Sugerencias inteligentes de actividades por día
- 🤖 Optimización de rutas y tiempos
- 🤖 Playbooks contextuales con recomendaciones locales dinámicas
- 🤖 Plan B automático ante cambios (cierres, clima, presupuesto)

**Arquitectura Preparada**: El backend está diseñado para soportar IA desde el inicio (AIOrchestrator, separación de capas), pero la implementación se activa en Fase 2.

#### **Fase 3: Funcionalidades Avanzadas**

- 🚀 Colaboración multi-usuario (co-viajeros)
- 🚀 Integración con partners de reservas
- 🚀 Mapas embebidos (v2 de MapCapability)
- 🚀 Modo offline completo
- 🚀 Recomendaciones personalizadas basadas en historial

### **1.3. Diseño y experiencia de usuario:**

> Proporciona imágenes y/o videotutorial mostrando la experiencia del usuario desde que aterriza en la aplicación, pasando por todas las funcionalidades principales.

#### **📱 Wireframes y Flujos de Usuario**

Hemos diseñado wireframes detallados para todas las pantallas principales de la aplicación, mostrando la jerarquía de navegación y los patrones de interacción:

**📄 Ver documento completo**: [`product-discovery/7-Wireframes.md`](product-discovery/7-Wireframes.md)

> **🎨 Próximos pasos**: Prototipos interactivos, user testing, y sistema de diseño completo.

### **1.4. Instrucciones de instalación:**

Esta guía te ayudará a configurar el entorno de desarrollo local de Jaarvi desde cero. Al finalizar, tendrás el backend funcionando y las aplicaciones móviles listas para desarrollo y pruebas.

> **⏱️ Tiempo estimado**: 30-45 minutos (dependiendo de velocidad de descarga y experiencia)

#### **1.4.1. Prerequisitos**

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas:

| Herramienta | Versión Mínima | Comando de Verificación | Descarga |
|-------------|----------------|-------------------------|----------|
| **Node.js** | 18.x LTS | `node --version` | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.x | `npm --version` | (incluido con Node.js) |
| **PostgreSQL** | 14.x | `psql --version` | [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | 2.x | `git --version` | [git-scm.com](https://git-scm.com/) |
| **Java JDK** | 17 | `java -version` | [Adoptium](https://adoptium.net/) |
| **Android Studio** | 2023.x+ | - | [developer.android.com](https://developer.android.com/studio) |
| **Xcode** (solo macOS) | 15.x+ | `xcode-select --version` | App Store |

**Herramientas opcionales recomendadas**:
- **Docker** (para setup): [docker.com](https://www.docker.com/)
- **Postman** o **Insomnia** (para probar API): [postman.com](https://www.postman.com/)
- **pgAdmin** (GUI para PostgreSQL): [pgadmin.org](https://www.pgadmin.org/)

#### **1.4.2. Configuración del Repositorio**

##### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/geovanniduarte/Jaarvi.git
cd Jaarvi
```

##### Paso 2: Explorar la estructura del proyecto

La estructura del proyecto sigue el patrón **Kotlin Multiplatform (KMP) + Compose Multiplatform (CMP)** para compartir código entre plataformas:

```
Jaarvi/
├── backend/                # Backend Node.js/TypeScript con Express
│   ├── src/
│   │   ├── domain/        # Capa de dominio (entidades, agregados, interfaces)
│   │   ├── application/   # Capa de aplicación (servicios, orquestación)
│   │   ├── presentation/  # Capa de presentación (controllers)
│   │   ├── infrastructure/# Capa de infraestructura (Prisma, externos)
│   │   ├── routes/        # Definición de rutas Express
│   │   ├── middleware/    # Middleware (auth, CORS, errors)
│   │   └── index.ts       # Entry point del servidor
│   ├── prisma/
│   │   ├── schema.prisma  # Schema de base de datos
│   │   ├── migrations/    # Migraciones versionadas
│   │   └── seed.ts        # Datos iniciales
│   ├── test-utils/        # Utilidades para testing
│   ├── __tests__/         # Tests unitarios y de integración
│   ├── package.json       # Dependencias del backend
│   ├── tsconfig.json      # Configuración TypeScript
│   └── .env.example       # Template de variables de entorno
├── shared/                 # KMP: Código compartido multiplataforma
│   └── src/
│       ├── commonMain/    # Código común (Android + iOS)
│       │   └── kotlin/
│       │       ├── domain/        # Dominio: itinerario, playbooks, Plan B
│       │       ├── data/          # Repositorios, cache
│       │       └── network/       # Ktor client + serialización
│       ├── androidMain/   # Código específico Android
│       └── iosMain/       # Código específico iOS
├── shared-ui/              # CMP: UI compartida (pantallas y componentes)
│   └── src/
│       ├── commonMain/    # UI común (Compose Multiplatform)
│       │   └── kotlin/
│       │       ├── screens/       # Pantallas principales
│       │       ├── components/    # Componentes reutilizables
│       │       └── presenters/    # ViewModels/Presenters
│       ├── androidMain/   # Ajustes UI específicos Android
│       └── iosMain/       # Ajustes UI específicos iOS
├── androidApp/             # Android: Entry point + capacidades de plataforma
│   ├── src/
│   │   └── main/
│   │       ├── kotlin/
│   │       │   ├── capabilities/  # Implementaciones (MapCapability, etc.)
│   │       │   └── MainActivity.kt
│   │       ├── res/       # Recursos Android
│   │       └── AndroidManifest.xml
│   └── build.gradle.kts
├── iosApp/                 # iOS: Entry point + capacidades de plataforma
│   ├── Jaarvi/
│   │   ├── capabilities/  # Implementaciones iOS (MapCapability, etc.)
│   │   ├── ContentView.swift
│   │   └── JaarviApp.swift
│   └── Jaarvi.xcodeproj
├── product-discovery/      # Documentación de producto y diseño
├── ai-specs/               # Especificaciones para desarrollo con IA
│   ├── specs/             # Estándares (backend, frontend, documentation)
│   └── .agents/           # Configuración de agentes IA
└── README.md               # Este archivo
```

**Arquitectura en Capas**:
- **Backend**: Sigue DDD (Domain-Driven Design) con 4 capas independientes
- **Mobile**: Capas compartidas (UI → presenters → dominio → repositorios) 
- **Capabilities**: Interfaces para aislar dependencias del SO (mapas, notificaciones, etc.)

Para más detalles sobre la arquitectura, consulta la [Sección 2.1](#21-diagrama-de-arquitectura) y [Sección 2.3](#23-descripción-de-alto-nivel-del-proyecto-y-estructura-de-ficheros).

#### **1.4.3. Configuración de la Base de Datos**

##### Paso 1: Crear usuario y base de datos PostgreSQL

```bash
# Conectar a PostgreSQL como superusuario
psql postgres

# Dentro de psql, ejecutar:
CREATE USER jaarvi_dev WITH PASSWORD 'jaarvi_local_dev_2024';
CREATE DATABASE jaarvi_dev;
GRANT ALL PRIVILEGES ON DATABASE jaarvi_dev TO jaarvi_dev;
\q
```

> **Nota de Seguridad**: Esta contraseña es solo para desarrollo local. En producción se usarán secretos gestionados por AWS.

##### Paso 2: Verificar conexión

```bash
psql -U jaarvi_dev -d jaarvi_dev -h localhost
```

Si se conecta correctamente, escribe `\q` para salir.

#### **1.4.4. Configuración del Backend**

##### Paso 1: Navegar al directorio del backend

```bash
cd backend
```

##### Paso 2: Instalar dependencias

```bash
npm install
```

> **💡 Tip**: Si encuentras errores de permisos, evita usar `sudo`. Configura npm para usar un directorio local: [docs.npmjs.com/resolving-eacces-permissions-errors](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)

##### Paso 3: Configurar variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones locales:

```bash
# Database
DATABASE_URL="postgresql://jaarvi_dev:jaarvi_local_dev_2024@localhost:5432/jaarvi_dev"

# Server
PORT=3000
NODE_ENV=development

# JWT Secret (genera uno aleatorio para desarrollo)
JWT_SECRET="dev-secret-change-in-production"

# CORS (permite tu frontend local)
FRONTEND_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:19006

# AWS (solo para MVP local - no se usan servicios reales)
AWS_REGION=us-east-1
AWS_ENDPOINT=http://localhost:4566  # LocalStack si usas Docker

# Logs
LOG_LEVEL=debug
```

> **🔐 Importante**: Nunca commitees el archivo `.env` al repositorio. Ya está incluido en `.gitignore`.

##### Paso 4: Generar Prisma Client

```bash
npx prisma generate
```

Este comando genera el cliente TypeScript type-safe basado en tu schema de Prisma.

##### Paso 5: Ejecutar migraciones de base de datos

```bash
npx prisma migrate dev --name init
```

Esto creará todas las tablas necesarias en tu base de datos local.

##### Paso 6: Poblar base de datos con datos de prueba (seed)

```bash
npm run seed
```

Esto insertará datos iniciales:
- Usuarios de prueba
- Destinos disponibles (ciudades con cobertura MVP)
- Tipos de actividades obligatorias configuradas
- Ejemplos de viajes

##### Paso 7: Iniciar el servidor de desarrollo

```bash
npm run dev
```

Deberías ver:

```
🚀 Server running on http://localhost:3000
✅ Database connected
✅ Prisma client initialized
```

##### Paso 8: Verificar que el backend funciona

En otra terminal o en tu navegador, prueba:

```bash
curl http://localhost:3000/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

#### **1.4.5. Configuración de la Aplicación Móvil**

> **Nota MVP**: Como el MVP se enfoca en creación manual, no es necesario configurar servicios de IA en esta etapa.

##### **Opción A: Android (Recomendado para empezar)**

###### Paso 1: Abrir proyecto en Android Studio

```bash
# Desde el directorio raíz de Jaarvi
cd androidApp
```

Abre Android Studio y selecciona **"Open an Existing Project"**, navega a la carpeta `androidApp`.

###### Paso 2: Configurar local.properties

Android Studio debería crear automáticamente `local.properties`, pero si no:

```properties
# androidApp/local.properties
sdk.dir=/Users/TU_USUARIO/Library/Android/sdk  # macOS
# o
sdk.dir=C\:\\Users\\TU_USUARIO\\AppData\\Local\\Android\\Sdk  # Windows
```

###### Paso 3: Sync Gradle

Android Studio iniciará automáticamente un Gradle Sync. Si no, haz clic en el ícono del elefante en la barra superior: **"Sync Project with Gradle Files"**.

> **⏱️ Primera vez**: Puede tomar 5-10 minutos descargando dependencias.

###### Paso 4: Configurar URL del backend local

Edita el archivo de configuración para apuntar a tu backend local:

```kotlin
// shared/src/commonMain/kotlin/com/jaarvi/config/NetworkConfig.kt
object NetworkConfig {
    const val BASE_URL = "http://10.0.2.2:3000"  // Emulador Android
    // const val BASE_URL = "http://localhost:3000"  // Dispositivo físico en misma red
}
```

> **📱 Nota sobre IPs**:
> - **Emulador Android**: usa `10.0.2.2` (apunta al localhost de tu máquina)
> - **Dispositivo físico**: usa la IP local de tu máquina (ej: `192.168.1.100`)

###### Paso 5: Ejecutar en emulador o dispositivo

**Opción A: Emulador**

1. En Android Studio: **Tools → Device Manager**
2. Crea un nuevo dispositivo virtual (AVD): **Pixel 6 API 34** (recomendado)
3. Click en ▶️ (Play) junto al AVD
4. Una vez iniciado el emulador, click en **Run 'app'** en Android Studio

**Opción B: Dispositivo físico**

1. Habilita **Opciones de desarrollador** en tu Android:
   - Ve a **Ajustes → Acerca del teléfono**
   - Toca **Número de compilación** 7 veces
2. Habilita **Depuración USB**:
   - Ve a **Ajustes → Sistema → Opciones de desarrollador**
   - Activa **Depuración USB**
3. Conecta tu dispositivo por USB
4. Acepta el prompt de autorización en el dispositivo
5. Click en **Run 'app'** en Android Studio

##### **Opción B: iOS (solo macOS)**

###### Paso 1: Abrir proyecto en Xcode

```bash
cd iosApp
open Jaarvi.xcworkspace  # o .xcodeproj si no hay workspace
```

> **💡 Si no existe el .xcworkspace**: Primero ejecuta `pod install` desde el directorio `iosApp`

###### Paso 2: Instalar CocoaPods dependencies

```bash
cd iosApp
pod install
```

> **🔧 Qué hace `pod install`**: 
> - Descarga las dependencias de CocoaPods definidas en el `Podfile`
> - **Automáticamente** ejecuta el build de Gradle para generar los frameworks de Kotlin (`shared` y `shared-ui`)
> - Vincula los frameworks generados al proyecto Xcode como frameworks nativos
> 
> **⏱️ Primera vez**: Puede tomar 5-10 minutos ya que debe compilar todo el código Kotlin a frameworks nativos para iOS.

> **💡 Troubleshooting**: Si ves errores relacionados con módulos Kotlin no encontrados, ejecuta manualmente:
> ```bash
> # Desde el directorio raíz del proyecto
> ./gradlew :shared:linkDebugFrameworkIosSimulatorArm64
> ./gradlew :shared-ui:linkDebugFrameworkIosSimulatorArm64
> 
> # Luego vuelve a intentar pod install
> cd iosApp
> pod install
> ```

###### Paso 3: Configurar URL del backend local

Edita la configuración (mismo archivo que Android):

```kotlin
// shared/src/commonMain/kotlin/com/jaarvi/config/NetworkConfig.kt
object NetworkConfig {
    const val BASE_URL = "http://localhost:3000"  // Simulador iOS
}
```

###### Paso 4: Configurar Signing & Capabilities

1. En Xcode, selecciona el proyecto **Jaarvi** en el navegador izquierdo
2. Selecciona el target **Jaarvi**
3. Ve a la pestaña **Signing & Capabilities**
4. En **Team**, selecciona tu Apple ID (o cuenta de desarrollador)
5. Xcode configurará automáticamente el Bundle Identifier

> **📝 Nota**: Para desarrollo local, puedes usar una cuenta Apple ID gratuita.

###### Paso 5: Ejecutar en simulador

1. En Xcode, selecciona un simulador: **iPhone 15 Pro** (recomendado)
2. Click en el botón ▶️ (Play) o presiona `Cmd + R`

#### **1.4.6. Verificación End-to-End**

##### Paso 1: Verificar backend está corriendo

```bash
curl http://localhost:3000/api/trips
```

Debería devolver una lista (posiblemente vacía si aún no creaste viajes).

##### Paso 2: Probar autenticación

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@jaarvi.app",
    "password": "TestPassword123"
  }'
```

Debería devolver un token JWT.

##### Paso 3: Verificar app móvil conecta al backend

1. Abre la app móvil en el emulador/simulador
2. Intenta crear una cuenta o hacer login con las credenciales de prueba
3. Si se conecta correctamente, deberías ver la pantalla principal

##### Paso 4: Probar flujo básico (opcional)

1. Crear un nuevo viaje
2. Agregar un destino
3. Crear actividades manualmente
4. Verificar que los datos se persisten en la base de datos:

```bash
psql -U jaarvi_dev -d jaarvi_dev -c "SELECT * FROM trips LIMIT 5;"
```

#### **1.4.7. Comandos Útiles para Desarrollo**

##### Backend

```bash
# Desarrollo con hot-reload
npm run dev

# Ejecutar tests
npm test

# Ejecutar tests con coverage
npm run test:coverage

# Linting
npm run lint

# Build para producción
npm run build

# Ver logs de Prisma
npx prisma studio  # Abre GUI para explorar DB en http://localhost:5555
```

##### Prisma

```bash
# Crear una nueva migración
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones pendientes
npx prisma migrate deploy

# Resetear database (⚠️ elimina todos los datos)
npx prisma migrate reset

# Generar cliente después de cambios en schema
npx prisma generate

# Abrir Prisma Studio (GUI para DB)
npx prisma studio
```

##### Mobile

```bash
# Android - Limpiar build
cd androidApp
./gradlew clean

# iOS - Limpiar build
cd iosApp
xcodebuild clean

# Kotlin Multiplatform - Build frameworks para iOS
# (normalmente pod install lo hace automáticamente)
./gradlew :shared:linkDebugFrameworkIosSimulatorArm64
./gradlew :shared-ui:linkDebugFrameworkIosSimulatorArm64

# Para dispositivo físico iOS (ARM64)
./gradlew :shared:linkDebugFrameworkIosArm64
./gradlew :shared-ui:linkDebugFrameworkIosArm64
```

#### **1.4.8. Solución de Problemas Comunes**

##### ❌ Error: "Port 3000 is already in use"

**Causa**: Otro proceso está usando el puerto 3000.

**Solución**:

```bash
# Encontrar el proceso
lsof -i :3000

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en .env
PORT=3001
```

##### ❌ Error: "Database connection failed"

**Causa**: PostgreSQL no está corriendo o credenciales incorrectas.

**Solución**:

```bash
# Verificar que PostgreSQL está corriendo
pg_isready

# Iniciar PostgreSQL (macOS con Homebrew)
brew services start postgresql@14

# Iniciar PostgreSQL (Linux)
sudo systemctl start postgresql

# Verificar credenciales en .env coinciden con tu configuración
```

##### ❌ Error: Prisma "Schema validation error"

**Causa**: Schema de Prisma tiene errores de sintaxis.

**Solución**:

```bash
# Validar schema
npx prisma validate

# Formatear schema
npx prisma format
```

##### ❌ Error: "Module not found" en backend

**Causa**: Dependencias no instaladas o cache corrupto.

**Solución**:

```bash
# Limpiar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

##### ❌ Error: Android Gradle sync fails

**Causa**: Configuración de SDK incorrecta o cache corrupto.

**Solución**:

```bash
# Invalidar caches en Android Studio
File → Invalidate Caches... → Invalidate and Restart

# Limpiar Gradle cache
./gradlew clean
rm -rf ~/.gradle/caches/
```

##### ❌ Error: iOS pod install fails

**Causa**: Versión de CocoaPods desactualizada o dependencias incompatibles.

**Solución**:

```bash
# Actualizar CocoaPods
sudo gem install cocoapods

# Limpiar e reinstalar
cd iosApp
rm -rf Pods Podfile.lock
pod install --repo-update
```

##### ❌ Error: "Module 'shared' not found" en iOS

**Causa**: Los frameworks de Kotlin no se generaron correctamente durante `pod install`.

**Solución**:

```bash
# Opción 1: Regenerar completamente con CocoaPods
cd iosApp
rm -rf Pods Podfile.lock
pod install --repo-update

# Opción 2: Build manual de frameworks Kotlin
cd ..  # Volver al directorio raíz
./gradlew :shared:linkDebugFrameworkIosSimulatorArm64
./gradlew :shared-ui:linkDebugFrameworkIosSimulatorArm64

# Luego volver a pod install
cd iosApp
pod install

# Opción 3: Limpiar cache de Gradle y reintentar
cd ..
./gradlew clean
cd iosApp
pod install
```

**Verificar que los frameworks se generaron**:

```bash
# Deben existir estos archivos:
ls -la ../shared/build/bin/iosSimulatorArm64/debugFramework/
ls -la ../shared-ui/build/bin/iosSimulatorArm64/debugFramework/
```

##### ❌ Error: "Network request failed" en mobile app

**Causa**: App no puede conectar al backend.

**Solución**:

1. **Verificar backend está corriendo**: `curl http://localhost:3000/health`
2. **Verificar URL correcta en NetworkConfig.kt**:
   - Emulador Android: `http://10.0.2.2:3000`
   - Simulador iOS: `http://localhost:3000`
   - Dispositivo físico: IP de tu máquina (ej: `http://192.168.1.100:3000`)
3. **Verificar firewall** no está bloqueando conexiones locales

##### ❌ Error: "Unauthorized" al llamar API

**Causa**: Token JWT no válido o expirado.

**Solución**:

1. Hacer login nuevamente para obtener nuevo token
2. Verificar `JWT_SECRET` en `.env` no ha cambiado
3. Verificar headers de autenticación:

```bash
# Formato correcto
Authorization: Bearer <tu_token_aquí>
```

#### **1.4.9. Setup Alternativo con Docker**

Si prefieres un setup más rápido usando Docker:

```bash
# Desde el directorio raíz
docker-compose up -d

# Esto iniciará:
# - PostgreSQL en puerto 5432
# - Backend en puerto 3000
# - Prisma Studio en puerto 5555
```

Archivo `docker-compose.yml` incluido en el proyecto.

#### **1.4.10. Próximos Pasos**

Una vez tengas el entorno configurado:

1. 📖 **Lee la documentación de arquitectura**: [Sección 2](#2-arquitectura-del-sistema)
2. 🗄️ **Explora el modelo de datos**: [Sección 3](#3-modelo-de-datos)
3. 📝 **Revisa las historias de usuario**: [Sección 5](#5-historias-de-usuario)
4. 🎯 **Consulta los estándares de desarrollo**: `ai-specs/specs/`
5. 🚀 **Empieza a desarrollar**: Revisa los tickets abiertos en [Sección 6](#6-tickets-de-trabajo)

#### **1.4.11. Recursos Adicionales**

- **Prisma Documentation**: [prisma.io/docs](https://www.prisma.io/docs/)
- **Kotlin Multiplatform**: [kotlinlang.org/docs/multiplatform.html](https://kotlinlang.org/docs/multiplatform.html)
- **Compose Multiplatform**: [jetbrains.com/lp/compose-multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)
- **Express.js Guide**: [expressjs.com/en/starter/installing.html](https://expressjs.com/en/starter/installing.html)

---

> **💬 ¿Necesitas ayuda?** Si encuentras problemas no cubiertos aquí, abre un issue en GitHub o contacta al equipo de desarrollo.

---

## 2. Arquitectura del Sistema

Jaarvi se construye como una app móvil multiplataforma con **Kotlin Multiplatform (KMP)** para compartir el core (dominio y datos) 
y **Compose Multiplatform (CMP)** para compartir la UI (pantallas y componentes) entre Android e iOS. Las integraciones con 
el sistema operativo (mapas, notificaciones, almacenamiento seguro, navegador in-app) se aíslan mediante **interfaces de capacidades** 
con implementaciones por plataforma. En v1, la navegación se resuelve con **mapas externos** (deep links) y más adelante se habilitan
 **mapas embebidos** reutilizando la misma abstracción.


### **2.1. Diagrama de arquitectura:**
> Usa el formato que consideres más adecuado para representar los componentes principales de la aplicación y las tecnologías utilizadas. Explica si sigue algún patrón predefinido, justifica por qué se ha elegido esta arquitectura, y destaca los beneficios principales que aportan al proyecto y justifican su uso, así como sacrificios o déficits que implica.

Arquitectura propuesta: **Kotlin Multiplatform (KMP) + Compose Multiplatform (CMP)** con un **core compartido** (dominio/datos) y una **UI compartida** (pantallas y componentes), más implementaciones específicas por plataforma para capacidades del sistema operativo (mapas, notificaciones, almacenamiento seguro, navegador in-app).

Esto permite un **time-to-market** rápido para Android+iOS (una sola base de UI y lógica) y reduce duplicación, manteniendo flexibilidad para integrar capacidades nativas cuando sea necesario.

#### **2.1.1 Mobile Apps Architecture**
```mermaid
flowchart TB
  User[Usuario]

  subgraph Apps[Apps]
    AndroidApp["Android App (Kotlin)"]
    IosApp["iOS App (Kotlin)"]
  end

  subgraph SharedUI["Shared UI (CMP)"]
    Screens["Pantallas y UI compartida (Compose)"]
    UIState["UI State (StateFlow) + Presenters"]
  end

  subgraph SharedCore["Shared Core (KMP)"]
    Domain["Dominio: itinerario, playbooks, Plan B"]
    Data["Datos: repositorios"]
    Net["Networking: Ktor + Kotlinx Serialization"]
    Db["Persistencia: SQLDelight"]
  end

  subgraph Platform["Capacidades por plataforma"]
    MapCap["MapCapability (interfaz)"]
    MapV1["v1: navegación externa (deep links)"]
    MapV2["v2: mapas embebidos (Android/iOS nativo)"]
    NotifCap["NotificationCapability (interfaz)"]
    BrowserCap["BrowserCapability (interfaz)"]
    DocsCap["DocumentVault (interfaz)"]
  end

  subgraph Services["Servicios externos"]
    BackendAPI["Backend API (REST/JSON)"]
    Affiliate["Partners afiliados"]
  end

  User --> AndroidApp
  User --> IosApp

  AndroidApp --> Screens
  IosApp --> Screens

  Screens --> UIState
  UIState --> Domain
  Domain --> Data
  Data --> Net
  Data --> Db

  Screens --> MapCap
  MapCap --> MapV1
  MapCap --> MapV2

  Screens --> NotifCap
  Screens --> BrowserCap
  Screens --> DocsCap

  Net --> BackendAPI
  BrowserCap --> Affiliate
```

Beneficios principales:
- Menos duplicación: UI y lógica compartidas entre Android/iOS.
- Escalabilidad: se separa dominio/datos de la UI y de capacidades de plataforma.
- Evolución controlada: mapas embebidos se agregan luego sin reescribir el flujo (misma interfaz `MapCapability`).

Sacrificios/consideraciones:
- Algunas capacidades siguen siendo específicas por plataforma (notificaciones, almacenamiento, mapas embebidos).
- La disciplina de mantener el código compartido libre de dependencias Android-only es clave.

#### **2.1.2 Backend Architecture**

El backend de Jaarvi implementa una **arquitectura en capas** basada en **Domain-Driven Design (DDD)** con **Node.js/TypeScript/Express**, diseñada para ser **escalable**, **mantenible** y **testeable**. La arquitectura separa claramente las responsabilidades en cuatro capas principales y se despliega como funciones serverless en AWS Lambda, integrándose con los servicios de AWS (RDS PostgreSQL, S3, Bedrock) y las aplicaciones móviles KMP.

##### **Diagrama de Arquitectura Backend**

```mermaid
graph TB
    subgraph "Mobile Layer"
        Mobile["Mobile Apps<br/>(Android/iOS KMP)"]
    end

    subgraph "API Gateway"
        Gateway["AWS API Gateway<br/>REST + WebSocket"]
        Auth["AWS Cognito<br/>Authentication"]
    end

    subgraph "Presentation Layer"
        Routes["Express Routes<br/>API Endpoints"]
        Controllers["Controllers<br/>Request Handlers"]
        Middleware["Middleware<br/>Auth, Validation, CORS, Errors"]
    end

    subgraph "Application Layer"
        TripService["TripService<br/>Trip Management"]
        ItineraryService["ItineraryService<br/>Planning Orchestration"]
        ActivityService["ActivityService<br/>Activity Operations"]
        DocumentService["DocumentService<br/>Document Management"]
        PlaybookService["PlaybookService<br/>Guidance Logic"]
        AIOrchestrator["AIOrchestrator<br/>AI Service Coordination"]
        Validator["Validator<br/>Input Validation"]
    end

    subgraph "Domain Layer"
        subgraph "Aggregates"
            TripAggregate["Trip Aggregate<br/>Trip + Destinations<br/>+ Itineraries"]
            UserAggregate["User Aggregate<br/>User + Preferences<br/>+ Profile"]
        end
        
        subgraph "Entities"
            Itinerary["Itinerary"]
            DayPlan["DayPlan"]
            Activity["Activity"]
            Document["Document"]
        end
        
        subgraph "Value Objects"
            Preferences["TravelPreferences"]
            Location["Location"]
            TimeBlock["TimeBlock"]
            CostEstimate["CostEstimate"]
        end
        
        subgraph "Domain Services"
            ItineraryGenerator["ItineraryGenerator"]
            PlanBEngine["PlanBEngine"]
            TimeCalculator["TimeCalculator"]
            BudgetCalculator["BudgetCalculator"]
        end
        
        subgraph "Repository Interfaces"
            ITripRepo["ITripRepository"]
            IUserRepo["IUserRepository"]
            IDocRepo["IDocumentRepository"]
        end
    end

    subgraph "Infrastructure Layer"
        subgraph "Repository Implementations"
            TripRepo["TripRepository<br/>(Prisma)"]
            UserRepo["UserRepository<br/>(Prisma)"]
            DocumentRepo["DocumentRepository<br/>(Prisma)"]
        end
        
        subgraph "External Services"
            Prisma["Prisma Client<br/>ORM"]
            AIService["AI Service Client<br/>(Amazon Bedrock)"]
            S3Client["S3 Client<br/>Document Storage"]
            SQSClient["SQS Client<br/>Async Jobs"]
            SNSClient["SNS Client<br/>Notifications"]
        end
        
        subgraph "Infrastructure Utilities"
            Logger["Logger<br/>CloudWatch"]
            EventBus["Event Bus<br/>Domain Events"]
        end
    end

    subgraph "Data Layer"
        Postgres[("PostgreSQL<br/>RDS Multi-AZ")]
        S3[("S3 Buckets<br/>Documents")]
        Cache[("DynamoDB<br/>Session Cache")]
    end

    subgraph "AI & Async Processing"
        Bedrock["Amazon Bedrock<br/>LLM Service"]
        Lambda["Lambda Functions<br/>Background Jobs"]
        SQS["SQS Queue<br/>Job Queue"]
    end

    %% Connections
    Mobile --> Gateway
    Gateway --> Auth
    Gateway --> Routes
    
    Routes --> Middleware
    Middleware --> Controllers
    
    Controllers --> TripService
    Controllers --> ItineraryService
    Controllers --> ActivityService
    Controllers --> DocumentService
    Controllers --> PlaybookService
    
    TripService --> Validator
    ItineraryService --> Validator
    ItineraryService --> AIOrchestrator
    PlaybookService --> AIOrchestrator
    
    TripService --> TripAggregate
    ItineraryService --> TripAggregate
    ActivityService --> Itinerary
    DocumentService --> Document
    
    TripAggregate --> ItineraryGenerator
    TripAggregate --> PlanBEngine
    Itinerary --> TimeCalculator
    Activity --> BudgetCalculator
    
    ItineraryGenerator --> ITripRepo
    TripService --> ITripRepo
    ItineraryService --> ITripRepo
    DocumentService --> IDocRepo
    
    ITripRepo -.implements.-> TripRepo
    IUserRepo -.implements.-> UserRepo
    IDocRepo -.implements.-> DocumentRepo
    
    TripRepo --> Prisma
    UserRepo --> Prisma
    DocumentRepo --> Prisma
    
    AIOrchestrator --> AIService
    AIOrchestrator --> SQSClient
    DocumentRepo --> S3Client
    
    Prisma --> Postgres
    S3Client --> S3
    UserRepo --> Cache
    
    AIService --> Bedrock
    SQSClient --> SQS
    SQS --> Lambda
    Lambda --> AIService
    
    TripService --> Logger
    Controllers --> EventBus
    
    style TripAggregate fill:#E8F4F8
    style UserAggregate fill:#E8F4F8
    style Prisma fill:#3B48CC,color:#fff
    style Postgres fill:#3B48CC,color:#fff
    style S3 fill:#569A31,color:#fff
    style Bedrock fill:#6B5EFF,color:#fff
```

##### **Descripción de Capas**

**1. Presentation Layer** (Capa de Presentación)

Esta capa maneja la comunicación HTTP y actúa como punto de entrada para las solicitudes de las aplicaciones móviles.

- **Express Routes**: Definen los endpoints REST (`/api/trips`, `/api/itineraries`, `/api/activities`, `/api/documents`)
- **Controllers**: Manejan las peticiones HTTP, delegan lógica de negocio a servicios, y formatean respuestas
  - `TripController`: CRUD de viajes y gestión de destinos
  - `ItineraryController`: Generación y edición de itinerarios
  - `ActivityController`: Gestión de actividades diarias
  - `DocumentController`: Carga y consulta de documentos de viaje
  - `PlaybookController`: Consulta de playbooks y guías por destino
- **Middleware**:
  - `authMiddleware`: Valida tokens JWT de Cognito
  - `validationMiddleware`: Valida esquemas de entrada usando `validator`
  - `corsMiddleware`: Configura CORS para apps móviles
  - `errorMiddleware`: Manejo global de errores con logging

**2. Application Layer** (Capa de Aplicación)

Orquesta la lógica de negocio y coordina operaciones entre el dominio y la infraestructura. **No contiene lógica de dominio**, solo coordinación.

- **TripService**: Gestión completa del ciclo de vida de un viaje
  - Crear/actualizar/eliminar viajes
  - Agregar destinos a un viaje
  - Consultar viajes por usuario
- **ItineraryService**: Orquestación de generación de itinerarios
  - Iniciar generación de itinerario (sincrónica o asíncrona)
  - Refrescar itinerario diario (start-of-day mode)
  - Coordinar con `AIOrchestrator` para obtener sugerencias
- **ActivityService**: Operaciones sobre actividades
  - CRUD de actividades en un día
  - Marcar actividades como completadas/saltadas
  - Reordenar actividades en el día
- **DocumentService**: Gestión de documentos
  - Subir documentos (tickets, reservas, permisos)
  - Vincular documentos a actividades/días
  - Recuperar documentos por contexto
- **PlaybookService**: Consulta de playbooks y guías
  - Obtener playbooks por destino
  - Recuperar instrucciones paso a paso
  - Sugerir alternativas (Plan B)
- **AIOrchestrator**: Coordinador de servicios de IA
  - Prepara contexto para generación de itinerarios
  - Envía solicitudes a Amazon Bedrock (LLM)
  - Encola trabajos pesados en SQS para procesamiento asíncrono
  - Audita generaciones AI (prompt, respuesta, metadata)

> **Nota MVP**: En la Fase 1 (MVP), el `AIOrchestrator` y los servicios de IA NO se implementan. Los servicios de aplicación (`TripService`, `ItineraryService`, `ActivityService`) funcionan completamente sin dependencias de IA, usando solo lógica de dominio y repositorios. La arquitectura está preparada para agregar IA en Fase 2 sin refactorización.

- **Validator**: Validación centralizada de entradas
  - Valida esquemas de datos de entrada
  - Sanitización de inputs
  - Reglas de negocio transversales

**3. Domain Layer** (Capa de Dominio)

El corazón de la aplicación. Contiene **toda la lógica de negocio** y es **independiente** de frameworks y tecnologías externas.

**Aggregates** (Raíces de Agregado):
- **Trip Aggregate**: Raíz del agregado que gestiona el viaje completo
  - `Trip` (Entity): Viaje con fechas, estado, metadata
  - `TripDestination` (Entity): Destinos dentro del viaje con rangos de días
  - `Itinerary` (Entity): Versión del itinerario generado
  - Invariantes: Un viaje debe tener al menos un destino; fechas coherentes
  
- **User Aggregate**: Gestiona usuario y sus preferencias
  - `User` (Entity): Usuario con perfil y credenciales
  - `UserProfile` (Value Object): Datos de perfil
  - `TravelPreferences` (Value Object): Preferencias de viaje (ritmo, presupuesto, intereses)

**Entities** (Entidades):
- `Itinerary`: Versión de un itinerario con metadata de generación
- `DayPlan`: Plan para un día específico con actividades ordenadas
- `Activity`: Actividad individual (visita, traslado, comida, etc.)
- `Document`: Documento de viaje vinculado a actividad/día

**Value Objects** (Objetos de Valor):
- `Location`: Coordenadas + dirección
- `TimeBlock`: Ventana de tiempo (inicio, fin, duración)
- `CostEstimate`: Estimación de costo (monto, moneda, nivel de confianza)
- `TravelPreferences`: Configuración de preferencias (inmutable)

**Domain Services** (Servicios de Dominio):
- **ItineraryGenerator**: Genera itinerarios usando reglas de negocio + AI
  - Asigna actividades a días
  - Valida factibilidad (tiempos de viaje, horarios)
  - Incorpora actividades obligatorias (ej: dormir)
- **PlanBEngine**: Genera alternativas cuando el plan original no es viable
  - Detecta conflictos (cierres, clima, presupuesto)
  - Propone actividades alternativas equivalentes
- **TimeCalculator**: Calcula tiempos de viaje y ventanas horarias
  - Estima duración de actividades
  - Calcula tiempos de traslado entre ubicaciones
- **BudgetCalculator**: Calcula costos y presupuestos
  - Suma costos por día/actividad
  - Valida contra restricciones de presupuesto

**Repository Interfaces**:
- `ITripRepository`: Contrato para acceso a datos de Trip
- `IUserRepository`: Contrato para acceso a datos de User
- `IDocumentRepository`: Contrato para acceso a documentos

**4. Infrastructure Layer** (Capa de Infraestructura)

Implementa los detalles técnicos y se integra con servicios externos. **Depende del dominio**, no al revés (Dependency Inversion).

**Repository Implementations**:
- **TripRepository**: Implementación con Prisma para Trip aggregate
  - Mapea entre entidades de dominio y modelos Prisma
  - Maneja transacciones para operaciones complejas
- **UserRepository**: Implementación con Prisma + DynamoDB cache
  - Caché de sesiones en DynamoDB
  - Persistencia en PostgreSQL
- **DocumentRepository**: Implementación con Prisma + S3
  - Metadata en PostgreSQL
  - Archivos binarios en S3

**External Services**:
- **Prisma Client**: ORM para acceso type-safe a PostgreSQL
- **AI Service Client**: Cliente para Amazon Bedrock (generación de itinerarios)
- **S3 Client**: Cliente AWS SDK para almacenamiento de documentos
- **SQS Client**: Cliente para encolar trabajos asíncronos
- **SNS Client**: Cliente para envío de notificaciones push

**Infrastructure Utilities**:
- **Logger**: Wrapper de CloudWatch para logging estructurado
- **Event Bus**: Sistema de eventos de dominio para desacoplamiento

##### **Decisiones de Diseño Clave**

1. **Domain-Driven Design (DDD)**
   - **Decisión**: Usar DDD con agregados y entidades bien definidas
   - **Razón**: El dominio de viajes es complejo (Trip, Itinerary, Activities, Documents) con reglas de negocio sofisticadas
   - **Beneficio**: Lógica de negocio encapsulada, fácil de testear y evolucionar

2. **Layered Architecture (4 Capas)**
   - **Decisión**: Separación estricta en Presentation → Application → Domain → Infrastructure
   - **Razón**: Desacoplar lógica de negocio de detalles técnicos (base de datos, frameworks)
   - **Beneficio**: Testabilidad (domain layer sin dependencias externas), mantenibilidad, escalabilidad

3. **Repository Pattern con Interfaces**
   - **Decisión**: Definir contratos (`ITripRepository`) en el dominio, implementar en infraestructura
   - **Razón**: Inversión de dependencias (DIP) - el dominio no depende de Prisma
   - **Beneficio**: Fácil testeo con mocks, posibilidad de cambiar ORM sin afectar dominio

4. **AI Service como Servicio de Aplicación Orquestado**
   - **Decisión**: `AIOrchestrator` en capa de aplicación coordina con `ItineraryGenerator` (dominio) y `AIService` (infra)
   - **Razón**: La IA es un detalle de implementación, las reglas de negocio están en el dominio
   - **Beneficio**: Podemos cambiar el proveedor de IA (Bedrock → OpenAI) sin afectar el dominio

5. **Procesamiento Asíncrono con SQS**
   - **Decisión**: Generación de itinerarios complejos se encola en SQS para procesamiento en Lambda
   - **Razón**: Generación de itinerarios puede tomar >30s (límite de API Gateway)
   - **Beneficio**: Mejor UX (respuesta inmediata), escalabilidad (múltiples workers)

6. **Document Storage Híbrido (Prisma + S3)**
   - **Decisión**: Metadata en PostgreSQL, binarios en S3
   - **Razón**: PostgreSQL no es óptimo para almacenar archivos grandes; S3 es especializado y económico
   - **Beneficio**: Mejor rendimiento, costos optimizados, escalabilidad

7. **Serverless Deployment (AWS Lambda)**
   - **Decisión**: Express app envuelta con `serverless-http` y desplegada en Lambda
   - **Razón**: Escalabilidad automática, pay-per-use, baja latencia con API Gateway
   - **Beneficio**: Costo reducido en MVP, infraestructura gestionada, alta disponibilidad

##### **Puntos de Integración**

**Con Mobile Apps (KMP)**:
- Las apps móviles consumen el backend vía **API REST** a través de API Gateway
- Autenticación con **tokens JWT** emitidos por AWS Cognito
- Networking layer en KMP usa **Ktor Client** para llamadas HTTP
- Formato de intercambio: **JSON** con modelos compartidos (Kotlinx Serialization)
- WebSocket para notificaciones en tiempo real (futuro)

**Con AI Services (Amazon Bedrock)**:
- `AIOrchestrator` prepara el contexto de generación (trip, preferences, playbooks disponibles)
- Llama a Bedrock con prompts estructurados para generar itinerarios
- Parsea respuesta del LLM y crea entidades de dominio (`Itinerary`, `DayPlan`, `Activity`)
- Audita generaciones (prompt, respuesta, model version) en base de datos para mejora continua

**Con Servicios Externos (Afiliados)**:
- `PlaybookService` incluye recomendaciones contextuales de afiliados
- No hay integración directa backend-afiliados (redirección desde app móvil)
- Backend registra clics de afiliados para atribución básica

##### **Beneficios y Trade-offs**

**Beneficios**:
- ✅ **Alta Mantenibilidad**: Separación clara de responsabilidades, fácil localizar y modificar código
- ✅ **Testabilidad**: Dominio sin dependencias externas, fácil mockear infraestructura
- ✅ **Escalabilidad**: Arquitectura serverless escala automáticamente con demanda
- ✅ **Flexibilidad**: Cambiar ORMs, proveedores de IA o bases de datos sin afectar lógica de negocio
- ✅ **Type Safety**: TypeScript + Prisma garantizan type safety end-to-end
- ✅ **Despliegue Independiente**: Backend se despliega independientemente de mobile apps

**Trade-offs**:
- ⚠️ **Complejidad Inicial**: DDD y capas añaden estructura; puede ser overkill para MVPs muy pequeños (pero Jaarvi es lo suficientemente complejo para justificarlo)
- ⚠️ **Latencia de Cold Start**: Lambda tiene cold starts (~1-3s primera invocación); mitigable con provisioned concurrency si es crítico
- ⚠️ **Curva de Aprendizaje**: Equipo debe entender DDD, agregados, y separación de capas
- ⚠️ **Overhead de Mapeo**: Mapear entre modelos Prisma y entidades de dominio añade código boilerplate (pero mejora desacoplamiento)
- ⚠️ **Costos de Infraestructura**: RDS Multi-AZ y Bedrock tienen costos fijos; evaluar trade-off costo/disponibilidad




### **2.2. Descripción de componentes principales:**

> Describe los componentes más importantes, incluyendo la tecnología utilizada

- **Apps (Android/iOS)**: entrypoints por plataforma y wiring de dependencias.
- **UI compartida (CMP)**: pantallas principales (setup del viaje, planificador/edición, modo “Hoy”, documentos) y componentes reutilizables.
- **UI State (presenters)**: clases “tipo ViewModel” multiplataforma que exponen `StateFlow` y manejan eventos de UI (sin `androidx.lifecycle.ViewModel` en código compartido).
- **Core compartido (KMP)**:
  - **Dominio**: reglas de itinerario, playbooks, cálculo de tiempos, “Plan B”.
  - **Datos**: repositorios y cache.
  - **Networking**: Ktor + serialización.
  - **Persistencia**: SQLDelight.
- **Capacidades por plataforma (interfaces + impls)**: `MapCapability`, `NotificationCapability`, `BrowserCapability`, `DocumentVault`.

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

> Representa la estructura del proyecto y explica brevemente el propósito de las carpetas principales, así como si obedece a algún patrón o arquitectura específica.

#### **Estructura Completa del Proyecto**

```
Jaarvi/
├── backend/                # Backend Node.js/TypeScript con Express
│   ├── src/
│   │   ├── domain/        # Capa de Dominio (DDD)
│   │   │   ├── models/            # Entidades y Agregados
│   │   │   └── repositories/      # Interfaces de repositorios
│   │   ├── application/   # Capa de Aplicación
│   │   │   ├── services/          # Servicios de negocio
│   │   │   └── validator.ts       # Validación de entradas
│   │   ├── presentation/  # Capa de Presentación
│   │   │   └── controllers/       # Controllers HTTP
│   │   ├── infrastructure/# Capa de Infraestructura
│   │   │   ├── logger.ts          # Logging
│   │   │   └── prismaClient.ts    # Cliente Prisma
│   │   ├── routes/        # Definición de rutas Express
│   │   ├── middleware/    # Middleware (auth, CORS, errors)
│   │   ├── index.ts       # Entry point del servidor
│   │   └── lambda.ts      # Handler AWS Lambda
│   ├── prisma/
│   │   ├── schema.prisma  # Schema de base de datos
│   │   ├── migrations/    # Migraciones versionadas
│   │   └── seed.ts        # Datos iniciales (seed)
│   ├── test-utils/        # Utilidades para testing
│   │   ├── builders/              # Test data builders
│   │   └── mocks/                 # Mock helpers
│   ├── __tests__/         # Tests unitarios y de integración
│   ├── jest.config.js     # Configuración Jest
│   ├── tsconfig.json      # Configuración TypeScript
│   ├── serverless.yml     # Configuración Serverless Framework
│   ├── package.json       # Dependencias del backend
│   └── .env.example       # Template de variables de entorno
│
├── shared/                 # KMP: Código compartido multiplataforma
│   └── src/
│       ├── commonMain/    # Código común (Android + iOS)
│       │   └── kotlin/
│       │       ├── domain/        # Dominio: itinerario, playbooks, Plan B
│       │       ├── data/          # Repositorios, cache
│       │       └── network/       # Ktor client + Kotlinx Serialization
│       ├── androidMain/   # Código específico Android
│       │   └── kotlin/
│       └── iosMain/       # Código específico iOS
│           └── kotlin/
│
├── shared-ui/              # CMP: UI compartida (pantallas y componentes)
│   └── src/
│       ├── commonMain/    # UI común (Compose Multiplatform)
│       │   └── kotlin/
│       │       ├── screens/       # Pantallas principales
│       │       ├── components/    # Componentes reutilizables
│       │       └── presenters/    # ViewModels/Presenters (StateFlow)
│       ├── androidMain/   # Ajustes UI específicos Android
│       │   └── kotlin/
│       └── iosMain/       # Ajustes UI específicos iOS
│           └── kotlin/
│
├── androidApp/             # Android: Entry point + capacidades de plataforma
│   ├── src/
│   │   └── main/
│   │       ├── kotlin/
│   │       │   ├── capabilities/  # MapCapability, NotificationCapability, etc.
│   │       │   └── MainActivity.kt
│   │       ├── res/               # Recursos Android (layouts, drawables)
│   │       └── AndroidManifest.xml
│   └── build.gradle.kts
│
├── iosApp/                 # iOS: Entry point + capacidades de plataforma
│   ├── Jaarvi/
│   │   ├── capabilities/          # MapCapability, NotificationCapability, etc.
│   │   ├── ContentView.swift      # Vista principal
│   │   ├── JaarviApp.swift        # Entry point iOS
│   │   └── Info.plist
│   └── Jaarvi.xcodeproj
│
├── product-discovery/      # Documentación de producto y diseño
│   ├── 1-JaarviGeneralSpecs.md   # Especificaciones generales
│   ├── 2-lean-canvas.md          # Lean Canvas
│   ├── 4-GeneralArchitecture.md  # Diagramas de arquitectura
│   ├── 5-UseCases.md             # Casos de uso
│   └── 6-DataBase.md             # Diseño de base de datos
│
├── ai-specs/               # Especificaciones para desarrollo con IA
│   ├── specs/
│   │   ├── base-standards.mdc           # Estándares base (TDD, etc.)
│   │   ├── backend-standards.mdc        # Estándares backend
│   │   ├── frontend-standards.mdc       # Estándares frontend
│   │   └── documentation-standards.mdc  # Estándares de docs
│   ├── .agents/                         # Configuración de agentes IA
│   └── .commands/                       # Comandos personalizados
│
└── README.md               # Este archivo - documentación principal
```

** Dependency Grap
androidApp ──┐
             ├─> shared-ui ──> shared ──> Backend API
iosApp ──────┘                      └──> SQLDelight (local DB)

#### **Descripción de Componentes Principales**

##### **Backend (Node.js/TypeScript)**

Sigue **Domain-Driven Design (DDD)** con arquitectura en capas:

- **`domain/`**: Capa de dominio con entidades, agregados (Trip, User), value objects, y contratos de repositorios. **Independiente** de frameworks externos.
  
- **`application/`**: Capa de aplicación con servicios que orquestan lógica de negocio (TripService, ItineraryService, ActivityService). Coordina entre dominio e infraestructura.

- **`presentation/`**: Capa de presentación con controllers que manejan peticiones HTTP y responses. Delegan lógica a servicios.

- **`infrastructure/`**: Capa de infraestructura con implementaciones de repositorios (Prisma), clientes externos (S3, SQS), y utilidades (logger, event bus).

- **`prisma/`**: Schema de base de datos, migraciones versionadas, y scripts de seed.

**Patrón**: Layered Architecture + Repository Pattern + Dependency Inversion

##### **Shared (Kotlin Multiplatform)**

Código compartido entre Android e iOS:

- **`domain/`**: Lógica de negocio del cliente (reglas de itinerarios, validaciones, modelos).
  
- **`data/`**: Repositorios, cache local (SQLDelight), sincronización.

- **`network/`**: Cliente HTTP (Ktor), serialización (Kotlinx), gestión de API calls.

**Patrón**: Clean Architecture + Repository Pattern

##### **Shared-UI (Compose Multiplatform)**

UI compartida entre plataformas:

- **`screens/`**: Pantallas completas (TripListScreen, ItineraryEditorScreen, TodayScreen).
  
- **`components/`**: Componentes reutilizables (buttons, cards, forms).

- **`presenters/`**: Clases "tipo ViewModel" que exponen `StateFlow` y manejan eventos de UI (sin dependencia de `androidx.lifecycle`).

**Patrón**: MVVM (Model-View-ViewModel) adaptado para multiplataforma

##### **AndroidApp / iOSApp**

Entry points por plataforma:

- **`capabilities/`**: Implementaciones específicas de plataforma para interfaces definidas en `shared` (mapas, notificaciones, almacenamiento seguro, navegador).

- **MainActivity.kt / JaarviApp.swift**: Puntos de entrada que inicializan la app y cargan la UI compartida.

**Patrón**: Adapter Pattern para capabilities

#### **Patrones Arquitectónicos Aplicados**

1. **Domain-Driven Design (DDD)**: Backend estructura el código alrededor del dominio de negocio
2. **Layered Architecture**: Separación clara de responsabilidades en capas (Backend + Mobile)
3. **Clean Architecture**: Dependencias apuntan hacia el dominio, no hacia afuera
4. **Repository Pattern**: Abstracción de acceso a datos con interfaces
5. **Dependency Inversion**: Capas superiores no dependen de detalles de implementación
6. **Capability Pattern**: Abstracciones para funcionalidades específicas de plataforma

#### **Convenciones de Nomenclatura**

- **Backend (TypeScript)**: camelCase para archivos, PascalCase para clases
- **Mobile (Kotlin)**: PascalCase para archivos y clases, camelCase para funciones
- **Tests**: Misma estructura que `src/`, con sufijo `.test.ts` o `Test.kt`
- **Componentes compartidos**: Prefijo `Andes` para componentes de UI (ej: `AndesButton`)

### **2.4. Infraestructura y despliegue**

#### Diagrama de Infraestructura AWS

```plantuml
@startuml Jaarvi AWS Infrastructure
!define RECTANGLE_COLOR #FF9900
!define VPC_COLOR #E8F4F8
!define DATABASE_COLOR #3B48CC
!define STORAGE_COLOR #569A31
!define COMPUTE_COLOR #FF9900

skinparam rectangle {
  BackgroundColor<<mobile>> #3498DB
  BackgroundColor<<cdn>> #FF9900
  BackgroundColor<<gateway>> #FF9900
  BackgroundColor<<auth>> #DD344C
  BackgroundColor<<compute>> #FF9900
  BackgroundColor<<database>> #3B48CC
  BackgroundColor<<storage>> #569A31
  BackgroundColor<<ai>> #6B5EFF
  BackgroundColor<<messaging>> #E7157B
  BackgroundColor<<monitoring>> #FF9900
  BorderColor Black
  FontColor White
}

actor "User" as user

' Mobile Layer
package "Mobile Apps" <<mobile>> {
  component "Android App\n(Kotlin/Compose)" as android
  component "iOS App\n(Kotlin/Compose)" as ios
}

' Edge Layer
component "CloudFront\nCDN" <<cdn>> as cdn
component "API Gateway\nREST/WebSocket" <<gateway>> as apigw
component "Cognito\nAuthentication" <<auth>> as cognito

' Application Layer
package "VPC - Application Tier" <<compute>> as vpc_app {
  component "Application\nLoad Balancer" <<gateway>> as alb
  
  package "ECS Cluster" <<compute>> {
    component "Backend API\nNode.js/TypeScript\nPrisma ORM" <<compute>> as backend
    component "AI Service\nItinerary Generation\nPlaybooks Engine" <<ai>> as ai_service
  }
}

' Data Layer
package "VPC - Data Tier" <<database>> as vpc_data {
  database "RDS PostgreSQL\nPrimary (Multi-AZ)" <<database>> as postgres
  database "RDS PostgreSQL\nRead Replica" <<database>> as postgres_read
  database "DynamoDB\nSession Cache" <<database>> as dynamodb
}

' Storage Layer
storage "S3 Documents\nTravel Docs\nTickets & Permits" <<storage>> as s3_docs
storage "S3 Static Assets\nImages & Maps\nPlaybooks" <<storage>> as s3_static

' AI & Processing Services
component "Amazon Bedrock\nLLM Service" <<ai>> as bedrock
component "Lambda Functions\nEvent Processing" <<compute>> as lambda

' Messaging & Notifications
queue "SQS\nAsync Job Queue" <<messaging>> as sqs
component "SNS\nPush Notifications" <<messaging>> as sns

' Monitoring
component "CloudWatch\nLogs & Metrics\nAlerts" <<monitoring>> as cloudwatch

' CI/CD
cloud "CI/CD Pipeline" {
  component "GitHub Actions" <<compute>> as github
  component "App Distribution\nGoogle Play\nApp Store" <<mobile>> as distribution
}

' Connections
user -down-> android
user -down-> ios

android -down-> cdn
ios -down-> cdn
android -down-> apigw : Direct API
ios -down-> apigw : Direct API

cdn -down-> apigw
apigw -right-> cognito : Auth
apigw -down-> alb

alb -down-> backend
alb -down-> ai_service

backend -down-> postgres : Write
backend -down-> postgres_read : Read
backend -down-> dynamodb : Cache
backend -right-> s3_docs : Documents
backend -right-> s3_static : Assets

ai_service -down-> postgres
ai_service -right-> bedrock : Generate
ai_service -right-> s3_static : Playbooks

backend -down-> sqs : Queue Jobs
sqs -right-> lambda
lambda -up-> ai_service : Trigger

backend -down-> sns : Notifications
ai_service -down-> sns
sns -up-> android : Push
sns -up-> ios : Push

backend -right-> cloudwatch : Logs
ai_service -right-> cloudwatch : Logs
lambda -right-> cloudwatch : Logs

github -down-> backend : Deploy
github -down-> ai_service : Deploy
github -down-> distribution
distribution -up-> android : Release
distribution -up-> ios : Release

note right of backend
  **Backend API**
  - REST API with Prisma ORM
  - Trip CRUD operations
  - Document management
  - User preferences
  - Authentication flows
end note

note right of ai_service
  **AI Service**
  - Itinerary generation
  - Playbooks execution
  - Plan B alternatives
  - Local advice engine
  - Context-aware recommendations
end note

note bottom of postgres
  **PostgreSQL Database**
  - Users, Trips, Itineraries
  - Activities, Documents
  - AI Generation metadata
  - Multi-AZ for High Availability
  - Automated backups
end note

note bottom of s3_docs
  **Secure Document Storage**
  - Encrypted at rest (AES-256)
  - Lifecycle policies
  - Versioning enabled
  - Access control with IAM
end note

@enduml
```

#### Descripción de la Infraestructura

**Capa de Cliente:**
- **Android/iOS Apps**: Aplicaciones móviles construidas con Kotlin Multiplatform y Compose Multiplatform, desplegadas en Google Play y App Store.

**Capa de Entrada (Edge):**
- **CloudFront**: CDN para cachear contenido estático y reducir latencia global.
- **API Gateway**: Punto de entrada unificado para todas las APIs REST y WebSocket, con rate limiting y throttling.
- **Cognito**: Gestión de autenticación y autorización de usuarios (email/password, Google, Apple OAuth).

**Capa de Aplicación (VPC):**
- **Application Load Balancer**: Distribuye tráfico entre instancias de backend y AI service.
- **ECS Cluster**:
  - **Backend API**: Servicio Node.js/TypeScript con Prisma ORM para operaciones CRUD, gestión de viajes, documentos y preferencias.
  - **AI Service**: Servicio especializado para generación de itinerarios, ejecución de playbooks, alternativas Plan B y recomendaciones locales, integrado con Amazon Bedrock.

**Capa de Datos (VPC):**
- **RDS PostgreSQL**: Base de datos principal (Multi-AZ) con réplica de lectura para escalado horizontal en consultas.
- **DynamoDB**: Cache de sesiones y preferencias de usuario para acceso rápido.

**Capa de Almacenamiento:**
- **S3 - Documents**: Almacenamiento encriptado de documentos de viaje (tickets, permisos, reservas) con versionado habilitado.
- **S3 - Static Assets**: Contenido estático (imágenes, mapas, contenido de playbooks).

**Servicios de IA y Procesamiento:**
- **Amazon Bedrock**: LLM para generación inteligente de itinerarios y recomendaciones contextuales.
- **Lambda Functions**: Procesamiento de eventos asíncronos y tareas de background.
- **SQS**: Cola de mensajes para procesamiento asíncrono de generación de itinerarios y trabajos pesados.
- **SNS**: Servicio de notificaciones push para alertas de tiempo y recordatorios.

**Monitoreo:**
- **CloudWatch**: Centralización de logs, métricas y alertas para todos los servicios.

#### Proceso de Despliegue

**1. Desarrollo y CI/CD:**
- Rama por feature/ticket → Pull Request a `main` → Revisión de código.
- **GitHub Actions** ejecuta automáticamente:
  - Linting y validación de código
  - Tests unitarios e integración (KMP commonTest)
  - Build de contenedores Docker
  - Análisis de seguridad (SAST/dependency scanning)

**2. Backend Deployment:**
- Merge a `main` → GitHub Actions construye imágenes Docker.
- Push a Amazon ECR (Elastic Container Registry).
- Actualización de servicios ECS con rolling deployment (zero-downtime).
- Health checks verifican disponibilidad antes de completar despliegue.

**3. Mobile App Distribution:**
- **Android**: Build con Gradle → firma APK/AAB → upload a Google Play Console (internal track → beta → production).
- **iOS**: Build con Xcode → firma con certificados → upload a TestFlight → App Store Connect.
- Releases versionadas con changelog y rollout gradual (staged rollout).

**4. Infraestructura como Código:**
- Infraestructura AWS gestionada con **Terraform** o **AWS CDK**.
- Configuración versionada en repositorio separado.
- Aplicación de cambios mediante pipeline automatizado con validación previa.

**5. Estrategia de Rollback:**
- ECS permite rollback inmediato a versión anterior en caso de problemas.
- Backup automático de RDS antes de migraciones de esquema.
- Feature flags para habilitar/deshabilitar funcionalidades sin redespliegue.

**6. Ambientes:**
- **Development**: Para testing interno, datos sintéticos.
- **Staging**: Réplica de producción con datos anonimizados para QA.
- **Production**: Ambiente productivo con monitoreo 24/7 y auto-scaling configurado.

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

Prácticas recomendadas (MVP):
- **HTTPS** para toda comunicación con backend/terceros.
- **Almacenamiento seguro** para datos sensibles (tokens/credenciales) usando mecanismos nativos por plataforma (detrás de `DocumentVault`/capability).
- **Mínimos permisos**: solicitar solo los permisos necesarios (por ejemplo, ubicación solo si aporta valor directo en ejecución).
- **Validación y manejo de errores**: no registrar PII en logs; mensajes de error claros para el usuario sin filtrar detalles sensibles.

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

Estrategia de testing (MVP):
- **Tests compartidos (KMP `commonTest`)**: reglas de dominio (itinerario, playbooks, tiempos, Plan B) y lógica de presenters (event → state).
- **Android UI tests**: Compose UI tests para flujos críticos (modo “Hoy”, edición de itinerario, apertura de navegación externa).
- **iOS UI tests**: XCUITest como smoke tests para flujos principales (arranque, navegación básica, flujos críticos).

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

Modelo propuesto (resumen): PostgreSQL + Prisma. Incluye usuarios y autenticación (email/contraseña + Google/Apple), viajes, itinerarios versionados, días por ciudad, actividades, documentos y auditoría de IA.

**📊 Para ver el diagrama ERD completo en Mermaid y todos los detalles del modelo de datos, consulta:**  
[**product-discovery/6-DataBase.md - Sección 2: ERD (Mermaid)**](product-discovery/6-DataBase.md#2-erd-mermaid)


### **3.2. Descripción de entidades principales:**

**📋 Para ver la especificación completa de todas las tablas con campos, tipos, índices y restricciones, consulta:**  
[**product-discovery/6-DataBase.md - Sección 3: Especificación de tablas (Prisma-friendly)**](product-discovery/6-DataBase.md#3-especificación-de-tablas-prisma-friendly)

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

[CREATE TRIP](/ai-specs/changes/mvp-03-create-trip-with-destinations.md)

**Historia de Usuario 2**

[MANAGE TRIP](/ai-specs/changes/mvp-04-manage-trip-lifecycle.md)

**Historia de Usuario 3**

[BUILD MANUAL ITINERARY](/ai-specs/changes/mvp-05-build-manual-itinerary.md)

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

[TICKET 1](/ai-specs/changes/TICKETS/backend-scaffolding.md)

**Ticket 2**

[TICKET 2](/ai-specs/changes/TICKETS/frontend-scaffolding.md)

**Ticket 3**

[TICKET 3](/ai-specs/changes/TICKETS/database-init.md)

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

