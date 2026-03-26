# PRODUCT BACKLOG - TRAVELSPLIT MVP

## EPIC 1: INFRAESTRUCTURA Y ARQUITECTURA (FOUNDATION)
Esta épica agrupa todas las tareas técnicas necesarias para establecer los cimientos del proyecto siguiendo la arquitectura en capas y las definiciones tecnológicas del PRD.

> **ID SUGERIDO:** TS-001
> **TIPO:** Tarea Técnica
> **TÍTULO:** Inicialización de Backend NestJS y Configuración de Base de Datos
> **PRIORIDAD:** Crítica (MVP)
> **ESTIMACIÓN:** 5 Puntos
> **ASIGNACIÓN SUGERIDA:** Backend
> **ETIQUETAS:** #setup, #backend, #database, #architecture
>
> **DESCRIPCIÓN:**
> *Propósito:* Establecer el entorno de desarrollo del servidor y la persistencia de datos.
> *Detalle:* Configurar un proyecto nuevo en NestJS. Configurar la conexión a PostgreSQL. Definir la estrategia de "Soft Delete" global (columna `deleted_at`). Implementar estructura de carpetas estricta: Controllers, Services, Repositories (Pattern CSR).
>
> **CRITERIOS DE ACEPTACIÓN:**
> - [ ] Repositorio creado con estructura modular de NestJS.
> - [ ] Conexión exitosa a instancia local/dev de PostgreSQL.
> - [ ] Configuración de TypeORM con soporte para Soft Delete.
> - [ ] Middleware de manejo de errores global configurado.
>
> **NOTAS TÉCNICAS / DEPENDENCIAS:**
> Ver sección 7 del PRD: Arquitectura en Capas y Separación de Responsabilidades.

> **ID SUGERIDO:** TS-002
> **TIPO:** Tarea Técnica
> **TÍTULO:** Inicialización de Frontend React + TailwindCSS
> **PRIORIDAD:** Crítica (MVP)
> **ESTIMACIÓN:** 3 Puntos
> **ASIGNACIÓN SUGERIDA:** Frontend
> **ETIQUETAS:** #setup, #frontend, #ui
>
> **DESCRIPCIÓN:**
> *Propósito:* Crear el cliente web responsivo.
> *Detalle:* Inicializar proyecto React con TypeScript. Instalar y configurar TailwindCSS. Definir sistema de rutas (React Router).
>
> **CRITERIOS DE ACEPTACIÓN:**
> - [ ] Proyecto corre en local sin errores.
> - [ ] Tailwind configurado y funcionando.
> - [ ] Estructura de carpetas de componentes atomic/modular definida.
> - [ ] Configuración base de linter y prettier para TypeScript.

---

## EPIC 2: AUTENTICACIÓN Y USUARIOS
Gestión del acceso seguro y la identidad de los usuarios, requisito previo para la regla de negocio "Strict User Policy".

> **ID SUGERIDO:** TS-003
> **TIPO:** Historia de Usuario
> **TÍTULO:** Registro de Usuario
> **PRIORIDAD:** Crítica (MVP)
> **ESTIMACIÓN:** 5 Puntos
> **ASIGNACIÓN SUGERIDA:** Fullstack
> **ETIQUETAS:** #auth, #mvp
>
> **DESCRIPCIÓN:**
> *Propósito:* Permitir que nuevos usuarios entren al ecosistema para poder ser invitados a viajes.
> *Detalle:* Formulario de registro y endpoint de creación.
>
> **USER STORY:**
> "Como nuevo usuario, quiero registrarme ingresando mi email, nombre y contraseña, para poder tener una identidad válida en el sistema."
>
> **CRITERIOS DE ACEPTACIÓN:**
> - [ ] Validar que el email no exista previamente.
> - [ ] Validar contraseña > 6 caracteres.
> - [ ] Guardar contraseña encriptada (bcrypt/argon2).
> - [ ] Retornar confirmación de éxito y redirigir a Login.
>
> **NOTAS TÉCNICAS / DEPENDENCIAS:**
> Endpoint `POST /auth/register`.

> **ID SUGERIDO:** TS-004
> **TIPO:** Historia de Usuario
> **TÍTULO:** Login con JWT
> **PRIORIDAD:** Crítica (MVP)
> **ESTIMACIÓN:** 3 Puntos
> **ASIGNACIÓN SUGERIDA:** Backend
> **ETIQUETAS:** #auth, #security
>
> **DESCRIPCIÓN:**
> *Propósito:* Proveer acceso seguro a los recursos protegidos.
>
> **USER STORY:**
> "Como usuario registrado, quiero iniciar sesión con mis credenciales, para acceder a mis viajes."
>
> **CRITERIOS DE ACEPTACIÓN:**
> - [ ] Validar credenciales contra BD.
> - [ ] Generar y retornar Token JWT.
> - [ ] El frontend debe almacenar el token de forma segura (HttpOnly cookie o LocalStorage según estrategia).
> - [ ] Manejo de error 401 para credenciales inválidas.

