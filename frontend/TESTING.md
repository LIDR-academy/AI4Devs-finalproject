# Guía de Testing - SIGQ Frontend

Esta guía describe cómo ejecutar y escribir tests para el frontend de SIGQ.

## Tipos de Tests

### 1. Tests Unitarios (Vitest)
Prueban componentes React individuales.

**Ubicación**: `src/**/*.test.tsx` o `src/**/*.spec.tsx`

**Ejecutar**:
```bash
npm test              # Ejecutar tests
npm run test:ui       # Interfaz visual
npm run test:coverage # Con cobertura
```

### 2. Tests E2E (Playwright)
Prueban flujos completos de usuario en el navegador.

**Ubicación**: `e2e/**/*.spec.ts`

**Ejecutar** (siempre desde el directorio `frontend/`):
```bash
npm run test:e2e        # Todos los tests E2E
npm run test:e2e:planning  # Solo planning/checklist (Chromium, más rápido)
npm run test:e2e -- e2e/planning-checklist.spec.ts   # Solo un archivo
npm run test:e2e:ui     # Interfaz visual
npm run test:e2e:debug  # Modo debug
```

Si "no pasa nada" o falla el arranque del servidor: abre otra terminal, en `frontend/` ejecuta `npm run dev`, y vuelve a lanzar los E2E; Playwright reutilizará el servidor ya en marcha.

## Estructura de Tests

### Test Unitario con Vitest

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Component } from './Component';

describe('Component', () => {
  it('debería renderizar correctamente', () => {
    render(<Component />);
    expect(screen.getByText('Texto')).toBeInTheDocument();
  });
});
```

### Test E2E con Playwright

```typescript
import { test, expect } from '@playwright/test';

test('debería hacer login', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});
```

## Tests Disponibles

### Unitarios (Vitest)
- ✅ `src/utils/errors.spec.ts` - Util getApiErrorMessage (mensajes de error del API)
- ✅ `src/services/planning.service.spec.ts` - PlanningService (checklist, etc.)
- ✅ `src/services/documentation.service.spec.ts` - DocumentationService (getBySurgeryId, update, etc.)

### E2E
- ✅ `auth.spec.ts` - Flujos de autenticación
- ✅ `patients.spec.ts` - Gestión de pacientes
- ✅ `navigation.spec.ts` - Navegación y rutas
- ✅ `planning-checklist.spec.ts` - Planificación → Cirugía → Checklist WHO
- ✅ `calendar.spec.ts` - Calendario de quirófanos (selector, semana, enlaces)

## Configuración

### Vitest
Configurado en `vite.config.ts` con soporte para React Testing Library.

### Playwright
Configurado en `playwright.config.ts` con:
- Servidor de desarrollo automático
- Múltiples navegadores (Chrome, Firefox, Safari)
- Reporter HTML

## Mejores Prácticas

### 1. Selectores Estables
```typescript
// ✅ Bueno: Selectores semánticos
await page.locator('button[type="submit"]').click();
await page.locator('[aria-label="Cerrar"]').click();

// ❌ Evitar: Selectores frágiles
await page.locator('.btn-primary').click();
```

### 2. Esperas Explícitas
```typescript
// ✅ Esperar a que elemento sea visible
await expect(page.locator('text=Éxito')).toBeVisible();

// ✅ Esperar a URL
await page.waitForURL('**/dashboard');
```

### 3. Datos de Prueba
```typescript
// Usar datos consistentes para tests
const testUser = {
  email: 'test@example.com',
  password: 'test123',
};
```

## Troubleshooting

### Error: "Page not found"
Asegúrate de que el servidor de desarrollo esté corriendo o configura `webServer` en `playwright.config.ts`.

### Tests Lentos
- Usa `page.waitForLoadState('networkidle')` solo cuando sea necesario
- Evita `page.waitForTimeout()` cuando sea posible
- Usa `test.setTimeout()` para tests que requieren más tiempo

### Elementos No Encontrados
- Verifica que el elemento esté visible antes de interactuar
- Usa `page.locator().waitFor()` si es necesario
- Revisa que los selectores sean correctos

## CI/CD

Para integración continua:

```bash
# Tests unitarios
npm test

# Tests E2E
npx playwright install --with-deps
npm run test:e2e
```

## Documentación intraoperatoria – Uso en móvil/tablet

La página de **Documentación Intraoperatoria** (`/documentation/:surgeryId`) está optimizada para uso en tablet y móvil:

- **Áreas táctiles**: Botones y pestañas con altura mínima 44px para cumplir accesibilidad táctil (WCAG).
- **Layout responsivo**:
  - Cabecera: título y enlace "Ver Detalles" se apilan en pantallas pequeñas; el enlace ocupa todo el ancho en móvil.
  - Estado (Conectado/Guardado) y botón "Guardar ahora": se apilan en móvil, en línea en sm+.
  - Pestañas Preoperatorio/Intraoperatorio/Postoperatorio: scroll horizontal si no caben; altura táctil 44px.
  - Detalles del procedimiento (Tipo anestesia, Pérdida sangre): una columna en móvil, dos en sm+.
- **Textarea de notas**: Altura mínima adaptable (`clamp(12rem, 40vh, 28rem)`), redimensionable en vertical, `touch-manipulation` para reducir retardo en tacto.
- **Clases**: `touch-manipulation` en controles interactivos para mejorar respuesta en dispositivos táctiles.

Recomendación: en tablet, usar la vista en horizontal para tener pestañas y teclado visibles; el dictado por voz (VoiceInput) requiere permiso de micrófono y funciona mejor en Chrome.

## Recursos

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Library](https://testing-library.com/react)
