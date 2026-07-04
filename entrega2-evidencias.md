# Entrega 2 — Código funcional: evidencias y acceso

> **Objeto de la entrega:** backend, frontend y base de datos conectados, con el flujo principal completo y operativo. Este documento explica dónde reside el código, cómo verificarlo, y las evidencias de su funcionamiento.

---

## 1. Ubicación del código y motivo de su privacidad

El código de Muugen reside en repositorios **privados**, fuera de esta plantilla:

| Repositorio | Contenido | Acceso |
|---|---|---|
| https://github.com/Jonnhyx/muugen | Producto completo: backend (FastAPI), frontend (Next.js), migraciones, infraestructura y documentación | Privado — se facilita acceso de lectura al evaluador bajo petición |
| https://github.com/Jonnhyx/Multi-Agent-AI-Ecosystem | Sistema multi-agente con el que se desarrolló el producto | Privado — ídem |

**Motivo:** Muugen es un proyecto vinculado a una necesidad real de mi empresa (Muutech). Aunque actualmente el repositorio es personal, el código está destinado a convertirse en **código propietario de la empresa**, por lo que no puede publicarse. Esta plantilla de entrega contiene la documentación completa del proyecto (readme, prompts, anexos) y este documento de evidencias; el código se verifica mediante acceso de lectura directo y las evidencias de ejecución listadas abajo.

## 2. Ancla de la entrega (estado inmutable)

Para que la evaluación se refiera al estado exacto entregado (y no al estado futuro del repositorio), la entrega queda anclada al commit de integración del MVP en `main`:

- **Commit:** `d67dffdd915a9b2224913bbefead4782ba0d1905` — *Merge pull request #56 (develop → main)*: integración del MVP completo.
- **Verificación:** `git log d67dffd` en el repositorio, o directamente https://github.com/Jonnhyx/muugen/commit/d67dffd (requiere acceso de lectura).

## 3. Evidencias de funcionamiento

**Despliegue vivo:** la aplicación está desplegada y operativa en **https://muugen.muutech.es** (AlmaLinux 9 + Nginx/SSL + PostgreSQL + Docker Compose). El acceso requiere autenticación; se facilita una credencial temporal de evaluación mediante onetimesecret.

**Vídeo del flujo E2E completo** (login → subida de MIB → progreso en vivo → resultado → descarga del YAML):
📹 https://drive.google.com/file/d/1Iej9XMdK1GQpok03vs-QdDQhmnQYewtr/view

**Flujo principal implementado y conectado:**
- **Frontend** (Next.js): login con sesión firmada, formulario de generación (dropzone de MIB + deps, contexto, cliente, ingeniero), pantalla de progreso con polling y etapas del pipeline en vivo, pantalla de resultado con descarga/previsualización del YAML.
- **Backend** (FastAPI + worker): `POST /api/generate` asíncrono (202), pipeline de 3 agentes (parser → estratega → arquitecto), serialización YAML, validación local con self-healing, deduplicación por SHA-256, leasing de tareas del worker.
- **Base de datos** (PostgreSQL 15): 7 tablas, 9 migraciones Alembic aplicadas automáticamente en el despliegue por el servicio `muugen-migrate`.

**Ejecución local reproducible** (para verificación sin credenciales de LLM):

```bash
git clone git@github.com:Jonnhyx/muugen.git && cd muugen
git checkout d67dffd   # estado exacto de la entrega (ver §2)
cp infra/.env.example infra/.env       # rellenar; usar LLM_PROVIDER=mock
docker compose up -d                   # migrate + api + worker + ui
# UI en http://localhost:3000 — el flujo completo funciona con el proveedor mock,
# sin coste de API ni conexión externa.
```

## 4. Trazabilidad del desarrollo: Pull Requests → tickets

El desarrollo completo se realizó mediante Pull Requests trazables a tickets SCRUM (ejecutados en su mayoría por el sistema multi-agente; ver anexo del readme). Historial de merges a `develop`/`main`:

| PR | Ticket | Contenido |
|---|---|---|
| #8 | SCRUM-8 | [DB] Schema PostgreSQL inicial (Alembic) |
| #9 | SCRUM-9 | Contratos Pydantic (CanonicalOID, SelectionReport, ZabbixTemplate) |
| #10 | SCRUM-10 | Agente 1: MIB Parser con pysmi |
| #11 | SCRUM-11 | Knowledge Base: perfiles IT + matching de contexto |
| #13-14 | SCRUM-12/13 | Agente 2: Estratega (KB + LLM, selección) + fix iterativo |
| #18 | SCRUM-14 | Agente 3: ZabbixArchitect (LLM → estructura Zabbix) |
| #19 | SCRUM-15 | Serializador YAML compatible con Zabbix 6 |
| #20 | SCRUM-16 | `POST /generate` + auth middleware |
| #21 | SCRUM-17 | Endpoints auxiliares (health, generations) |
| #23, #27 | SCRUM-18 | Fixes de review + documentación |
| #28 | SCRUM-20 | UI Pantalla 1: formulario de generación |
| #29 | SCRUM-21 | UI Pantalla 2: progreso de generación |
| #30 | SCRUM-22 | UI Pantalla 3: resultado y descarga |
| #31, #33 | SCRUM-23/24 | Imágenes Docker (api, ui) |
| #35-36 | SCRUM-25 | Nginx con SSL (+ docs) |
| #39-40 | SCRUM-30 | Logging estructurado JSON (+ docs) |
| #41-42 | SCRUM-29 | Trazabilidad por ingeniero (+ docs) |
| #43-44 | SCRUM-28 | API de clientes, alta implícita (+ docs) |
| #45-46 | SCRUM-31 | Validación local + self-healing (+ docs) |
| #48, #50 | SCRUM-MVP / REVIEW | Aplicación de comentarios de PR + docs de review |
| #51-52 | SCRUM-32 | CliProvider (LLM vía Claude Code CLI) (+ docs) |
| #53 | — | Refactor (estratega guiado por intención, KB a 15 perfiles) |
| #54 | bugfix/mvp | Estabilización de la integración del MVP |
| **#56** | — | **Integración final: `develop` → `main`** *(= commit ancla de esta entrega, ver §2)* |

Patrón visible en el historial: cada ticket genera **dos PRs** (código y documentación, con revisores distintos), abiertos por los agentes y trazables por el nombre de la rama.

## 5. Calidad y CI

- **Suite de tests:** 520+ tests (unitarios + integración) con umbral de cobertura del 75 % (cobertura real ~85 %).
- **CI (GitHub Actions):** en cada push/PR se ejecutan lint (ruff, mypy) y la suite completa. El proveedor `mock` del LLM permite que los tests del pipeline corran en CI sin credenciales ni coste.
- **Calidad forzada por contrato:** Pydantic v2 en las fronteras, CHECK constraints en BD, y validación local del YAML generado con self-healing.

## 6. Decisiones sobre E2E automatizado y CD (transparencia)

Dos artefactos de la entrega final se han resuelto deliberadamente **por integración corporativa** en lugar de por implementación paralela en este repositorio:

- **Test E2E automatizado:** Muutech dispone de una plataforma de pruebas E2E corporativa (Cypress) con flujos que cubren el conjunto de sus productos. Muugen se integrará en esos flujos al incorporarse como producto interno. Implementar ahora un E2E paralelo en el repositorio supondría duplicar una infraestructura existente y crear un artefacto que quedaría obsoleto en la integración. La calidad del flujo se garantiza hoy mediante la suite de 520+ tests (que incluye tests de integración del runner completo con el proveedor mock), la validación local del output y la verificación manual E2E documentada en vídeo.
- **Pipeline de CD:** análogamente, el despliegue productivo se integrará en los workflows de despliegue corporativos. El repositorio documenta y automatiza el despliegue actual (script de provisión idempotente `infra/setup-server.sh`, `docker compose` con migraciones automáticas vía `muugen-migrate`), sin duplicar un pipeline que sería descartado.

Ambas decisiones son revisables: si la evaluación del curso requiere estos artefactos en el repositorio, su implementación mínima está diseñada (el E2E correría con `LLM_PROVIDER=mock` en CI; el CD sería un workflow de despliegue sobre `main`).

## 7. Cómo solicitar acceso

Para acceder a los repositorios privados o a la credencial de la demo, contactar con el autor (Jonatan Pérez Rodríguez) a través del canal del curso. El acceso de lectura se concede de inmediato.