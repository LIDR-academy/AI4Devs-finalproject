# Etapa 6 — Paquete 13 (CU-13) Seguridad Basica y Permisos (MVP)

## Metadata
- Etapa 6 — Ejecucion y Construccion (IA-First)
- Paquete 13
- Caso de uso CU-13 Seguridad Basica y Permisos
- Alcance MVP (autenticacion + autorizacion minima)
- Dependencias Paquetes 01–12 (API y UI funcionando) + existencia de API externa corporativa para authmenus + recaptcha v3

---

## Caso de Uso — CU-13 Seguridad Basica y Permisos (MVP)

### Objetivo
Habilitar acceso seguro a la plataforma para usuarios internos, mediante
- autenticacion por usuario y contraseña (MVP)
- integracion con API externa corporativa para
  - autenticar credenciales
  - obtener permisos de menu (rolesfuncionalidades)
- proteccion de endpoints API
- integracion recaptcha v3 en login

 Nota Los solicitantes externos NO acceden a la plataforma.

### Actores
- Actor primario Usuario interno
- Actor secundario API externa corporativa (auth + permisos)
- Actor secundario Google reCAPTCHA v3

### Disparador
El usuario intenta iniciar sesion y utilizar la plataforma.

### Precondiciones
- Existe API corporativa accesible desde el backend.
- Se dispone de claves de reCAPTCHA v3.
- Frontend Angular listo para integrar autenticacion.

### Flujo principal
1. Usuario abre pantalla de login.
2. Usuario ingresa usuario y contraseña.
3. UI obtiene token de reCAPTCHA v3 y lo incluye en el login.
4. Backend valida reCAPTCHA (y aplica umbral).
5. Backend llama a API corporativa para autenticar.
6. Si autentica
   - backend genera sesiontoken para la app (MVP JWT o session cookie)
   - obtiene permisos de menuacciones desde API corporativa
   - persiste cache minimo (opcional) para rendimiento
7. UI guarda tokensesion y carga menus segun permisos.
8. Todas las llamadas posteriores a API requieren autenticacion.

### Postcondiciones
- Usuario autenticado.
- Permisos cargados y aplicados en UI.
- API protegida.

### Reglas  invariantes relevantes
- Auditor solo lectura (si aplica en permisos).
- Admin puede acceder a mantenedores (cuando existan).
- Ningun endpoint de gestion de casos debe quedar publico.
- Endpoints publicos permitidos
  - encuesta GETPOST por token
  - (futuro) webhooks controlados

### Excepciones
- reCAPTCHA bajo umbral - rechazar login
- credenciales invalidas - rechazar login
- API corporativa caida - error controlado (no autenticar)

---

## Historias de Usuario asociadas

### HU-13 — Login seguro y menus segun permisos (alta prioridad)
Como usuario interno  
Quiero iniciar sesion y ver solo lo que tengo permitido  
Para operar el sistema de forma segura.

#### Criterios de aceptacion (GivenWhenThen)
- Given credenciales validas y recaptcha ok
  When hago login
  Then obtengo sesiontoken y se cargan mis permisos

- Given credenciales invalidas
  When hago login
  Then se rechaza con mensaje estandar

- Given usuario sin permiso a una accion
  When intenta llamar el endpoint protegido
  Then se rechaza con 403

- Given endpoint de encuesta publica
  When se accede sin token de login
  Then funciona (si el token de encuesta es valido)

---

## Tickets de trabajo (= 4 horas cu) para HU-13

### T6-079 — Definir estrategia de autenticacion (Laravel + Angular) (MVP)
Objetivo Elegir e implementar mecanismo MVP de sesiontoken.  
Alcance (recomendacion MVP)
- JWT (Bearer) para Angular
- refresh token opcional (si complica, se omite y se usa expiracion corta)
Entregable
- documento tecnico corto en repo (README auth)
Criterios de aceptacion
- decision implementable y consistente
Pruebas minimas
- login entrega token y puede llamarse endpoint protegido

---

### T6-080 — Integracion reCAPTCHA v3 en login (Angular + Laravel)
Objetivo Validar recaptcha en el flujo de login.  
Alcance
- Angular obtiene token recaptcha
- Laravel valida token contra Google
- umbral configurable (default 0.85)
Criterios de aceptacion
- recaptcha invalidobajo - login rechazado
Pruebas minimas
- pruebas con mock de verificacion recaptcha

