# 📋 Plan de Implementación - SportsPlex

## 📅 Timeline Estimado: 30 Horas

### Distribución por Entrega

```text
Entrega 1 (22 Julio) - DOCUMENTACIÓN - 3 horas ✅
├── README.md completo
├── Prompts.md
├── Diagrama ER
├── Historias de usuario
└── Tickets de trabajo

Entrega 2 (9 Septiembre) - MVP FUNCIONAL - 15 horas
├── Modelos y BD (SQLite) - 2h
├── Autenticación (Login/Registro) - 2h
├── Búsqueda de pistas - 2h
├── Crear reserva - 2h
├── Ver mis reservas - 2h
├── Admin: Aprobar reservas - 2h
├── Tests unitarios e integración - 2h
└── Pull Request feature-entrega2-MPP

Entrega 3 (29 Septiembre) - FINAL COMPLETA - 12 horas
├── Admin: CRUD pistas - 2h
├── Admin: Horarios - 2h
├── Admin: Reportes - 2h
├── Cancelación de reservas - 1h
├── Email (confirmación) - 1h
├── Exportar CSV/PDF - 1h
├── Tests E2E - 1h
├── Despliegue AWS - 1h
└── Pull Request finalproject-MPP

TOTAL: 3 + 15 + 12 = 30 horas ✓
```

---

## 🎯 Entrega 1: Documentación (Completada el 27 de Julio de 2026) ✅

### Artefactos Completados
- [x] README.md (ficha, objetivo, características, arquitectura, BD, historias, API)
- [x] prompts.md (20 prompts clave documentados)
- [x] Diagrama ER (ASCII en README)
- [x] Historias de usuario (HU-001 a HU-009)
- [x] Tickets de trabajo (TASK-001 a TASK-036)

### ✅ Próximos Pasos de Entrega 1

#### 1️⃣ Crear Fork del Repositorio
```bash
# Ve a GitHub
https://github.com/LIDR-academy/AI4Devs-finalproject

# Haz fork (botón arriba a la derecha)
# Se creará: https://github.com/TU_USUARIO/AI4Devs-finalproject
```

#### 2️⃣ Clonar el Fork
```bash
git clone https://github.com/TU_USUARIO/AI4Devs-finalproject.git
cd AI4Devs-finalproject
```

#### 3️⃣ Crear Rama de Feature
```bash
git checkout -b feature-entrega1-MPP
```

#### 4️⃣ Copiar Archivos de Documentación
Copia estos archivos a la raíz del repositorio:
- `Primera Entrega/README.md` → `/README.md`
- `Primera Entrega/prompts.md` → `/prompts.md`
- `Primera Entrega/PLAN_IMPLEMENTACION.md` → `/PLAN_IMPLEMENTACION.md`

#### 5️⃣ Hacer Commit
```bash
git add README.md prompts.md PLAN_IMPLEMENTACION.md
git commit -m "docs: Documentación técnica Entrega 1 - SportsPlex" -m "Artefactos entregados:
- README.md: Ficha, objetivo, características, arquitectura, BD, API, historias, tickets
- prompts.md: 20 prompts clave documentados
- PLAN_IMPLEMENTACION.md: Timeline y plan detallado de 3 entregas

Stack: .NET + Razor + SQLite + AWS
Funcionalidades: Búsqueda, reservas, aprobación admin, reportes, email"
```

#### 6️⃣ Hacer Push
```bash
git push -u origin feature-entrega1-MPP
```

#### 7️⃣ Crear Pull Request
- Ve a tu fork en GitHub
- Verás botón "Compare & pull request"
- **Título:** `[ENTREGA 1] Documentación técnica - SportsPlex`
- **Descripción:**

