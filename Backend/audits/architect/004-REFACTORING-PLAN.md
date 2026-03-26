# Plan de Refactorización: AuthService - Cumplimiento CSED

**Fecha:** 2025-01-27  
**Basado en:** Auditoría CSED #004  
**Objetivo:** Corregir violación arquitectónica donde AuthService retorna DTOs en lugar de entidades

---

## LOGIC BREAKDOWN

### Problema
El `AuthService` actualmente retorna `AuthResponseDto` directamente, violando el patrón CSED donde:
- **Services** deben retornar **entidades** (no DTOs)
- **Controllers** deben mapear entidades a **DTOs** antes de retornar

### Casos límite
- ✅ Mantener compatibilidad de API (mismo formato de respuesta HTTP)
- ✅ No romper funcionalidad existente
- ✅ Mantener manejo de errores actual
- ✅ Preservar generación de tokens JWT
- ✅ Mantener validaciones de negocio

### Lógica paso a paso
1. Modificar `AuthService` para retornar `{ user: User; accessToken: string }`
2. Mover método `mapToUserResponse()` del Service al Controller
3. Actualizar Controller para mapear entidad a DTO antes de retornar
4. Actualizar tipos TypeScript en ambos archivos
5. Verificar que no se rompa funcionalidad existente

---

## Resumen Ejecutivo

**Violación detectada:** `AuthService` retorna `AuthResponseDto` en lugar de entidades `User`.

**Impacto:** Viola separación de capas CSED, dificulta reuso del servicio.

**Solución:** Refactorizar para que Service retorne entidades y Controller mapee a DTOs.

**Riesgo:** Bajo - Cambio interno, API HTTP no cambia.

---

## Análisis de Cambios Requeridos

### Archivos a Modificar

1. **`Backend/src/modules/auth/services/auth.service.ts`**
   - Cambiar tipo de retorno de `register()` y `login()`
   - Eliminar método `mapToUserResponse()`
   - Eliminar import de `UserResponseDto` y `AuthResponseDto`
   - Actualizar documentación JSDoc

2. **`Backend/src/modules/auth/controllers/auth.controller.ts`**
   - Agregar método `mapToUserResponse()` privado
   - Actualizar métodos `register()` y `login()` para mapear entidad a DTO
   - Agregar import de `User` entity y `UserResponseDto`
   - Mantener misma firma de métodos públicos (retornan `AuthResponseDto`)

### Archivos que NO se Modifican

- ✅ `Backend/src/modules/auth/dto/*.dto.ts` - Sin cambios
- ✅ `Backend/src/modules/auth/auth.module.ts` - Sin cambios
- ✅ Otros módulos - Sin impacto

---

## Plan de Implementación Detallado

### Fase 1: Preparación

#### 1.1 Verificar Estado Actual
- [ ] Confirmar que los tests existentes pasan
- [ ] Documentar comportamiento actual de los endpoints
- [ ] Verificar que no hay dependencias externas del tipo de retorno de `AuthService`

#### 1.2 Crear Backup Mental
- [ ] Revisar código actual línea por línea
- [ ] Identificar todos los lugares donde se usa `AuthService`
- [ ] Verificar que solo `AuthController` usa `AuthService` directamente

### Fase 2: Refactorización del Service

#### 2.1 Modificar Método `register()`

**Estado actual:**
```typescript
async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
  const createUserDto: CreateUserDto = {
    nombre: registerDto.nombre,
    email: registerDto.email,
    contraseña: registerDto.contraseña,
  };

  const user = await this.usersService.create(createUserDto);
  const accessToken = await this.generateToken(user);
  const userResponse = this.mapToUserResponse(user);

  return new AuthResponseDto(accessToken, userResponse);
}
```

**Estado objetivo:**
```typescript
async register(registerDto: RegisterDto): Promise<{ user: User; accessToken: string }> {
  const createUserDto: CreateUserDto = {
    nombre: registerDto.nombre,
    email: registerDto.email,
    contraseña: registerDto.contraseña,
  };

  const user = await this.usersService.create(createUserDto);
  const accessToken = await this.generateToken(user);

  return { user, accessToken };
}
```

