# 🎾 SportsPlex - Sistema de Reserva de Pistas Deportivas

## 📋 Ficha del Proyecto

| Aspecto | Detalle |
|--------|---------|
| **Nombre** | SportsPlex |
| **Descripción** | Plataforma web para la reserva de pistas deportivas con gestión de disponibilidad y aprobación de reservas |
| **MVP** | Sistema E2E funcional con búsqueda, reserva, aprobación y reportes |
| **Stack** | .NET (ASP.NET Core MVC) + Razor + SQLite + AWS |
| **Timeline** | 30 horas distribuidas hasta 29 de septiembre |
| **Autores** | Mauricio Perez (MPP) |

---

## 🎯 Objetivo del Producto

Proporcionar a usuarios una plataforma intuitiva para reservar pistas deportivas en diferentes ciudades, y a administradores herramientas para gestionar la disponibilidad, precios y aprobaciones de reservas.

### Usuarios Objetivo
- **Usuarios Finales**: Personas que quieren reservar pistas deportivas
- **Administradores**: Gestores de las pistas (aprobación, precios, horarios)

---

## ✨ Características Principales

### Para Usuarios
1. 🔐 Registro e inicio de sesión simple
2. 🔍 Búsqueda de pistas por deporte, ciudad y fecha
3. 📅 Visualizar disponibilidad horaria
4. ✋ Solicitar reserva (requiere aprobación)
5. ❌ Cancelar reserva
6. 📊 Ver mis reservas
7. 📈 Exportar mis reservas a CSV/PDF

### Para Administradores
1. 🏢 Gestión de pistas (crear, editar, eliminar)
2. ⚙️ Configurar horarios y precios por pista
3. ✅ Aprobar/rechazar solicitudes de reserva
4. 📋 Ver todas las reservas
5. 📊 Reportes: pistas más reservadas, ingresos totales
6. 📈 Exportar reportes a CSV/PDF
7. ❌ Cancelar reservas

---

## 🏗️ Arquitectura

### Vista General
```
┌─────────────────────────────────────────┐
│         Frontend (Razor MVC)             │
│   (HTML, CSS, JavaScript Vanilla)       │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Backend (.NET ASP.NET Core)          │
│  Controllers → Services → Repository     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│        SQLite Database (EC2)             │
│  Tables: Usuarios, Deportes, Pistas,    │
│          Ciudades, Horarios, Reservas   │
└──────────────────────────────────────────┘
```

### Patrones y Estructura
- **Patrón**: MVC (Model-View-Controller)
- **Inyección de dependencias**: Nativa de .NET
- **Capa de acceso a datos**: Entity Framework Core
- **Autenticación**: Sistema simple con sesiones ASP.NET

### Flujo Principal
```
Usuario Anónimo
    ↓
[Registro/Login]
    ↓
Usuario Autenticado
    ↓
[Buscar Pistas] → Filtrar por Deporte, Ciudad, Fecha
    ↓
[Ver Disponibilidad] → Horas disponibles (según estado del slot)
    ↓
[Solicitar Reserva] → Estado: PENDIENTE
    ↓
[Admin Revisa] → Aprueba o Rechaza
    ↓
[Usuario Recibe Email] → Confirmación o Rechazo
    ↓
[Uso Posterior] → Cancelar o Completar
```

---

## 🗄️ Modelo de Datos

### Diagrama ER (Entity-Relationship)