---

### T6-081 — Adaptador API corporativa autenticar (Laravel)
Objetivo Consumir API externa para validar credenciales.  
Alcance
- cliente HTTP con timeouts
- mapping de respuesta a usuario interno
- manejo de errores (no autenticar si falla)
Criterios de aceptacion
- credenciales validas - ok
- invalidas - rechazo
Pruebas minimas
- unit tests con mocks

---

### T6-082 — Adaptador API corporativa permisosmenus (Laravel)
Objetivo Obtener permisos de menuacciones del usuario.  
Alcance
- endpoint corporativo de permisos
- normalizar permisos a un modelo interno simple
  - lista de codigos de permisos
- cache opcional (memoriaDB)
Criterios de aceptacion
- permisos disponibles para UI
Pruebas minimas
- unit tests con mocks

---

### T6-083 — Endpoint POST apiauthlogin (Laravel)
Objetivo Implementar login de la aplicacion.  
Alcance
- recibe userpass + recaptcha_token
- valida recaptcha
- autentica via API corporativa
- genera token app
- retorna
  - access_token
  - datos usuario basicos
  - permisos
Criterios de aceptacion
- cumple HU-13
Pruebas minimas
- feature tests
  - ok
  - recaptcha fail
  - credenciales invalidas
  - api corporativa caida

---

### T6-084 — Middleware de autenticacion para API (Laravel)
Objetivo Proteger endpoints internos.  
Alcance
- middleware JWTsession
- whitelist de endpoints publicos
  - encuestas (publico con token de encuesta)
Criterios de aceptacion
- sin token - 401 en endpoints protegidos
- con token - ok
Pruebas minimas
- feature tests 401200

---

### T6-085 — Middleware de autorizacion por permiso (Laravel)
Objetivo Restringir acciones segun permisos.  
Alcance
- guard por permiso (ej `CASO_VER`, `CASO_EDITAR`, `KANBAN_VER`, etc.)
- mapping inicial minimo (MVP)
Criterios de aceptacion
- usuario sin permiso - 403
Pruebas minimas
- feature test 403

---

### T6-086 — Angular pantalla login + almacenamiento token + interceptor (Angular)
Objetivo Integrar login y proteccion de llamadas.  
Alcance
- pantalla login
- guardar token
- interceptor HTTP agrega Authorization header
- guard de rutas basico
Criterios de aceptacion
- login habilita navegacion
- sin login redirige a login
Pruebas minimas
- prueba manual guiada

---

### T6-087 — Angular menus segun permisos (Angular)
Objetivo Renderizar menu dinamico por permisos.  
Alcance
- servicio de permisos
- ocultar items sin permiso
Criterios de aceptacion
- menu cambia segun permisos del usuario
Pruebas minimas
- prueba manual con dos perfiles mock

---

### T6-088 — Registro de auditoria de login (Laravel)
Objetivo Trazar accesos y fallos.  
Alcance
- evento `LoginExitoso`  `LoginFallido`
- persistencia en `evento_log` o tabla dedicada
Criterios de aceptacion
- loguea intentos
Pruebas minimas
- feature test

---

## Priorizacion del paquete (orden recomendado)
1) T6-079 (estrategia auth)  
2) T6-081 (auth corporativa)  
3) T6-080 (recaptcha)  
4) T6-083 (endpoint login)  
5) T6-084 (middleware auth)  
6) T6-082 (permisos)  
7) T6-085 (middleware permisos)  
8) T6-086 (UI login)  
9) T6-087 (menus)  
10) T6-088 (auditoria)

---

## Decisiones abiertas (para que confirmes si quieres ahora)
1) Token de aplicacion
   - JWT (recomendado) vs cookies de sesion
2) Umbral recaptcha
   - mantener 0.85 como baseline (ya definido)

---

## Listo para Cursor + spec-kit (cuando corresponda)
- Para T6-081082 pide a Cursor que trabaje con interfaces + mocks, sin depender del endpoint real hasta tener contrato final.
- No permitir que Cursor exponga endpoints sensibles sin middleware.
