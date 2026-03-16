# Product Requirements Document (PRD)
## Gamy - Plataforma de Descubrimiento y Gestión de Juegos de Mesa

---

### **Document Information**
- **Version:** 1.0
- **Date:** Agosto 2025
- **Product Owner:** [Nombre]
- **Project Type:** Proyecto Académico - Maestría en IA
- **Target Launch:** Q1 2026

---

## **1. Executive Summary**

**Gamy** es una plataforma web que permite a los entusiastas de juegos de mesa descubrir, aprender y gestionar su colección personal de juegos. El proyecto combina una base de datos curada de juegos con funcionalidades de gestión personal, ofreciendo contenido diferenciado según el nivel de registro del usuario.

### **1.1 Propuesta de Valor**
- **Para usuarios no registrados:** Acceso básico al catálogo de juegos y reglas simplificadas
- **Para usuarios registrados:** Gestión completa de biblioteca personal, lista de deseos y acceso a contenido premium
- **Para administradores:** Herramientas de curación de contenido y gestión de solicitudes

### **1.2 Diferenciadores Clave**
1. **Biblioteca Personal:** Gestión integral de colección y lista de deseos
2. **Contenido Curado:** Base de datos administrada profesionalmente
3. **Escalabilidad de Contenido:** Sistema de solicitudes para expansión del catálogo
4. **Experiencia Diferenciada:** Contenido premium para usuarios registrados

---

## **2. Market Context**

### **2.1 Target Market**
- **Ubicación:** Francia (lanzamiento inicial)
- **Idiomas:** Francés e Inglés
- **Audiencia Primaria:** Entusiastas de juegos de mesa residentes en París y alrededores

### **2.2 Competitive Analysis**
**Competidores Principales:**
- BoardGameGeek (BGG)
- Tabletopia
- Board Game Arena

**Ventaja Competitiva:**
- Enfoque en gestión personal vs. catálogo global masivo
- Contenido curado vs. contenido generado por usuarios
- Experiencia simplificada vs. complejidad de plataformas existentes

---

## **3. Product Vision & Objectives**

### **3.1 Vision Statement**
*"Ser la plataforma de referencia para que los amantes de juegos de mesa en Francia gestionen su pasión, descubran nuevos juegos y accedan a reglas claras y organizadas."*

### **3.2 Mission Statement**
*"Simplificar la gestión y descubrimiento de juegos de mesa mediante una plataforma intuitiva que conecta a jugadores con contenido curado y herramientas de organización personal."*

### **3.3 Business Objectives (6 meses)**
- **Adopción:** 50 usuarios activos mensuales
- **Engagement:** 30% tasa de retención semanal
- **Satisfacción:** NPS de 80
- **Contenido:** Base de 500+ juegos catalogados
- **Validación:** Feedback positivo de casas de juego locales

### **3.4 Long-term Objectives (12+ meses)**
- Modelo de patrocinio con casas de juego parisinas
- Expansión a otras ciudades francesas
- Sistema de monetización validado

---

## **4. User Personas & User Stories**

### **4.1 Primary Personas**

#### **Persona 1: "Marie - La Découvreuse"**
- **Perfil:** 28 años, profesional, nueva en juegos de mesa
- **Objetivos:** Encontrar juegos adecuados para principiantes, entender reglas fácilmente
- **Pain Points:** Intimidada por la complejidad, no sabe por dónde empezar

#### **Persona 2: "Jean - Le Collectionneur"**
- **Perfil:** 35 años, jugador experimentado con 50+ juegos
- **Objetivos:** Gestionar su colección, track de lista de deseos, encontrar joyas ocultas
- **Pain Points:** Falta de organización, olvida qué juegos posee

#### **Persona 3: "Sophie - L'Organisatrice"**
- **Perfil:** 42 años, organiza noches de juegos regularmente
- **Objetivos:** Encontrar juegos para diferentes grupos, acceso rápido a reglas
- **Pain Points:** Necesita recordar reglas rápidamente, adaptar juegos al grupo

### **4.2 User Stories (MVP)**