```
┌─────────────────────────┐
│      USUARIOS           │
├─────────────────────────┤
│ ID (PK)                 │
│ Email (UNIQUE)          │
│ Contraseña (Hashed)     │
│ Nombre                  │
│ Rol (Usuario/Admin)     │
│ FechaCreacion           │
│ Activo                  │
└─────────────┬───────────┘
              │
              │ 1:N (Reservas)
              │
┌─────────────▼───────────┐
│      RESERVAS           │
├─────────────────────────┤
│ ID (PK)                 │
│ UsuarioID (FK)          │
│ PistaID (FK)            │
│ Fecha                   │
│ HoraInicio              │
│ HoraFin                 │
│ Estado (Pendiente/....) │
│ FechaCreacion           │
│ FechaAprobacion         │
│ AdminID (FK) [Nullable] │
└───────────┬─────────────┘
            │
            │ N:1 (Pistas)
            │
    ┌───────▼─────────┐
    │     PISTAS      │
    ├─────────────────┤
    │ ID (PK)         │
    │ Nombre          │
    │ DeporteID (FK)  │
    │ CiudadID (FK)   │
    │ PrecioPorHora   │
    │ Activa          │
    └────┬────────┬───┘
         │        │
    ┌────▼──┐  ┌──▼─────────────┐
    │DEPORTES   │      CIUDADES      │
    ├──────────┤├─────────────────────┤
    │ ID (PK)  │ │ ID (PK)            │
    │ Nombre   │ │ Nombre             │
    │ Duracion │ │ Pais               │
    │ (minutos)│ │ FechaCreacion      │
    └──────────┘ └─────────────────────┘

┌─────────────────────────────┐
│       HORARIOS              │
├─────────────────────────────┤
│ ID (PK)                     │
│ PistaID (FK)                │
│ DiaSemana (0-6: Lun-Dom)    │
│ HoraInicio (8, 9, etc)      │
│ HoraFin (22, 20, etc)       │
│ Activo                      │
└─────────────────────────────┘
```

### Tablas Detalladas

#### USUARIOS
```sql
CREATE TABLE Usuarios (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Nombre NVARCHAR(255) NOT NULL,
    Rol NVARCHAR(50) NOT NULL CHECK(Rol IN ('Usuario', 'Admin')),
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    Activo BIT NOT NULL DEFAULT 1
);
```

#### DEPORTES
```sql
CREATE TABLE Deportes (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(100) NOT NULL UNIQUE,
    DuracionMinutos INT NOT NULL, -- 90 (Tenis), 120 (Fútbol), etc
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE()
);

-- Datos iniciales
INSERT INTO Deportes VALUES ('Tenis', 90, GETDATE());
INSERT INTO Deportes VALUES ('Fútbol', 120, GETDATE());
INSERT INTO Deportes VALUES ('Pádel', 60, GETDATE());
INSERT INTO Deportes VALUES ('Básquetbol', 120, GETDATE());
```

#### CIUDADES
```sql
CREATE TABLE Ciudades (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(100) NOT NULL,
    Pais NVARCHAR(100) NOT NULL,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE()
);

-- Datos iniciales
INSERT INTO Ciudades VALUES ('Madrid', 'España', GETDATE());
INSERT INTO Ciudades VALUES ('Barcelona', 'España', GETDATE());
INSERT INTO Ciudades VALUES ('Valencia', 'España', GETDATE());
INSERT INTO Ciudades VALUES ('Bilbao', 'España', GETDATE());
INSERT INTO Ciudades VALUES ('Sevilla', 'España', GETDATE());
```

#### PISTAS
```sql
CREATE TABLE Pistas (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(255) NOT NULL,
    DeporteId INT NOT NULL,
    CiudadId INT NOT NULL,
    PrecioPorHora DECIMAL(10,2) NOT NULL,
    Activa BIT NOT NULL DEFAULT 1,
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (DeporteId) REFERENCES Deportes(Id),
    FOREIGN KEY (CiudadId) REFERENCES Ciudades(Id)
);

-- Datos iniciales
INSERT INTO Pistas VALUES ('Pista Tenis Centro Madrid', 1, 1, 25.00, 1, GETDATE());
INSERT INTO Pistas VALUES ('Pista Fútbol 5 Madrid', 2, 1, 30.00, 1, GETDATE());
-- ... más pistas
```

