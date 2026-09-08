# Repositorios

Interfaces de persistencia (puertos) que la capa de **casos de uso** consume sin
conocer Prisma. Las implementaciones concretas (adaptadores) viven junto a cada
interfaz como `*.prisma.ts` y usan el cliente de [`src/db/prisma.ts`](../db/prisma.ts).

Regla de dependencias (ADR-0001 §2):

```
Route Handler (app/api/*)  →  Caso de uso (src/use-cases)  →  Repositorio (puerto)
                                                                    ↑
                                              Implementación Prisma (adaptador)
```

El **dominio** (`src/domain`) no depende de ninguna de estas capas.
