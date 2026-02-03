## FASE 3: Modelo de Servicio (Lean Canvas)

### Lean Canvas Adaptado a Herramienta Enterprise

SF-PM no es un producto SaaS comercial, sino una **herramienta interna de gestión patrimonial** para la Oficina Técnica de la Sagrada Familia. El Lean Canvas se adapta para reflejar el **ROI operativo** y el **valor interno** generado.

| **Bloque** | **Contenido** |
|------------|---------------|
| **1. Problema** | **Pain Points Críticos:**<br>• **Desconexión Rhino-Físico:** Archivos CAD de 2GB imposibles de consultar rápidamente. BIM Manager tarda 3h/día buscando información dispersa.<br>• **Pérdida de Trazabilidad:** Imposible auditar quién aprobó qué versión de una pieza, cuándo se modificó, o si cumple especificaciones de patrimonio.<br>• **Costes por Errores de Fabricación:** Piezas de piedra noble cortadas con datos incorrectos cuestan €15,000 cada una en retrabajos. 15% de piezas requieren ajustes por falta de especificaciones claras.<br>• **"Basura Digital" en Servidores:** Archivos duplicados, versiones obsoletas, nomenclaturas caóticas. Nadie sabe cuál es la "verdad" actual. |
| **2. Segmentos de Cliente (Usuarios Internos)** | **Usuarios Principales:**<br>• **Oficina Técnica (Arquitectos):** 3 equipos de diseño, ~12 arquitectos. Suben 200-500 piezas/semana. Necesitan validación inmediata.<br>• **BIM Manager / Coordinador de Obra:** 1 persona clave. Supervisa 50,000+ piezas, coordina 5 talleres externos. Necesita visibilidad total en tiempo real.<br>• **Taller de Canteros (Logística):** 5 talleres externos, ~60 operarios totales. Necesitan visualización 3D clara y actualizaciones de estado simples.<br>• **Dirección de Obra / Comisión de Patrimonio:** Requieren reportes de compliance, auditoría de materiales, trazabilidad oficial. |
| **3. Propuesta de Valor Única** | **"The Digital Gatekeeper with Immutable Traceability"**<br><br>**Diferenciadores clave:**<br>• **Validación Activa Pre-Ingesta:** The Librarian Agent rechaza archivos que no cumplen ISO-19650 ANTES de entrar al sistema. "Garbage In, Garbage Out" → "Garbage Never In".<br>• **Confianza Total en el Dato:** Event Sourcing inmutable. 100% de cambios auditables (quién, cuándo, qué). Compliance patrimonial garantizado.<br>• **Democratización del Acceso 3D:** Talleres sin licencias Rhino pueden visualizar piezas en tablet. Arquitectos sin abrir archivos de 2GB pueden consultar metadatos en 2 segundos.<br><br>**Tagline Interno:** *"La única fuente de verdad para 50,000 piezas únicas del patrimonio mundial."* |
| **4. Solución (Stack Técnico)** | **Componentes Core:**<br>• **The Librarian Agent (LangGraph):** Workflow stateful de validación multi-paso. Clasifica tipologías, detecta anomalías geométricas, enriquece metadatos faltantes.<br>• **Visor 3D Web Ligero (Three.js):** Renderiza 1,000+ piezas a >30 FPS. Accesible desde tablets en obra sin software CAD instalado.<br>• **Base de Datos Centralizada (Supabase/PostgreSQL):** RBAC granular, Row Level Security, Event Sourcing para trazabilidad inmutable.<br>• **Hybrid Extraction Pipeline (rhino3dm):** Metadata extraída en <1s, geometría procesada en background (Celery workers). |
| **5. Canales (Despliegue)** | **Puntos de Acceso:**<br>• **Intranet Oficina Técnica:** Acceso desde estaciones de trabajo de arquitectos vía navegador (Chrome/Edge).<br>• **Tablets Rugerizadas en Obra:** Talleres y supervisores acceden desde Android/iOS tablets con WiFi/4G.<br>• **Dashboards en Salas de Reunión:** Pantallas grandes para dirección de obra (reportes en tiempo real, gráficos de progreso).<br><br>**Deploy:** Cloud (Railway/Vercel frontend, Supabase backend) con posibilidad de desplegar on-premise si requerimientos de seguridad lo exigen. |
| **6. Flujo de Ingresos (ROI Operativo)** | **No hay ventas directas. El valor es ahorro operativo y mitigación de riesgos:**<br><br>**Ahorro Directo:**<br>• **Reducción 90% tiempo de búsqueda:** BIM Manager ahorra 2.5h/día × €50/h × 250 días = **€31,250/año**<br>• **Eliminación errores de fabricación:** 15% de 500 piezas/año evitan retrabajo. 75 piezas × €15,000 = **€1,125,000/año** (ahorro potencial, asumiendo 10% efectividad = €112,500 real)<br>• **Reducción tiempo de revisión manual:** Validación automática ahorra 3 días × 4 arquitectos × €60/h × 8h = **€5,760 por batch**<br><br>**Ahorro Indirecto:**<br>• **Compliance patrimonial sin esfuerzo extra:** Evita multas/retrasos por auditorías fallidas (valor intangible)<br>• **Velocidad de localización de piezas:** De 3 horas a 10 segundos (valor en agilidad operativa)<br><br>**ROI Conservador 1er Año:** €150,000 en ahorros vs. €50,000 desarrollo + €10,000 infraestructura = **ROI 150%** |
| **7. Estructura de Costes** | **Inversión Inicial (TFM - 3 Meses):**<br>• **Desarrollo:** €0 (trabajo de máster, equivalente a €30,000 si fuera contratado)<br>• **Infraestructura de Desarrollo:** €0 (tier gratuito Supabase, Vercel, Railway)<br><br>**Costes Operativos Anuales (Post-MVP):**<br>• **Infraestructura Cloud:**<br>  - Supabase Pro: €25/mes × 12 = €300/año<br>  - Storage S3/Supabase: €50/mes × 12 = €600/año (estimado 500GB archivos .glb)<br>  - Compute/Workers (Celery): €30/mes × 12 = €360/año<br>• **APIs Externas:**<br>  - OpenAI GPT-4 (The Librarian): €200/mes × 12 = €2,400/año (estimado 10,000 clasificaciones)<br>• **Mantenimiento y Soporte:**<br>  - Desarrollador part-time: €15,000/año (1 día/semana)<br><br>**TOTAL ANUAL:** ~€18,660/año |
| **8. Métricas Clave (KPIs)** | **Calidad de Datos de Entrada:**<br>• **Tasa de Rechazo de Archivos:** % de archivos rechazados por The Librarian (objetivo: 20-30% inicial → 5% tras 6 meses de aprendizaje de usuarios)<br>• **Precisión de Clasificación:** % de piezas clasificadas correctamente (objetivo: >85%)<br><br>**Eficiencia Operativa:**<br>• **Tiempo Medio de Localización de Pieza:** Segundos para encontrar info de cualquier pieza (objetivo: <10s)<br>• **Tiempo de Procesamiento de Upload:** Segundos para validar 200 piezas (objetivo: <30s)<br><br>**Trazabilidad y Compliance:**<br>• **% de Piezas con Trazabilidad Completa:** Piezas con historial de eventos completo (objetivo: 100%)<br>• **Uptime del Sistema:** Disponibilidad del servicio (objetivo: >99%)<br><br>**Adopción:**<br>• **Usuarios Activos Semanales:** Arquitectos y talleres usando el sistema (objetivo: 80% del equipo en 3 meses)<br>• **Piezas Gestionadas:** Total de piezas en sistema (objetivo: 10,000 en 6 meses, 50,000 en 2 años) |
| **9. Ventaja Injusta (Unfair Advantage)** | **Activos Únicos No Replicables:**<br>• **Acceso a Datos Reales Históricos:** 20+ años de archivos Rhino de la Sagrada Familia. Dataset único de geometría patrimonial compleja.<br>• **Conocimiento Profundo del Workflow:** Entendimiento íntimo de flujos de trabajo reales (no asumidos) de la Oficina Técnica: nomenclaturas específicas, tipologías de piezas, talleres externos, certificaciones patrimoniales.<br>• **Relación con Cliente de Alto Perfil:** Sagrada Familia como caso de estudio valida el sistema para otros proyectos patrimoniales (Catedral de Milán, Ópera de Sydney).<br>• **Expertise Híbrido:** Combinación de conocimiento arquitectónico (Rhino/Grasshopper) + desarrollo full-stack + AI engineering. Difícil de replicar en equipos separados. |

