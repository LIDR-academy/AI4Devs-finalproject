# 1. Descripción General del Producto — Lexio

## 1.1. Objetivo

Lexio es una aplicación móvil de vocabulario personalizado que resuelve un problema cotidiano para cualquier persona que aprende inglés: **encontrar una palabra nueva, buscarla en Google Translate y olvidarla en semanas**.

El usuario captura manualmente la palabra o frase que encontró en una película, libro, video o conversación. Lexio la convierte en una **tarjeta visual** generando automáticamente una definición (en español o inglés, a elección del usuario) mediante IA y sugiriendo imágenes descriptivas vía Unsplash. Esa tarjeta se convierte en la base de una **sesión diaria de 10 ejercicios** generados por IA — exclusivamente con el vocabulario real del usuario.

El valor diferencial de Lexio frente a un traductor es la **retención real**: no solo saber qué significa una palabra en el momento, sino recordarla de verdad mediante práctica repetida, contexto visual y el hábito medido a través de una racha diaria.

**Propuesta de valor única:** *Tu diccionario personal inteligente — contexto real + IA + hábito diario.*

### Problema que resuelve

| Comportamiento actual | Problema | Solución Lexio |
|-----------------------|----------|----------------|
| Buscar en Google Translate | Significado olvidado en días/semanas | Tarjeta persistente con imagen y definición propia |
| Anotar en app de notas | Sin estructura ni repaso | Diccionario personal organizado en la nube |
| No tener sistema de práctica | Vocabulario pasivo, no activo | Sesión diaria de 10 ejercicios personalizados con IA |
| Sin motivación para repasar | Abandono del hábito | Sistema de rachas (streak) diario |

### Usuarios objetivo

Cualquier persona interesada en mejorar su vocabulario en inglés. El usuario elige las palabras que le importan — sin restricción de nivel CEFR ni temática.

---

## 1.2. Características y funcionalidades principales

### 1. Captura manual de palabras y frases

El usuario introduce cualquier palabra o frase en inglés que encuentre en su día a día. La app:

- Genera automáticamente una **definición sugerida** mediante la API de Claude (Anthropic), en el idioma elegido por el usuario (español o inglés).
- Permite **editar la definición** antes o después de guardar, añadiendo contexto personal.
- Normaliza el término (`trim` + `lowercase`) para evitar duplicados en el diccionario personal.

### 2. Tarjetas visuales con imagen

Cada palabra se convierte en una **tarjeta visual** con:

- La palabra o frase en inglés.
- Su definición (editable, idioma ES o EN).
- Una imagen representativa seleccionada de entre las sugeridas por Unsplash.

El usuario elige la imagen que mejor representa su recuerdo de esa palabra.

### 3. Diccionario de vocabulario personal

Cada usuario tiene su propia colección de tarjetas almacenada en la nube (Firebase Firestore):

- Accesible desde cualquier dispositivo tras iniciar sesión.
- **Una tarjeta por término normalizado** — sin duplicados.
- Estado por tarjeta: `activa` o `aprendida` (marcado manual por el usuario).
- Mínimo de **4 palabras** para desbloquear la práctica diaria.

### 4. Práctica diaria generada con IA

La app genera una **sesión de exactamente 10 ejercicios** por día, seleccionados aleatoriamente del banco de palabras del usuario. Dos tipos de ejercicio:

| Tipo | Descripción |
|------|-------------|
| **Imagen → Palabra** (`image_match`) | Se muestra la imagen de la tarjeta y el usuario elige la palabra correcta entre 4 opciones |
| **Quiz opción múltiple** (`mcq`) | Claude genera una pregunta sobre la definición/contexto de la tarjeta con 4 opciones |

La sesión está diseñada para completarse en menos de 2 minutos.

### 5. Sistema de rachas (Streak)

- Completar la sesión diaria de 10 ejercicios suma **1 día de racha**.
- No completar la sesión un día calendario **reinicia la racha a 0**.
- La racha actual es visible de forma prominente en la pantalla principal.
- Es el único elemento de gamificación del MVP: simple, efectivo y sin fricción.

### 6. Validación de aprendizaje

El usuario puede **marcar manualmente** una tarjeta como «aprendida» cuando sienta que domina la palabra. Esta validación es autodeclarada — el MVP no evalúa el dominio de forma objetiva. Las palabras aprendidas siguen apareciendo en ejercicios.

### 7. Autenticación de usuarios

Registro e inicio de sesión con email y contraseña (Firebase Authentication). El diccionario de cada usuario es **privado y persistente** en la nube.

### 8. Interfaz bilingüe

La UI de la aplicación está disponible en **español e inglés**, independientemente del idioma elegido para las definiciones.

---

## 1.3. Diseño y experiencia de usuario

### Principios UX

| Principio | Descripción |
|-----------|-------------|
| **Rapidez** | La práctica diaria se completa en ~2 minutos, pocos taps |
| **Claridad** | Mensajes explícitos en bloqueos (ej. «Necesitas X palabras más para practicar») |
| **Propiedad** | La IA sugiere; el usuario siempre puede editar definición e imagen |
| **Hábito visible** | La racha es el único elemento gamificado; ocupa lugar prominente en home |

### Pantallas principales (MVP)

