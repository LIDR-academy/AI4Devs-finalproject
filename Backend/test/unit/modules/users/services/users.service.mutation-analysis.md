# Mutation analysis: UsersService.findOne(id)

Reference implementation:

```typescript
async findOne(id: string): Promise<User> {
  const user = await this.userRepository.findOne({
    where: { id, deletedAt: IsNull() },
  });

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  return user;
}
```

Current test for the error path: **"should throw NotFoundException when user not found"** (mocks `findOne` with `null`, asserts `rejects.toThrow(NotFoundException)` and `rejects.toThrow('Usuario no encontrado')`).

---

## Mutations StrykerJS would typically apply

### 1. Condition negation (Conditional Expression / Equality mutator)

| Mutación | Código mutado | Comportamiento con `user === null` | ¿Matan los tests? | Notas |
|----------|----------------|-------------------------------------|--------------------|--------|
| Negar condición | `if (!user)` → `if (user)` | Original: entra al `if` y lanza. Mutante: no entra, hace `return user` (null). | **Sí** | El test espera `rejects.toThrow(NotFoundException)`; el mutante resuelve con `null` → falla el test. |
| `!user` → `user === null` | Misma lógica para `null`. | Igual que original cuando el repo devuelve `null`. | **Sí** | Misma salida; el test sigue pasando para el mutante (comportamiento correcto). |
| `!user` → `user !== null` | Equivale a `if (user)`. | Solo lanza cuando hay usuario; si `user` es `null`, no lanza y retorna `null`. | **Sí** | Mismo efecto que negar la condición; el test detecta que no se lanza la excepción. |

**Conclusión:** Los tests actuales matan estos mutantes de condición porque cubren explícitamente el caso “usuario no encontrado” y comprueban que se lanza la excepción.

---

### 2. Borrado del throw (Block Statement mutator)

| Mutación | Código mutado | Comportamiento | ¿Matan los tests? | Gap si sobrevive |
|----------|----------------|----------------|--------------------|-------------------|
| Cuerpo vacío | `if (!user) { throw new NotFoundException(...); }` → `if (!user) { }` | Si no hay usuario, no se lanza nada y se ejecuta `return user` (null). | **Sí** | Si no hubiera test del error: el mutante devolvería `null` en lugar de lanzar; no se comprobaría el contrato “debe lanzar”. |
| Eliminar todo el `if` | Eliminar el bloque condicional completo | Siempre se hace `return user` (incluido `null`). | **Sí** | Mismo gap: sin test de “not found”, el mutante sobreviviría y ocultaría que se perdió el throw. |

**Conclusión:** El test **"should throw NotFoundException when user not found"** mata estos mutantes porque exige que, cuando el usuario no existe, la promesa sea rechazada con `NotFoundException`. Un mutante que quite el `throw` hace que la promesa se resuelva con `null`, por lo que el test falla.

---

### 3. Cambio de operador / literal (String Literal, Method Chain mutators)

| Mutación | Código mutado | Comportamiento | ¿Matan los tests? | Gap si sobrevive |
|----------|----------------|----------------|--------------------|-------------------|
| Mensaje vacío o distinto | `'Usuario no encontrado'` → `''` o otro string | Sigue lanzando `NotFoundException`, pero con otro mensaje. | **Sí** (si se asserta el mensaje) | Si solo se comprobara el tipo con `toThrow(NotFoundException)` y no el mensaje con `toThrow('Usuario no encontrado')`, el mutante del mensaje **sobreviviría**. Eso revela un gap: no se valida el mensaje de error. |
| Cambiar tipo de excepción | `NotFoundException` → otra excepción o `Error` | El test que espera `NotFoundException` fallaría. | **Sí** | - |

**Conclusión:** Que el test actual verifique también el mensaje (`'Usuario no encontrado'`) es lo que permite matar mutantes del literal. Si se quitara esa aserción, un mutante que cambiara el mensaje sobreviviría y mostraría que la cobertura del “valor” del error es débil.

---

### 4. Return statement mutator

| Mutación | Código mutado | Comportamiento | ¿Matan los tests? |
|----------|----------------|----------------|-------------------|
| No devolver el usuario | `return user` → `return undefined` o eliminar return | En el caso “user found”, el test espera `result === mockUser`; recibiría `undefined`. | **Sí** | El test **"should return user when found"** falla y mata al mutante. |

**Conclusión:** El test del camino feliz mata mutantes que alteren o eliminen el `return user`.

---

## Resumen: mutantes que matan los tests vs. posibles supervivientes

- **Condición:** Negar `!user` o cambiar a `user`/`user !== null` → **matan** los tests porque el test de “user not found” exige que se lance y que no se devuelva `null`.
- **Throw:** Quitar el `throw` o vaciar el bloque → **matan** los tests por la misma razón.
- **Return:** Cambiar o quitar `return user` → **matan** el test “should return user when found”.
- **Mensaje de la excepción:** Cambiar `'Usuario no encontrado'` → **matan** los tests solo porque hoy se asserta también el mensaje. Si se eliminara esa aserción, el mutante del mensaje **sobreviviría**.

**Gap de cobertura que revelaría un mutante superviviente:**  
Si un mutante que cambia el **mensaje** de la `NotFoundException` sobreviviera, indicaría que los tests no comprueban el mensaje de error. En ese caso, se recomienda mantener (o añadir) una aserción explícita del mensaje, por ejemplo:

```ts
await expect(service.findOne('non-existent-id')).rejects.toThrow('Usuario no encontrado');
```

Los tests actuales ya incluyen esta verificación, por lo que ese mutante sería matado y no quedaría ese gap para `findOne(id)`.
