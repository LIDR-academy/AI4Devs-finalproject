# Contributing to bonÀreaGo

¡Gracias por tu interés en contribuir a bonÀreaGo! Este documento proporciona guías y mejores prácticas para contribuir al proyecto.

## Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [Cómo Empezar](#cómo-empezar)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Convenciones de Commits](#convenciones-de-commits)
- [Proceso de Pull Request](#proceso-de-pull-request)
- [Cómo Ejecutar Tests](#cómo-ejecutar-tests)
- [Cómo Agregar Nuevas Features](#cómo-agregar-nuevas-features)

---

## Código de Conducta

Este proyecto sigue un código de conducta. Al participar, se espera que mantengas este código. Por favor reporta comportamiento inaceptable a security@your-domain.com.

### Nuestros Estándares

- Usar lenguaje acogedor e inclusivo
- Ser respetuoso con diferentes puntos de vista
- Aceptar críticas constructivas con gracia
- Enfocarse en lo que es mejor para la comunidad
- Mostrar empatía hacia otros miembros

---

## Cómo Empezar

### 1. Fork del Repositorio

```bash
# Fork en GitHub, luego clonar
git clone https://github.com/your-username/bonareago.git
cd bonareago
```

### 2. Configurar Entorno de Desarrollo

```bash
# Ejecutar script de setup
./scripts/setup-dev.sh

# Levantar infraestructura
./scripts/dev-infra.sh

# Verificar que todo funciona
./scripts/verify-all.sh
```

### 3. Crear Rama de Trabajo

```bash
# Crear rama desde main
git checkout -b feature/my-new-feature

# O para bugfix
git checkout -b fix/issue-123
```

---

## Proceso de Desarrollo

### 1. Desarrollo Local

```bash
# Backend: Cada servicio se puede ejecutar independientemente
cd Backend/trips-service
mvn clean install
mvn exec:java

# Frontend: Desarrollo con hot reload
cd Frontend
npm run dev
```

### 2. Ejecutar Tests

```bash
# Backend: Tests unitarios
cd Backend
mvn test

# Backend: Tests de integración
mvn verify

# Frontend: Tests unitarios
cd Frontend
npm test

# Frontend: Tests E2E
npm run cypress:open
```

### 3. Verificar Cambios

```bash
# Verificar que todo compila
cd Backend && mvn clean install
cd Frontend && npm run build

# Verificar linting
cd Frontend && npm run lint

# Verificar tests
./scripts/run-ci-tests.sh
```

---

## Estándares de Código

### Backend (Java)

**Estilo de Código:**
- Seguir [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Usar 4 espacios para indentación
- Máximo 120 caracteres por línea
- Nombres de clases en PascalCase
- Nombres de métodos y variables en camelCase

**Ejemplo:**

```java
public class TripService {
    
    private final TripRepository tripRepository;
    
    @Inject
    public TripService(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }
    
    public List<TripDto> findActiveTrips() {
        return tripRepository.findByStatus(TripStatus.ACTIVE)
            .stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }
}
```

**Principios:**
- **SOLID**: Aplicar principios SOLID en diseño
- **DRY**: No repetir código
- **YAGNI**: No implementar funcionalidad que no se necesita
- **Clean Code**: Código legible y mantenible

### Frontend (TypeScript/React)

**Estilo de Código:**
- Seguir [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Usar 2 espacios para indentación
- Máximo 100 caracteres por línea
- Componentes en PascalCase
- Funciones y variables en camelCase

**Ejemplo:**

```typescript
interface TripCardProps {
  trip: TripDto;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onEdit, onDelete }) => {
  const { t } = useTranslation();
  
  const handleEdit = () => {
    onEdit(trip.id);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('trips.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
};
```

**Principios:**
- **Componentes funcionales**: Usar hooks en lugar de clases
- **TypeScript estricto**: Tipar todo correctamente
- **Composición**: Componentes pequeños y reutilizables
- **Hooks personalizados**: Extraer lógica reutilizable

---

## Convenciones de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/).

### Formato

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Tipos

- **feat**: Nueva funcionalidad
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de formato (no afectan código)
- **refactor**: Refactorización de código
- **test**: Añadir o modificar tests
- **chore**: Cambios en build, CI, etc.
- **perf**: Mejoras de performance

### Ejemplos

```bash
# Feature
git commit -m "feat(trips): add filter by destination"

# Bugfix
git commit -m "fix(booking): validate seats availability"

# Documentation
git commit -m "docs(api): update trips endpoint examples"

# Refactor
git commit -m "refactor(matching): extract scoring logic to service"

# Test
git commit -m "test(trips): add E2E tests for trip creation"
```

### Scope

Scopes comunes:
- **trips**: Trips service
- **users**: Users service
- **booking**: Booking service
- **matching**: Matching service
- **notifications**: Notification service
- **frontend**: Frontend application
- **api**: API changes
- **docs**: Documentation
- **ci**: CI/CD changes

---

## Proceso de Pull Request

### 1. Antes de Crear PR

```bash
# Actualizar desde main
git checkout main
git pull origin main
git checkout feature/my-feature
git rebase main

# Verificar que todo funciona
./scripts/verify-all.sh
npm test
mvn test
```

### 2. Crear Pull Request

**Título:**
```
feat(trips): Add filter by destination
```

**Descripción:**

```markdown
## Descripción
Añade funcionalidad para filtrar viajes por destino.

## Tipo de Cambio
- [x] Nueva funcionalidad
- [ ] Corrección de bug
- [ ] Breaking change
- [ ] Documentación

## Checklist
- [x] Código sigue los estándares del proyecto
- [x] Tests añadidos/actualizados
- [x] Documentación actualizada
- [x] Todos los tests pasan
- [x] No hay warnings de linting

## Tests
- Tests unitarios: ✅ Pasando
- Tests E2E: ✅ Pasando
- Coverage: 85%

## Screenshots (si aplica)
[Añadir screenshots]

## Notas Adicionales
Esta funcionalidad es requerida para la historia de usuario #123.
```

### 3. Revisión de Código

El PR será revisado por al menos un maintainer. Se verificará:

- ✅ Código sigue estándares
- ✅ Tests adecuados
- ✅ Documentación actualizada
- ✅ No introduce regresiones
- ✅ Performance aceptable

### 4. Merge

Una vez aprobado:
- Se hará squash merge a main
- Se borrará la rama feature
- Se actualizará el CHANGELOG

---

## Cómo Ejecutar Tests

### Backend

```bash
# Todos los tests
cd Backend
mvn clean test

# Tests de un servicio específico
cd Backend/trips-service
mvn test

# Tests de integración
mvn verify

# Con coverage
mvn test jacoco:report
```

### Frontend

```bash
cd Frontend

# Tests unitarios
npm test

# Tests con coverage
npm run test:coverage

# Tests E2E (requiere servicios corriendo)
npm run cypress:open

# Tests E2E headless
npm run test:e2e
```

### Tests E2E Completos

```bash
# Levantar todo el sistema
./scripts/start-all-services.sh

# Ejecutar tests E2E
cd Frontend
npm run test:e2e

# O usar script
./scripts/run-e2e-tests.sh
```

---

## Cómo Agregar Nuevas Features

### 1. Planificación

1. Crear issue en GitHub describiendo la feature
2. Discutir diseño y approach
3. Obtener aprobación de maintainers

### 2. Implementación Backend

```bash
# 1. Crear rama
git checkout -b feature/my-feature

# 2. Crear entidad (si es necesario)
# Backend/trips-service/src/main/java/com/bonareago/trips/domain/MyEntity.java

# 3. Crear repository
# Backend/trips-service/src/main/java/com/bonareago/trips/repository/MyRepository.java

# 4. Crear service con lógica de negocio
# Backend/trips-service/src/main/java/com/bonareago/trips/service/MyService.java

# 5. Crear REST resource
# Backend/trips-service/src/main/java/com/bonareago/trips/resource/MyResource.java

# 6. Añadir tests
# Backend/trips-service/src/test/java/...

# 7. Actualizar OpenAPI
# doc/api/trips-service.yaml
```

### 3. Implementación Frontend

```bash
# 1. Crear tipos
# Frontend/src/types/api.ts

# 2. Crear servicio API
# Frontend/src/api/myService.ts

# 3. Crear componentes
# Frontend/src/components/myFeature/MyComponent.tsx

# 4. Crear página (si es necesario)
# Frontend/src/pages/MyPage.tsx

# 5. Añadir traducciones
# Frontend/src/i18n/*/myFeature.json

# 6. Añadir tests
# Frontend/src/components/myFeature/MyComponent.test.tsx

# 7. Añadir tests E2E
# Frontend/cypress/e2e/myFeature/myFeature.cy.ts
```

### 4. Documentación

```markdown
# 1. Actualizar README si es necesario
# README.md

# 2. Actualizar documentación de API
# doc/api/README.md

# 3. Añadir a CHANGELOG
# CHANGELOG.md

# 4. Actualizar Memory Bank
# memory-bank/progress.md
# memory-bank/featurePlan.md
```

### 5. Testing

```bash
# Tests unitarios
mvn test
npm test

# Tests E2E
npm run cypress:open

# Verificación completa
./scripts/verify-all.sh
```

---

## Estructura de Proyecto

```
bonareago/
├── Backend/
│   ├── auth-service/
│   ├── users-service/
│   ├── trips-service/
│   ├── booking-service/
│   ├── matching-service/
│   ├── notification-service/
│   └── shared/
├── Frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── types/
│   │   └── i18n/
│   └── cypress/
├── doc/
│   ├── api/
│   ├── deployment/
│   ├── development/
│   └── security/
├── memory-bank/
└── scripts/
```

---

## Recursos Útiles

- [QUICK-START.md](../../QUICK-START.md) - Setup rápido
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitectura del sistema
- [API Documentation](../api/README.md) - Documentación de APIs
- [Production Setup](../deployment/production-setup.md) - Deployment
- [Security Checklist](../security/security-checklist.md) - Seguridad

---

## Preguntas Frecuentes

### ¿Cómo añado un nuevo idioma?

1. Añadir archivos de traducción en `Frontend/src/i18n/{lang}/`
2. Añadir archivos de traducción en `Backend/*/src/main/resources/messages_{lang}.properties`
3. Actualizar `i18n/config.ts` con el nuevo idioma
4. Añadir tests para el nuevo idioma

### ¿Cómo añado un nuevo microservicio?

1. Copiar estructura de un servicio existente
2. Actualizar `pom.xml` del parent
3. Crear schema en PostgreSQL
4. Añadir migraciones Flyway
5. Actualizar `docker-compose.yml`
6. Añadir documentación OpenAPI
7. Añadir tests

### ¿Cómo debug un servicio?

```bash
# Backend con debug port
mvn exec:java -Dexec.args="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"

# Frontend con debug
npm run dev
# Luego usar Chrome DevTools
```

---

## Contacto

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: dev@your-domain.com

---

¡Gracias por contribuir a bonÀreaGo! 🚗💚