#### **Epic 1: Descubrimiento de Juegos**
- **US-001:** Como visitante no registrado, quiero buscar juegos por categoría para encontrar opciones que me interesen
- **US-002:** Como visitante, quiero ver información básica de un juego (nombre, jugadores, tiempo, edad) para evaluar si es adecuado
- **US-003:** Como visitante, quiero acceder a reglas básicas para decidir si quiero aprender el juego

#### **Epic 2: Gestión de Usuario**
- **US-004:** Como nuevo usuario, quiero registrarme con email/contraseña para acceder a funcionalidades premium
- **US-005:** Como usuario registrado, quiero iniciar sesión para acceder a mi perfil personal
- **US-006:** Como usuario registrado, quiero editar mi perfil para personalizar mi experiencia

#### **Epic 3: Biblioteca Personal**
- **US-007:** Como usuario registrado, quiero agregar juegos a mi biblioteca para hacer seguimiento de mi colección
- **US-008:** Como usuario registrado, quiero crear una lista de deseos para planificar futuras compras
- **US-009:** Como usuario registrado, quiero ver mi biblioteca organizada para encontrar rápidamente mis juegos

#### **Epic 4: Contenido Premium**
- **US-010:** Como usuario registrado, quiero acceder a reglas detalladas para comprender completamente los juegos
- **US-011:** Como usuario registrado, quiero ver descripciones extendidas para tomar mejores decisiones

#### **Epic 5: Expansión de Catálogo**
- **US-012:** Como usuario, quiero solicitar la adición de un juego no encontrado para expandir el catálogo
- **US-013:** Como administrador, quiero revisar solicitudes de juegos para mantener la calidad del catálogo
- **US-014:** Como administrador, quiero agregar nuevos juegos al catálogo para satisfacer las necesidades de los usuarios

---

## **5. MVP Scope & Features**

### **5.1 Core Features (Must Have)**

#### **5.1.1 Gestión de Catálogo de Juegos**
- Base de datos inicial con 500 juegos
- Campos obligatorios: nombre, descripción básica, número de jugadores, tiempo de juego, edad recomendada, categoría
- Sistema de búsqueda y filtrado básico
- Páginas individuales por juego

#### **5.1.2 Sistema de Usuarios**
- Registro con email/contraseña
- Login/logout
- Perfil básico de usuario
- Diferenciación de contenido por tipo de usuario

#### **5.1.3 Biblioteca Personal**
- Lista "Mis Juegos" (biblioteca)
- Lista "Deseados" (wishlist)
- Funcionalidad agregar/remover juegos

#### **5.1.4 Sistema de Contenido Diferenciado**
- **Visitantes:** Información básica, reglas resumidas
- **Usuarios Registrados:** Información completa, reglas detalladas, descripciones extendidas

#### **5.1.5 Sistema de Solicitudes**
- Formulario para solicitar juegos no encontrados
- Dashboard administrativo para gestionar solicitudes
- Campos requeridos: nombre del juego, editorial, categoría, justificación

### **5.2 Features Excluded from MVP**
- Integración con APIs externas (BGG, etc.)
- Sistema de reseñas y ratings
- Funcionalidades sociales (seguir usuarios, etc.)
- Reconocimiento de imágenes de juegos
- Chatbot o asistente IA
- Cualquier funcionalidad de monetización
- Notificaciones push
- Sistema de eventos o partidas

---

## **6. Technical Requirements**

### **6.1 Technology Stack**
- **Backend:** Django (Python) - aprovechando experiencia del equipo
- **Database:** PostgreSQL - para robustez y escalabilidad
- **Frontend:** Django Templates + HTMX (desarrollo rápido) o React (si se requiere mayor interactividad)
- **Hosting:** Heroku o DigitalOcean (fácil deployment)
- **Version Control:** Git + GitHub

### **6.2 System Architecture**
```
[Frontend] ↔ [Django Backend] ↔ [PostgreSQL Database]
     ↓              ↓                    ↓
[Static Files] [Admin Panel]    [Data Migration Tools]
```

### **6.3 Database Schema (Core Tables)**
```
Users
- id, email, password, first_name, last_name, date_joined, is_active

Games
- id, name, description_basic, description_detailed, min_players, max_players
- play_time, min_age, category, rules_basic, rules_detailed, image_url, created_at

UserGameLibrary
- id, user_id, game_id, date_added, status (owned/wishlist)

GameRequests
- id, user_id, game_name, publisher, category, description, status, created_at
```