**Cambios:**
- Cambiar tipo de retorno de `Promise<AuthResponseDto>` a `Promise<{ user: User; accessToken: string }>`
- Eliminar llamada a `this.mapToUserResponse(user)`
- Eliminar creación de `new AuthResponseDto()`
- Retornar objeto plano con `user` y `accessToken`
- Actualizar JSDoc para reflejar nuevo tipo de retorno

#### 2.2 Modificar Método `login()`

**Estado actual:**
```typescript
async login(loginDto: LoginDto): Promise<AuthResponseDto> {
  const user = await this.usersService.findByEmail(loginDto.email);

  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const isPasswordValid = await bcrypt.compare(
    loginDto.contraseña,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const accessToken = await this.generateToken(user);
  const userResponse = this.mapToUserResponse(user);

  return new AuthResponseDto(accessToken, userResponse);
}
```

**Estado objetivo:**
```typescript
async login(loginDto: LoginDto): Promise<{ user: User; accessToken: string }> {
  const user = await this.usersService.findByEmail(loginDto.email);

  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const isPasswordValid = await bcrypt.compare(
    loginDto.contraseña,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const accessToken = await this.generateToken(user);
  return { user, accessToken };
}
```

**Cambios:**
- Cambiar tipo de retorno de `Promise<AuthResponseDto>` a `Promise<{ user: User; accessToken: string }>`
- Eliminar llamada a `this.mapToUserResponse(user)`
- Eliminar creación de `new AuthResponseDto()`
- Retornar objeto plano con `user` y `accessToken`
- Actualizar JSDoc para reflejar nuevo tipo de retorno

#### 2.3 Eliminar Método `mapToUserResponse()`

**Eliminar completamente:**
```typescript
// ELIMINAR ESTE MÉTODO
private mapToUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    createdAt: user.createdAt,
  };
}
```

#### 2.4 Actualizar Imports del Service

**Eliminar imports:**
```typescript
// ELIMINAR estas líneas:
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
```

**Mantener imports:**
```typescript
// MANTENER estos imports:
import { User } from '../../users/entities/user.entity';
// ... otros imports existentes
```

### Fase 3: Refactorización del Controller

#### 3.1 Agregar Método `mapToUserResponse()` al Controller

**Agregar método privado:**
```typescript
/**
 * Mapea una entidad User a UserResponseDto.
 * Excluye información sensible como passwordHash.
 *
 * @private
 * @method mapToUserResponse
 * @param {User} user - Entidad User a mapear
 * @returns {UserResponseDto} DTO de respuesta con los campos públicos
 */
private mapToUserResponse(user: User): UserResponseDto {
  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    createdAt: user.createdAt,
  };
}
```

**Ubicación:** Después del constructor, antes de los métodos públicos.

#### 3.2 Actualizar Método `register()` del Controller

**Estado actual:**
```typescript
async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
  // El controller solo delega al service
  return await this.authService.register(registerDto);
}
```

**Estado objetivo:**
```typescript
async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
  const { user, accessToken } = await this.authService.register(registerDto);
  const userResponse = this.mapToUserResponse(user);
  return new AuthResponseDto(accessToken, userResponse);
}
```

**Cambios:**
- Desestructurar retorno del service: `const { user, accessToken } = ...`
- Mapear entidad a DTO: `const userResponse = this.mapToUserResponse(user)`
- Crear y retornar `AuthResponseDto`
- Actualizar comentario JSDoc si es necesario

#### 3.3 Actualizar Método `login()` del Controller

**Estado actual:**
```typescript
async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
  // El controller solo delega al service
  return await this.authService.login(loginDto);
}
```

**Estado objetivo:**
```typescript
async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
  const { user, accessToken } = await this.authService.login(loginDto);
  const userResponse = this.mapToUserResponse(user);
  return new AuthResponseDto(accessToken, userResponse);
}
```