---

### Estrategia de Escalabilidad (Futuro Post-TFM)

#### Fase 1: MVP Interno (3 meses - TFM)
**Objetivo:** Demostrar viabilidad técnica con caso de uso real de Sagrada Familia.

**Alcance:**
- Sistema funcional con 6 features MVP (Upload, Validación, Dashboard, Visor 3D, RBAC, Update Estado)
- Procesamiento de 10,000 piezas reales
- 10-20 usuarios beta (arquitectos + 2 talleres)

**Éxito medido por:**
- 0% piezas inválidas en DB
- Reducción 70% tiempo búsqueda vs. proceso actual
- Feedback positivo de BIM Manager (NPS >8)

---

#### Fase 2: Consolidación Sagrada Familia (Meses 4-12)
**Objetivo:** Sistema en producción estable para toda la Oficina Técnica.

**Nuevas Features (P1):**
- Búsqueda avanzada + filtros combinados
- Notificaciones automáticas (email/push)
- Historial de versiones con comparación visual
- Reportes ejecutivos (PDF/Excel)
- Interfaz móvil nativa (iOS/Android)

**Métricas de Éxito:**
- 50,000 piezas gestionadas
- 50+ usuarios activos semanales
- Uptime >99%
- ROI €150,000+ en ahorros demostrados