---

## EPIC 3: GESTIÓN DE VIAJES (TRIP MANAGEMENT)
Funcionalidades core para la creación y configuración de los grupos de viaje.

> **ID SUGERIDO:** TS-005
> **TIPO:** Historia de Usuario
> **TÍTULO:** Crear Viaje y Rol de Administrador
> **PRIORIDAD:** Crítica (MVP)
> **ESTIMACIÓN:** 3 Puntos
> **ASIGNACIÓN SUGERIDA:** Frontend | Backend
> **ETIQUETAS:** #trips, #roles
>
> **DESCRIPCIÓN:**
> *Propósito:* Iniciar el contenedor donde se agruparán los gastos.
> *Detalle:* El usuario que crea el viaje se convierte automáticamente en "Admin/Creador".
>
> **USER STORY:**
> "Como usuario, quiero crear un nuevo viaje asignándole un nombre, para empezar a registrar gastos."
>
> **CRITERIOS DE ACEPTACIÓN:**
> - [ ] Input para nombre del viaje.
> - [ ] Moneda fijada en COP por defecto (backend).
> - [ ] El usuario creador se asigna como participante con rol ADMIN.
> - [ ] Generación automática de código alfanumérico único para el viaje.

> **ID SUGERIDO:** TS-006
> **TIPO:** Historia de Usuario
> **TÍTULO:** Invitar Participantes (Strict Policy)
> **PRIORIDAD:** Alta
> **ESTIMACIÓN:** 5 Puntos
> **ASIGNACIÓN SUGERIDA:** Backend | Frontend
> **ETIQUETAS:** #trips, #business-rule
>
> **DESCRIPCIÓN:**
> *Propósito:* Agregar amigos al viaje asegurando que ya existan en la plataforma.
> *Detalle:* Implementar la Regla de Negocio #1.
>
> **USER STORY:**
> "Como Creador del viaje, quiero invitar amigos usando su correo electrónico, para que el sistema valide si están registrados y los añada al grupo."
>
> **CRITERIOS DE ACEPTACIÓN:**
> - [ ] Input para ingresar email del amigo.
> - [ ] El sistema verifica si el email existe en la tabla `Users`.
> - [ ] Si existe: Se asocia al viaje y se envía notificación (email/simulado).
> - [ ] Si NO existe: Mostrar error bloqueante "El usuario no está registrado en TravelSplit".
> - [ ] Solo el Creador puede ver la opción de agregar personas.

> **ID SUGERIDO:** TS-007
> **TIPO:** Historia de Usuario
> **TÍTULO:** Unirse a Viaje mediante Código
> **PRIORIDAD:** Media
> **ESTIMACIÓN:** 3 Puntos
> **ASIGNACIÓN SUGERIDA:** Fullstack
> **ETIQUETAS:** #trips, #usability
>
> **DESCRIPCIÓN:**
> *Propósito:* Facilitar el acceso rápido a un viaje sin esperar invitación por email.
>
> **USER STORY:**
> "Como usuario participante, quie                  lfanumérico, para unirme automáticamente a un viaje existente."
>
> **CRITERIOS DE ACEPTACIÓN:**
> - [ ] Campo de texto para ingresar código.
> - [ ] Validación de código existente y activo.
> - [ ] El usuario se añade como "Participante" (Rol Medio).
> - [ ] No permitir unirse si ya es miembro.

---

## EPIC 4: GESTIÓN DE GASTOS (EXPENSES)
El corazón del sistema. Registro y visualización de movimientos financieros.

> **ID SUGERIDO:** TS-008
> **TIPO:** Tarea Técnica
> **TÍTULO:** Servicio de Carga de Imágenes (Cloud)
> **PRIORIDAD:** Alta
> **ESTIMACIÓN:** 5 Puntos
> **ASIGNACIÓN SUGERIDA:** Backend
> **ETIQUETAS:** #infra, #media
>
> **DESCRIPCIÓN:**
> *Propósito:* Habilitar el almacenamiento de fotos de recibos.
> *Detalle:* Configurar servicio (S3 o Cloudinary) y crear endpoint para subida de archivos `multipart/form-data`.
>
> **CRITERIOS DE ACEPTACIÓN:**
> - [ ] Endpoint recibe imagen y valida formato/peso.
> - [ ] Imagen se sube al proveedor cloud.
> - [ ] Endpoint retorna la URL pública segura de la imagen.

