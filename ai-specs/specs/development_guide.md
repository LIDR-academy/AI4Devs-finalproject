# Guía de desarrollo

Guía para configurar el entorno, ejecutar la app Flutter y trabajar con Firebase en este proyecto. No hay backend Node ni cliente React: todo el acceso a datos es vía **Firebase SDK** desde la app en `app/`.

## Requisitos previos

Instala lo siguiente:

- **Flutter SDK** (compatible con Dart `^3.12`, ver `app/pubspec.yaml`)
- **Dart SDK** (incluido con Flutter)
- **Git**
- **Android Studio** (SDK + emulador) y/o **Xcode** (macOS, para iOS)
- **Firebase CLI** (`npm install -g firebase-tools` o instalador oficial)
- **FlutterFire CLI** (`dart pub global activate flutterfire_cli`)

Comprueba la instalación:

```bash
flutter doctor
firebase --version
```

## 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd AI4Devs-finalproject
```

## 2. Configurar la app Flutter

El código de la aplicación móvil está en el directorio **`app/`**.

```bash
cd app
flutter pub get
```

### Variables y configuración Firebase

No uses archivos `.env` con URLs REST. La configuración de Firebase se genera con FlutterFire:

```bash
# Desde app/ — requiere sesión en Firebase CLI (firebase login)
flutterfire configure
```

Esto crea/actualiza `lib/firebase_options.dart` y enlaza el proyecto con apps Android/iOS en la consola de Firebase.

**No subas a Git:** claves de cuenta de servicio, `google-services.json` / `GoogleService-Info.plist` si el equipo los excluye por política (revisa `.gitignore`).

### Archivos Firebase en la raíz del repo (cuando existan)

| Archivo | Propósito |
|---------|-----------|
| `firebase.json` | Configuración de emuladores y despliegue |
| `.firebaserc` | Alias de proyectos Firebase |
| `firestore.rules` | Reglas de seguridad de Firestore |
| `firestore.indexes.json` | Índices compuestos |

Si aún no existen, créalos con `firebase init` en la raíz del monorepo o del módulo acordado por el equipo.

## 3. Emuladores Firebase (desarrollo local)

Recomendado para no escribir en producción durante el desarrollo:

```bash
# Desde la raíz donde está firebase.json
firebase emulators:start --only auth,firestore,storage
```

En la app, conecta los emuladores al arranque (solo en `kDebugMode`), por ejemplo:

```dart
// Ejemplo — ajustar host según plataforma (10.0.2.2 en emulador Android)
await FirebaseAuth.instance.useAuthEmulator('localhost', 9099);
FirebaseFirestore.instance.useFirestoreEmulator('localhost', 8080);
```

Consulta `ai-specs/specs/firebase-standards.mdc` para el patrón acordado en el proyecto.

## 4. Ejecutar la aplicación

```bash
cd app

# Listar dispositivos
flutter devices

# Android o iOS
flutter run

# Web (solo si el equipo lo soporta; el objetivo principal es móvil)
flutter run -d chrome
```

## 5. Calidad de código y análisis

```bash
cd app
dart format .
flutter analyze
```

## 6. Pruebas

### Tests unitarios y de widgets

```bash
cd app
flutter test
```

### Tests de BLoC

Usa el paquete `bloc_test` en tests bajo `test/`, con use cases y repositorios **mockeados** (sin llamar a Firebase real).

### Tests de integración

```bash
cd app
flutter test integration_test/
```

Ejecuta contra **Firebase Emulator Suite** cuando el flujo toque Firestore o Auth.

## 7. Estructura esperada del código

Alineado con Clean Architecture (ver `mobile-standards.mdc` y `firebase-standards.mdc`):

```text
app/lib/
  features/
    <feature>/
      presentation/   # Widgets, BLoC
      domain/         # Entities, use cases, repository interfaces
      data/           # Repository impls, datasources Firebase
  core/               # Utilidades compartidas, tema, router
```

- **Presentación**: no importar `cloud_firestore` ni `firebase_auth` directamente.
- **Dominio**: sin dependencias de Flutter ni Firebase.
- **Datos**: única capa que usa el SDK de Firebase.

## 8. Documentación relacionada

| Documento | Contenido |
|-----------|-----------|
| [data-model.md](./data-model.md) | Entidades y relaciones (modelo de negocio; migración a colecciones Firestore) |
| [firebase-data-access.yml](./firebase-data-access.yml) | Operaciones de datos (sustituto del antiguo OpenAPI REST) |
| [api-spec.yml](./api-spec.yml) | **Obsoleto** — solo aviso de deprecación |
| [base-standards.mdc](./base-standards.mdc) | Reglas globales para agentes IA |

## 9. Stack obsoleto (no usar)

Los siguientes elementos pertenecen al stack web anterior y **no aplican** a este proyecto:

- Node.js, Express, Prisma, PostgreSQL, `docker-compose` para BD relacional
- Carpetas `backend/` y `frontend/`
- Variables `DATABASE_URL`, `REACT_APP_API_URL`
- Cypress contra API HTTP local
- Especificación OpenAPI REST en `api-spec.yml` (ver `firebase-data-access.yml`)

Si encuentras referencias a REST o a `http://localhost:3000` en tickets o docs, tradúcelas a operaciones Firestore/Auth/Storage descritas en `firebase-data-access.yml`.