#### HORARIOS
```sql
CREATE TABLE Horarios (
    Id INT PRIMARY KEY IDENTITY(1,1),
    PistaId INT NOT NULL,
    DiaSemana INT NOT NULL CHECK(DiaSemana BETWEEN 0 AND 6), -- 0=Lun, 6=Dom
    HoraInicio INT NOT NULL,
    HoraFin INT NOT NULL,
    Activo BIT NOT NULL DEFAULT 1,
    FOREIGN KEY (PistaId) REFERENCES Pistas(Id),
    UNIQUE(PistaId, DiaSemana)
);

-- Datos iniciales (Lun-Vie: 8-22, Sab-Dom: 9-20)
INSERT INTO Horarios VALUES (1, 0, 8, 22, 1); -- Lunes
INSERT INTO Horarios VALUES (1, 1, 8, 22, 1); -- Martes
INSERT INTO Horarios VALUES (1, 2, 8, 22, 1); -- Miércoles
INSERT INTO Horarios VALUES (1, 3, 8, 22, 1); -- Jueves
INSERT INTO Horarios VALUES (1, 4, 8, 22, 1); -- Viernes
INSERT INTO Horarios VALUES (1, 5, 9, 20, 1); -- Sábado
INSERT INTO Horarios VALUES (1, 6, 9, 20, 1); -- Domingo
```

#### RESERVAS
```sql
CREATE TABLE Reservas (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UsuarioId INT NOT NULL,
    PistaId INT NOT NULL,
    Fecha DATE NOT NULL,
    HoraInicio INT NOT NULL,
    HoraFin INT NOT NULL,
    Estado NVARCHAR(50) NOT NULL CHECK(Estado IN ('Pendiente', 'Aprobada', 'Cancelada', 'Completada')),
    FechaCreacion DATETIME NOT NULL DEFAULT GETDATE(),
    FechaAprobacion DATETIME NULL,
    AdminId INT NULL,
    Motivo NVARCHAR(500) NULL, -- Motivo de cancelación/rechazo
    FOREIGN KEY (UsuarioId) REFERENCES Usuarios(Id),
    FOREIGN KEY (PistaId) REFERENCES Pistas(Id),
    FOREIGN KEY (AdminId) REFERENCES Usuarios(Id)
);
```

---

## 🔌 API / Endpoints

### Autenticación
- `POST /Auth/Register` → Registrar nuevo usuario
- `POST /Auth/Login` → Iniciar sesión
- `GET /Auth/Logout` → Cerrar sesión

### Búsqueda y Reservas (Usuarios)
- `GET /Pistas/Search?deporte=X&ciudad=Y&fecha=Z` → Buscar pistas disponibles
- `GET /Pistas/{id}` → Detalle de pista
- `POST /Reservas/Solicitar` → Crear solicitud de reserva
- `GET /Reservas/Mis` → Ver mis reservas
- `POST /Reservas/{id}/Cancelar` → Cancelar reserva
- `GET /Reportes/MisReservas` → Informe de mis reservas
- `GET /Reportes/MisReservas/Exportar?format=csv|pdf` → Exportar

### Administración (Admins)
- `GET /Admin/Pistas` → Listar todas las pistas
- `POST /Admin/Pistas` → Crear pista
- `PUT /Admin/Pistas/{id}` → Editar pista
- `DELETE /Admin/Pistas/{id}` → Eliminar pista
- `POST /Admin/Horarios` → Configurar horario
- `GET /Admin/Reservas` → Ver todas las reservas
- `POST /Admin/Reservas/{id}/Aprobar` → Aprobar reserva
- `POST /Admin/Reservas/{id}/Rechazar` → Rechazar reserva
- `GET /Admin/Reportes/Estadisticas` → Pistas más reservadas, ingresos
- `GET /Admin/Reportes/Estadisticas/Exportar?format=csv|pdf` → Exportar

---

## 👥 Historias de Usuario

### 1. HU-001: Registro e Inicio de Sesión
**Como** usuario nuevo  
**Quiero** registrarme en la plataforma con email y contraseña  
**Para** acceder a la búsqueda y reserva de pistas

