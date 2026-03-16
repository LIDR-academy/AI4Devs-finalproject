# 🎨 FASE 2: DISEÑO

## 🎯 Propósito
Documentar CÓMO vamos a construirlo.

## 📂 Estructura de esta Fase

### `01-arquitectura/`
- **01-Arquitectura-C4.md** - Visión de arquitectura a 4 niveles
  - Contexto del sistema
  - Contenedores (Frontend, Backend, BD, etc.)
  - Componentes principales
  - Código/Clases

### `02-diagramas/`
- **01-Entidades-Modelo-Datos.md** - Descripción de todas las entidades
- **02-Data-Model-Diagram.md** - Diagrama ER visual de la BD
- **03-Componentes-Backend.md** - Arquitectura de NestJS + módulos
- **04-Componentes-Frontend.md** - Estructura de Angular + componentes
- **05-Secuencia.md** - Diagramas de flujo de procesos principales
- **06-Despliegue.md** - Infraestructura, Docker, Kubernetes, CI/CD
- **07-Paquetes-Modulos.md** - Organización de código y dependencias
- **08-Seguridad.md** - Arquitectura de seguridad enterprise

---

## ✅ Orden de Lectura

1. **PRIMERO:** 01-Arquitectura-C4.md (30 min)
   - Visión general de la arquitectura
   
2. **SEGUNDO:** 01-Entidades-Modelo-Datos.md (40 min)
   - Entender el modelo de datos
   
3. **TERCERO:** 02-Data-Model-Diagram.md (15 min)
   - Ver diagrama ER visual
   
4. **CUARTO:** 03-Componentes-Backend.md (25 min)
   - Arquitectura del backend (si eres dev backend)
   
5. **QUINTO:** 04-Componentes-Frontend.md (25 min)
   - Arquitectura del frontend (si eres dev frontend)
   
6. **SEXTO:** 05-Secuencia.md (20 min)
   - Flujos de procesos principales
   
7. **SÉPTIMO:** 06-Despliegue.md (25 min)
   - Infraestructura (si eres DevOps)
   
8. **OCTAVO:** 07-Paquetes-Modulos.md (20 min)
   - Organización del código
   
9. **NOVENO:** 08-Seguridad.md (30 min)
   - Seguridad enterprise (revisar siempre)

**Tiempo total:** ~3 horas

---

## 🎯 Preguntas que debes poder responder después

- [ ] ¿Cuáles son los 4 contenedores principales del sistema?
- [ ] ¿Cuántas entidades principales tiene el modelo de datos?
- [ ] ¿Cómo se segregan los datos en multi-tenancy?
- [ ] ¿Cuántos módulos NestJS tiene el backend?
- [ ] ¿Cuál es la estructura de rutas de Angular?
- [ ] ¿Cómo se despliega el sistema (Docker/K8s)?
- [ ] ¿Cuáles son los 3 pilares de seguridad?

---

## 👥 ROLES Y PRIORIDAD DE LECTURA

**Arquitecto:** Lee TODO (3 horas)  
**Dev Backend:** 1→2→3→6→7→9 (2 horas)  
**Dev Frontend:** 1→2→3→4→5→8→9 (2 horas)  
**DevOps:** 1→2→6→8 (1.5 horas)  
**QA:** 1→5→9 (1.5 horas)  

---

## 🔗 Siguiente Fase
Una vez completes DISEÑO → Ir a **3. DESARROLLO** para implementar los tickets.

### Documentación específica de microservicios
- MS-CORE (Gateway Central):
  - Diseño: [3. desarrollo/backend/ms-core/.prompts/05-diseno.md](3.%20desarrollo/backend/ms-core/.prompts/05-diseno.md)
  - Modelo de datos: [3. desarrollo/backend/ms-core/.prompts/06-modelo-datos.md](3.%20desarrollo/backend/ms-core/.prompts/06-modelo-datos.md)
  - Especificación de prompts: [3. desarrollo/backend/ms-core/.prompts/02-prompt-library.md](3.%20desarrollo/backend/ms-core/.prompts/02-prompt-library.md)
  - Estado y plan futuro: [3. desarrollo/backend/ms-core/.prompts/07-estado-desarrollo.md](3.%20desarrollo/backend/ms-core/.prompts/07-estado-desarrollo.md) y [3. desarrollo/backend/ms-core/.prompts/08-plan-futuro.md](3.%20desarrollo/backend/ms-core/.prompts/08-plan-futuro.md)
   - Diseño: [3. desarrollo/backend/ms-perso/.prompts/05-diseno.md](3.%20desarrollo/backend/ms-perso/.prompts/05-diseno.md)
   - Modelo de datos: [3. desarrollo/backend/ms-perso/.prompts/06-modelo-datos.md](3.%20desarrollo/backend/ms-perso/.prompts/06-modelo-datos.md)
   - Especificación de prompts: [3. desarrollo/backend/ms-perso/.prompts/02-prompt-library.md](3.%20desarrollo/backend/ms-perso/.prompts/02-prompt-library.md)
   - Estado y plan futuro: [3. desarrollo/backend/ms-perso/.prompts/07-estado-desarrollo.md](3.%20desarrollo/backend/ms-perso/.prompts/07-estado-desarrollo.md) y [3. desarrollo/backend/ms-perso/.prompts/08-plan-futuro.md](3.%20desarrollo/backend/ms-perso/.prompts/08-plan-futuro.md)
- MS-AUTH (Autenticación):
   - Diseño: [3. desarrollo/backend/ms-auth/.prompts/05-diseno.md](3.%20desarrollo/backend/ms-auth/.prompts/05-diseno.md)
   - Modelo de datos: [3. desarrollo/backend/ms-auth/.prompts/06-modelo-datos.md](3.%20desarrollo/backend/ms-auth/.prompts/06-modelo-datos.md)
   - Especificación de prompts: [3. desarrollo/backend/ms-auth/.prompts/02-prompt-library.md](3.%20desarrollo/backend/ms-auth/.prompts/02-prompt-library.md)
   - Estado y plan futuro: [3. desarrollo/backend/ms-auth/.prompts/07-estado-desarrollo.md](3.%20desarrollo/backend/ms-auth/.prompts/07-estado-desarrollo.md) y [3. desarrollo/backend/ms-auth/.prompts/08-plan-futuro.md](3.%20desarrollo/backend/ms-auth/.prompts/08-plan-futuro.md)
- MS-CONFI (Configuración/Catálogos):
  - Diseño: [3. desarrollo/backend/ms-confi/.prompts/05-diseno.md](3.%20desarrollo/backend/ms-confi/.prompts/05-diseno.md)
  - Modelo de datos: [3. desarrollo/backend/ms-confi/.prompts/06-modelo-datos.md](3.%20desarrollo/backend/ms-confi/.prompts/06-modelo-datos.md)
  - Especificación de prompts: [3. desarrollo/backend/ms-confi/.prompts/02-prompt-library.md](3.%20desarrollo/backend/ms-confi/.prompts/02-prompt-library.md)
  - Estado y plan futuro: [3. desarrollo/backend/ms-confi/.prompts/07-estado-desarrollo.md](3.%20desarrollo/backend/ms-confi/.prompts/07-estado-desarrollo.md) y [3. desarrollo/backend/ms-confi/.prompts/08-plan-futuro.md](3.%20desarrollo/backend/ms-confi/.prompts/08-plan-futuro.md)