**Cambios:**
- Desestructurar retorno del service: `const { user, accessToken } = ...`
- Mapear entidad a DTO: `const userResponse = this.mapToUserResponse(user)`
- Crear y retornar `AuthResponseDto`
- Actualizar comentario JSDoc si es necesario

#### 3.4 Actualizar Imports del Controller

**Agregar imports:**
```typescript
// AGREGAR estas líneas:
import { User } from '../../users/entities/user.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';
```

**Mantener imports existentes:**
```typescript
// MANTENER estos imports:
import { AuthResponseDto } from '../dto/auth-response.dto';
// ... otros imports existentes
```

### Fase 4: Verificación y Testing

#### 4.1 Verificación de Tipos TypeScript
- [ ] Compilar proyecto sin errores: `npm run build`
- [ ] Verificar que TypeScript detecta correctamente los nuevos tipos
- [ ] Confirmar que no hay errores de tipo en el IDE

#### 4.2 Verificación Funcional
- [ ] Probar endpoint `POST /auth/register` con datos válidos
- [ ] Verificar que la respuesta tiene el mismo formato que antes
- [ ] Probar endpoint `POST /auth/login` con credenciales válidas
- [ ] Verificar que la respuesta tiene el mismo formato que antes
- [ ] Probar casos de error (email duplicado, credenciales inválidas)
- [ ] Verificar que los mensajes de error son los mismos

#### 4.3 Verificación de Arquitectura
- [ ] Confirmar que `AuthService` ya no retorna DTOs
- [ ] Confirmar que `AuthController` mapea entidades a DTOs
- [ ] Verificar que no hay imports innecesarios
- [ ] Confirmar que el código sigue el patrón CSED

#### 4.4 Verificación de Documentación
- [ ] Actualizar JSDoc en métodos modificados si es necesario
- [ ] Verificar que Swagger sigue funcionando correctamente
- [ ] Confirmar que la documentación de API no cambió

---

## Checklist de Implementación

### Pre-Refactorización
- [ ] Leer y entender el código actual completamente
- [ ] Verificar que los tests existentes pasan
- [ ] Crear branch de trabajo: `refactor/auth-service-csed-compliance`

### Refactorización del Service
- [ ] Modificar tipo de retorno de `register()` a `Promise<{ user: User; accessToken: string }>`
- [ ] Modificar implementación de `register()` para retornar objeto plano
- [ ] Modificar tipo de retorno de `login()` a `Promise<{ user: User; accessToken: string }>`
- [ ] Modificar implementación de `login()` para retornar objeto plano
- [ ] Eliminar método `mapToUserResponse()` del Service
- [ ] Eliminar imports innecesarios (`UserResponseDto`, `AuthResponseDto`) del Service
- [ ] Actualizar JSDoc de métodos modificados

### Refactorización del Controller
- [ ] Agregar método `mapToUserResponse()` privado al Controller
- [ ] Actualizar método `register()` para mapear entidad a DTO
- [ ] Actualizar método `login()` para mapear entidad a DTO
- [ ] Agregar imports necesarios (`User`, `UserResponseDto`) al Controller
- [ ] Actualizar JSDoc de métodos modificados si es necesario

### Verificación
- [ ] Compilar proyecto sin errores TypeScript
- [ ] Probar endpoint `POST /auth/register` funcionalmente
- [ ] Probar endpoint `POST /auth/login` funcionalmente
- [ ] Verificar que respuestas HTTP son idénticas a antes
- [ ] Verificar que casos de error funcionan correctamente
- [ ] Confirmar cumplimiento del patrón CSED

### Post-Refactorización
- [ ] Ejecutar linter y corregir warnings si los hay
- [ ] Actualizar documentación si es necesario
- [ ] Crear commit con mensaje descriptivo
- [ ] Ejecutar auditoría CSED nuevamente para confirmar corrección

