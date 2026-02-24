# Patrones de Validación — Adresles Backend

> **Última actualización**: 2026-02-24  
> **Origen**: Bug en `AdminController` — Query DTO sin decoradores → HTTP 400  
> **Estándar relacionado**: [`openspec/specs/backend-standards.mdc` — Patrones de Validación](../../openspec/specs/backend-standards.mdc)

---

## Contexto

El backend NestJS usa un `ValidationPipe` global con `whitelist: true` + `forbidNonWhitelisted: true`. Esto convierte los decoradores de `class-validator` en **obligatorios** para cualquier propiedad expuesta en un DTO, sin excepción. Sin esta comprensión, es fácil crear DTOs que silenciosamente devuelven 400 en producción.

---

## Regla Fundamental

> **Toda propiedad de un DTO que puede llegar en una petición HTTP DEBE tener al menos un decorador de `class-validator`.**

Esto incluye:
- `@Body()` — cuerpo de petición POST/PUT/PATCH
- `@Query()` — query parameters (`?page=1&limit=50`)
- `@Param()` — path parameters (`:id`, `:conversationId`)

---

## Patrones por Tipo de DTO

### 1. Query DTO (paginación) — El más propenso a error

```typescript
import { IsOptional, IsString } from 'class-validator';

class PaginationQuery {
  @IsOptional()
  @IsString()
  page?: string;  // Llega como string desde HTTP, parseado manualmente en el controller

  @IsOptional()
  @IsString()
  limit?: string;
}
```

> **Por qué `@IsString()` y no `@IsInt()`?** Los query params siempre llegan como `string` en HTTP. Con `transform: true` del ValidationPipe se pueden convertir automáticamente a `number`, pero requiere `@Type(() => Number)` de `class-transformer`. Parsear manualmente con `parseInt()` en el controller es igualmente válido y más explícito.

### 2. Query DTO con transformación automática

```typescript
import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class PaginationQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
```

### 3. Body DTO (creación de recurso)

```typescript
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsEnum } from 'class-validator';

class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  externalOrderId: string;

  @IsOptional()
  @IsEmail()
  buyerEmail?: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;
}
```

### 4. Path Param DTO

Los `@Param()` individuales como `@Param('id') id: string` no necesitan DTO — son strings simples. Si se agrupan en una clase, aplica la misma regla:

```typescript
import { IsUUID } from 'class-validator';

class ConversationParams {
  @IsUUID()
  conversationId: string;
}
```

---

## Configuración de Referencia

```typescript
// apps/api/src/main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,            // Strips propiedades sin decoradores (no lanza error)
  forbidNonWhitelisted: true, // Además lanza HTTP 400 si hay props no decoradas
  transform: true,            // Convierte tipos automáticamente con @Type()
}));
```

Con `whitelist: true` solo, las propiedades sin decoradores se ignoran silenciosamente.  
Con `forbidNonWhitelisted: true`, se lanza `HTTP 400 Bad Request` — mucho más seguro pero requiere disciplina.

---

## Checklist al crear un Controller

- [ ] ¿El método usa `@Query()`? → El DTO tiene `@IsOptional()` / `@IsString()` en todas sus propiedades
- [ ] ¿El método usa `@Body()`? → El DTO tiene decoradores en todas las propiedades requeridas y opcionales
- [ ] ¿El DTO tiene propiedades sin ningún decorador? → Añadir al menos `@IsOptional()` si es opcional
- [ ] ¿Se parsean números desde query params? → Elegir entre `parseInt()` manual o `@Type(() => Number)` + `@IsInt()`

---

## Historial

| Fecha | Evento |
|-------|--------|
| 2026-02-24 | Patrón identificado — `AdminController.PaginationQuery` sin decoradores causaba HTTP 400 en `/api/admin/orders` y `/api/admin/users` |