```
┌─────────────────────────────────────────────┐
│  Login / Registro                           │
│  • Email + contraseña                       │
│  • Firebase Auth                            │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│  Home                                       │
│  • Racha actual (prominente)                │
│  • CTA «Practicar hoy» (si ≥ 4 palabras)   │
│  • Acceso rápido al diccionario             │
└──────┬──────────────────┬───────────────────┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌──────────────────────────┐
│  Diccionario│    │  Añadir palabra           │
│  • Lista    │    │  1. Input término         │
│    tarjetas │    │  2. Preview definición IA │
│  • Filtros  │    │  3. Editar definición      │
│    activa / │    │  4. Elegir idioma ES/EN   │
│    aprendida│    │  5. Seleccionar imagen    │
│  • Detalle  │    │  6. Guardar tarjeta       │
│    tarjeta  │    └──────────────────────────┘
└─────────────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│  Práctica diaria                            │
│  • 10 ejercicios secuenciales               │
│  • image_match + mcq mezclados             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Resumen de sesión                          │
│  • Aciertos / 10                            │
│  • Racha actualizada                        │
└─────────────────────────────────────────────┘
```

### Flujos de usuario principales

#### Flujo 1 — Primera experiencia (onboarding implícito)

1. El usuario se registra con email y contraseña.
2. Ve su diccionario vacío con un CTA claro para añadir la primera palabra.
3. Añade palabras una a una: escribe término → IA sugiere definición → elige idioma → edita si quiere → selecciona imagen → guarda.
4. Al llegar a 4 palabras, se desbloquea el botón «Practicar hoy».
5. Completa su primera sesión de 10 ejercicios → **racha = 1**.

#### Flujo 2 — Usuario recurrente (día típico)

1. Abre la app → ve su racha actual en home.
2. Toca «Practicar hoy» → completa 10 ejercicios en ~2 minutos.
3. Ve el resumen y la racha actualizada.
4. Opcionalmente añade alguna palabra nueva al diccionario.

#### Flujo 3 — Consolidar aprendizaje

1. Navega al diccionario y revisa tarjetas.
2. En la tarjeta de una palabra que ya domina, toca «Marcar como aprendida».
3. El estado cambia a aprendida; la tarjeta sigue en el pool de ejercicios.

#### Flujo 4 — Perder la racha

1. El usuario no completa su sesión un día calendario.
2. Al día siguiente abre la app → racha reiniciada a 0.
3. Completa la sesión → racha = 1 (nuevo inicio).

### Decisiones de diseño clave

| Decisión | Justificación |
|----------|---------------|
| Sin push notifications en MVP | Reducción de scope; la racha visible es suficiente motivación en demo |
| Solo racha, sin XP/badges | Evitar complejidad gamificadora; el hábito diario es el foco |
| Bloqueo estricto con < 4 palabras | Garantiza que los ejercicios sean siempre variados y coherentes |
| Imagen obligatoria en tarjeta | Clave para el tipo de ejercicio `image_match`; refuerza memoria visual |
| Sesión fija de 10 ejercicios | Experiencia corta y predecible; elimina decisión del usuario |

---

## 1.4. Instrucciones de instalación

> **Nota:** Las instrucciones definitivas se completarán al finalizar la implementación del proyecto. Esta sección describe el proceso esperado basado en la arquitectura definida.

### Pre-requisitos

| Herramienta | Versión mínima | Propósito |
|-------------|----------------|-----------|
| Node.js | 18.x LTS | Backend y tooling |
| npm / yarn | npm 9+ | Gestión de dependencias |
| Expo CLI | Latest | Desarrollo móvil |
| Git | 2.x | Control de versiones |
| Cuenta Firebase | — | Auth y Firestore |
| API key Claude | — | Definiciones y ejercicios |
| API key Unsplash | — | Imágenes de tarjetas |

### Estructura del repositorio

```
lexio/
├── mobile/        # App React Native + Expo
├── backend/       # API Node.js + Express (BFF)
└── docs/          # Documentación del proyecto
```

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd lexio
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear el archivo de variables de entorno:

```bash
cp .env.example .env
```

Completar `.env` con tus credenciales:

```env
PORT=3000
FIREBASE_SERVICE_ACCOUNT=<json-string-o-path-al-archivo>
ANTHROPIC_API_KEY=<tu-clave-claude>
UNSPLASH_ACCESS_KEY=<tu-clave-unsplash>
```

Iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`.

### 3. Configurar Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Habilitar **Authentication** → proveedor Email/Password.
3. Habilitar **Cloud Firestore** → modo producción.
4. Desplegar las Security Rules:

```bash
firebase deploy --only firestore:rules
```

5. Descargar el archivo `serviceAccountKey.json` (Admin SDK) → usarlo en el backend (nunca commitear).

### 4. Configurar la App móvil

```bash
cd mobile
npm install
```

Crear el archivo de entorno:

```bash
cp .env.example .env
```

Completar `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_FIREBASE_API_KEY=<tu-firebase-api-key>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<tu-proyecto>.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<tu-proyecto-id>
```

Iniciar la app en modo desarrollo:

```bash
npx expo start
```

Escanear el QR con **Expo Go** (iOS/Android) para ver la app en tu dispositivo.

### 5. Verificar el flujo completo

1. Abrir la app en Expo Go.
2. Registrarse con email y contraseña.
3. Añadir 4 palabras con imagen y definición.
4. Completar una sesión de 10 ejercicios.
5. Verificar que la racha se actualiza a 1.

### Variables de entorno de referencia (`.env.example`)

**Backend:**

```env
PORT=3000
FIREBASE_SERVICE_ACCOUNT=
ANTHROPIC_API_KEY=
UNSPLASH_ACCESS_KEY=
NODE_ENV=development
```

**Mobile:**

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```