```markdown
## Entrega 1: Documentación Técnica

### Resumen
Esta PR contiene la documentación completa del proyecto SportsPlex (sistema de reserva de pistas deportivas).

### Cambios
- **README.md**: Ficha del proyecto, objetivo, características, arquitectura, modelo de datos, API, historias de usuario, tickets
- **prompts.md**: 20 prompts clave documentados para la implementación
- **docs/ARCHITECTURE.md**: Diagrama ER y patrones arquitectónicos
- **docs/USER_STORIES.md**: 9 historias de usuario con criterios de aceptación

### Características Documentadas
✅ Stack: .NET + Razor + SQLite + AWS
✅ Autenticación simple (sin Identity)
✅ Búsqueda de pistas con cálculo de disponibilidad
✅ Sistema de reservas con aprobación de admin
✅ Cancelación de reservas
✅ Reportes y exportación CSV/PDF
✅ Panel administrativo (CRUD pistas, horarios, aprobaciones)
✅ Notificaciones por email

### Próximas Entregas
- **Entrega 2 (9 sept)**: MVP funcional (backend + frontend + BD conectados)
- **Entrega 3 (29 sept)**: Completar funcionalidades, tests, despliegue AWS

### Estados
- [x] Documentación técnica completada
- [x] Modelo de datos validado
- [x] Prompts para implementación listos
- [ ] Código implementado (Entrega 2)
```

#### 8️⃣ Rellenar Formulario Typeform
👉 https://lidr.typeform.com/proyectoai4devs

Campos a completar:
- **Nombre del proyecto**: SportsPlex
- **Descripción breve**: Sistema de reserva de pistas deportivas con aprobación de admin
- **Stack**: .NET + Razor + SQLite + AWS
- **Enlace PR Entrega 1**: (URL del PR que creaste)
- **Enlace repositorio**: https://github.com/TU_USUARIO/AI4Devs-finalproject

---

## 🛠️ Entrega 2: MVP Funcional (9 Septiembre)

### Objetivos
- Backend .NET con modelos y BD SQLite
- Autenticación simple
- Búsqueda de pistas
- Crear y ver reservas
- Admin aprueba/rechaza
- Tests básicos

### Plan Detallado

#### Semana 1 (29 Julio - 4 Agosto)
**Horas estimadas: 5h**

```
Día 1 (1-2h): Proyecto base
- Crear solución .NET
- Estructura carpetas (Models, Services, Controllers, Views, Data)
- NuGet packages (EF Core, SQLite, BCrypt)

Día 2 (2-3h): Modelos y BD
- Crear models: Usuario, Deporte, Ciudad, Pista, Horario, Reserva
- DbContext
- Migraciones
- Seed datos iniciales
```

#### Semana 2 (5-11 Agosto)
**Horas estimadas: 5h**

```
Día 3 (2h): Autenticación
- AuthController (Register, Login, Logout)
- AuthService
- Vistas Razor
- Middleware custom

Día 4 (3h): Búsqueda
- SearchService (disponibilidad, overlaps)
- PistasController GET /Search
- Vista búsqueda
```

#### Semana 3 (12-18 Agosto)
**Horas estimadas: 5h**

```
Día 5 (2h): Crear Reserva
- ReservasController POST /Solicitar
- Validaciones
- Vista formulario

Día 6 (2h): Ver Reservas
- GET /Reservas/Mis
- Vista tabla

Día 7 (1h): Admin Aprobación
- GET /Admin/Reservas
- POST /Admin/Aprobar
- Vista admin
```

#### Semana 4 (19-25 Agosto)
**Horas estimadas: 3h**

```
Día 8 (2h): Tests
- Unitarios (AuthService, SearchService)
- Integración (Disponibilidad)

Día 9 (1h): PR y review
- Hacer commit
- Push a origin
- Crear PR feature-entrega2-MPP
```

### Checklist Entrega 2

- [ ] Proyecto .NET compilable
- [ ] BD SQLite con seed data
- [ ] Registro y login funcional
- [ ] Búsqueda de pistas con disponibilidad
- [ ] Crear reserva (estado Pendiente)
- [ ] Ver mis reservas
- [ ] Admin ve reservas pendientes
- [ ] Admin aprueba/rechaza
- [ ] Tests unitarios (mínimo 5)
- [ ] Tests integración (mínimo 3)
- [ ] Vistas Razor responsive
- [ ] PR feature-entrega2-MPP creado

---

## 🎨 Entrega 3: Final Completa (29 Septiembre)

### Objetivos
- Todas las funcionalidades
- Admin: CRUD pistas, horarios, reportes
- Cancelación de reservas
- Email
- Exportación CSV/PDF
- Tests E2E
- Despliegue AWS