**Criterios de Aceptación:**
- [ ] Formulario de registro con email, contraseña, nombre
- [ ] Validación: email único, contraseña mínimo 6 caracteres
- [ ] Hash de contraseña (no guardar en texto plano)
- [ ] Mensaje de éxito al registrarse
- [ ] Redirigir a login
- [ ] Login con email/contraseña correcto
- [ ] Crear sesión y redirigir al dashboard
- [ ] Mensaje de error si credenciales inválidas

**Tickets asociados:**
- TASK-001: Crear modelo Usuario
- TASK-002: Implementar registro
- TASK-003: Implementar login
- TASK-004: Crear vistas Razor

---

### 2. HU-002: Búsqueda de Pistas
**Como** usuario registrado  
**Quiero** buscar pistas deportivas filtrando por deporte, ciudad y fecha  
**Para** encontrar disponibilidad según mis necesidades

**Criterios de Aceptación:**
- [ ] Página de búsqueda con filtros: Deporte (dropdown), Ciudad (dropdown), Fecha (date picker)
- [ ] Resultados muestran: Nombre pista, deporte, precio/hora, estado
- [ ] Mostrar disponibilidad horaria (horas con slots libres)
- [ ] Evitar overlaps: no mostrar horas ya reservadas
- [ ] Click en pista → ver detalle y horarios disponibles
- [ ] Interfaz responsive (móvil + desktop)
- [ ] Validar fecha >= hoy

**Tickets asociados:**
- TASK-005: Crear modelos Deporte, Ciudad, Pista
- TASK-006: Seed datos iniciales
- TASK-007: Implementar búsqueda (Service + Controller)
- TASK-008: Crear vista búsqueda
- TASK-009: Calcular disponibilidad (lógica de overlaps)

---

### 3. HU-003: Solicitar Reserva
**Como** usuario registrado  
**Quiero** solicitar una reserva de pista  
**Para** reservar un horario específico

**Criterios de Aceptación:**
- [ ] Formulario con: Pista (preseleccionada), Fecha (preseleccionada), Hora inicio (dropdown según duración)
- [ ] Validar: fecha >= hoy, hora disponible, no overlap
- [ ] Calcular hora fin según duración del deporte
- [ ] Estado inicial: PENDIENTE
- [ ] Mostrar resumen antes de confirmar (pista, fecha, hora, precio total)
- [ ] Guardar en BD con FechaCreacion = ahora
- [ ] Redirigir a "Reserva solicitada" con número de confirmación
- [ ] Enviar email al usuario: "Tu reserva está pendiente de aprobación"

**Tickets asociados:**
- TASK-010: Crear modelo Reserva
- TASK-011: Lógica validación reserva
- TASK-012: Implementar controller POST reserva
- TASK-013: Crear vista form reserva
- TASK-014: Implementar envío de email (SMTP)

---

### 4. HU-004: Informe de Reservas (Usuario)
**Como** usuario registrado  
**Quiero** ver todas mis reservas y su estado  
**Para** controlar mis reservaciones

**Criterios de Aceptación:**
- [ ] Página "Mis Reservas" con tabla: Pista, Fecha, Hora, Estado, Acciones
- [ ] Filtrar por estado: Todas, Pendiente, Aprobada, Cancelada, Completada
- [ ] Mostrar solo mi usuario (WHERE UsuarioId = currentUser)
- [ ] Botón Cancelar visible solo si Estado = Pendiente o Aprobada
- [ ] Botón "Exportar CSV" → descarga CSV
- [ ] Botón "Exportar PDF" → descarga PDF
- [ ] Paginación si > 10 registros

**Tickets asociados:**
- TASK-015: Implementar GET Reservas/Mis
- TASK-016: Crear vista tabla reservas
- TASK-017: Exportar CSV
- TASK-018: Exportar PDF

---

