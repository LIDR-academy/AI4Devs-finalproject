# ADR-0002 — Entrega del PDF en Base64 en el canal público de verificación

- **Estado:** Aceptada
- **Fecha:** 2026-07-29
- **Decisores:** Arquitectura de Software CCB
- **Ámbito:** microservicio `verificacion` (puerto 8083), contrato `GET /api/v1/verificaciones/{codigo}/documento`; consumo futuro en `frontend/portal-verificacion` (TKT-067, fuera de alcance de implementación en 006)
- **Relacionado con:** Constitución §VII y Restricciones Institucionales (URLs pre-firmadas S3); RNF-19; HU-14 / TKT-011; clarificación spec `006-servicio-publico-verificacion` (2026-07-29 Q2:A); [plan Complexity Tracking](../../specs/006-servicio-publico-verificacion/plan.md)

---

## Contexto

La constitución (principio VII y restricciones institucionales) establece que los PDFs en
Amazon S3 **solo se exponen por URL pre-firmada** con expiración de 15 minutos, nunca por
acceso directo al bucket. Esa regla protege el canal autenticado de **descargas** y evita
objetos públicamente listables o enlaces permanentes.

El servicio público de verificación (HU-14 / EPIC-02) debe permitir a un **tercero anónimo**
validar un código de 14 caracteres y **visualizar** el certificado en el portal de
verificación (visor pdf.js). La clarificación de requisitos (2026-07-29 Q2:A) y TKT-011 fijan
que la API entregue el **contenido PDF codificado en Base64** en el cuerpo de la respuesta,
no una URL pre-firmada.

Tensión:

| Norma | Exigencia aparente |
| --- | --- |
| Constitución VII / RNF-19 | Exponer PDFs solo vía URL pre-firmada S3 (15 min) |
| Spec 006 / TKT-011 / portal verificación | Entregar Base64 en JSON para pdf.js; sin URL S3 en el canal anónimo |

Sin una decisión explícita, la implementación de 006 quedaría en violación constitucional o
el portal público quedaría sin contrato usable.

## Decisión

Se **acepta una excepción acotada** a la regla de URLs pre-firmadas **únicamente** para el
flujo público de verificación:

1. **`GET /api/v1/verificaciones/{codigo}/documento`** (servicio `verificacion`) MUST
   devolver el PDF en Base64 (`data.contenido`) con `tipo: application/pdf`, tras validar
   formato, existencia y vigencia del código (60 días calendario, `America/Bogota`).
2. Ese endpoint MUST NOT devolver URL pre-firmada, URL pública del bucket ni redirect a S3.
3. El objeto en S3 MUST permanecer **no público**; solo el backend (credenciales de servicio)
   ejecuta `GetObject`. El cliente anónimo nunca recibe credenciales ni localizadores S3.
4. **RNF-19 y la constitución VII siguen vigentes sin cambio** para el microservicio
   `descargas` y cualquier otro canal autenticado: allí la entrega al cliente sigue siendo
   por URL pre-firmada (15 min).
5. Esta excepción **no** autoriza buckets públicos, URLs permanentes ni entrega Base64 en
   `descargas`.

En términos de gobernanza constitucional: se trata de una **desviación justificada por ADR**
(Complexity Tracking de la feature 006), no de una enmienda al texto de la constitución en
esta entrega. Una enmienda MINOR futura puede formalizar el matiz (“salvo verificación
pública documentada en ADR-0002”) si el equipo de arquitectura lo prioriza.

## Alternativas consideradas

### A — URL pre-firmada también en verificación (rechazada)

Cumple literalmente VII/RNF-19, pero:

- Expone un localizador S3 temporal al navegador **anónimo**, ampliando la superficie de
  reenvío/filtración del enlace frente a un cuerpo de respuesta de un solo uso en la sesión
  del visor.
- Rompe el contrato ya fijado del portal (pdf.js + Base64) y TKT-011.
- No aporta control adicional relevante: quien ya pasó la validación del código vigente
  está autorizado a ver ese PDF concreto.

### B — Proxy de bytes con `Content-Type: application/pdf` (stream) sin Base64 (rechazada por ahora)

Viable técnicamente y también evitaría URLs S3, pero:

- Exige cambiar el contrato del portal/TKT-011 (Base64 embebido en JSON/`ApiResponse`).
- Puede adoptarse en una evolución futura sin invalidar esta ADR, si se mantiene la
  invariante “sin URL S3 al cliente anónimo”.

### C — Enmendar la constitución ahora para decir “Base64 o pre-firmada” (aplazada)

Correcta a largo plazo; se aplazó para no bloquear 006. Esta ADR cumple el requisito de
Governance (“desviación MUST justificarse mediante ADR”) mientras tanto.

## Consecuencias

**Positivas**
- Alineación con HU-14, TKT-011 y el portal de verificación (pdf.js).
- El bucket S3 no se hace público; no hay presigned URL en el canal anónimo.
- RNF-19 permanece intacto en `descargas`.
- Desbloquea `/speckit-implement` de 006 sin ambigüedad de cumplimiento.

**Negativas / riesgos a gestionar**
- Respuestas JSON más pesadas (PDF completo en Base64, ~33 % de overhead). Mitigación:
  solo tras código vigente; rate limit 100 req/s por IP (Bucket4j + Redis); P95 validación
  &lt; 500 ms (SC-001) se mide en el GET de validación, no necesariamente en documento.
- El PDF viaja por el API corporativo: TLS obligatorio; no cachear respuestas de documento
  en CDN públicos; no registrar el Base64 en logs.
- Quien capture la respuesta HTTP ve el PDF (igual que con una URL pre-firmada descargada).
  La autorización sigue siendo “conocer un código vigente de 14 caracteres”.

**Invariantes que MUST preservarse (protegidas por tests)**
- Código inválido / inexistente / expirado → no se llama a S3 ni se devuelve contenido.
- Objeto ausente o vacío/corrupto → 404 `ARCHIVO_NO_ENCONTRADO` + alerta interna; sin detalles
  de infraestructura al cliente.
- S3 caído → 503 `SERVICIO_NO_DISPONIBLE`.
- Ningún campo de respuesta de verificación contiene URL de S3.

## Cumplimiento y trazabilidad

| Artefacto | Uso de esta ADR |
| --- | --- |
| `specs/006-servicio-publico-verificacion/plan.md` | Complexity Tracking debe citar ADR-0002 |
| `specs/006-servicio-publico-verificacion/spec.md` | FR-008 / FR-008a / FR-011 |
| `contracts/api-verificaciones.md` | Cuerpo `{ contenido, tipo }` |
| Constitución 1.0.0 | Desviación acotada justificada; candidata a enmienda MINOR posterior |
| Servicio `descargas` | Sin cambio: sigue RNF-19 con URLs pre-firmadas |

## Referencias

- Clarificación Q2:A — `specs/006-servicio-publico-verificacion/spec.md` (Session 2026-07-29)
- Research R6 — `specs/006-servicio-publico-verificacion/research.md`
- Constitución §VII, Restricciones Institucionales, Governance (ADR obligatorio para desviaciones)
- Hallazgo C1 — análisis `/speckit-analyze` de 2026-07-29
