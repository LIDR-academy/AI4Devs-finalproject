# Issue 002 — Coherencia documental post-historias de usuario

> Detectado: 2026-06-10 · Sesión 3 · Análisis de coherencia completo

## Hallazgos

### 1. ❌ `docs/development_guide.md` — Archivo de otro proyecto (ALTA)

**Problema:** El archivo pertenece al proyecto `AI4Devs-LTI-extended`. Contiene:
- Referencias a Node.js v16, npm v8, Prisma, React
- Credenciales de otro proyecto (`LTIdbUser`)
- Puerto 3000 (INKSPIRE usa 5000)
- Instrucciones de `git clone` de otro repo

**Fix:** Reescribir completamente para INKSPIRE con:
- Prerequisites: .NET SDK 10, Node.js 22+, Angular CLI 20, Docker, PostgreSQL 16
- Setup: `docker-compose up` para PostgreSQL + MinIO
- Backend: `dotnet run` en /backend
- Frontend: `ng serve` en /frontend
- Seed: `dotnet run --seed` o migration con datos iniciales
- Variables de entorno correctas (sin credenciales reales)

---

### 2. ⚠️ `docs/data-model.md` — Campos Won't-Have en Review (MEDIA)

**Problema:** La entidad `Review` conserva campos de funcionalidades eliminadas del MVP:
- `healing_photo_url` — foto de curación 90 días (Won't-Have)
- `has_healing_photo` — flag asociado
- `healing_photo_at` — timestamp asociado
- `artist_response` — respuesta del artista a reseñas (Won't-Have)

También la regla de validación: *"Healing photo can only be uploaded after 90 days from booking_date"*

**Fix:** Eliminar los 4 campos y la regla de validación asociada. Agregar comentario: "Campos para foto de curación y respuesta del artista reservados para versiones futuras."

---

### 3. ⚠️ `docs/data-model.md` — Falta `relationship_type` en Sponsorship (MEDIA)

**Problema:** US0014 especifica `relationship_type: enum ['ambassador', 'sponsored', 'certified']` pero la entidad `Sponsorship` en data-model.md no tiene ese campo.

**Fix:** Agregar campo:
- `relationship_type`: Type of brand relationship ('ambassador', 'sponsored', 'certified')
- Agregar al diagrama ER
- Validación: required, enum de 3 valores

---

### 4. 💡 US0007 redundante con US0004.CA5 (BAJA)

**Problema:** US0004 criterio CA5 ya dice "Filtro por certificación sanitaria: toggle". US0007 repite exactamente lo mismo como historia separada, agregando solo el badge visual.

**Fix:** Clarificar en US0007 que su alcance diferenciador es:
- El **badge visual** (componente reutilizable en cards, búsqueda y perfil)
- No el toggle de filtro (que se implementa en US0004)

Agregar nota aclaratoria en US0007: "El toggle de filtro se implementa en US0004.CA5. Esta US se enfoca en el componente badge y su visualización consistente."

---

### 5. ℹ️ `docs/api-spec.yml` — Vacío (INFO)

**Problema:** Fue vaciado intencionalmente en issue-001. Ahora con 14 US definidas, los endpoints son identificables.

**Fix:** Ejecutar ahora con lo que ya se pueda realizar. Luego, a medida que se avance se actualizará. 

---

## Plan de Ejecución

| Paso | Acción | Archivo(s) | Hallazgo |
|---|---|---|---|
| 1 | Reescribir development_guide.md para INKSPIRE | `docs/development_guide.md` | #1 |
| 2 | Eliminar campos Won't-Have de Review | `docs/data-model.md` | #2 |
| 3 | Agregar relationship_type a Sponsorship | `docs/data-model.md` | #3 |
| 4 | Agregar nota aclaratoria en US0007 | `docs/us/us0007/us0007.md` | #4 |
| 5 | Generar api-spec.yml con endpoints | `docs/api-spec.yml` | #5 |

## Criterios de Done

- [x] `docs/development_guide.md` describe setup de .NET 10 + Angular 20 + PostgreSQL 16 + Docker
- [x] `docs/development_guide.md` no contiene referencias a Node.js, Prisma, React ni LTI
- [x] `Review` en data-model.md no tiene campos `healing_photo_url`, `has_healing_photo`, `healing_photo_at`, `artist_response`
- [x] `Sponsorship` en data-model.md tiene campo `relationship_type` con enum de 3 valores
- [x] Diagrama ER de Sponsorship incluye `relationship_type`
- [x] US0007 tiene nota que clarifica alcance vs US0004.CA5
- [x] api-spec.yml contiene endpoints derivados de las 14 US