### 5. HU-005: Aprobar/Rechazar Reservas (Admin)
**Como** administrador  
**Quiero** revisar solicitudes de reserva y aprobar o rechazar  
**Para** controlar qué reservas se confirman

**Criterios de Aceptación:**
- [ ] Dashboard admin con tabla de Reservas Estado = PENDIENTE
- [ ] Ver detalle: usuario, pista, fecha, hora, precio
- [ ] Botón "Aprobar" → Estado = APROBADA, FechaAprobacion = ahora
- [ ] Botón "Rechazar" + motivo (modal) → Estado = CANCELADA, guardar motivo
- [ ] Enviar email a usuario: "Reserva aprobada" o "Rechazada por: {motivo}"
- [ ] Refrescar tabla automáticamente o manual
- [ ] Solo admin puede acceder

**Tickets asociados:**
- TASK-019: Crear middleware/atributo de autorización admin
- TASK-020: Implementar POST Aprobar
- TASK-021: Implementar POST Rechazar
- TASK-022: Crear vista admin dashboard

---

### 6. HU-006: Cancelación de Reservas
**Como** usuario  
**Quiero** cancelar una reserva aprobada o pendiente  
**Para** liberar el slot si cambio de planes

**Criterios de Aceptación:**
- [ ] Botón Cancelar en "Mis Reservas" si Estado IN (Pendiente, Aprobada)
- [ ] Modal de confirmación
- [ ] Campo opcional "Motivo"
- [ ] Estado → CANCELADA, FechaCancelacion = ahora
- [ ] Email: "Tu reserva fue cancelada"
- [ ] Admin también puede cancelar desde su panel con motivo obligatorio

**Tickets asociados:**
- TASK-023: POST /Reservas/{id}/Cancelar
- TASK-024: Vista modal cancelación

---

### 7. HU-007: Gestión de Pistas (Admin)
**Como** administrador  
**Quiero** crear, editar y eliminar pistas  
**Para** gestionar la oferta de servicios

**Criterios de Aceptación:**
- [ ] CRUD: Create, Read, Update, Delete
- [ ] Formulario: Nombre, Deporte (dropdown), Ciudad (dropdown), Precio/hora
- [ ] Validar campos obligatorios
- [ ] Soft delete (Activa = 0) para mantener historial
- [ ] Listar pistas con filtro: Todas, Activas, Inactivas
- [ ] Editar: solo propiedades, no afecta reservas pasadas
- [ ] Interfaz responsive

**Tickets asociados:**
- TASK-025: GET Admin/Pistas
- TASK-026: POST Admin/Pistas (Create)
- TASK-027: PUT Admin/Pistas/{id} (Update)
- TASK-028: DELETE Admin/Pistas/{id} (Soft Delete)
- TASK-029: Vistas Razor admin pistas

---

### 8. HU-008: Configuración de Horarios (Admin)
**Como** administrador  
**Quiero** establecer horarios de funcionamiento por pista y día  
**Para** definir cuándo se puede reservar cada pista

**Criterios de Aceptación:**
- [ ] Interfaz: Seleccionar pista → grilla lun-dom
- [ ] Para cada día: Hora Inicio (8-23), Hora Fin (8-23)
- [ ] Validar: Fin > Inicio
- [ ] Guardar en tabla Horarios
- [ ] Mostrar configuración actual
- [ ] Editar/actualizar horarios
- [ ] Soft delete (Activo = 0)

**Tickets asociados:**
- TASK-030: GET Admin/Horarios
- TASK-031: POST/PUT Admin/Horarios
- TASK-032: Vista Razor horarios

---

### 9. HU-009: Reportes Admin (Estadísticas)
**Como** administrador  
**Quiero** ver reportes de pistas más reservadas e ingresos  
**Para** analizar el desempeño del negocio

**Criterios de Aceptación:**
- [ ] Reportes incluyen:
  - Top 5 pistas más reservadas (por cantidad)
  - Ingresos totales (suma de precio * duración)
  - Ingresos por pista
  - Reservas por estado