### **6.4 Performance Requirements**
- Tiempo de carga < 3 segundos
- Soporte para 100 usuarios concurrentes
- 99% uptime

### **6.5 Security Requirements**
- Autenticación segura (Django Auth)
- Validación de datos de entrada
- Protección CSRF
- Encriptación de contraseñas
- Cumplimiento RGPD básico

---

## **7. User Experience (UX) Design**

### **7.1 Design Principles**
- **Mobile First:** Diseño responsive prioritizando móviles
- **Simplicidad:** Navegación intuitiva con máximo 3 clics para cualquier función
- **Claridad:** Tipografía legible, contraste adecuado
- **Consistencia:** Patrones de diseño uniformes

### **7.2 Key User Flows**

#### **Flow 1: Descubrimiento de Juego (Usuario No Registrado)**
```
Home Page → Búsqueda/Filtros → Resultados → Página de Juego → Reglas Básicas
     ↓
[Call-to-Action: Registrarse para más contenido]
```

#### **Flow 2: Gestión de Biblioteca (Usuario Registrado)**
```
Login → Mi Biblioteca → [Ver Juegos Propios | Ver Lista Deseos] 
  ↓
Página de Juego → [Agregar a Biblioteca | Agregar a Deseos | Remover]
```

#### **Flow 3: Solicitud de Juego**
```
Búsqueda → "No encontrado" → Formulario de Solicitud → Confirmación
```

### **7.3 Key Pages/Views**
1. **Homepage:** Búsqueda, juegos destacados, CTA registro
2. **Game Catalog:** Lista con filtros, paginación
3. **Game Detail:** Info completa, reglas, acciones de biblioteca
4. **User Dashboard:** Biblioteca, wishlist, perfil
5. **Game Request Form:** Formulario estructurado
6. **Admin Panel:** Gestión de juegos y solicitudes

---

## **8. Content Strategy**

### **8.1 Initial Content**
- **500 juegos populares** curados manualmente
- Fuentes: rankings BGG, juegos vendidos en tiendas francesas, recomendaciones de comunidades

### **8.2 Content Creation Process**
1. **Research:** Identificación de juegos relevantes
2. **Data Entry:** Información básica y avanzada
3. **Rules Curation:** Creación de versiones básicas y detalladas usando:
   - Videos de YouTube (resúmenes propios)
   - Manuales oficiales
   - Recursos de casas creadoras
4. **Quality Assurance:** Revisión antes de publicación

### **8.3 Content Expansion**
- **User Requests:** Sistema de solicitudes implementado
- **Admin Workflow:** Dashboard para gestionar solicitudes pendientes
- **Prioritization:** Basada en popularidad y número de solicitudes

---

## **9. Success Metrics & KPIs**

### **9.1 MVP Success Metrics (6 months)**

#### **Adoption Metrics**
- Monthly Active Users (MAU): 50
- Registro de usuarios: 75 total
- Tasa de conversión visitante → usuario: 15%

#### **Engagement Metrics**
- Session duration: 8+ minutos promedio
- Pages per session: 5+
- Weekly retention rate: 30%
- Bounce rate: <60%

#### **Content Metrics**
- Games per user library: 5+ promedio
- Wishlist items per user: 3+ promedio
- Game requests submitted: 20+ total
- Game detail page views: 80% del tráfico

#### **Quality Metrics**
- Net Promoter Score (NPS): 80+
- User satisfaction surveys: 4.5/5 promedio
- Technical uptime: 99%+

### **9.2 Business Validation Metrics**
- Feedback sessions con casas de juego: 5+ completed
- User interview insights: Quarterly
- Feature usage analytics: Monthly review

---

## **10. Implementation Roadmap**

### **10.1 Development Phases**

#### **Phase 1: Foundation (Semanas 1-4)**
- Configuración inicial del proyecto Django
- Modelos de base de datos
- Sistema de autenticación básico
- Admin panel básico
- Deployment pipeline

**Deliverables:**
- Proyecto Django funcional
- Base de datos configurada
- Usuario admin operativo

#### **Phase 2: Core Features (Semanas 5-8)**
- Catálogo de juegos (models + views)
- Sistema de búsqueda y filtros
- Páginas de detalle de juegos
- Carga inicial de datos (100 juegos)
- Frontend básico responsive

