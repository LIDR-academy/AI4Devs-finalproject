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

### 5. Query DTO con enum de valores permitidos (`@IsIn`) y herencia de DTO

Cuando un endpoint extiende otro con parámetros adicionales de tipo enum, usar herencia de DTO y `@IsIn([...])`:

```typescript
import { IsOptional, IsIn, IsString } from 'class-validator';

class PaginationQuery {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}

// Extiende PaginationQuery añadiendo parámetros de ordenación con valores fijos
class OrdersQuery extends PaginationQuery {
  @IsOptional()
  @IsIn(['ref', 'store', 'user', 'amount', 'date'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: string;
}
```

> **Fallback silencioso vs. error 400**: Con `forbidNonWhitelisted: true` y sin `ValidationPipe` global en tests, los valores inválidos para `@IsIn` pueden llegar al servicio. El servicio debe implementar su propia validación de fallback cuando el comportamiento correcto ante valores inválidos es degradar silenciosamente (no lanzar 400). Ver `admin.service.ts` para el patrón de `validSortColumns.includes(sortBy)`.

### 6. Patrón `buildOrderBy()` — construcción dinámica de `orderBy` en Prisma

Para servicios que soportan múltiples criterios de ordenación, extraer la lógica a un método privado para facilitar los tests unitarios:

```typescript
@Injectable()
export class AdminService {
  private readonly validSortColumns = ['ref', 'store', 'user', 'amount', 'date'];

  async getOrders(page: number, limit: number, sortBy?: string, sortDir?: string) {
    const isValidSort = sortBy !== undefined && this.validSortColumns.includes(sortBy);
    const resolvedSort = isValidSort ? sortBy : 'date';
    const dir: 'asc' | 'desc' = isValidSort
      ? sortDir === 'asc' ? 'asc' : 'desc'
      : 'desc'; // reset conjunto si sortBy inválido
    const orderBy = this.buildOrderBy(resolvedSort, dir);
    // ...
  }

  private buildOrderBy(sortBy: string | undefined, dir: 'asc' | 'desc') {
    const refSort = { externalOrderNumber: { sort: dir, nulls: 'last' as const } };
    switch (sortBy) {
      case 'store': return [{ store: { name: dir } }, refSort]; // con subsort
      case 'user':  return [{ user: { firstName: dir } }, { user: { lastName: dir } }];
      default:      return [{ webhookReceivedAt: dir }];
    }
  }
}
```

> El método privado permite testearlo directamente llamando a `getOrders` y verificando el argumento de `findMany` con `toHaveBeenCalledWith(expect.objectContaining({ orderBy: [...] }))`.

> **Nulls al final**: Para campos opcionales (ej. `externalOrderNumber`), usar `{ sort: dir, nulls: 'last' }` en lugar de `dir` directamente.

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
| 2026-02-24 | Añadido patrón 5: DTO con herencia y `@IsIn` para validación de enums (ticket `t01-orders-sorting`) |
| 2026-02-24 | Añadido patrón 6: `buildOrderBy()` privado para ordenación dinámica con Prisma |
