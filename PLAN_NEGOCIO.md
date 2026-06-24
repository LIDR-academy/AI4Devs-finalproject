# Plan de negocio — Plataforma LMS SaaS (Tech + IA)

Documento de referencia estratégica para el producto. El código actual (`codigofinal/lms-cms-laravel12`) es el **MVP técnico (Fase 1)**; la hoja de ruta de implementación está en `codigofinal/lms-cms-laravel12/docs/ROADMAP_SAAS.md`.

---

## 1.1 Concepto del negocio

**Propuesta de valor:** Plataforma SaaS moderna donde desarrolladores, empresas y educadores pueden crear, compartir y monetizar cursos de tecnología con herramientas IA integradas.

### Target principal

| Segmento | Descripción |
|----------|-------------|
| Bootcamps y academias de coding | 200+ en España/Latam |
| Empresas tech | Formación interna de equipos |
| Profesores independientes | Especialistas en tecnología |
| Comunidades de desarrolladores | Aprendizaje colaborativo |

---

## 1.2 Características principales

| Área | Descripción | Estado MVP actual |
|------|-------------|-------------------|
| Creación de cursos inteligente | Editor drag-and-drop; IA para contenido auxiliar, transcripciones y quizzes automáticos | Editor + plugins ✓; IA generativa pendiente |
| Tutor IA integrado | Chatbot (LangChain + Claude/GPT) por lección | Pendiente (Fase 1) |
| Análisis de aprendizaje | Dashboard progreso, conceptos débiles, recomendaciones | Progreso básico ✓; analytics avanzado pendiente |
| Integración ecológica | GitHub, APIs, entornos de desarrollo | Pendiente (Fase 3) |
| Monetización flexible | Venta de cursos 70/30, certificaciones, premium | Planes definidos ✓; Stripe pendiente |
| Comunidades | Foros, proyectos, portfolios, mentoría | Foro como plugin ✓; comunidad global pendiente |

---

## 1.3 Modelo de ingresos (SaaS)

| Plan | Precio | Público | Incluye |
|------|--------|---------|---------|
| **Básico** | €4.99/mes | Estudiantes | Cursos públicos, 1 tutor IA/mes, certificados básicos |
| **Pro** | €29/mes | Profesores/creadores | 5 cursos, tutor IA ilimitado, analytics, monetización |
| **Empresa** | €299–999/mes | Instituciones | Cursos ilimitados, SSO, white-label parcial, soporte B2B |
| **API IA** | €0.10–0.50/consulta | Plataformas externas | Integración Moodle/Canvas/propias |

Configuración técnica de planes: `config/saas.php` en el repositorio Laravel.

---

## 1.4 Proyección de ingresos (Año 1–3)

| Métrica | Año 1 | Año 2 | Año 3 |
|---------|-------|-------|-------|
| Usuarios Básico | 300 | 1,200 | 3,500 |
| Profesores Pro | 15 | 60 | 180 |
| Clientes Empresa | 2 | 12 | 35 |
| MRR | €1,500 | €8,500 | €22,000 |
| Ingresos anuales | €18,000 | €102,000 | €264,000 |
| Margen operativo | -35% | 15% | 45% |

**Referencia:** Udemy (€500M+), Teachable (€100M+). Diferenciación: tech + IA + comunidad hispanohablante.

---

## 1.5 Stack técnico recomendado

| Componente | Tecnología | Estado actual / evolución |
|------------|------------|---------------------------|
| Base de datos | Supabase (PostgreSQL + pgvector) | MySQL 8.4 (MVP) → migración futura |
| Backend | Node/NestJS + Python FastAPI | Laravel 12 (MVP) → microservicio IA en Python |
| Frontend | React/Next.js + TypeScript | Blade + JS (MVP) → Next.js en Fase 2+ |
| IA/LLM | Claude API + LangChain | Pendiente |
| Infraestructura | Azure App Service / AKS | Docker local (MVP) → Azure |
| Almacenamiento | Azure Blob / S3 | `storage/` Laravel (MVP) |
| Pagos | Stripe + Paddle (EU) | Pendiente Fase 1 |
| Video | Mux / JWPlayer | Upload local + embed (MVP) |

---

## 1.6 Fases de desarrollo

### Fase 1 — MVP (meses 1–3)

- Autenticación y perfiles ✓
- Editor de cursos básico ✓ (plugins, páginas WYSIWYG, vídeo)
- Reproductor de video ✓
- Tutor IA simple (Claude API) — en curso
- Pagos básicos (Stripe) — pendiente
- Deploy en Azure — pendiente

### Fase 2 — Alpha (meses 4–6)

50 usuarios beta, analytics avanzado, dashboard profesores, certificados PDF, €500–1000/mes.

### Fase 3 — Expansión (meses 7–12)

300+ usuarios, monetización de cursos, GitHub/Slack, foros activos, MRR €1500+.

### Fase 4 — Consolidación (año 2)

1,200+ usuarios, API pública, partnerships bootcamps, white-label, MRR €8,000+.

---

## 1.7 Ventajas y desafíos

**Ventajas:** escalabilidad SaaS, alto margen a madurez, network effects, diferenciación IA, alineación con skills DevOps/educación.

**Desafíos:** 18–24 meses a rentabilidad, inversión inicial (hosting, APIs IA, equipo), competencia (Udemy, Teachable), CAC, complejidad técnica (pagos, streaming).

---

## 1.8 Go-to-market

1. **Fase 0:** Validación con 10–20 bootcamps/profesores; landing + waitlist; early bird 50%.
2. **Lanzamiento:** 5–10 cursos propios de calidad.
3. **Partnerships:** Bootcamps ES/LATAM, white-label, revenue share 70/30.
4. **Community:** Dev.to, Hashnode, Reddit, Discord tech hispanohablante.
5. **Content marketing:** SEO «curso online javascript IA».
6. **Paid ads:** Google/Meta (año 2+).

---

## Enlaces del repositorio

- Código MVP: `codigofinal/lms-cms-laravel12`
- Documentación técnica: `AI4Devs-finalproject/readme.md`
- Roadmap de implementación: `codigofinal/lms-cms-laravel12/docs/ROADMAP_SAAS.md`
- Página de planes (app): `/pricing`