> **ID SUGERIDO:** TS-009
> **TIPO:** Historia de Usuario
> **TÍTULO:** Registrar Nuevo Gasto
> **PRIORIDAD:** Crítica (MVP)
> **ESTIMACIÓN:** 8 Puntos
> **ASIGNACIÓN SUGERIDA:** Fullstack
> **ETIQUETAS:** #expenses, #core
>
> **DESCRIPCIÓN:**
> *Propósito:* Alimentar el sistema con la información financiera del viaje.
> *Detalle:* Debe soportar división del gasto (por defecto partes iguales entre todos, MVP).
>
> **USER STORY:**
> "Como participante del viaje, quiero registrar un gasto con monto, categoría y foto, para dejar constancia de mi pago."
>
> **CRITERIOS DE ACEPTACIÓN:**
> - [ ] Formulario con: Título, Monto (COP), Categoría (Select), Foto (Opcional).
> - [ ] Selección de pagador (por defecto el usuario logueado).
> - [ ] Selección de beneficiarios (Split). Por defecto: Todos los miembros.
> - [ ] Validar que el monto sea positivo.
> - [ ] Guardar registro en BD.

> **ID SUGERIDO:** TS-010
> **TIPO:** Historia de Usuario
> **TÍTULO:** Edición/Eliminación Centralizada de Gastos
> **PRIORIDAD:** Alta
> **ESTIMACIÓN:** 5 Puntos
> **ASIGNACIÓN SUGERIDA:** Backend | Frontend
> **ETIQUETAS:** #expenses, #permissions
>
> **DESCRIPCIÓN:**
> *Propósito:* Mantener la integridad de los datos evitando conflictos entre participantes. Implementar Regla de Negocio #2.
>
> **USER STORY:**
> "Como Creador del viaje, quiero tener permisos exclusivos para editar o eliminar cualquier gasto, para corregir errores de otros usuarios."
>
> **CRITERIOS DE ACEPTACIÓN:**
> - [ ] Frontend: Botones "Editar" y "Borrar" solo visibles si `user.id === trip.creator_id`.
> - [ ] Backend: Guard/Middleware que verifique rol de Creador antes de procesar UPDATE/DELETE.
> - [ ] Soft delete aplicado al eliminar.

> **ID SUGERIDO:** TS-011
> **TIPO:** Historia de Usuario
> **TÍTULO:** Feed de Gastos del Viaje
> **PRIORIDAD:** Alta
> **ESTIMACIÓN:** 3 Puntos
> **ASIGNACIÓN SUGERIDA:** Frontend
> **ETIQUETAS:** #ui, #read-only
>
> **DESCRIPCIÓN:**
> *Propósito:* Visualizar la actividad reciente del grupo.
>
> **USER STORY:**
> "Como usuario, quiero ver una lista de todos los gastos ordenados del más reciente al más antiguo, para estar al tanto de los movimientos."
>
> **CRITERIOS DE ACEPTACIÓN:**
> - [ ] Listado con scroll infinito o paginación.
> - [ ] Cada item muestra: Quién pagó, Monto, Título, Fecha.
> - [ ] Al hacer clic, ver detalle (incluyendo foto si existe).

---

## EPIC 5: SALDOS Y LIQUIDACIÓN (BALANCES)
Funcionalidad final para dar valor al usuario (saber quién debe a quién).

> **ID SUGERIDO:** TS-012
> **TIPO:** Tarea Técnica
> **TÍTULO:** Algoritmo de Cálculo de Saldos
> **PRIORIDAD:** Alta
> **ESTIMACIÓN:** 8 Puntos
> **ASIGNACIÓN SUGERIDA:** Backend
> **ETIQUETAS:** #logic, #math
>
> **DESCRIPCIÓN:**
> *Propósito:* Procesar todos los gastos y determinar las deudas netas.
> *Detalle:* Calcular "Total Gastado por Persona" vs "Cuota Justa (Fair Share)".
> *Lógica:* (Total Viaje / N Personas) - (Lo que pagó Persona X) = Balance.
>
> **CRITERIOS DE ACEPTACIÓN:**
> - [ ] Servicio que recibe ID de viaje y retorna array de balances.
> - [ ] Unit Tests cubriendo casos: Gasto único, Múltiples gastos, Usuario que no gastó nada.
> - [ ] Precisión decimal manejada correctamente.

> **ID SUGERIDO:** TS-013
> **TIPO:** Historia de Usuario
> **TÍTULO:** Visualización de Deudas
> **PRIORIDAD:** Alta
> **ESTIMACIÓN:** 3 Puntos
> **ASIGNACIÓN SUGERIDA:** Frontend
> **ETIQUETAS:** #ui, #value
>
> **DESCRIPCIÓN:**
> *Propósito:* Que el usuario entienda fácilmente cuánto debe o cuánto le deben.
>
> **USER STORY:**
> "Como usuario, quiero ver un resumen claro de saldos, para saber a quién debo transferirle dinero."
>
> **CRITERIOS DE ACEPTACIÓN:**
> - [ ] Pantalla "Saldos" dentro del viaje.
> - [ ] Mostrar lista simplificada: "Juan debe $50.000 a Pedro".
> - [ ] Mostrar mi balance personal destacado (Ej: "Te deben $20.000" o "Debes $15.000").