**Deliverables:**
- Catálogo navegable
- 100 juegos cargados con información completa
- Búsqueda funcional

#### **Phase 3: User Features (Semanas 9-12)**
- Sistema completo de registro/login
- Biblioteca personal y wishlist
- Diferenciación de contenido por usuario
- Sistema de solicitudes de juegos
- Dashboard de usuario

**Deliverables:**
- Funcionalidades de usuario completas
- Gestión de biblioteca operativa
- Sistema de solicitudes implementado

#### **Phase 4: Content & Polish (Semanas 13-16)**
- Carga completa de 500 juegos
- Optimización de performance
- Testing integral
- Mejoras de UX basadas en feedback
- Documentation completa

**Deliverables:**
- Base de datos completa (500 juegos)
- Aplicación optimizada y testeada
- Ready for launch

### **10.2 Resource Allocation**
- **Developer:** 80% IA-assisted development, 20% manual coding/review
- **Product Owner:** Strategy, content curation, user testing
- **Timeline:** 16 semanas para MVP completo

---

## **11. Risk Assessment & Mitigation**

### **11.1 Technical Risks**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Performance issues with large dataset | Medium | High | Database optimization, caching, pagination |
| Django learning curve for team | Low | Medium | Team ya tiene experiencia Django |
| Data migration complexity | Medium | Medium | Incremental data loading, robust testing |

### **11.2 Business Risks**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low user adoption | Medium | High | Organic marketing en comunidades, feedback temprano |
| Content creation overhead | High | Medium | Start con 500 juegos, priorizar solicitudes populares |
| Copyright issues con reglas | Low | High | Crear contenido original, referencias apropiadas |

### **11.3 Market Risks**

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Competencia fuerte de BGG | Low | Medium | Enfoque en nicho francés, diferenciación clara |
| Falta interés casas de juego | Medium | Low | Validación temprana, pivoting si necesario |

---

## **12. Success Criteria & Go/No-Go Decision Points**

### **12.1 MVP Launch Criteria**
**Go-Live Requirements:**
- ✅ 500 juegos catalogados con información completa
- ✅ Todas las user stories implementadas y testeadas
- ✅ Performance < 3 segundos load time
- ✅ Mobile responsive funcionando correctamente
- ✅ 0 bugs críticos, < 5 bugs menores
- ✅ Admin panel operativo para gestión de contenido

### **12.2 3-Month Success Criteria**
**Continue/Pivot Decision:**
- 25+ usuarios registrados
- 15+ usuarios con bibliotecas activas (5+ juegos)
- 5+ solicitudes de juegos nuevos
- NPS > 60
- 2+ casas de juego expresan interés

### **12.3 6-Month Success Criteria**
**Scale/Monetize Decision:**
- 50+ MAU achieved
- 30% weekly retention rate
- NPS > 80
- Clear monetization path identified
- Positive feedback from casa de juego partners

---

## **13. Post-MVP Roadmap**

### **13.1 Phase 2 Features (Months 7-12)**
- Sistema básico de reseñas
- Integración con APIs externas (BGG)
- Funcionalidades sociales básicas
- Sistema de notificaciones
- Mobile app considerations

### **13.2 Monetization Implementation**
- Modelo freemium con contenido premium
- Sistema de patrocinios con casas de juego
- Analytics para sponsors
- Programa de referidos

### **13.3 Scale Considerations**
- Expansión a otras ciudades francesas
- Soporte multiidioma mejorado
- API pública para terceros
- Integración con tiendas online

---

## **14. Appendices**

### **14.1 Competitive Analysis Detail**
[Análisis detallado de BoardGameGeek, Tabletopia, y otros competidores]

### **14.2 Technical Architecture Diagrams**
[Diagramas detallados de arquitectura del sistema]

### **14.3 User Research Data**
[Insights de entrevistas con usuarios potenciales]

### **14.4 Legal Considerations**
- Compliance con RGPD
- Copyright considerations para contenido de juegos
- Terms of Service y Privacy Policy requirements

---

**Document End**

*Este PRD será revisado y actualizado mensualmente basado en learnings del desarrollo y feedback de usuarios.*