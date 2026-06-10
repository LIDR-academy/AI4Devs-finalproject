# Prompts de la sesión · Cambio de stack tecnológico

> Sesión de trabajo · Junio 2026 · Actualización de stack en agentes y estándares de documentación

---

## 01 — Ejecutar prompt de cambio de stack

```
Ejecuta el prompt de este archivo & 'c:\repo\ai4devs\AI4Devs-finalproject\prompts\02-cambiar stack tech.md'
```

---

## 02 — Contenido del prompt ejecutado (`02-cambiar stack tech.md`)

```
Modifica los archivos ai-specs/agents/backend-developer.md, ai-specs/agents/frontend-developer.md,
ai-specs/docs/backend-standards.md, ai-specs/docs/frontend-standards.md
para que adopten el stack tecnológico de este proyecto, que es: netcore 10 C#, base de datos PostgreSQL, Angular 20.

IMPORTANTE:
- solo modifica el stack tecnológico, no modifiques ni elimines referencias a otras tecnologías
  o herramientas, como docker, git, etc.
- Genera un plan y preguntame antes de continuar por cada archivo.
```

---

## 03 — Aprobación: archivo 1 (backend-developer.md)

```
sí, procede
```

*(aprueba el plan para ai-specs/agents/backend-developer.md: TypeScript/Node.js/Express/Prisma/Jest → C#/.NET Core 10/ASP.NET Core/EF Core/xUnit)*

---

## 04 — Aprobación: archivo 2 (frontend-developer.md)

```
si
```

*(aprueba el plan para ai-specs/agents/frontend-developer.md: React/React Router/React Bootstrap/axios → Angular 20/Angular Router/Angular Material/HttpClient)*

---

## 05 — Corrección de ruta: archivos de docs en raíz

```
no lo crees, el archivo está en la carpeta docs de la raiz
```

*(corrección: los archivos backend-standards.md y frontend-standards.md están en docs/ de la raíz, no en ai-specs/docs/)*

---

## 06 — Aprobación: archivo 3 (docs/backend-standards.md)

```
si,cambia todo
```

*(aprueba reescritura completa de docs/backend-standards.md con .NET Core 10/C#/ASP.NET Core/EF Core/xUnit)*

---

## 07 — Aprobación: archivo 4 (docs/frontend-standards.md)

```
si
```

*(aprueba reescritura completa de docs/frontend-standards.md con Angular 20/Angular Material/HttpClient/signals)*

---

## 08 — Guardar prompts de la sesión

```
Todos los prompts que usamos en esta sesion grabalos en el archivo prompts/00-all-prompts.md
```

---

## Resumen de archivos modificados

| Archivo | Stack anterior | Stack nuevo |
|---|---|---|
| `ai-specs/agents/backend-developer.md` | TypeScript / Node.js / Express / Prisma / Jest | C# / .NET Core 10 / ASP.NET Core / EF Core / xUnit |
| `ai-specs/agents/frontend-developer.md` | React / React Bootstrap / axios | Angular 20 / Angular Material / HttpClient |
| `docs/backend-standards.md` | Node.js / TypeScript / Prisma / Jest | .NET Core 10 / C# / EF Core / xUnit |
| `docs/frontend-standards.md` | React 18 / React Bootstrap / axios | Angular 20 / Angular Material / HttpClient |

---

## 09 — Generación de documentación técnica (meta-prompt)

```
Genera un prompt especializado para IA (meta prompt) en base al archivo initial.md y guarda este
prompt en un archivo llamado master-prompt-docs.md dentro de la carpeta prompts de la raiz del proyecto
```

*(Genera prompts/master-prompt-docs.md con rol, contexto, misión y restricciones para producir docs/documentacion.md)*

---

## 10 — Plan de ejecución para documentación

```
Genera un plan detallado para master-prompt.md y grabalo en master-prompt-docs-plan.md para revisarlo
```

*(Genera prompts/master-prompt-docs-plan.md con checklist verificable, entidades, decisiones y validaciones cruzadas)*

---

## 11 — Ejecución del plan

```
ejecuta el plan de master-prompt-docs-plan.md
```

*(Genera docs/documentacion.md completo: descripción, Lean Canvas, 3 casos de uso, modelo de datos ER, arquitectura y diagramas C4)*

---

*INK·LINK © 2026 · Historial de sesión: cambio de stack tecnológico + documentación técnica v1*