---

## Comparación Antes/Después

### AuthService - Método register()

**ANTES (Incorrecto):**
```typescript
async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
  const createUserDto: CreateUserDto = {
    nombre: registerDto.nombre,
    email: registerDto.email,
    contraseña: registerDto.contraseña,
  };

  const user = await this.usersService.create(createUserDto);
  const accessToken = await this.generateToken(user);
  const userResponse = this.mapToUserResponse(user); // ❌ Mapeo en Service

  return new AuthResponseDto(accessToken, userResponse); // ❌ Retorna DTO
}
```

**DESPUÉS (Correcto):**
```typescript
async register(registerDto: RegisterDto): Promise<{ user: User; accessToken: string }> {
  const createUserDto: CreateUserDto = {
    nombre: registerDto.nombre,
    email: registerDto.email,
    contraseña: registerDto.contraseña,
  };

  const user = await this.usersService.create(createUserDto);
  const accessToken = await this.generateToken(user);

  return { user, accessToken }; // ✅ Retorna entidad
}
```

### AuthController - Método register()

**ANTES (Incorrecto):**
```typescript
async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
  // El controller solo delega al service
  return await this.authService.register(registerDto); // ❌ Service retorna DTO directamente
}
```

**DESPUÉS (Correcto):**
```typescript
async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
  const { user, accessToken } = await this.authService.register(registerDto); // ✅ Service retorna entidad
  const userResponse = this.mapToUserResponse(user); // ✅ Mapeo en Controller
  return new AuthResponseDto(accessToken, userResponse); // ✅ Controller retorna DTO
}
```

---

## Riesgos y Mitigaciones

### Riesgo 1: Cambio de Tipo de Retorno Interno
**Riesgo:** Si algún código externo usa directamente `AuthService`, podría romperse.

**Mitigación:** 
- Verificar que solo `AuthController` usa `AuthService` directamente
- El tipo de retorno HTTP no cambia (sigue siendo `AuthResponseDto`)

### Riesgo 2: Errores de Compilación TypeScript
**Riesgo:** Cambios de tipos podrían causar errores de compilación.

**Mitigación:**
- Compilar después de cada cambio
- Verificar tipos en el IDE antes de continuar

### Riesgo 3: Cambio Inadvertido en Comportamiento
**Riesgo:** La refactorización podría cambiar el comportamiento de la API.

**Mitigación:**
- Probar endpoints manualmente después de cambios
- Verificar que respuestas HTTP son idénticas
- Mantener mismos casos de error

---

## Métricas de Éxito

### Criterios de Aceptación

1. ✅ **Cumplimiento CSED:** `AuthService` retorna entidades, no DTOs
2. ✅ **Compatibilidad API:** Respuestas HTTP son idénticas a antes
3. ✅ **Sin Errores:** Proyecto compila sin errores TypeScript
4. ✅ **Funcionalidad:** Endpoints funcionan correctamente
5. ✅ **Arquitectura:** Separación de capas respetada

### Validación Final

Después de la refactorización, ejecutar:
```bash
# Compilar proyecto
npm run build

# Ejecutar tests (si existen)
npm test

# Ejecutar auditoría CSED nuevamente
# Debe mostrar 0 violaciones en módulo Auth
```

---

## Referencias

- **Auditoría CSED:** `Backend/audits/architect/004-ARCHITECTURE-AUDIT.md`
- **Agente CSED:** `.cursor/agents/CSED-architect.md`
- **Código actual:** 
  - `Backend/src/modules/auth/services/auth.service.ts`
  - `Backend/src/modules/auth/controllers/auth.controller.ts`

---

## Notas Adicionales

- Este cambio es **interno** y no afecta la API HTTP pública
- Los consumidores de la API no verán ningún cambio
- La refactorización mejora la arquitectura sin cambiar funcionalidad
- Después de esta refactorización, el módulo Auth tendrá 100% de cumplimiento CSED

---

**Fin del Plan de Refactorización**

