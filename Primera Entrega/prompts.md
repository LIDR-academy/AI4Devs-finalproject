# Prompts Utilizados - SportsPlex

## 📋 Índice de Prompts por Sección

1. [Arquitectura y Diseño](#arquitectura)
2. [Modelo de Datos](#modelo-datos)
3. [Autenticación](#autenticación)
4. [Búsqueda y Filtrado](#búsqueda)
5. [Gestión de Reservas](#reservas)
6. [Panel Administrativo](#admin)
7. [Reportes y Exportación](#reportes)
8. [Tests](#tests)
9. [Despliegue AWS](#aws)

---

## 🏗️ Arquitectura {#arquitectura}

### Prompt 1: Estructura Base del Proyecto .NET

**Prompt Original:**
```
Necesito crear un sistema de reserva de pistas deportivas en ASP.NET Core MVC.

Requisitos técnicos:
- Backend: .NET (ASP.NET Core MVC)
- Frontend: Razor Templates
- BD: SQLite para desarrollo, mantener en production
- Autenticación: Sistema simple sin Identity (con sesiones)
- Patrón arquitectónico: MVC + Service layer + Repository pattern
- ORM: Entity Framework Core

Proporciona:
1. Estructura de carpetas recomendada
2. Configuración básica appsettings.json
3. Startup/Program.cs con inyección de dependencias
4. DbContext base
5. Modelos iniciales (Usuario, Pista, Reserva, etc.)

El proyecto será desplegado en AWS (EC2) con SQLite.
```

**Objetivo:**
Crear estructura base del proyecto .NET con carpetas, configuración y contexto de BD.

**Herramienta Usada:** Claude Code (generación de código)

**Notas de Guía:**
- Especificar que es MVC (no Razor Pages puro)
- Enfatizar autenticación SIMPLE (no Identity)
- Mencionar desplegue AWS desde el inicio

---

### Prompt 2: Arquitectura de Autenticación Simple

**Prompt Original:**
```
En lugar de ASP.NET Core Identity (muy complejo), quiero un sistema de autenticación MÁS SIMPLE:

1. Tabla Usuarios con: Id, Email, PasswordHash, Nombre, Rol (Usuario/Admin)
2. Servicio de autenticación que:
   - Hashee la contraseña con SHA256 o BCrypt
   - Guarde sesión en Session["UserId"] y Session["UserRole"]
   - Middleware custom para verificar autenticación
3. Controladores protegidos con atributo [Authorize] custom

¿Cómo estructuro esto de forma limpia, mantenible y segura?
```

**Objetivo:**
Definir arquitectura de autenticación simple pero segura sin Identity.

**Herramienta Usada:** Claude Code + referencia a mejores prácticas

**Notas de Guía:**
- Usar BCrypt en lugar de SHA256 (más seguro)
- Crear atributo [AuthorizeUser] y [AuthorizeAdmin] reutilizable
- Middleware para verificar sesión en cada request

---

## 🗄️ Modelo de Datos {#modelo-datos}

### Prompt 3: Diseño de Esquema de BD

**Prompt Original:**
```
Necesito un esquema de BD para un sistema de reserva de pistas deportivas.

Entidades principales:
1. Usuarios (Email, Contraseña, Nombre, Rol)
2. Deportes (Nombre, DuraciónFija en minutos: Tenis=90, Fútbol=120, etc.)
3. Ciudades (Nombre, País)
4. Pistas (Nombre, Deporte, Ciudad, Precio/hora)
5. Horarios (Pista, DiaSemana: 0-6, HoraInicio, HoraFin)
6. Reservas (Usuario, Pista, Fecha, HoraInicio, HoraFin, Estado)

Estados de reserva: Pendiente, Aprobada, Cancelada, Completada

Requisitos:
- Foreign Keys correctas
- Índices en campos frecuentes (Email, Fecha, Estado)
- Constraints: duración debe ser positiva, horas válidas 0-23
- Soft delete: Activo BIT en Usuarios, Pistas, Horarios
- Audit: FechaCreacion, FechaAprobacion, AdminId

Proporciona:
1. Diagrama ER (ASCII)
2. Script SQL CREATE TABLE completo
3. Datos iniciales (Deportes, Ciudades, Pistas, Admin test)
```

**Objetivo:**
Diseño completo del esquema con constraints, índices y datos seed.

**Herramienta Usada:** Claude Code (SQL) + diagramas

**Notas de Guía:**
- Enfatizar relaciones 1:N y claves foráneas
- Incluir constraint CHECK para estados
- Especificar DEFAULT values (GETDATE(), 1 para Activo)

---

### Prompt 4: Models y DbContext en EF Core

**Prompt Original:**
```
Basado en el esquema anterior, crea los modelos de dominio y DbContext.

Requisitos:
- Clases: Usuario, Deporte, Ciudad, Pista, Horario, Reserva
- Propiedades navegables (relaciones N:1, 1:N)
- DbContext con DbSets para cada entidad
- Configuración en OnModelCreating:
  - Foreign keys explícitas
  - Índices (Email, Fecha, Estado)
  - Constraints (PasswordHash no nulo, etc.)
  - Value Objects si aplica (enums para Estado, DiaSemana)

Usa EF Core 7+ (latest).

El DbContext debe conectarse a SQLite local.
```

**Objetivo:**
Models listos para Entity Framework Core con relaciones correctas.

**Herramienta Usada:** Claude Code

**Notas de Guía:**
- Usar propiedades con backing fields si es necesario
- Enums para Estados y DiaSemana (type safety)
- Validaciones de dominio en constructores de models

---

## 🔐 Autenticación {#autenticación}

### Prompt 5: Controlador de Autenticación (Register/Login)

**Prompt Original:**
```
Crea el AuthController con acciones:
- GET /Register → Vista formulario
- POST /Register → Validar, hashear contraseña, guardar Usuario, redirigir a Login
- GET /Login → Vista formulario
- POST /Login → Buscar usuario, verificar contraseña, crear sesión, redirigir dashboard
- GET /Logout → Limpiar sesión, redirigir a home

Validaciones:
- Email: formato válido, único en BD
- Contraseña: mínimo 6 caracteres, no nulo
- Nombre: mínimo 3 caracteres

Seguridad:
- No exponer si email existe (mismo mensaje: "Email o contraseña inválida")
- Hash contraseña con BCrypt
- Session timeout (opcional para MVP)

Vistas Razor:
- Form register con CSRF token
- Form login con CSRF token
- Mensajes de error/éxito

TempData para pasar mensajes entre requests.
```

**Objetivo:**
Autenticación funcional con registro/login seguro.

**Herramienta Usada:** Claude Code

**Notas de Guía:**
- Usar IAuthenticationService inyectado
- ValidateAntiForgeryToken en POST
- Redirigir a returnUrl si está disponible

---

## 🔍 Búsqueda y Filtrado {#búsqueda}

### Prompt 6: Búsqueda de Pistas con Cálculo de Disponibilidad

**Prompt Original:**
```
Necesito un servicio SearchService que implemente búsqueda de pistas con:

Entrada:
- DeporteId (nullable)
- CiudadId (nullable)
- Fecha (DateTime)

Salida:
- List<PistaDisponibilidad> con:
  - Pista (id, nombre, precio)
  - Horarios disponibles (ej: [8-9, 9-10, 10-11, ...])

Lógica de disponibilidad:
1. Obtener horarios de operación del día (Horarios.HoraInicio-Fin)
2. Dividir en slots según duración deporte (Tenis=90min, Fútbol=120min, etc.)
3. Excluir slots que tienen Reserva con Estado=Aprobada para esa fecha
4. Retornar slots disponibles

Validaciones:
- Fecha >= hoy
- Solo pistas Activas=1
- Manejar overlaps correctamente

Proporciona también el controlador GET /Pistas/Search con query params.
```

**Objetivo:**
Lógica de disponibilidad sin overlaps, integrada en búsqueda.

**Herramienta Usada:** Claude Code

**Notas de Guía:**
- Usar LINQ con Include() para evitar N+1
- Calcular disponibilidad con algoritmo de slots (no reservas individuales)
- Caching opcional para disponibilidad (5 minutos)

---

### Prompt 7: Vista Razor de Búsqueda

**Prompt Original:**
```
Crea la vista _Search.cshtml para mostrar:
1. Filtros: Deporte (dropdown), Ciudad (dropdown), Fecha (date picker)
2. Botón "Buscar"
3. Tabla de resultados (si hay):
   - Columnas: Pista, Deporte, Ciudad, Precio/h, Horarios disponibles
   - Horarios como botones clicables → llevan a formulario de reserva
4. Validaciones frontend: fecha >= hoy, seleccionar al menos deporte o ciudad
5. Responsive: columnas apiladas en móvil

Usa Bootstrap 5 para estilos (si el proyecto ya lo usa).
```

**Objetivo:**
Interfaz intuitiva de búsqueda con resultados dinámicos.

**Herramienta Usada:** Claude Code + Razor

**Notas de Guía:**
- Usar Jquery Date Picker para fecha
- Mostrar Loading spinner mientras carga
- Validaciones HTML5 + JavaScript

---

## 📅 Gestión de Reservas {#reservas}

### Prompt 8: Crear Reserva (Request)

**Prompt Original:**
```
Controlador/Servicio POST /Reservas/Solicitar:

Entrada (ViewModel):
- PistaId
- Fecha
- HoraInicio
- DuracionMinutos (opcional, calcular de Deporte)

Procesos:
1. Validar usuario autenticado
2. Validar Reserva:
   - Fecha >= hoy + 1 día
   - Horario dentro de Horarios.HoraInicio-Fin
   - Hora + duración <= HoraFin
   - No exista overlap con Reserva aprobada en mismo slot
3. Calcular precio: Pista.Precio * (DuracionMinutos/60)
4. Crear Reserva con Estado=Pendiente
5. Guardar en BD
6. Enviar email: "Tu reserva fue solicitada, pendiente aprobación"
7. Mostrar confirmation page con número de reserva

Manejo de errores:
- Slot no disponible
- Fuera de horarios
- Datos inválidos

Proporciona ViewModel, Controller, Service, vista confirmation.
```

**Objetivo:**
Flujo completo de creación de reserva con validaciones y email.

**Herramienta Usada:** Claude Code

**Notas de Guía:**
- Usar transacción para atomicidad
- GenerarConfirmationNumber único (GUID o correlativo)
- Implementar IEmailService para envíos

---

### Prompt 9: Cancelación de Reserva

**Prompt Original:**
```
POST /Reservas/{id}/Cancelar:

Validaciones:
- Usuario propietario de reserva O es Admin
- Estado IN (Pendiente, Aprobada) - no permitir cancelar Cancelada/Completada
- Modal con motivo opcional (requerido si es admin)

Procesos:
1. Validar permisos
2. Validar estado
3. Actualizar Estado=Cancelada
4. Guardar motivo si aplica
5. Enviar email: "Tu reserva fue cancelada. Motivo: {motivo}"
6. Redirigir a Mis Reservas

Endpoint también disponible para Admin sin restricción de propietario.
```

**Objetivo:**
Cancelación segura de reservas con validaciones.

**Herramienta Usada:** Claude Code

**Notas de Guía:**
- Validar propietario antes de permitir
- Registrar quién canceló (AdminId si aplica)
- No permitir revertir a aprobada

---

### Prompt 10: Vista "Mis Reservas"

**Prompt Original:**
```
GET /Reservas/Mis:

Mostrar tabla con:
- Pista (nombre, deporte)
- Fecha y hora
- Estado (color: amarillo=Pendiente, verde=Aprobada, rojo=Cancelada, gris=Completada)
- Precio total
- Acciones: Ver detalle, Cancelar (si estado permite)

Filtros:
- Por estado (dropdown)
- Ordenar: Fecha ascendente

Pagination: 10 por página

Botón "Exportar CSV" → descarga archivo con mis reservas

Vistas en Razor con Bootstrap.
```

**Objetivo:**
Interfaz para que usuario vea y gestione sus reservas.

**Herramienta Usada:** Claude Code + Razor

**Notas de Guía:**
- Usar Select HTML con filtro JavaScript
- Implementar DataTables.net si quieres sorting avanzado
- Exportar CSV simple: foreach genera rows

---

## 👨‍💼 Panel Administrativo {#admin}

### Prompt 11: CRUD de Pistas (Admin)

**Prompt Original:**
```
Admin dashboard para gestionar pistas.

Funcionalidades:
1. GET /Admin/Pistas → Listar todas (activas e inactivas)
   - Tabla: Nombre, Deporte, Ciudad, Precio, Estado (Activa/Inactiva)
   - Botones: Editar, Desactivar
   
2. GET /Admin/Pistas/Create → Formulario crear
   - Campos: Nombre, Deporte (dropdown), Ciudad (dropdown), PrecioPorHora
   - Validar no vacíos, precio > 0

3. POST /Admin/Pistas → Guardar nueva
   
4. GET /Admin/Pistas/{id}/Edit → Formulario editar
   - Mismos campos que Create
   - Prepoblado con valores actuales
   
5. POST /Admin/Pistas/{id}/Edit → Actualizar
   - No permitir cambiar Deporte/Ciudad (evitar romper reservas)
   - Sí permitir cambiar nombre y precio
   
6. POST /Admin/Pistas/{id}/Deactivate → Soft delete
   - Actualizar Activa = 0
   - No eliminar de BD (preserve history)

Validaciones:
- Deporte y Ciudad deben existir
- Nombre único por Ciudad+Deporte
- Precio > 0

Vista: form bootstrap con CSRF token, validaciones both sides.
```

**Objetivo:**
CRUD completo de pistas con soft delete.

**Herramienta Usada:** Claude Code

**Notas de Guía:**
- No permitir cambios que afecten reservas existentes
- Soft delete preserva historial
- Usar select dropdowns para FK

---

### Prompt 12: Gestión de Horarios (Admin)

**Prompt Original:**
```
Panel de horarios: por cada pista, definir lun-dom.

GET /Admin/Horarios/{pistaId} → Mostrar grilla:
   Dom  Lun  Mar  Mié  Jue  Vie  Sab
   9-20 8-22 8-22 8-22 8-22 8-22 9-20

Editable: click en celda → abre modal con HoraInicio, HoraFin (selects 0-23)

POST /Admin/Horarios → Guardar configuración:
- Body: Array de {DiaSemana, HoraInicio, HoraFin}
- Validar: HoraFin > HoraInicio, ambas 0-23
- UPSERT: si existe dia → update, si no → insert
- Actualizar Activo=0 para días no enviados (opcional)

Vista: tabla editable con modals, Bootstrap.
```

**Objetivo:**
Configuración visual y sencilla de horarios por día.

**Herramienta Usada:** Claude Code + JavaScript

**Notas de Guía:**
- Usar partial view para modal
- AJAX POST para guardar sin refresh
- Validar cliente + servidor

---

### Prompt 13: Aprobar/Rechazar Reservas (Admin)

**Prompt Original:**
```
Dashboard de reservas pendientes para admin.

GET /Admin/Reservas?estado=Pendiente:
- Tabla: Usuario, Pista, Fecha, Hora, Precio, Acciones

Acciones:
1. POST /Admin/Reservas/{id}/Aprobar
   - Validar Reserva.Estado = Pendiente
   - Actualizar Estado = Aprobada
   - Guardar FechaAprobacion, AdminId
   - Enviar email usuario: "Tu reserva fue aprobada. Detalles: ..."

2. POST /Admin/Reservas/{id}/Rechazar
   - Modal con campo "Motivo" (obligatorio)
   - Actualizar Estado = Cancelada, Motivo = input
   - Enviar email: "Tu reserva fue rechazada. Motivo: {motivo}"

Validaciones:
- Solo Pendiente puede pasar a Aprobada
- Motivo requerido para rechazo

Vista: tabla with Bootstrap, botones con confirmación, modal rechazo.
```

**Objetivo:**
Workflow simple de aprobación de reservas.

**Herramienta Usada:** Claude Code

**Notas de Guía:**
- Usar transacción en controller
- Email template para aprobada/rechazada
- Mostrar toast/alert de éxito

---

## 📊 Reportes y Exportación {#reportes}

### Prompt 14: Reportes Admin (Estadísticas)

**Prompt Original:**
```
GET /Admin/Reportes/Estadisticas:

Mostrar:
1. Top 5 pistas más reservadas (cantidad de reservas aprobadas)
   - Tabla: Pista, Cantidad, Ingresos
   
2. Ingresos totales (sum(Precio * Duracion))
   - Por mes (gráfico)
   - Por pista (tabla)
   
3. Reservas por estado (gráfico pie)
   - Pendiente, Aprobada, Cancelada, Completada
   
4. Filtro rango fechas (opcional): fecha inicio - fecha fin

Datos:
- Calcular dinámicamente de tabla Reservas
- Usar LINQ con GroupBy, Sum, OrderBy
- Caching 5 minutos para performance

Vista:
- Usar Chart.js para gráficos (pie, bar)
- Tabla responsive
- Botón exportar CSV/PDF
```

**Objetivo:**
Reportes visuales con insights de negocio.

**Herramienta Usada:** Claude Code + Chart.js

**Notas de Guía:**
- Usar DTO para pasar datos a vista
- Cachear con IMemoryCache
- Chart.js CDN o npm

---

### Prompt 15: Exportar a CSV y PDF

**Prompt Original:**
```
Implementar dos exportaciones:

1. CSV (/Reportes/Exportar?format=csv):
   - Usar CsvHelper (nuget)
   - Headers: Pista, Fecha, Hora, Usuario, Estado, Precio
   - File download: attachment filename=reservas_{date}.csv

2. PDF (/Reportes/Exportar?format=pdf):
   - Usar iTextSharp o QuestPDF (nuget)
   - Header: "Informe Reservas {FechaDesde} - {HastaFecha}"
   - Tabla con datos
   - Footer con fecha generación
   - File download: attachment filename=reservas_{date}.pdf

Ambos:
- Datos según filtros activos (estado, rango fechas)
- Disponible para Usuario (sus reservas) y Admin (todas)

Proporciona:
- Service ExportService con métodos ToCsv(), ToPdf()
- Controller actions
- Validaciones
```

**Objetivo:**
Exportación en dos formatos solicitados.

**Herramienta Usada:** Claude Code

**Notas de Guía:**
- Usar librerías NuGet estándar
- Validar permisos antes de exportar
- Manejo de caracteres especiales (UTF-8)

---

## 🧪 Tests {#tests}

### Prompt 16: Tests Unitarios - AuthService

**Prompt Original:**
```
Crea tests unitarios para AuthService usando xUnit.

Tests:
1. RegisterUser_ValidEmail_ReturnsSuccess
   - Input: email válido, password 6+ chars, nombre
   - Assertion: User creado, password hasheado
   
2. RegisterUser_DuplicateEmail_ReturnsFail
   - Input: email que ya existe
   - Assertion: Exception o error
   
3. LoginUser_ValidCredentials_ReturnsUser
   - Input: email, password correcto
   - Assertion: User retornado con rol correcto
   
4. LoginUser_InvalidPassword_ReturnsFail
   - Assertion: null o exception

Usa Moq para mockear IUserRepository.
Valida también hash verificación.
```

**Objetivo:**
Tests de autenticación sin BD real.

**Herramienta Usada:** xUnit + Moq

**Notas de Guía:**
- Arrange-Act-Assert pattern
- Mock dependencias externas
- Validar tanto happy path como edge cases

---

### Prompt 17: Tests de Integración - Disponibilidad de Pistas

**Prompt Original:**
```
Tests de integración para SearchService.GetAvailableSlots():

Setup:
- Crear BD en memoria (SQLite en-memory)
- Insertar: Deporte (Tenis, 90min), Pista, Horario (8-22)
- Insertar: Reserva aprobada de 8-9.30

Test 1: GetSlots_NoReservas_ReturnsAllSlots
- Sin reservas → retorna todos los slots posibles

Test 2: GetSlots_WithApprovedReserva_ExcludesOverlaps
- Con reserva 8-9.30 → los slots 8-9.30 deben estar excluidos
- Slots 9.30-11, 11-12.30, etc. deben estar disponibles

Test 3: GetSlots_PendingReserva_DoesNotExclude
- Reserva con estado Pendiente → no excluir de disponibilidad

Test 4: GetSlots_OutOfOperatingHours_ReturnsEmpty
- Fecha con Horario 9-20 → no retornar slots antes 9 ni después 20

Usa InMemory DbContext.
```

**Objetivo:**
Tests de disponibilidad contra lógica de overlaps.

**Herramienta Usada:** xUnit + EF In-Memory

**Notas de Guía:**
- Setup reusable con DbContextOptions
- Validar cálculo de slots correctamente
- Test edge cases (duración parcial, midnight boundaries)

---

### Prompt 18: Test E2E - Flujo Completo de Reserva

**Prompt Original:**
```
Test E2E simulando flujo:
1. Usuario registra
2. Usuario busca pista (deporte=Tenis, ciudad=Madrid)
3. Usuario solicita reserva (fecha=mañana, hora=10)
4. Admin aprueba reserva
5. Usuario ve reserva aprobada

Usa:
- Selenium WebDriver o Cypress
- BD real (SQLite test)
- Mimic navegador real

Flujo:
- GET /Register
- POST /Register con datos
- GET /Pistas/Search?deporte=1&ciudad=1&fecha=...
- POST /Reservas/Solicitar
- GET /Admin/Reservas (como admin)
- POST /Admin/Reservas/{id}/Aprobar
- GET /Reservas/Mis (verificar estado=Aprobada)

Assertions:
- Página titles
- elementos en DOM
- Estado en BD
```

**Objetivo:**
Test end-to-end del flujo principal completo.

**Herramienta Usada:** Selenium WebDriver

**Notas de Guía:**
- Usar waits explícitos
- Setup/teardown DB antes y después
- Screenshots en fallo

---

## 🚀 Despliegue AWS {#aws}

### Prompt 19: Pipeline CI/CD básico (GitHub Actions)

**Prompt Original:**
```
Crear workflow GitHub Actions para:

1. Trigger: Push a feature/* y main
2. Jobs:
   - Build: dotnet build
   - Test: dotnet test (xUnit)
   - SonarQube scan (opcional)
3. Deploy (solo en main):
   - Publish: dotnet publish -c Release
   - Upload artefacto a S3 o AWS CodeDeploy
   - SSH a EC2 y redeploy

Archivo: .github/workflows/ci-cd.yml

Secrets:
- AWS_ACCESS_KEY
- AWS_SECRET_KEY
- EC2_IP
- EC2_SSH_KEY

Logs visibles en GitHub Actions tab.
```

**Objetivo:**
Pipeline automatizado de build, test y deploy.

**Herramienta Usada:** GitHub Actions + AWS

**Notas de Guía:**
- Usar secrets para credenciales
- Parallel jobs si es posible
- Slack notification on failure (opcional)

---

### Prompt 20: Despliegue en AWS EC2

**Prompt Original:**
```
Guía de despliegue en EC2 (Linux):

1. Provisionar EC2:
   - Ubuntu 22.04 LTS, t3.micro
   - Security Group: SSH (22), HTTP (80), HTTPS (443)
   - Elastic IP

2. Instalar dependencias:
   - .NET Runtime 7+
   - SQLite3
   - Nginx (reverse proxy)
   - Certbot (SSL)

3. Deploy app:
   - dotnet publish -c Release
   - Copiar build a /app/sportsplex
   - systemd service file para auto-start
   - Nginx conf reverseproxy a localhost:5000

4. BD SQLite:
   - Copiar DB file a /app/sportsplex/data/app.db
   - Migraciones: dotnet ef database update

5. Seguridad:
   - SSL con Let's Encrypt
   - Firewall (UFW)
   - Logs en /var/log/sportsplex

6. Monitoreo (opcional):
   - CloudWatch logs
   - Health check endpoint

Proporciona:
- Script bash de deployment
- systemd service file
- Nginx config
- appsettings.Production.json
```

**Objetivo:**
Despliegue funcional y seguro en AWS EC2.

**Herramienta Usada:** Bash + Nginx + systemd

**Notas de Guía:**
- Usar environment variables para secretos
- Automatizar con scripts
- Documentar en README

---

## 📝 Notas de Uso de IA

### Estrategia General

1. **Arquitec/Diseño**: Prompts descriptivos, solicitando estructura + explicación
2. **Código**: Prompts específicos por funcionalidad, indicando errores a corregir
3. **Tests**: Prompts con ejemplo de test unitario esperado
4. **Iteración**: Si el código no funciona, proporciono el error y pido ajustes específicos

### Herramientas Utilizadas

- **Claude Code**: Generación de código .NET, EF, Razor, SQL
- **ChatGPT (ocasional)**: Debugging, alternativas de arquitectura
- **Stack Overflow + Docs**: Validación de soluciones

### Control de Calidad

- Cada PR incluye: cambios, tests, documentación
- Revisión manual de lógica crítica (overlap en reservas, aprovals)
- Testing manual del flujo E2E antes de merge

---

**Última actualización:** 27 de Julio, 2026  
**Versión:** 1.0