### Plan Detallado

#### Semana 1-2 (1-14 Septiembre)
**Horas estimadas: 5h**

```
Admin Panel:
- CRUD Pistas (Create, Read, Update, Deactivate)
- Gestión Horarios (por día de semana)
- Reportes: Top pistas, ingresos, estadísticas
```

#### Semana 3 (15-21 Septiembre)
**Horas estimadas: 4h**

```
Funcionalidades Usuario:
- Cancelación de reserva
- Email (confirmación, aprobación, rechazo)
- Exportar CSV/PDF
```

#### Semana 4 (22-29 Septiembre)
**Horas estimadas: 3h**

```
Testing y Despliegue:
- Tests E2E (Selenium)
- Despliegue AWS EC2
- Documentación final
- PR finalproject-MPP
```

### Checklist Entrega 3

- [ ] CRUD Pistas completo
- [ ] Gestión Horarios
- [ ] Cancelación de reservas
- [ ] Email funcional
- [ ] Exportar CSV/PDF
- [ ] Reportes admin (gráficos opcionales)
- [ ] Tests unitarios (10+)
- [ ] Tests integración (5+)
- [ ] Tests E2E (2+)
- [ ] CI/CD GitHub Actions
- [ ] Despliegue AWS EC2
- [ ] URL pública accesible
- [ ] Documentación final en README
- [ ] PR finalproject-MPP creado
- [ ] Video 2-3 min demostrando flujo (opcional)

---

## 📊 Matriz de Esfuerzo

| Funcionalidad | Horas | Entrega | Complejidad |
|---------------|-------|---------|-------------|
| Autenticación | 2 | 2 | Media |
| Búsqueda + Disponibilidad | 3 | 2 | Alta |
| Crear Reserva | 2 | 2 | Media |
| Ver Reservas | 1.5 | 2 | Baja |
| Admin Aprobación | 2 | 2 | Media |
| CRUD Pistas | 2 | 3 | Media |
| Horarios | 2 | 3 | Media |
| Cancelación | 1 | 3 | Baja |
| Email | 1.5 | 3 | Baja |
| CSV/PDF | 1.5 | 3 | Baja |
| Reportes | 2 | 3 | Alta |
| Tests | 4 | 2-3 | Media |
| CI/CD | 1 | 3 | Media |
| Despliegue AWS | 2 | 3 | Alta |
| Documentación | 2 | 1-3 | Baja |
| **Total** | **31** | - | - |

---

## 🎓 Aprendizajes Clave

### Por Entrega

**Entrega 1 (Documentación):**
- Usar IA para estructurar y documentar
- Validar contexto del usuario
- Definir claramente requisitos

**Entrega 2 (MVP):**
- Implementación paso a paso
- Tests desde el principio
- Validaciones en ambos lados (cliente + servidor)

**Entrega 3 (Final):**
- Despliegue real
- Integración de servicios
- Performance y optimización

---

## ❓ Preguntas Frecuentes

### ¿Puedo cambiar el stack?
Sí, pero es recomendable mantener .NET + Razor por consistencia.

### ¿Qué pasa si no termino a tiempo?
Puedes solicitar prórroga (2 semanas) directamente con tu TA.

### ¿Cómo hago si el email no funciona?
Para MVP, puedes usar log en lugar de email real. Luego integrar SMTP.

### ¿Debo hacer despliegue en Entrega 2?
No, es para Entrega 3. Pero puedes tener todo listo localmente.

### ¿SQLite es suficiente para production?
Para MVP sí. Si escala, migrar a SQL Server o PostgreSQL.

---

## 📚 Recursos

- [ASP.NET Core Docs](https://docs.microsoft.com/aspnet/core/)
- [Entity Framework Core](https://docs.microsoft.com/ef/core/)
- [Razor Templates](https://docs.microsoft.com/aspnet/core/mvc/views/razor/)
- [SQLite EF Core](https://docs.microsoft.com/ef/core/providers/sqlite/)
- [AWS Deployment](https://aws.amazon.com/getting-started/)

---

**Última actualización:** 27 de Julio, 2026  
**Versión:** 1.0