- [ ] Filtro por rango de fechas (opcional)
- [ ] Gráficos: barras, pie (si es posible con Chart.js)
- [ ] Exportar a CSV/PDF
- [ ] Solo admin

**Tickets asociados:**
- TASK-033: Queries reportes
- TASK-034: GET Admin/Reportes/Estadisticas
- TASK-035: Vista reportes
- TASK-036: Exportar reportes CSV/PDF

---

## 🎯 Tickets de Trabajo - Entrega 1 (Documentación)

| ID | Título | HU | Descripción | Criterios de Aceptación | Estimación |
|----|---------|----|-------------|------------------------|----|
| TASK-001 | Crear modelos de dominio | HU-001 | Crear clases Usuario, Deporte, Ciudad, Pista, Reserva, Horario | Modelos compilables, propiedades definidas | 1h |
| TASK-002 | Crear contexto EF | Todas | Crear DbContext, configurar conexión SQLite, migrations | DbContext funcional, migrations aplicables | 1h |
| TASK-003 | Seed datos iniciales | HU-002 | Cargar deportes, ciudades, pistas, horarios, admin test | Datos en BD listos para testing | 1.5h |
| TASK-004 | Estructura de carpetas y proyecto | Todas | Folder structure: Models, Services, Controllers, Views, Data | Proyecto organizado, compilable | 0.5h |
| TASK-005 | Diseño BD y script SQL | Todas | Scripts CREATE TABLE, Foreign Keys, Índices | Schema completo, documentado | 1h |
| TASK-006 | Documentación arquitectura | Todas | Diagrama ER, flujos, patrones | README con diagramas | 1.5h |
| TASK-007 | Historias de usuario detalladas | Todas | HU-001 a HU-009 con criterios de aceptación | 9 HUs documentadas | 2h |
| TASK-008 | Plan de sprints | Todas | Desglose tickets por entrega (1, 2, 3) | Roadmap claro | 1h |

---

## 📦 Entregas Planificadas

### Entrega 1 (22 Julio) - Documentación Técnica ✅
- [x] README.md completo
- [x] Prompts.md
- [x] Modelo de datos
- [x] Historias de usuario
- [x] Tickets de trabajo
- [x] PR: feature-entrega1-MPP

### Entrega 2 (9 Septiembre) - MVP Funcional
- [ ] Modelos y BD (SQLite)
- [ ] Autenticación (Login/Registro)
- [ ] Búsqueda de pistas
- [ ] Crear reserva
- [ ] Ver mis reservas
- [ ] Admin: Aprobar reservas
- [ ] Tests unitarios e integración
- [ ] PR: feature-entrega2-MPP

### Entrega 3 (29 Septiembre) - Final Completa
- [ ] Todas las funcionalidades
- [ ] Admin: CRUD pistas, horarios, reportes
- [ ] Emails
- [ ] Exportar CSV/PDF
- [ ] Tests E2E
- [ ] Despliegue AWS
- [ ] Documentación completa
- [ ] PR: finalproject-MPP + rama final

---

## 🚀 Siguientes Pasos

1. ✅ Crear repositorio AI4Devs-finalproject (fork)
2. ✅ Crear rama `feature-entrega1-MPP`
3. ✅ Copiar README.md y Prompts.md
4. ✅ Hacer PR a main
5. 📝 Llenar formulario Typeform con URL del PR

---

## 📚 Referencias y Recursos

- [ASP.NET Core MVC Docs](https://docs.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core](https://docs.microsoft.com/en-us/ef/core/)
- [Razor Pages Documentation](https://docs.microsoft.com/en-us/aspnet/core/razor-pages/)
- [SQLite with EF Core](https://docs.microsoft.com/en-us/ef/core/providers/sqlite/)
- [AWS Deployment Guide](https://aws.amazon.com/getting-started/hands-on/)

---

**Última actualización:** 27 de Julio, 2026  
**Versión:** 1.0 - Entrega 1
