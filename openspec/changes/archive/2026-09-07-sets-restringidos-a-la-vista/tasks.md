# Tasks: Sets restringidos a la vista

> Tests no negociables. Los dos que más importan aquí: que la proyección pública siga
> sin filtrar **lo que sí es interno** —sacar `restricted` de esa lista no puede
> aflojar la afirmación sobre el resto— y la **frontera del cálculo de la fecha**, que
> es donde `monthsBetween` tiene su caso raro.

## 1. La restricción, en el catálogo

- [x] 1.1 `src/domain/catalog/public-projection.ts`: `restricted` entra en `PublicSet`
      y en `PUBLIC_SET_FIELDS`, y **sale** de `NON_PUBLIC_SET_FIELDS`;
      `AuthenticatedSet` deja de declararlo por su cuenta
- [x] 1.2 `catalog.repository.prisma.ts`: `PUBLIC_SET_SELECT` lo incluye y la
      proyección autenticada se simplifica —ya no tiene que añadirlo aparte—
- [x] 1.3 `tests/public-catalog.test.ts`: la afirmación "no es público" se **cambia**,
      no se borra; el resto de campos internos sigue afirmado
- [x] 1.4 Rejilla (`app/(public)/catalogo/page.tsx`): marca en la tarjeta con la
      antigüedad exigida, leída del ajuste, no escrita a mano

## 2. Desde cuándo

- [x] 2.1 `src/domain/subscriptions/eligibility.ts`: `restrictedAvailableFrom`, pura,
      devolviendo `Date` y no una frase (design.md §4)
- [x] 2.2 El veredicto `SUBSCRIPTION_TOO_RECENT` lleva la fecha, para que la use igual
      la ficha que la API
- [x] 2.3 Tests de la frontera: la fecha cumple la antigüedad y un milisegundo antes no
      (design.md §5), incluida un alta el día 31. **El barrido tumbó dos versiones
      antes de la buena** —el desbordamiento de febrero y la hora del alta—; ese es el
      test que hay que conservar, no los casos sueltos
- [x] 2.4 Ficha: el cuarto motivo deja de ser el único sin salida — muestra la fecha, y
      la condición del set se ve también sin sesión

## 3. Cierre

- [x] 3.1 E2E: un set restringido se distingue en la rejilla, y la ficha dice desde
      cuándo a quien no llega
- [x] 3.2 Documentación: `readme.md`, `documents/PRD.md` y `AGENTS.md`
- [x] 3.3 Verificación completa: `tsc --noEmit`, `eslint .`, `vitest run`,
      `next build`, `npm run test:e2e` y `openspec validate --all --strict`