---

#### Fase 3: Expansión Multi-Proyecto (Año 2)
**Objetivo:** Plataforma SaaS para otros proyectos de patrimonio/arquitectura compleja.

**Pivote de Producto:**
- **Multi-tenancy:** 1 instancia gestiona N proyectos independientes
- **API Pública:** Integraciones con BIM 360, Procore, ERPs de construcción
- **Workflow Customizable:** Cada proyecto define estados y flujos propios
- **Modelo de Pricing:** €500/mes por proyecto + €0.10 por pieza gestionada

**Clientes Potenciales:**
- Proyectos de restauración patrimonial (catedrales, palacios, monumentos)
- Grandes obras de arquitectura paramétrica (estadios, aeropuertos, museos)
- Estudios de arquitectura con fabricación digital intensiva (fachadas complejas, elementos prefabricados)

**Proyección de Ingresos (Año 2):**
- 10 clientes × €500/mes × 12 = €60,000/año (suscripciones)
- 500,000 piezas × €0.10 = €50,000/año (uso)
- **Total:** €110,000 ARR (Annual Recurring Revenue)

---

### Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Resistencia al cambio de usuarios** | Alta | Medio | Onboarding intensivo, demostración de ahorro de tiempo inmediato, training personalizado por rol |
| **Escalabilidad de procesamiento** | Media | Alto | Arquitectura async desde día 1 (Celery workers), tests de carga con 50,000 piezas antes de producción |
| **Precisión de clasificación IA <80%** | Media | Medio | Modo "human-in-the-loop" por defecto, fine-tuning progresivo con feedback de usuarios |
| **Costes de APIs LLM superiores** | Baja | Bajo | Monitoreo de costes en tiempo real, fallback a regex si GPT-4 excede presupuesto mensual |
| **Dependencia de proveedor cloud** | Baja | Alto | Arquitectura portable (Docker), datos en PostgreSQL estándar (no vendor lock-in), backup diario |
| **Requerimientos de seguridad on-premise** | Media | Alto | Plan B: Deploy en servidores propios de Sagrada Familia, mantener arquitectura cloud-agnostic |

---

## 📚 Referencias

**Standards:**
- ISO 19650: Organization and digitization of information about buildings (BIM)
- Uniclass 2015: Classification system for the construction industry

**Inspiración:**
- Speckle: Plataforma de interoperabilidad AEC (referencia para sincronización de datos)
- BIM 360: Autodesk cloud platform (referencia para workflows colaborativos)
- Rhino.Compute: Procesamiento cloud de geometría (modelo de arquitectura asíncrona)

---

