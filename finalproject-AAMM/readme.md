## Índice

0. [Ficha del proyecto](#0-ficha-del-proyecto)
1. [Descripción general del producto](#1-descripción-general-del-producto)
   - [1.1. Objetivo](#11-objetivo)
   - [1.2. Características y funcionalidades principales](#12-características-y-funcionalidades-principales)
   - [1.3. Diseño y experiencia de usuario](#13-diseño-y-experiencia-de-usuario)
     - [1.3.1. Flujo de Onboarding](#131-flujo-de-onboarding-registro--configuración-inicial)
     - [1.3.2. Flujo de Búsqueda de Propiedades](#132-flujo-de-búsqueda-de-propiedades)
     - [1.3.3. Flujo de Coincidencias y Notificaciones](#133-flujo-de-coincidencias-y-notificaciones-inteligentes)
     - [1.3.4. Flujo de Visualización de Propiedad](#134-flujo-de-visualización-de-propiedad)
     - [1.3.5. Flujo de Contacto y Chat](#135-flujo-de-contacto-y-chat)
   - [1.4. Flujo del Panel de Control](#14-flujo-del-panel-de-control-publicadores)
   - [1.5. Flujo de Favoritos y Comparación](#15-flujo-de-favoritos-y-comparación)
   - [1.6. Adaptación para Dispositivos Móviles](#16-adaptación-para-dispositivos-móviles)
   - [1.7. Principios de Diseño Centrado en el Usuario](#17-principios-de-diseño-centrado-en-el-usuario)
   - [1.8. Instrucciones de instalación](#18-instrucciones-de-instalación)
   - [1.9. Casos de Uso Principales del Sistema](#19-casos-de-uso-principales-del-sistema)
     - [1.9.1. Registrarse y configurar perfil](#191-registrarse-y-configurar-perfil)
     - [1.9.2. Publicar una propiedad](#192-publicar-una-propiedad-core)
     - [1.9.3. Buscar propiedades en el mapa](#193-buscar-propiedades-en-el-mapa-core)
     - [1.9.4. Generar coincidencias automáticas](#194-generar-coincidencias-automáticas-core)
     - [1.9.5. Contactar al publicador](#195-contactar-al-publicador-core)
     - [1.9.6. Administrar mis propiedades](#196-administrar-mis-propiedades)
     - [1.9.7. Guardar y comparar propiedades favoritas](#197-guardar-y-comparar-propiedades-favoritas)
     - [1.9.8. Recuperar contraseña](#198-recuperar-contraseña)
     - [1.9.9. Recibir notificaciones de coincidencias](#199-recibir-notificaciones-de-coincidencias)
     - [1.9.10. Cerrar sesión y limpiar sesión segura](#1910-cerrar-sesión-y-limpiar-sesión-segura)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
   - [2.1. Diagrama de arquitectura](#21-diagrama-de-arquitectura)
   - [2.2. Tecnologías por Componente](#22-tecnologías-por-componente)
   - [2.3. Patrón Arquitectónico: MVC Monolítico Modular](#23-patrón-arquitectónico-mvc-monolítico-modular)
   - [2.4. Descripción de componentes principales](#24-descripción-de-componentes-principales)
     - [2.4.1. Frontend (Cliente)](#241-frontend-cliente)
     - [2.4.2. Backend (Servidor de Negocio)](#242-backend-servidor-de-negocio)
     - [2.4.3. Base de Datos](#243-base-de-datos)
     - [2.4.4. Sistema de Notificaciones](#244-sistema-de-notificaciones)
     - [2.4.5. Sistema de Matching Inteligente](#245-sistema-de-matching-inteligente)
     - [2.4.6. Servicios Externos / Integraciones](#246-servicios-externos--integraciones)
     - [2.4.7. Middleware y Seguridad](#247-middleware-y-seguridad)
     - [2.4.8. Infraestructura / Orquestación](#248-infraestructura--orquestación)
   - [2.5. Descripción de alto nivel del proyecto y estructura de ficheros](#25-descripción-de-alto-nivel-del-proyecto-y-estructura-de-ficheros)
   - [2.6. Infraestructura y despliegue](#26-infraestructura-y-despliegue)
   - [2.7. Seguridad](#27-seguridad)
   - [2.8. Tests](#28-tests)
3. [Modelo de datos](#3-modelo-de-datos)
   - [3.1. Diagrama del Modelo de Datos](#31-diagrama-del-modelo-de-datos)
   - [3.2. Descripción de Entidades Principales](#32-descripción-de-entidades-principales)
4. [Especificación de la API](#4-especificación-de-la-api)
   - [4.1. Endpoints Principales de ZonMatch](#41-endpoints-principales-de-zonmatch)
     - [4.1.1. POST /api/auth/login - Autenticación de Usuario](#411-post-apiauthlogin---autenticación-de-usuario)
     - [4.1.2. GET /api/search/advanced - Búsqueda Avanzada de Propiedades](#412-get-apisearchadvanced---búsqueda-avanzada-de-propiedades)
     - [4.1.3. POST /api/properties - Crear Nueva Propiedad](#413-post-apiproperties---crear-nueva-propiedad)
   - [4.2. Endpoints Adicionales Importantes](#42-endpoints-adicionales-importantes)
   - [4.3. Características Especiales de la API](#43-características-especiales-de-la-api)
5. [Historias de Usuario](#5-historias-de-usuario)
   - [5.1. Historias de Usuario Core](#51-historias-de-usuario-core)
     - [5.1.1. Historia de Usuario 1: Búsqueda Geográfica con Polígonos](#511-historia-de-usuario-1-búsqueda-geográfica-con-polígonos)
     - [5.1.2. Historia de Usuario 2: Notificaciones Automáticas de Matches](#512-historia-de-usuario-2-notificaciones-automáticas-de-matches)
     - [5.1.3. Historia de Usuario 3: Sistema de Favoritos y Comparación](#513-historia-de-usuario-3-sistema-de-favoritos-y-comparación)
     - [5.1.4. Historia de Usuario 4: Contacto Dual (Chat Interno + WhatsApp)](#514-historia-de-usuario-4-contacto-dual-chat-interno--whatsapp)
     - [5.1.5. Historia de Usuario 5: Panel de Métricas para Publicadores](#515-historia-de-usuario-5-panel-de-métricas-para-publicadores)
6. [Tickets de Trabajo](#6-tickets-de-trabajo)
   - [6.1. TICKET #1: Frontend - Sistema de Notificaciones en Tiempo Real](#61-ticket-1-frontend---sistema-de-notificaciones-en-tiempo-real)
   - [6.2. TICKET #2: Backend - Sistema de Matching Inteligente](#62-ticket-2-backend---sistema-de-matching-inteligente)
   - [6.3. TICKET #3: Base de Datos - Optimización y Escalabilidad](#63-ticket-3-base-de-datos---optimización-y-escalabilidad)
7. [Pull Requests](#7-pull-requests)
   - [7.1. Pull Request 1](#71-pull-request-1)
   - [7.2. Pull Request 2](#72-pull-request-2)
   - [7.3. Pull Request 3](#73-pull-request-3)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
Antonio Alejandro Moreno Martinez

### **0.2. Nombre del proyecto:**
Zonmatch

### **0.3. Descripción breve del proyecto:**
Zonmatch revoluciona la forma en que se descubren propiedades inmobiliarias, resolviendo una de las principales fricciones del mercado: la ineficiencia en el emparejamiento entre oferta y demanda. En un entorno donde los portales tradicionales requieren búsquedas manuales extensas y carecen de retroalimentación proactiva, los usuarios se enfrentan a una experiencia fragmentada y poco personalizada.

### **0.4. URL del proyecto:**
https://zonmatch.vercel.app

### 0.5. URL o archivo comprimido del repositorio
https://github.com/aaMorneo/zonmatch.git

ya se envio la invitacion al repo a jorge@lidr.co y a LuisEUM

---

## 1. Descripción general del producto
Este sistema propone una solución tecnológica basada en una arquitectura moderna compuesta por ReactJS para una interfaz responsiva e intuitiva, Node.js y MySQL para una gestión robusta de datos, y un sistema de matching inteligente basado en reglas que utiliza algoritmos geográficos avanzados y criterios ponderados para generar coincidencias automáticas entre inmuebles y buscadores. Los usuarios pueden definir zonas de interés mediante polígonos interactivos sobre el mapa, aplicar múltiples filtros (tipo de propiedad, amenidades, precio, etc.) y recibir notificaciones en tiempo real cuando una propiedad relevante aparece o se publica.

A diferencia de los portales tradicionales, Zonmatch no es solo una vitrina de propiedades, sino un sistema inteligente de conexión inmediata entre intereses complementarios, replicando la lógica de apps de emparejamiento social. Este enfoque dinámico y centrado en el usuario transforma el descubrimiento inmobiliario en una experiencia ágil, proactiva y placentera.

Diseñado para un público amplio y diverso, Zonmatch ofrece funcionalidades especializadas tanto para usuarios individuales que buscan su nuevo hogar, como para agentes, inmobiliarias y constructoras que desean posicionar sus propiedades de forma más eficiente. Todos los actores pueden beneficiarse de algoritmos de coincidencia inversa, sugerencias automatizadas y analíticas en tiempo real para tomar decisiones más rápidas y precisas.

### **1.1. Objetivo:**
Zonmatch tiene como propósito transformar radicalmente la forma en que personas y empresas descubren, ofertan y conectan con propiedades inmobiliarias, eliminando la necesidad de búsquedas manuales complejas, resultados irrelevantes o interacciones pasivas.

A diferencia de plataformas tradicionales, Zonmatch no se basa en mecánicas visuales tipo "swipe", sino que utiliza una lógica de coincidencia automatizada mediante algoritmos de matching basados en reglas geográficas y criterios ponderados. Los usuarios pueden definir filtros detallados (tipo de propiedad, amenidades, presupuesto, etc.) y delimitar zonas de interés dibujando polígonos en el mapa, lo que permite encontrar propiedades relevantes de forma proactiva, sin búsquedas constantes.

El sistema también genera coincidencias inversas: si un nuevo inmueble publicado coincide con los filtros de un buscador activo, el sistema lo notifica automáticamente. Esta doble vía de emparejamiento acelera la conexión entre oferta y demanda.

¿Qué valor aporta?
	•	Ahorro de tiempo en la búsqueda de inmuebles relevantes.
	•	Coincidencias más precisas, gracias a filtros combinados con geolocalización y algoritmos de matching inteligente.
	•	Notificaciones automáticas en tiempo real para nuevos matches.
	•	Herramientas inteligentes para empresas del sector que necesitan segmentar y posicionar su inventario de forma más efectiva.

¿Qué problema soluciona?
	•	El exceso de información irrelevante y la baja personalización en portales actuales.
	•	La falta de un sistema que detecte oportunidades inmobiliarias de forma automática y bidireccional.
	•	La ausencia de herramientas interactivas para definir zonas de interés reales por parte de los usuarios.

¿A quién está dirigido?
	•	Buscadores individuales (compradores o inquilinos) que quieren resultados precisos y sin esfuerzo.
	•	Agentes inmobiliarios que necesitan visibilidad y acceso a prospectos calificados.
	•	Inmobiliarias y constructoras que manejan carteras extensas y buscan inteligencia comercial.

### **1.2. Características y funcionalidades principales:**
A continuación se detallan las funcionalidades específicas de **Zonmatch**, diseñadas para responder a las necesidades de los distintos perfiles de usuario (buscadores, agentes, inmobiliarias, constructoras) y resolver los principales desafíos del mercado inmobiliario tradicional.

### Lean Canvas:**
![Lean Canvas de Zonmatch](./docs/diagramas/lean%20canvas.png)

---

### Funcionalidades Clave

#### 1. Publicación Inteligente de Propiedades
- **Usuarios:** Agentes, inmobiliarias, usuarios particulares.  
- **Descripción:**  
  - Formulario detallado con geolocalización y atributos del inmueble.
  - Categorización por tipo de operación (venta, renta, traspaso).
  - Subida de imágenes, etiquetas especiales (ej. pet-friendly, nuevo).
- **Valor que aporta:** Facilita una carga estructurada y optimizada de propiedades.

#### 2. Búsqueda Avanzada con Filtros Dinámicos
- **Usuarios:** Buscadores.  
- **Descripción:**  
  - Filtros por tipo de propiedad, habitaciones, precio, amenidades, etc.
  - Posibilidad de guardar búsquedas frecuentes.
- **Valor que aporta:** Permite resultados altamente relevantes sin búsquedas extensas.

#### 3. Selección Geográfica con Polígonos en Mapa
- **Usuarios:** Buscadores.  
- **Descripción:**  
  - Herramienta para dibujar zonas personalizadas directamente en el mapa.
  - Muestra propiedades dentro de zonas delimitadas.
- **Valor que aporta:** Búsqueda geográfica precisa basada en preferencias reales.

#### 4. Sistema de Match Automático
- **Usuarios:** Todos.  
- **Descripción:**  
  - Sistema de matching basado en reglas que genera coincidencias automáticas si una propiedad cumple al menos el 50% de los filtros y está dentro del área definida.
- **Valor que aporta:** Encuentra coincidencias de forma proactiva, sin búsquedas manuales constantes.

#### 5. Match Inverso (Publicación → Buscador)
- **Usuarios:** Publicadores (agentes, inmobiliarias).  
- **Descripción:**  
  - Cuando se publica un nuevo inmueble, se verifica si coincide con filtros activos de otros usuarios y se les notifica automáticamente.
- **Valor que aporta:** Aumenta la exposición inmediata de nuevas propiedades a públicos interesados.

#### 6. Notificaciones Inteligentes
- **Usuarios:** Todos.  
- **Descripción:**  
  - Alertas en tiempo real por nuevos matches, ajustes de búsqueda y actividad relevante.
- **Valor que aporta:** Mantiene al usuario informado sin necesidad de monitoreo constante.

#### 7. Panel de Control Personalizado
- **Usuarios:** Agentes e inmobiliarias.  
- **Descripción:**  
  - Métricas de rendimiento por propiedad (vistas, clics, contactos).
  - Analítica por zona, tipo de inmueble y comportamiento de usuarios.
- **Valor que aporta:** Optimiza decisiones comerciales y de posicionamiento.

#### 8. Gestión de Favoritos y Seguimiento
- **Usuarios:** Buscadores.  
- **Descripción:**  
  - Guardado de favoritos, comparador de propiedades y visualización de historial de interacción.
- **Valor que aporta:** Facilita el análisis y comparación para tomar decisiones informadas.

#### 9. Sistema de Contacto y Chat Interno
- **Usuarios:** Todos.  
- **Descripción:**  
  - Contacto directo entre publicador y buscador.
  - Chat con historial de conversación dentro de la plataforma.
- **Valor que aporta:** Mejora la conversión al facilitar la comunicación inmediata.

#### 10. Interfaz Multidispositivo
- **Usuarios:** Todos.  
- **Descripción:**  
  - Diseño responsive para uso fluido en móviles, tablets y computadoras.
- **Valor que aporta:** Accesibilidad y comodidad desde cualquier lugar.

#### 11. Gestión de Seguridad y Autenticación de Usuarios
- **Usuarios:** Todos (buscadores, publicadores, agentes, administradores)  
- **Descripción:**  
  - Registro seguro con validación de identidad por correo.
  - Autenticación mediante email y contraseña cifrada.
  - Recuperación de contraseña con token temporal.
  - Control de sesión: expiración automática e invalidación manual.
  - Protección contra ataques de fuerza bruta mediante límites de intentos y bloqueo temporal.
  - Middleware de autorización basado en roles (`user`, `agent`, `admin`) para proteger rutas sensibles.
  - Cifrado de datos en tránsito (TLS/HTTPS) y en almacenamiento (hashing con bcrypt).
  - Posible integración futura con proveedores de identidad (OAuth 2.0: Google, Facebook).
- **Valor que aporta:**  
  Garantiza la seguridad, privacidad y control de acceso sobre la información sensible del usuario y las operaciones realizadas dentro de la plataforma.

---

### **1.3. Diseño y experiencia de usuario:**
# Flujos de Usuario Detallados – Zonmatch
Diseñados bajo principios de UX centrado en el usuario, accesibilidad y eficiencia. Cada flujo representa la experiencia ideal para web y móvil.

---

## 1.3.1. Flujo de Onboarding (Registro + Configuración Inicial)

### Objetivo:
Capturar el perfil del usuario e intenciones desde el primer uso.

### 1.3.1.1. Pantalla: Registro / Login (con manejo de seguridad)
**Componentes:**
- Tabs: [Iniciar sesión] | [Crear cuenta]
- Inputs:
  - Correo electrónico
  - Contraseña (con opción de mostrar/ocultar)
- Selector de rol al registrarse: [Buscador] | [Publicador]
- Botón: "Continuar"
- Enlace: "¿Olvidaste tu contraseña?"

**Interacciones:**
1. El usuario accede a la pantalla de login o registro.
2. En modo "Crear cuenta":
   - Completa datos y define su tipo de usuario.
   - Se almacena la contraseña con hashing (bcrypt).
   - El backend asigna el rol correspondiente y genera un token JWT al autenticarse.
3. En modo "Iniciar sesión":
   - El sistema valida las credenciales ingresadas.
   - Si son correctas:
     - Se genera un JWT con el rol del usuario.
     - Se almacena como cookie segura (`HttpOnly`, `Secure`).
     - Se redirige al dashboard que corresponda (`/panel`, `/explorar`, etc.).
   - Si son incorrectas:
     - Se incrementa el contador de intentos.
     - Tras 5 fallos, se bloquea el acceso temporalmente (con mensaje informativo).
4. Si el usuario hace clic en "¿Olvidaste tu contraseña?":
   - Se solicita su correo electrónico.
   - Se genera un token temporal con expiración de 15 minutos.
   - Se envía un correo con un enlace de recuperación.
   - Al hacer clic, accede a un formulario para definir una nueva contraseña.
   - Se actualiza la contraseña en el backend con un nuevo hash seguro.

**Seguridad Aplicada:**
- Contraseñas encriptadas con bcrypt.
- Prevención de ataques de fuerza bruta (limitación de intentos).
- Token JWT con control de expiración.
- Protección por rol: buscador, publicador, administrador.
- HTTPS obligatorio en todos los endpoints de autenticación.
- Cookie `HttpOnly` y `Secure` para evitar accesos vía JS.
- Enlace de recuperación con token temporal no reutilizable.

![Flujo de Autenticación](./docs/flujos-usuario/diagramas/Login-Registro.png)

@startuml
start

:Usuario accede a pantalla de login;
:Ingresa correo y contraseña;

if (¿Credenciales válidas?) then (Sí)
:Validar hash (bcrypt);
:Generar token JWT con rol;
:Establecer cookie segura;
:Redirigir al panel correspondiente;
else (No)
:Incrementar contador de intentos;
if (¿Excedió el límite?) then (Sí)
    :Bloquear acceso temporalmente;
else (No)
    :Mostrar mensaje de error;
endif
endif

:¿Usuario olvidó contraseña?;
if (Sí) then
:Solicitar correo electrónico;
:Generar token temporal con expiración;
:Enviar enlace de recuperación;
:Usuario accede al enlace;
:Ingresa nueva contraseña;
:Actualizar contraseña cifrada;
endif

stop
@enduml

---

### 1.3.1.2. Pantalla: Configuración Inicial (para buscadores)
**Paso 1:** Tipo de propiedad + operación  
**Paso 2:** Rango de precio  
**Paso 3:** Amenidades prioritarias (checkboxes)  
**Paso 4:** Dibujo de zona de interés (mapa con herramienta de polígono)  
**Paso 5:** Confirmación del perfil

**Sistema de matching:** Crea el perfil base para el sistema de coincidencias automáticas basado en reglas.

![Flujo de Onboarding](./docs/flujos-usuario/diagramas/Onboarding.png)

@startuml
start
:Mostrar pantalla de bienvenida;
if (¿Nuevo usuario?) then (Sí)
  :Mostrar formulario de registro;
  :Seleccionar tipo de usuario;
  if (¿Buscador?) then (Sí)
    :Mostrar wizard de configuración:
    :1. Tipo de propiedad;
    :2. Rango de precio;
    :3. Amenidades deseadas;
    :4. Zona de interés (polígono en mapa);
    :Guardar perfil;
  else (Publicador)
    :Redirigir a panel de publicaciones;
  endif
  :Redirigir al dashboard;
else (No)
  :Mostrar login;
  :Redirigir al dashboard;
endif
stop
@enduml

---

## 1.3.2. Flujo de Búsqueda de Propiedades

### Objetivo:
Permitir al usuario encontrar propiedades relevantes rápida y precisamente.

### 1.3.2.1. Pantalla: Buscador Principal (Home)
**Componentes:**
- Filtros rápidos en el encabezado
- CTA: "Ver propiedades en el mapa"

---

### 1.3.2.2. Pantalla: Búsqueda Avanzada + Mapa
**Componentes:**
- Mapa interactivo con opción de dibujar zona
- Filtros adicionales (habitaciones, amenidades, tipo)
- Botón: "Guardar esta búsqueda"

**Resultados:**
- Cards con nivel de match (%) y acciones rápidas

**Sistema de matching:**
- Ordenamiento por relevancia basado en algoritmos geográficos
- Sugerencias si no hay resultados exactos usando criterios ponderados

![Flujo de Búsqueda](./docs/flujos-usuario/diagramas/Busqueda.png)

@startuml
start
:Mostrar buscador principal;
:Aplicar filtros rápidos;
:Ir a pantalla de mapa;
:Mostrar filtros avanzados;
:Usuario dibuja polígono;
:Aplicar todos los filtros;
:Mostrar propiedades coincidentes;
if (¿Guardar búsqueda?) then (Sí)
  :Guardar configuración de búsqueda;
endif
stop
@enduml

---

## 1.3.3. Flujo de Coincidencias y Notificaciones Inteligentes

### Objetivo:
Alertar automáticamente de oportunidades relevantes.

### 1.3.3.1. Match Automático (directo)
- Disparador: propiedad coincide con filtros del usuario
- Visualización: modal flotante + listado en dashboard

### 1.3.3.2. Match Inverso
- Disparador: búsqueda activa coincide con una nueva publicación
- Para el publicador: vista con detalles del perfil del buscador

![Flujo de Coincidencias](./docs/flujos-usuario/diagramas/Match.png)

@startuml
start
partition "Back-end" {
  :Publicación nueva o filtros actualizados;
  if (¿Coincide con búsqueda activa?) then (Sí)
    :Generar match;
    :Notificar a buscador y/o publicador;
  endif
}
partition "Frontend" {
  :Usuario visualiza match;
  :Explora la propiedad sugerida;
}
stop
@enduml

---

## 1.3.4. Flujo de Visualización de Propiedad

### Objetivo:
Presentar la propiedad clara y atractivamente.

### 1.3.4.1. Pantalla: Detalle de Inmueble
**Componentes:**
- Galería de imágenes
- Información estructurada
- Mapa con ubicación
- Botones: [Guardar], [Comparar], [Contactar]

**Sistema de matching:**
- Propiedades similares al final del detalle basadas en algoritmos de proximidad geográfica

![Flujo de Visualización](./docs/flujos-usuario/diagramas/Visualizacion.png)

@startuml
start
:Mostrar tarjeta de propiedad;
:Usuario hace clic en "ver detalle";
:Mostrar ficha completa (galería + info + mapa);
:Mostrar botones de acción;

if (¿Guardar propiedad?) then (Sí)
  :Agregar a favoritos;
else (No)
endif

if (¿Comparar propiedad?) then (Sí)
  :Agregar al comparador;
else (No)
endif

if (¿Contactar agente?) then (Sí)
  :Redirigir a chat interno;
else (No)
endif

stop
@enduml

---

## 1.3.5. Flujo de Contacto y Chat

### Objetivo:
Facilitar la comunicación entre buscadores y publicadores, ofreciendo flexibilidad al usuario para elegir el canal de contacto más conveniente.

### 1.3.5.1. Chat Interno (In-App Messaging)

### Objetivo:
Mantener conversaciones dentro del entorno seguro de Zonmatch, vinculadas a una propiedad específica.

### 1.3.5.1.1. Pantalla: Chat In-App

**Componentes:**
- Lista de conversaciones previas (ordenadas por fecha)
- Vista activa del chat con:
  - Nombre y rol del interlocutor
  - Nombre + imagen de la propiedad asociada
  - Estado (en línea / última conexión)
- Zona de mensajes:
  - Campo de texto
  - Botón de envío
  - Adjuntos (opcional)
- Botón "Volver" o navegación lateral en escritorio

**Interacciones:**
1. El usuario presiona "Contactar" desde la propiedad.
2. Se abre un nuevo hilo o se continúa uno existente.
3. La conversación queda registrada y accesible desde la bandeja "Mensajes".
4. Mensajes se muestran con etiquetas de hora y estado ("leído", "entregado").

**Notificaciones:**
- Badge sobre el ícono de mensajes.
- (Opcional) Notificaciones push habilitadas.

**IA (futuro):**
- Sugerencias de respuestas rápidas.
- Alertas para seguimiento si no hay respuesta en X horas.

**Privacidad:**
- Datos protegidos; sin visibilidad de número telefónico.
- Capacidad de reportar o bloquear (futuro).

**Diseño Responsive:**
- Móvil: pantalla completa, navegación por swipe.
- Escritorio: vista dividida (sidebar + chat).

---

### 1.3.5.2 Contacto Externo vía WhatsApp

### Objetivo:
Ofrecer una vía directa de contacto fuera de la plataforma, aprovechando una app de mensajería ampliamente utilizada.

### 1.3.5.2.1. Pantalla: Modal de Contacto

**Componentes:**
- Modal o pantalla con selección de canal:
  - [Iniciar Chat Interno]
  - [Contactar por WhatsApp]
- Si se elige WhatsApp:
  - Redirección inmediata vía `wa.me`
  - Mensaje prellenado con datos relevantes:
    ```
    https://wa.me/52XXXXXXXXXX?text=Hola,%20vi%20tu%20propiedad%20en%20Zonmatch%20y%20me%20interesa%20más%20información
    ```

**Interacciones:**
1. El usuario presiona "Contactar".
2. Elige WhatsApp como canal.
3. El sistema abre la app (en móvil) o WhatsApp Web (en desktop).
4. La conversación continúa fuera del entorno Zonmatch.

**Consideraciones Técnicas:**
- Se registra solo el evento de salida (no los mensajes).
- El número del agente solo se muestra si ha activado la opción.

**Privacidad:**
- Se informa al usuario que este canal es externo.
- El número de teléfono se gestiona conforme a las preferencias del agente.

**Diseño Responsive:**
- En móvil, la app de WhatsApp se abre directamente.
- En escritorio, se abre WhatsApp Web en nueva pestaña.

---

### Interacciones del Usuario:
1. El usuario accede a la ficha de la propiedad.
2. Presiona el botón "Contactar".
3. Selecciona el canal preferido (chat interno o WhatsApp).
4. Se inicia la conversación en el medio elegido.

---

### IA en la Interfaz:
- Registro del canal de contacto utilizado por el usuario para estadísticas de conversión.
- (Futuro) Sugerencias automáticas de respuesta para agentes, según historial.

---

### 1.3.5.3. Pantalla: Chat Interno
**Componentes:**
- Lista de conversaciones
- Vista del mensaje + historial
- Campo de texto, botón de envío, y posibilidad de adjuntar archivos
---Diseño Responsive:
- En móvil: la opción de WhatsApp abre la app directamente (si está instalada).
- En escritorio: se abre WhatsApp Web.
- Layout mobile-first para chat interno: pantalla completa + botón de retroceso.

---

### Consideraciones de Privacidad:
- El número telefónico del agente solo será visible si habilitó la opción de contacto externo.
- Se informa al usuario que WhatsApp es un canal externo a Zonmatch, sin cifrado controlado por la plataforma.

![Flujo de Chat](./docs/flujos-usuario/diagramas/Chat.png)

@startuml
start
:Usuario accede a ficha de propiedad;
:Presiona botón "Contactar";

if (¿Selecciona canal de contacto?) then (Chat Interno)
  :Verifica si existe conversación previa;
  if (¿Existe?) then (Sí)
    :Mostrar conversación anterior;
  else (No)
    :Crear nuevo hilo de conversación;
    :Enviar mensaje inicial con contexto;
  endif
  :Intercambio de mensajes en tiempo real;
  :Notificaciones en bandeja de entrada;
else (WhatsApp)
  if (¿Agente tiene WhatsApp habilitado?) then (Sí)
    :Generar enlace con mensaje prellenado;
    :Redirigir a WhatsApp Web o App;
  else (No)
    :Mostrar mensaje: "Canal no disponible";
  endif
endif

stop
@enduml

---

## 1.4. Flujo del Panel de Control (Publicadores)

### Objetivo:
Gestionar publicaciones y evaluar rendimiento.

### 1.4.1. Pantalla: Dashboard de Publicaciones
**Componentes:**
- Cards con KPIs: vistas, matches, contactos
- Gráficos de rendimiento por zona
- Acciones: Editar / Archivar / Eliminar

**Sistema de matching:**
- Alertas de búsqueda activa coincidente basadas en algoritmos geográficos
- Recomendaciones para optimizar publicaciones usando criterios ponderados

![Flujo del Panel de Control](./docs/flujos-usuario/diagramas/Panel%20de%20control.png)

@startuml
start
:Mostrar dashboard;
:Listar propiedades del publicador;
repeat
  :Mostrar métricas por propiedad;
  :Permitir editar / archivar / eliminar;
repeat while (Más propiedades)
:Mostrar alertas de IA (matches inversos, bajo rendimiento);
:Mostrar sugerencias de mejora;
stop
@enduml

---

## 1.5. Flujo de Favoritos y Comparación

### Objetivo:
Organizar decisiones del usuario de forma clara.

### 1.5.1. Pantalla: Mis Favoritos
**Componentes:**
- Lista de propiedades guardadas
- Modo de comparación en tabla
- Botón: "¿Aún disponible?" para seguimiento

![Flujo de Favoritos](./docs/flujos-usuario/diagramas/Favoritos.png)

@startuml
start
:Usuario guarda propiedades;
:Accede a sección "Favoritos";
:Selecciona 2 o más para comparar;
:Mostrar tabla comparativa;
if (¿Enviar contacto?) then (Sí)
  :Enviar mensaje a publicador;
endif
stop
@enduml

---

## 1.6. Adaptación para Dispositivos Móviles

### Principios clave:
- Layout adaptativo con navegación inferior persistente
- Inputs táctiles y grandes
- Persistencia de filtros entre sesiones y dispositivos

---

## 1.7. Principios de Diseño Centrado en el Usuario

| Principio           | Aplicación en Zonmatch                                            |
|---------------------|-----------------------------------------------------------------|
| **Usabilidad**      | Flujo guiado, botones claros, feedback inmediato                |
| **Accesibilidad**   | Alto contraste, navegación por teclado, inputs legibles         |
| **Jerarquía Visual**| Elementos clave destacados: filtros, CTA, mapa                  |
| **Consistencia**    | Componentes reutilizables, navegación coherente                 |
| **Interactividad**  | Respuestas visuales lógicas a cada acción del usuario           |

---

### **1.8. Instrucciones de instalación:**

#### **Prerrequisitos del Sistema**

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 18.x o superior
- **npm** 8.x o superior
- **MySQL** 8.0 o superior
- **Redis** 6.x o superior
- **Git** para clonar el repositorio

#### **Instalación Completa del Proyecto**

##### **1. Clonar el Repositorio**
```bash
git clone https://github.com/tu-usuario/zonmatch.git
cd zonmatch
```

##### **2. Configurar Base de Datos**

**MySQL:**
```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE zonmatch;
CREATE USER 'zonmatch_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON zonmatch.* TO 'zonmatch_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**Redis:**
```bash
# Verificar que Redis esté ejecutándose
redis-cli ping
# Debería responder: PONG
```

##### **3. Configurar Backend**

```bash
# Navegar al directorio backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
```

**Editar archivo `.env` del backend:**
```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zonmatch
DB_USER=zonmatch_user
DB_PASSWORD=tu_password_seguro

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro_minimo_32_caracteres
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Servidor
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=10
```

**Ejecutar migraciones y seeders:**
```bash
# Ejecutar migraciones
npm run migrate

# Ejecutar seeders (datos de prueba)
npm run seed

# Verificar estado de migraciones
npx sequelize-cli db:migrate:status
```

**Levantar servidor backend:**
```bash
# Desarrollo con nodemon
npm run dev

# O en producción
npm run build
npm start
```

##### **4. Configurar Frontend**

```bash
# Navegar al directorio frontend (en nueva terminal)
cd frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env
```

**Editar archivo `.env` del frontend:**
```env
# Backend API
VITE_API_URL=http://localhost:3001

# Aplicación
VITE_APP_NAME=ZonMatch
VITE_APP_VERSION=1.0.0

# Entorno
VITE_NODE_ENV=development

# Características
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

**Levantar servidor frontend:**
```bash
# Desarrollo con hot reload
npm run dev

# O build para producción
npm run build
npm run preview
```

##### **5. Verificar Instalación**

**Backend (http://localhost:3001):**
```bash
# Health check
curl http://localhost:3001/health

# Debería responder:
# {
#   "status": "OK",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "version": "1.0.0"
# }
```

**Frontend (http://localhost:3000):**
- Abrir navegador en http://localhost:3000
- Verificar que la página principal cargue correctamente
- Verificar que las propiedades se muestren

#### **Comandos de Desarrollo**

##### **Backend:**
```bash
# Desarrollo con nodemon
npm run dev

# Build del proyecto
npm run build

# Ejecutar tests
npm test

# Linting
npm run lint

# Reset completo de base de datos
npm run db:reset
```

##### **Frontend:**
```bash
# Desarrollo con hot reload
npm run dev

# Build optimizado
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
npm run lint:fix

# Verificar tipos TypeScript
npm run type-check
```

#### **Gestión de Base de Datos**

##### **Migraciones:**
```bash
# Crear nueva migración
npx sequelize-cli migration:generate --name nombre-migracion

# Ejecutar migraciones
npm run migrate

# Revertir última migración
npx sequelize-cli db:migrate:undo

# Ver estado de migraciones
npx sequelize-cli db:migrate:status
```

##### **Seeders:**
```bash
# Crear nuevo seeder
npx sequelize-cli seed:generate --name nombre-seeder

# Ejecutar seeders
npm run seed

# Ejecutar seeder específico
npx sequelize-cli db:seed --seed XXXX-nombre.js
```

##### **Reset completo:**
```bash
# Reset completo de base de datos
npm run db:reset
```

#### **Instalación con Docker (Opcional)**

##### **Backend:**
```bash
cd backend
docker build -t zonmatch-backend .
docker run -p 3001:3001 zonmatch-backend
```

##### **Frontend:**
```bash
cd frontend
docker build -t zonmatch-frontend .
docker run -p 3000:3000 zonmatch-frontend
```

#### **Troubleshooting**

##### **Problemas Comunes:**

1. **Error de conexión a MySQL:**
   ```bash
   # Verificar que MySQL esté ejecutándose
   sudo service mysql status
   
   # Verificar credenciales en .env
   cat .env | grep DB_
   ```

2. **Error de conexión a Redis:**
   ```bash
   # Verificar que Redis esté ejecutándose
   redis-cli ping
   
   # Debería responder: PONG
   ```

3. **Errores de migración:**
   ```bash
   # Resetear base de datos
   npm run db:reset
   
   # Verificar estado de migraciones
   npx sequelize-cli db:migrate:status
   ```

4. **Problemas de permisos:**
   ```bash
   # Verificar permisos de archivos
   ls -la
   
   # Ajustar permisos si es necesario
   chmod 755 src/
   ```

5. **Error de conexión frontend-backend:**
   - Verificar que el backend esté corriendo en puerto 3001
   - Revisar la variable `VITE_API_URL` en `.env` del frontend
   - Verificar CORS en el backend

##### **Checklist de Verificación:**
- [ ] Variables de entorno configuradas correctamente
- [ ] MySQL ejecutándose y accesible
- [ ] Redis ejecutándose y accesible
- [ ] Migraciones ejecutadas sin errores
- [ ] Seeders ejecutados correctamente
- [ ] Puerto 3001 disponible para backend
- [ ] Puerto 3000 disponible para frontend
- [ ] Backend responde en http://localhost:3001/health
- [ ] Frontend carga en http://localhost:3000

#### **URLs de Acceso**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **Base de Datos**: MySQL en localhost:3306
- **Cache**: Redis en localhost:6379

#### **Próximos Pasos**

Una vez que la instalación esté completa:

1. **Crear cuenta de usuario** en http://localhost:3000/register
2. **Explorar propiedades** en la página principal
3. **Crear una propiedad** si eres agente o admin
4. **Probar funcionalidades** de favoritos y gestión
5. **Revisar logs** en ambas consolas para verificar funcionamiento

¡El proyecto ZonMatch estará listo para desarrollo y testing!

---

## 1.9. Casos de Uso Principales del Sistema

### 1.9.1. Registrarse y configurar perfil
**Actor:** Usuario (Buscador o Publicador)  
**Descripción:** Permite a un nuevo usuario registrarse en la plataforma y configurar su perfil según el rol.  
**Precondiciones:** El usuario no debe tener una cuenta activa.  
**Flujo principal:**
1. El usuario accede a la página de inicio.
2. Selecciona "Crear cuenta".
3. Ingresa correo, contraseña y selecciona su rol (buscador o publicador).
4. El sistema valida y crea la cuenta.
5. Si es buscador, se solicitan preferencias iniciales (tipo de propiedad, zona, filtros).
6. Se redirige al dashboard correspondiente.

![Registrarse y configurar perfil](./docs/casos-uso/diagramas/Registro.png)

@startuml
left to right direction
actor Usuario
rectangle Registro {
  (Registrarse) as R
  (Iniciar sesión) as L
  (Configurar preferencias de búsqueda) as P
}
Usuario --> R
Usuario --> L
L --> P : Si es buscador
@enduml

---

### 1.9.2. Publicar una propiedad *(Core)*
**Actor:** Publicador (Agente, Inmobiliaria, Constructora)  
**Descripción:** El publicador registra un nuevo inmueble en la plataforma.  
**Precondiciones:** El usuario debe estar autenticado como publicador.  
**Flujo principal:**
1. El publicador accede a su panel de propiedades.
2. Hace clic en "Publicar nueva propiedad".
3. Ingresa información: tipo, precio, descripción, amenidades, ubicación, imágenes.
4. El sistema valida y guarda los datos.
5. Se activa el motor de coincidencias inversas.
6. La propiedad queda visible en el mapa para buscadores compatibles.

![Publicar una propiedad](./docs/casos-uso/diagramas/Publicacion.png)

@startuml
actor Publicador
rectangle "Gestión de Propiedades" {
  (Iniciar publicación)
  (Cargar detalles del inmueble)
  (Asignar ubicación en mapa)
  (Subir imágenes)
  (Publicar propiedad)
}
Publicador --> (Iniciar publicación)
(Iniciar publicación) --> (Cargar detalles del inmueble)
(Cargar detalles del inmueble) --> (Asignar ubicación en mapa)
(Asignar ubicación en mapa) --> (Subir imágenes)
(Subir imágenes) --> (Publicar propiedad)
@enduml

---

### 1.9.3. Buscar propiedades en el mapa *(Core)*
**Actor:** Buscador  
**Descripción:** El usuario explora propiedades según filtros y zonas de interés.  
**Precondiciones:** Ninguna (puede ejecutarse con o sin sesión iniciada).  
**Flujo principal:**
1. El usuario accede a la vista "Explorar".
2. Aplica filtros: tipo, precio, amenidades, etc.
3. Dibuja una o varias zonas en el mapa.
4. El sistema devuelve propiedades compatibles visualmente.
5. El usuario puede guardar la búsqueda o seleccionar una propiedad para ver más.

![Buscar propiedades en el mapa](./docs/casos-uso/diagramas/Busqueda.png)

@startuml
actor Buscador
rectangle "Exploración de Propiedades" {
  (Aplicar filtros)
  (Dibujar zona de interés)
  (Ver resultados en mapa)
  (Guardar búsqueda)
}
Buscador --> (Aplicar filtros)
Buscador --> (Dibujar zona de interés)
Buscador --> (Ver resultados en mapa)
Buscador --> (Guardar búsqueda)
@enduml

---

### 1.9.4. Generar coincidencias automáticas *(Core)*
**Actor:** Sistema  
**Descripción:** Detecta automáticamente coincidencias entre búsquedas activas y propiedades publicadas.  
**Precondiciones:** Debe existir al menos una propiedad y una búsqueda activa.  
**Flujo principal:**
1. Se publica una nueva propiedad o se actualiza una búsqueda.
2. El sistema ejecuta el algoritmo de coincidencia (>= 50% de match + intersección geográfica).
3. Si hay coincidencias:
   - Se registra un match.
   - Se notifica a las partes involucradas (buscador o publicador).
4. Se almacena el resultado para historial y visualización futura.

![Generar coincidencias automáticas](./docs/casos-uso/diagramas/Match.png)

@startuml
actor Sistema
actor Usuario
rectangle "Notificaciones Inteligentes" {
  (Detectar coincidencia)
  (Generar alerta)
  Usuario <-- (Generar alerta)
}
Sistema --> (Detectar coincidencia)
(Detectar coincidencia) --> (Generar alerta)
@enduml

---

### 1.9.5. Contactar al publicador *(Core)*
**Actor:** Buscador  
**Descripción:** El usuario interesado inicia una conversación con el agente o publicador, por chat o WhatsApp.  
**Precondiciones:** El usuario debe haber accedido a la ficha de una propiedad.  
**Flujo principal:**
1. El buscador selecciona una propiedad de interés.
2. Hace clic en "Contactar".
3. El sistema muestra dos opciones: Chat interno o WhatsApp.
4. Si elige chat:
   - Se abre un canal de conversación persistente.
   - El usuario envía su primer mensaje.
5. Si elige WhatsApp:
   - Se redirige a `wa.me` con un mensaje predefinido.
   - El agente recibe la notificación en su app de WhatsApp.

![Contactar al publicador](./docs/casos-uso/diagramas/Chat.png)

@startuml
actor Buscador
rectangle "Comunicación" {
  (Ver propiedad)
  (Seleccionar canal de contacto)
  (Iniciar chat interno)
  (Redirigir a WhatsApp)
}
Buscador --> (Ver propiedad)
(Ver propiedad) --> (Seleccionar canal de contacto)
(Seleccionar canal de contacto) --> (Iniciar chat interno)
(Seleccionar canal de contacto) --> (Redirigir a WhatsApp)
@enduml

---

### 1.9.6. Administrar mis propiedades
**Actor:** Publicador  
**Descripción:** Permite a los publicadores gestionar su catálogo de inmuebles.  
**Precondiciones:** El usuario debe estar autenticado como publicador.  
**Flujo principal:**
1. El publicador accede al panel "Mis propiedades".
2. Visualiza el listado de publicaciones activas e inactivas.
3. Puede:
   - Editar datos de una propiedad.
   - Eliminar o desactivar una publicación.
   - Consultar métricas (vistas, contactos).
4. El sistema actualiza la base de datos y aplica validaciones.

![Administrar mis propiedades](./docs/casos-uso/diagramas/Administracion.png)

@startuml
actor Publicador
rectangle "Panel de Publicaciones" {
  (Ver mis propiedades)
  (Editar propiedad)
  (Eliminar propiedad)
  (Ver métricas)
}
Publicador --> (Ver mis propiedades)
(Ver mis propiedades) --> (Editar propiedad)
(Ver mis propiedades) --> (Eliminar propiedad)
(Ver mis propiedades) --> (Ver métricas)
@enduml

---

### 1.9.7. Guardar y comparar propiedades favoritas
**Actor:** Buscador  
**Descripción:** El usuario puede guardar propiedades y compararlas en su panel de favoritos.  
**Precondiciones:** El usuario debe tener una cuenta activa.  
**Flujo principal:**
1. Durante la exploración, el usuario hace clic en "Guardar".
2. La propiedad se añade a la lista de favoritos.
3. Desde su panel, el usuario accede a "Favoritos".
4. Selecciona múltiples propiedades y hace clic en "Comparar".
5. El sistema presenta una tabla comparativa de atributos.

![Guardar y comparar propiedades favoritas](./docs/casos-uso/diagramas/Favoritos.png)

@startuml
actor Buscador
rectangle "Gestión de Favoritos" {
  (Guardar propiedad)
  (Acceder a favoritos)
  (Comparar propiedades)
}
Buscador --> (Guardar propiedad)
Buscador --> (Acceder a favoritos)
(Acceder a favoritos) --> (Comparar propiedades)
@enduml

---

### 1.9.8. Recuperar contraseña
**Actor:** Usuario  
**Descripción:** Permite recuperar el acceso si el usuario olvida su contraseña.  
**Precondiciones:** El correo electrónico debe estar registrado.  
**Flujo principal:**
1. El usuario hace clic en "¿Olvidaste tu contraseña?".
2. Ingresa su correo.
3. El sistema genera un token de recuperación válido por 15 minutos.
4. Se envía un correo con un enlace único.
5. El usuario accede al enlace y define una nueva contraseña.
6. El sistema actualiza el hash en la base de datos.

![Recuperar contraseña](./docs/casos-uso/diagramas/Seguridad.png)

@startuml
actor Usuario
rectangle "Seguridad y Acceso" {
  (Solicitar recuperación)
  (Generar token temporal)
  (Enviar email con enlace)
  (Validar token)
  (Actualizar contraseña)
}
Usuario --> (Solicitar recuperación)
(Solicitar recuperación) --> (Generar token temporal)
(Generar token temporal) --> (Enviar email con enlace)
(Usuario) --> (Validar token)
(Validar token) --> (Actualizar contraseña)
@enduml

---

### 1.9.9. Recibir notificaciones de coincidencias
**Actor:** Usuario (buscador o publicador)  
**Descripción:** El sistema informa sobre nuevos matches detectados automáticamente.  
**Precondiciones:** El usuario debe tener al menos una búsqueda o propiedad activa.  
**Flujo principal:**
1. Se detecta un nuevo match por el sistema.
2. Se crea un registro de coincidencia.
3. Se genera una notificación para el usuario.
4. La notificación aparece en el panel o se envía por correo/app.
5. El usuario puede acceder al detalle del match desde su historial.

![Recibir notificaciones de coincidencias](./docs/casos-uso/diagramas/Notificacion.png)

@startuml
actor Sistema
actor Usuario
rectangle "Notificaciones Inteligentes" {
  (Detectar coincidencia)
  (Generar alerta)
  Usuario <-- (Generar alerta)
}
Sistema --> (Detectar coincidencia)
(Detectar coincidencia) --> (Generar alerta)
@enduml

---

### 1.9.10. Cerrar sesión y limpiar sesión segura
**Actor:** Usuario  
**Descripción:** El usuario finaliza su sesión cerrando el acceso a su cuenta.  
**Precondiciones:** El usuario debe haber iniciado sesión previamente.  
**Flujo principal:**
1. El usuario accede al menú de usuario.
2. Hace clic en "Cerrar sesión".
3. El sistema invalida el token JWT activo.
4. El usuario es redirigido a la página de login.
5. Se eliminan cookies seguras y se cierra el contexto de sesión.

![Cerrar sesión y limpiar sesión segura](./docs/casos-uso/diagramas/Limpieza.png)

@startuml
actor Usuario
rectangle "Autenticación" {
  (Cerrar sesión)
  (Invalidar token)
  (Redirigir a login)
}
Usuario --> (Cerrar sesión)
(Cerrar sesión) --> (Invalidar token)
(Invalidar token) --> (Redirigir a login)
@enduml

---

## 2. Arquitectura del Sistema

### **2.1. Diagrama de arquitectura:**
El sistema sigue una arquitectura MVC (Modelo-Vista-Controlador) con una capa de servicios para la lógica de negocio y una capa de datos para la persistencia.

![Arquitectura del Sistema](./docs/architecture/Arquitectura.png)

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React.js App - Web Only]
    end
    
    subgraph "Backend MVC"
        B[Express.js Server]
        
        subgraph "Controllers Layer"
            C1[UserController]
            C2[PropertyController]
            C3[MatchingController]
            C4[NotificationController]
            C5[ChatController]
        end
        
        subgraph "Models Layer"
            M1[User Model]
            M2[Property Model]
            M3[Matching Model]
            M4[Notification Model]
            M5[Chat Model]
        end
        
        subgraph "Services Layer"
            S1[UserService]
            S2[PropertyService]
            S3[MatchingService]
            S4[NotificationService]
            S5[ChatService]
        end
    end
    
    subgraph "Matchmaking Module"
        I[Sistema de Utilidades Geográficas]
        J[Matching Algorithm]
    end
    
    subgraph "External Services"
        K[Google Maps API]
        L[Firebase Push]
        M[WhatsApp Business API]
    end
    
    subgraph "Data Layer"
        N[MySQL Database]
        O[Redis Cache]
    end
    
    A --> B
    B --> C1
    B --> C2
    B --> C3
    B --> C4
    B --> C5
    
    C1 --> S1
    C2 --> S2
    C3 --> S3
    C4 --> S4
    C5 --> S5
    
    S1 --> M1
    S2 --> M2
    S3 --> M3
    S4 --> M4
    S5 --> M5
    
    S3 --> I
    S3 --> J
    
    S4 --> L
    S4 --> M
    
    S2 --> K
    
    M1 --> N
    M2 --> N
    M3 --> N
    M4 --> N
    M5 --> N
    
    N --> O
```

## 2.2. Tecnologías por Componente

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **Frontend** | React.js + TypeScript | Componentes reutilizables, tipado fuerte, PWA capabilities |
| **Backend Framework** | Express.js | Framework minimalista y flexible para Node.js |
| **Patrón Backend** | MVC (Model-View-Controller) | Separación clara de responsabilidades |
| **Base de Datos** | MySQL | ACID, transaccional, maduro y confiable |
| **Cache** | Redis | Sesiones, datos temporales, alta velocidad |
| **Sistema de Matching** | Algoritmos Geográficos | Matching inteligente basado en reglas geográficas |
| **Mapas** | Google Maps API | Mejor cobertura y precisión para México |
| **Notificaciones** | Firebase + WhatsApp Business | Push notifications + mensajería externa |
| **Autenticación** | JWT + OAuth2 | Estándar seguro y flexible |
| **Hosting** | AWS EC2 + S3 | Escalabilidad y redundancia |
| **CI/CD** | GitHub Actions | Integración continua y despliegue automático |

## 2.3. Patrón Arquitectónico: MVC Monolítico Modular

**Justificación de la elección:**
- **Escalabilidad moderada**: Miles de usuarios no requieren microservicios complejos
- **Presupuesto limitado**: Arquitectura monolítica reduce costos de infraestructura
- **Separación de dominios**: Facilita mantenimiento y evolución independiente
- **Patrón MVC**: Estructura clara y probada para aplicaciones web

**Beneficios principales:**
- Menor latencia en comunicaciones internas
- Despliegue simplificado
- Debugging más sencillo
- Menor overhead de infraestructura
- Separación clara de responsabilidades por capa

**Sacrificios o déficits:**
- Acoplamiento entre módulos
- Escalabilidad horizontal limitada
- Posible cuello de botella en un solo servicio
- Curva de aprendizaje para el patrón MVC 


### **2.4. Descripción de componentes principales:**

#### Índice de Componentes Principales

1. **[Frontend (Cliente)](#241-frontend-cliente)**
   - [React.js Application](#2411-reactjs-application)
   - [Componentes Especializados](#2412-componentes-especializados)

2. **[Backend (Servidor de Negocio)](#242-backend-servidor-de-negocio)**
   - [Express.js Server](#2421-expressjs-server)
   - [Controladores (Controllers)](#2422-controladores-controllers)

3. **[Base de Datos](#243-base-de-datos)**
   - [MySQL Database](#2431-mysql-database)
   - [Redis Cache](#2432-redis-cache)

4. **[Sistema de Notificaciones](#244-sistema-de-notificaciones)**
   - [NotificationService](#2441-notificationservice)
   - [Canales de Notificación](#2442-canales-de-notificación)

5. **[Sistema de Matching Inteligente](#245-sistema-de-matching-inteligente)**
   - [MatchingService](#2451-matchingservice)
   - [Algoritmo de Matching](#2452-algoritmo-de-matching)

6. **[Servicios Externos / Integraciones](#246-servicios-externos--integraciones)**
   - [Google Maps API](#2461-google-maps-api)
   - [Sistema de Utilidades Geográficas](#2462-sistema-de-utilidades-geográficas)

7. **[Middleware y Seguridad](#247-middleware-y-seguridad)**
   - [Authentication Middleware](#2471-authentication-middleware)
   - [Security Middleware](#2472-security-middleware)

8. **[Infraestructura / Orquestación](#248-infraestructura--orquestación)**
   - [Servidor de Aplicación](#2481-servidor-de-aplicación)
   - [Monitoreo y Logging](#2482-monitoreo-y-logging)

---

## 2.4.1. Frontend (Cliente)

### **2.4.1.1. React.js Application**
**Propósito funcional:** Interfaz de usuario responsiva que permite a los usuarios interactuar con todas las funcionalidades de Zonmatch.

**Tecnología utilizada:**
- **Framework:** React.js 18+ con TypeScript
- **Estado global:** Redux Toolkit para gestión de estado
- **Routing:** React Router v6 para navegación SPA
- **UI Components:** Material-UI (MUI) para componentes base
- **Mapas:** React Google Maps para integración con Google Maps API
- **Formularios:** React Hook Form con validación Yup
- **HTTP Client:** Axios para comunicación con backend

**Comunicación e interacciones:**
- **APIs REST:** Comunicación síncrona con backend mediante endpoints RESTful
- **WebSocket:** Para notificaciones en tiempo real y chat interno
- **Local Storage:** Persistencia de preferencias de usuario y sesión
- **Service Workers:** Para funcionalidades PWA y cache offline

**Buenas prácticas aplicadas:**
- **Componentes funcionales:** Uso de hooks para estado y efectos
- **Separación de responsabilidades:** Componentes presentacionales vs contenedores
- **Lazy loading:** Carga diferida de componentes pesados
- **Error boundaries:** Manejo de errores por componentes
- **Responsive design:** Mobile-first approach

### **2.4.1.2. Componentes Especializados**

#### **Mapa Interactivo**
**Propósito:** Visualización y selección geográfica de propiedades
**Tecnología:** React Google Maps + Drawing Manager
**Interacciones:** Integración con Google Maps API para geolocalización y dibujo de polígonos

#### **Sistema de Filtros**
**Propósito:** Búsqueda avanzada con múltiples criterios
**Tecnología:** React Hook Form + Yup validation
**Interacciones:** Comunicación con PropertyService para búsquedas dinámicas

## 2.4.2. Backend (Servidor de Negocio)

### **2.4.2.1. Express.js Server**
**Propósito funcional:** Servidor principal que orquesta todas las operaciones de negocio y gestiona las peticiones HTTP.

**Tecnología utilizada:**
- **Framework:** Express.js 4.x
- **Middleware:** CORS, helmet, compression, morgan
- **Validación:** Joi para validación de esquemas
- **Autenticación:** Passport.js con estrategias JWT
- **Logging:** Winston para logging estructurado
- **Testing:** Jest + Supertest para testing de APIs

**Comunicación e interacciones:**
- **APIs REST:** Endpoints RESTful para todas las operaciones CRUD
- **WebSocket:** Socket.io para comunicación en tiempo real
- **Base de datos:** Sequelize ORM para operaciones de persistencia
- **Cache:** Redis para almacenamiento temporal y sesiones

**Buenas prácticas aplicadas:**
- **Patrón MVC:** Separación clara entre controladores, modelos y servicios
- **Middleware pattern:** Reutilización de lógica común
- **Error handling:** Manejo centralizado de errores
- **Rate limiting:** Protección contra ataques de fuerza bruta
- **CORS configuration:** Seguridad en comunicación cross-origin

### **2.4.2.2. Controladores (Controllers)**

#### **UserController**
**Propósito:** Gestión de autenticación, registro y perfiles de usuario
**Tecnología:** Express.js + JWT + bcrypt
**Interacciones:** 
- Comunicación con UserService para lógica de negocio
- Integración con Redis para sesiones
- Validación con Joi schemas

#### **PropertyController**
**Propósito:** CRUD de propiedades y búsquedas avanzadas
**Tecnología:** Express.js + Sequelize + Google Maps API
**Interacciones:**
- Comunicación con PropertyService
- Integración con Google Maps para validación de direcciones
- Filtros dinámicos con consultas SQL optimizadas

#### **MatchingController**
**Propósito:** Gestión de coincidencias automáticas y algoritmos de matching
**Tecnología:** Express.js + algoritmos geográficos + sistema de scoring basado en reglas
**Interacciones:**
- Comunicación con MatchingService
- Integración con utilidades geográficas para análisis de proximidad
- Notificaciones automáticas a usuarios

## 2.4.3. Base de Datos

### **2.4.3.1. MySQL Database**
**Propósito funcional:** Almacenamiento persistente de todos los datos del sistema con garantías ACID.

**Tecnología utilizada:**
- **SGBD:** MySQL 8.0
- **ORM:** Sequelize para mapeo objeto-relacional
- **Migraciones:** Sequelize CLI para versionado de esquema
- **Seeding:** Datos de prueba y configuración inicial
- **Backup:** mysqldump con encriptación

**Comunicación e interacciones:**
- **Conexión directa:** Sequelize ORM para operaciones CRUD
- **Transacciones:** Para operaciones que requieren consistencia
- **Índices:** Optimización de consultas frecuentes
- **Replicación:** Para alta disponibilidad (futuro)

**Buenas prácticas aplicadas:**
- **Normalización:** Estructura normalizada para evitar redundancias
- **Índices estratégicos:** Para consultas de búsqueda y filtros
- **Constraints:** Restricciones de integridad referencial
- **Prepared statements:** Prevención de SQL injection
- **Connection pooling:** Optimización de conexiones

### **2.4.3.2. Redis Cache**
**Propósito funcional:** Almacenamiento temporal de datos frecuentemente accedidos y sesiones de usuario.

**Tecnología utilizada:**
- **Cache:** Redis 6.x
- **Cliente:** node-redis para Node.js
- **Serialización:** JSON para objetos complejos
- **TTL:** Expiración automática de datos

**Comunicación e interacciones:**
- **Sesiones:** Almacenamiento de sesiones de usuario
- **Cache de consultas:** Resultados de búsquedas frecuentes
- **Rate limiting:** Control de intentos de acceso
- **Notificaciones:** Cola temporal de notificaciones

## 2.4.4. Sistema de Notificaciones

### **2.4.4.1. NotificationService**
**Propósito funcional:** Gestión centralizada de todos los tipos de notificaciones del sistema.

**Tecnología utilizada:**
- **Framework:** Node.js con patrones de diseño
- **Firebase:** Firebase Cloud Messaging para push notifications
- **WhatsApp:** WhatsApp Business API para mensajería externa
- **Email:** Nodemailer para notificaciones por correo
- **WebSocket:** Socket.io para notificaciones en tiempo real

**Comunicación e interacciones:**
- **Eventos asíncronos:** Procesamiento de notificaciones en background
- **Colas de mensajes:** Redis para gestión de colas
- **APIs externas:** Integración con servicios de terceros
- **Base de datos:** Registro de historial de notificaciones

**Buenas prácticas aplicadas:**
- **Patrón Observer:** Suscripción a eventos de notificación
- **Retry logic:** Reintentos automáticos en caso de fallo
- **Rate limiting:** Control de frecuencia de notificaciones
- **Templates:** Plantillas reutilizables para diferentes tipos

### **2.4.4.2. Canales de Notificación**

#### **Push Notifications (Firebase)**
**Propósito:** Notificaciones instantáneas en navegador
**Tecnología:** Firebase Cloud Messaging
**Interacciones:** Service Workers en frontend para recepción

#### **WhatsApp Business API**
**Propósito:** Contacto directo entre usuarios y agentes
**Tecnología:** WhatsApp Business API + templates
**Interacciones:** Integración con sistema de chat interno

## 2.4.5. Sistema de Matching Inteligente

### **2.4.5.1. MatchingService**
**Propósito funcional:** Sistema de matching basado en reglas que genera coincidencias automáticas entre propiedades y buscadores utilizando algoritmos geográficos avanzados.

**Tecnología utilizada:**
- **Algoritmos Geográficos:** Ray Casting para polígonos, Haversine para distancias
- **Sistema de Scoring:** Criterios ponderados basados en reglas predefinidas
- **Utilidades Geográficas:** Cálculo de proximidad, validación de coordenadas
- **Geolocalización:** Cálculo de distancias y zonas de interés con precisión

**Comunicación e interacciones:**
- **Base de datos:** Consulta de propiedades y perfiles de usuario
- **Sistema de notificaciones:** Activación automática de alertas
- **Cache:** Almacenamiento de resultados de matching en Redis
- **Servicios geográficos:** Integración con Google Maps para validación

**Buenas prácticas aplicadas:**
- **Patrón Strategy:** Diferentes algoritmos de matching por tipo de usuario
- **Caching inteligente:** Resultados de matching en Redis
- **Validación robusta:** Verificación de coordenadas y polígonos
- **Métricas:** Tracking de efectividad de coincidencias

### **2.4.5.2. Algoritmo de Matching**
**Propósito:** Evaluación de compatibilidad entre propiedades y buscadores usando reglas geográficas y criterios ponderados
**Tecnología:** Algoritmos personalizados basados en reglas + utilidades geográficas
**Criterios de evaluación:**
- Precio (40% del peso)
- Ubicación geográfica (30% del peso) - incluye proximidad a polígonos
- Características de la propiedad (20% del peso)
- Preferencias del usuario (10% del peso)

**Algoritmos implementados:**
- **Ray Casting:** Verificación de puntos dentro de polígonos
- **Haversine:** Cálculo de distancias geográficas
- **Scoring Geográfico:** Puntuación basada en proximidad y zona
- **Validación de Coordenadas:** Verificación de latitud/longitud válidas

### **2.4.5.3. Ventajas del Sistema Basado en Reglas**
**Comparado con sistemas de IA tradicionales:**

**Ventajas:**
- **Transparencia:** Los criterios de matching son claros y explicables
- **Control:** Fácil ajuste de pesos y criterios sin reentrenamiento
- **Rendimiento:** Cálculos rápidos sin dependencias externas
- **Confiabilidad:** Resultados consistentes y predecibles
- **Costo:** Sin costos de API externas
- **Privacidad:** No se envían datos a servicios externos

**Características técnicas:**
- **Escalabilidad:** Maneja miles de propiedades y búsquedas eficientemente
- **Precisión:** Algoritmos geográficos probados y precisos
- **Flexibilidad:** Fácil agregar nuevos criterios de matching
- **Mantenimiento:** Código simple y fácil de mantener

## 2.4.6. Servicios Externos / Integraciones

### **2.4.6.1. Google Maps API**
**Propósito funcional:** Servicios de geolocalización, validación de direcciones y visualización de mapas.

**Tecnología utilizada:**
- **APIs:** Google Maps JavaScript API, Geocoding API, Places API
- **Cliente:** @googlemaps/js-api-loader
- **Funcionalidades:** Geocoding, reverse geocoding, autocompletado

**Comunicación e interacciones:**
- **Frontend:** Integración directa con React Google Maps
- **Backend:** Validación de direcciones en creación de propiedades
- **Cache:** Almacenamiento de resultados de geocoding

### **2.4.6.2. Sistema de Utilidades Geográficas**
**Propósito funcional:** Cálculos geográficos avanzados y validación de coordenadas para el sistema de matching.

**Tecnología utilizada:**
- **Algoritmos Geográficos:** Ray Casting, Haversine, validación de polígonos
- **Utilidades Personalizadas:** Funciones de cálculo de proximidad y scoring
- **Validación:** Verificación de coordenadas y polígonos válidos
- **Funcionalidades:** Cálculo de distancias, puntos en polígonos, scoring geográfico

**Comunicación e interacciones:**
- **MatchingService:** Cálculos geográficos para matching
- **PropertyService:** Validación de ubicaciones de propiedades
- **SearchService:** Validación de zonas de búsqueda
- **Cache:** Almacenamiento de resultados de cálculos geográficos

## 2.4.7. Middleware y Seguridad

### **2.4.7.1. Authentication Middleware**
**Propósito funcional:** Verificación de identidad y autorización de usuarios.

**Tecnología utilizada:**
- **JWT:** JSON Web Tokens para autenticación stateless
- **bcrypt:** Hashing seguro de contraseñas
- **Passport.js:** Estrategias de autenticación
- **Rate limiting:** Express-rate-limit

**Comunicación e interacciones:**
- **Headers:** Verificación de tokens en headers de autorización
- **Redis:** Blacklist de tokens invalidados
- **Base de datos:** Verificación de usuarios activos

### **2.4.7.2. Security Middleware**
**Propósito funcional:** Protección contra ataques comunes y vulnerabilidades.

**Tecnología utilizada:**
- **Helmet:** Headers de seguridad HTTP
- **CORS:** Configuración de Cross-Origin Resource Sharing
- **Input validation:** Sanitización de datos de entrada
- **SQL injection protection:** Prepared statements

**Buenas prácticas aplicadas:**
- **Defense in depth:** Múltiples capas de seguridad
- **Principle of least privilege:** Acceso mínimo necesario
- **Input sanitization:** Limpieza de datos de entrada
- **HTTPS enforcement:** Redirección automática a HTTPS

## 2.4.8. Infraestructura / Orquestación

### **2.4.8.1. Servidor de Aplicación**
**Propósito funcional:** Hosting y ejecución del servidor Node.js.

**Tecnología utilizada:**
- **Runtime:** Node.js 18+ LTS
- **Process manager:** PM2 para gestión de procesos
- **Load balancing:** Nginx como reverse proxy
- **SSL/TLS:** Certificados Let's Encrypt

**Comunicación e interacciones:**
- **Reverse proxy:** Nginx para balanceo de carga
- **SSL termination:** Terminación de conexiones HTTPS
- **Static files:** Servido de archivos estáticos
- **Health checks:** Monitoreo de estado del servidor

### **2.4.8.2. Monitoreo y Logging**
**Propósito funcional:** Observabilidad del sistema y detección de problemas.

**Tecnología utilizada:**
- **Logging:** Winston para logs estructurados
- **Monitoring:** Prometheus + Grafana (futuro)
- **Error tracking:** Sentry para captura de errores
- **Performance:** New Relic para métricas de rendimiento

**Buenas prácticas aplicadas:**
- **Structured logging:** Logs en formato JSON
- **Log levels:** Diferentes niveles de detalle
- **Centralized logging:** Agregación de logs en un punto
- **Alerting:** Notificaciones automáticas de problemas críticos 

### **2.5. Descripción de alto nivel del proyecto y estructura de ficheros**

#### **Visión Técnica General del Sistema**

**Zonmatch** es una aplicación web full-stack que implementa una plataforma de matchmaking inmobiliario inteligente. El sistema está diseñado como una **Single Page Application (SPA)** con arquitectura cliente-servidor, donde el frontend se comunica con el backend a través de APIs RESTful y WebSockets para funcionalidades en tiempo real.

**Naturaleza del Proyecto:**
- **Tipo:** Aplicación web full-stack
- **Arquitectura:** Cliente-servidor con SPA
- **Patrón:** MVC (Model-View-Controller) en backend
- **Comunicación:** APIs REST + WebSockets
- **Base de datos:** Relacional (MySQL) + Cache (Redis)

**Tecnologías Predominantes:**
- **Frontend:** React.js 18+ con TypeScript
- **Backend:** Node.js con Express.js
- **Base de datos:** MySQL 8.0 con Sequelize ORM
- **Cache:** Redis para sesiones y datos temporales
- **Sistema de Matching:** Algoritmos geográficos para análisis de proximidad
- **Mapas:** Google Maps API para geolocalización
- **Notificaciones:** Firebase + WhatsApp Business API

#### **Estructura del Repositorio**

```
zonmatch/
├── backend/                     # Servidor Node.js + TypeScript + Sequelize
│   ├── src/
│   │   ├── controllers/        # Capa de Controladores (MVC)
│   │   │   ├── authController.ts     # Autenticación y autorización
│   │   │   ├── propertyController.ts # Gestión de propiedades
│   │   │   ├── searchController.ts   # Búsquedas y filtros
│   │   │   ├── matchController.ts    # Sistema de coincidencias
│   │   │   ├── chatController.ts     # Chat interno
│   │   │   └── userController.ts     # Gestión de usuarios
│   │   ├── models/             # Capa de Modelos (MVC)
│   │   │   ├── index.ts              # Configuración de Sequelize
│   │   │   ├── User.ts               # Usuario con roles
│   │   │   ├── Property.ts           # Propiedades inmobiliarias
│   │   │   ├── Search.ts             # Búsquedas guardadas
│   │   │   ├── Match.ts              # Coincidencias generadas
│   │   │   ├── Favorite.ts           # Propiedades favoritas
│   │   │   ├── Message.ts            # Mensajes del chat
│   │   │   └── Polygon.ts            # Polígonos de zonas de interés
│   │   ├── services/           # Capa de Servicios (Lógica de negocio)
│   │   │   ├── matchService.ts       # Algoritmo de coincidencias
│   │   │   ├── notificationService.ts # Notificaciones
│   │   │   ├── emailService.ts       # Envío de emails
│   │   │   ├── mapService.ts         # Servicios de geolocalización
│   │   │   ├── geoUtils.ts           # Utilidades geográficas
│   │   │   └── whatsAppService.ts    # Integración WhatsApp
│   │   ├── routes/             # Definición de rutas API
│   │   │   ├── auth.ts               # Rutas de autenticación
│   │   │   ├── properties.ts         # Rutas de propiedades
│   │   │   ├── search.ts             # Rutas de búsqueda
│   │   │   ├── matches.ts            # Rutas de coincidencias
│   │   │   ├── chat.ts               # Rutas de chat
│   │   │   └── users.ts              # Rutas de usuarios
│   │   ├── middleware/         # Middleware de Express
│   │   │   ├── auth.ts               # Verificación JWT
│   │   │   ├── roleAuth.ts           # Autorización por roles
│   │   │   ├── rateLimit.ts          # Límite de intentos
│   │   │   └── validation.ts         # Validación de datos
│   │   ├── utils/              # Utilidades compartidas
│   │   │   ├── jwt.ts                # Manejo de JWT
│   │   │   ├── bcrypt.ts             # Encriptación
│   │   │   ├── validation.ts         # Validaciones
│   │   │   └── helpers.ts            # Funciones auxiliares
│   │   ├── config/             # Configuraciones
│   │   │   ├── database.ts           # Configuración MySQL
│   │   │   ├── jwt.ts                # Configuración JWT
│   │   │   ├── email.ts              # Configuración email
│   │   │   └── redis.ts              # Configuración Redis
│   │   ├── types/              # Tipos TypeScript
│   │   │   ├── auth.ts               # Tipos de autenticación
│   │   │   ├── property.ts           # Tipos de propiedades
│   │   │   ├── user.ts               # Tipos de usuario
│   │   │   └── api.ts                # Tipos de API
│   │   └── app.ts              # Punto de entrada
│   ├── database/
│   │   ├── migrations/         # Migraciones Sequelize
│   │   │   ├── 001-create-users.ts
│   │   │   ├── 002-create-properties.ts
│   │   │   ├── 003-create-searches.ts
│   │   │   ├── 004-create-matches.ts
│   │   │   ├── 005-create-favorites.ts
│   │   │   ├── 006-create-messages.ts
│   │   │   └── 007-create-polygons.ts
│   │   ├── seeders/            # Datos de prueba
│   │   │   ├── 001-demo-users.ts
│   │   │   ├── 002-demo-properties.ts
│   │   │   └── 003-demo-searches.ts
│   │   └── config/             # Configuración de base de datos
│   │       └── database.js
│   ├── tests/                  # Tests del backend
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   ├── docker/                 # Configuración Docker
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .gitignore
├── frontend/                    # Aplicación React + TypeScript + Vite
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   │   ├── common/         # Componentes base
│   │   │   │   ├── Button/
│   │   │   │   ├── Input/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Card/
│   │   │   │   └── Loading/
│   │   │   ├── layout/         # Componentes de layout
│   │   │   │   ├── Header/
│   │   │   │   ├── Footer/
│   │   │   │   ├── Sidebar/
│   │   │   │   └── Navigation/
│   │   │   └── features/       # Componentes específicos
│   │   │       ├── auth/       # Autenticación
│   │   │       ├── properties/ # Propiedades
│   │   │       ├── search/     # Búsqueda y filtros
│   │   │       ├── map/        # Mapa y geolocalización
│   │   │       ├── chat/       # Chat interno
│   │   │       ├── favorites/  # Favoritos
│   │   │       └── dashboard/  # Panel de control
│   │   ├── pages/              # Páginas principales
│   │   │   ├── Home/
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── Search/
│   │   │   ├── PropertyDetail/
│   │   │   ├── Dashboard/
│   │   │   ├── Favorites/
│   │   │   └── Chat/
│   │   ├── hooks/              # Custom hooks
│   │   │   ├── useAuth.ts      # Hook de autenticación
│   │   │   ├── useProperties.ts # Hook de propiedades
│   │   │   ├── useSearch.ts    # Hook de búsqueda
│   │   │   ├── useMap.ts       # Hook de mapa
│   │   │   └── useChat.ts      # Hook de chat
│   │   ├── services/           # Llamadas a la API
│   │   │   ├── api.ts          # Configuración base
│   │   │   ├── authService.ts  # Servicios de auth
│   │   │   ├── propertyService.ts # Servicios de propiedades
│   │   │   ├── searchService.ts # Servicios de búsqueda
│   │   │   └── chatService.ts  # Servicios de chat
│   │   ├── store/              # Estado global con Zustand
│   │   │   ├── authStore.ts    # Estado de autenticación
│   │   │   ├── propertyStore.ts # Estado de propiedades
│   │   │   ├── searchStore.ts  # Estado de búsqueda
│   │   │   ├── favoriteStore.ts # Estado de favoritos
│   │   │   └── index.ts        # Store principal
│   │   ├── utils/              # Utilidades del frontend
│   │   │   ├── constants.ts    # Constantes
│   │   │   ├── helpers.ts      # Funciones auxiliares
│   │   │   ├── validation.ts   # Validaciones
│   │   │   └── formatters.ts   # Formateadores
│   │   ├── types/              # Tipos TypeScript
│   │   │   ├── auth.ts         # Tipos de autenticación
│   │   │   ├── property.ts     # Tipos de propiedades
│   │   │   ├── user.ts         # Tipos de usuario
│   │   │   └── api.ts          # Tipos de API
│   │   ├── styles/             # Estilos globales
│   │   │   ├── globals.css
│   │   │   ├── variables.css
│   │   │   └── components.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   │   ├── index.html
│   │   └── assets/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts          # Configuración Vite
│   ├── .env.example
│   └── .gitignore
├── shared/                      # Código compartido
│   ├── types/                   # Tipos compartidos
│   │   ├── common.ts            # Tipos comunes
│   │   ├── api.ts               # Tipos de API compartidos
│   │   └── validation.ts        # Esquemas de validación
│   └── constants/               # Constantes compartidas
│       ├── roles.ts             # Roles del sistema
│       ├── propertyTypes.ts     # Tipos de propiedad
│       └── apiEndpoints.ts      # Endpoints de la API
├── docs/                        # Documentación técnica
│   ├── casos-uso/              # Diagramas de casos de uso
│   ├── flujos-usuario/         # Flujos de usuario
│   ├── diagramas/              # Diagramas técnicos
│   ├── api/                     # Documentación de la API
│   ├── deployment/              # Guías de despliegue
│   └── architecture/            # Documentación de arquitectura
├── scripts/                     # Scripts de automatización
│   ├── setup.sh                 # Script de configuración inicial
│   ├── deploy.sh                # Script de despliegue
│   ├── backup.sh                # Script de backup
│   └── docker/                  # Scripts de Docker
├── docker-compose.yml           # Docker Compose principal
├── .env.example                 # Variables de entorno ejemplo
├── .gitignore
└── README.md                    # Documentación principal
```

#### **Descripción de Carpetas y Archivos Principales**

##### **Backend (`/backend/`)**
- **`controllers/`**: Capa de controladores MVC - manejo de peticiones HTTP
  - `authController.ts`: Autenticación, registro, gestión de perfiles
  - `propertyController.ts`: CRUD de propiedades, búsquedas avanzadas
  - `searchController.ts`: Búsquedas y filtros dinámicos
  - `matchController.ts`: Algoritmos de coincidencias, matches automáticos
  - `chatController.ts`: Sistema de mensajería en tiempo real
  - `userController.ts`: Gestión de usuarios y perfiles

- **`models/`**: Capa de modelos MVC - representación de entidades de base de datos
  - `User.ts`: Modelo de usuario con roles y autenticación
  - `Property.ts`: Modelo de propiedad con relaciones y geolocalización
  - `Search.ts`: Modelo de búsquedas guardadas y filtros
  - `Match.ts`: Modelo de coincidencias generadas automáticamente
  - `Favorite.ts`: Modelo de propiedades favoritas del usuario
  - `Message.ts`: Modelo de mensajes del chat interno
  - `Polygon.ts`: Modelo de polígonos de zonas de interés

- **`services/`**: Capa de servicios - lógica de negocio y integraciones
  - `matchService.ts`: Algoritmos de matching con utilidades geográficas
  - `notificationService.ts`: Envío de notificaciones multi-canal
  - `emailService.ts`: Servicio de envío de emails
  - `mapService.ts`: Servicios de geolocalización y mapas
  - `geoUtils.ts`: Utilidades geográficas y algoritmos de proximidad
  - `whatsAppService.ts`: Integración con WhatsApp Business API

- **`routes/`**: Definición de endpoints RESTful organizados por dominio
- **`middleware/`**: Middleware de Express para autenticación, validación, etc.
- **`config/`**: Configuraciones de base de datos, JWT, email, Redis
- **`utils/`**: Utilidades compartidas (JWT, bcrypt, validaciones)
- **`types/`**: Definiciones TypeScript para tipado fuerte
- **`database/`**: Migraciones y seeders de Sequelize

##### **Frontend (`/frontend/`)**
- **`components/`**: Componentes React reutilizables organizados por dominio funcional
  - `common/`: Componentes base reutilizables (Button, Input, Modal, Card, Loading)
  - `layout/`: Componentes de layout (Header, Footer, Sidebar, Navigation)
  - `features/`: Componentes específicos por funcionalidad
    - `auth/`: Formularios de login, registro, recuperación de contraseña
    - `properties/`: Cards de propiedades, formularios de publicación, galerías
    - `search/`: Filtros avanzados, mapa interactivo, resultados de búsqueda
    - `map/`: Mapa y geolocalización con herramientas de dibujo
    - `chat/`: Sistema de mensajería interna, conversaciones
    - `favorites/`: Gestión de propiedades favoritas
    - `dashboard/`: Paneles de control para usuarios y agentes

- **`pages/`**: Páginas principales de la aplicación (Home, Login, Register, Search, etc.)
- **`hooks/`**: Custom hooks para lógica reutilizable (useAuth, useProperties, etc.)
- **`services/`**: Cliente HTTP (Axios), servicios de mapas, notificaciones
- **`store/`**: Estado global con Zustand (authStore, propertyStore, etc.)
- **`utils/`**: Utilidades del frontend (constantes, helpers, validaciones)
- **`types/`**: Definiciones TypeScript para tipado fuerte
- **`styles/`**: CSS/SCSS, temas, variables de diseño

##### **Shared (`/shared/`)**
- **`types/`**: Tipos compartidos entre frontend y backend
  - `common.ts`: Tipos comunes utilizados en toda la aplicación
  - `api.ts`: Tipos de API compartidos para consistencia
  - `validation.ts`: Esquemas de validación compartidos
- **`constants/`**: Constantes compartidas
  - `roles.ts`: Roles del sistema (user, agent, admin)
  - `propertyTypes.ts`: Tipos de propiedad inmobiliaria
  - `apiEndpoints.ts`: Endpoints de la API centralizados

##### **Documentación (`/docs/`)**
- **`casos-uso/`**: Diagramas PlantUML de casos de uso del sistema
- **`flujos-usuario/`**: Diagramas de flujos de usuario y experiencia
- **`diagramas/`**: Diagramas técnicos (arquitectura, base de datos)
- **`api/`**: Documentación de la API con ejemplos
- **`deployment/`**: Guías de despliegue y configuración
- **`arquitectura/`**: Documentación de arquitectura detalla

##### **Scripts (`/scripts/`)**
- **`setup.sh`**: Automatización de instalación y configuración inicial
- **`deploy.sh`**: Script de despliegue automatizado
- **`backup.sh`**: Script de backup de base de datos
- **`docker/`**: Scripts específicos para Docker

#### **Patrón Arquitectónico: MVC con Separación de Dominios**

**Organización del Proyecto:**
El proyecto sigue una **arquitectura híbrida** que combina múltiples patrones:

1. **Patrón MVC** en el backend para separación clara de responsabilidades
2. **Feature-based Architecture** en el frontend con separación por dominios funcionales
3. **Clean Architecture** con capas bien definidas
4. **Shared Kernel** para código compartido entre frontend y backend
5. **Repository Pattern** implementado a través de Sequelize models
6. **Service Layer Pattern** para lógica de negocio encapsulada

**Patrones Arquitectónicos Identificados:**

**Backend:**
- **MVC (Model-View-Controller)**: Separación clara entre controladores, modelos y servicios
- **Repository Pattern**: Acceso a datos a través de modelos Sequelize
- **Service Layer**: Lógica de negocio encapsulada en servicios especializados
- **Middleware Pattern**: Funciones intermedias reutilizables

**Frontend:**
- **Component-Based Architecture**: Componentes React reutilizables
- **Feature-based Organization**: Organización por funcionalidades de negocio
- **Store Pattern**: Estado global con Zustand
- **Custom Hooks Pattern**: Lógica reutilizable encapsulada en hooks

**Compartido:**
- **Shared Kernel**: Tipos y constantes compartidos entre frontend y backend
- **Domain-Driven Design (DDD)**: Organización por dominios de negocio

**Justificación de la Estructura:**

**Mantenibilidad:**
- **Separación clara de responsabilidades**: Controladores manejan HTTP, modelos gestionan datos, servicios contienen lógica de negocio
- **Organización por dominio**: Cada funcionalidad (auth, properties, matching) tiene su propia carpeta
- **Componentes reutilizables**: Frontend organizado en componentes modulares
- **Tipado fuerte**: TypeScript en ambos lados para detectar errores temprano

**Escalabilidad:**
- **Servicios desacoplados**: Cada servicio puede evolucionar independientemente
- **APIs RESTful**: Facilita la integración con otros sistemas
- **Base de datos normalizada**: Estructura optimizada para consultas complejas
- **Microservicios ready**: Estructura preparada para futura migración a microservicios

**Claridad del Código:**
- **Nomenclatura consistente**: Convenciones claras para archivos y carpetas
- **Documentación integrada**: README y documentación técnica en `/docs/`
- **Testing facilitado**: Separación clara permite tests unitarios y de integración
- **Onboarding rápido**: Estructura intuitiva para nuevos desarrolladores

**Beneficios de esta Organización:**
- **Desarrollo eficiente**: Cambios localizados en componentes específicos
- **Deployment simplificado**: Scripts automatizados para instalación y despliegue
- **Reutilización de código**: Componentes y servicios compartidos
- **Despliegue independiente**: Backend y frontend pueden desplegarse por separado
- **Testing comprehensivo**: Cada capa puede ser testeada independientemente

### **2.6. Infraestructura y Despliegue**

#### **Arquitectura de Infraestructura**

Zonmatch utiliza una infraestructura cloud moderna optimizada para costos, distribuida entre múltiples servicios especializados que garantizan alta disponibilidad, escalabilidad y facilidad de mantenimiento.

**Stack Tecnológico de Infraestructura:**

| Componente | Servicio | Propósito | Costo Mensual |
|------------|----------|-----------|----------------|
| **Frontend** | Vercel | Hosting de React SPA | $0 (Hobby Plan) |
| **Backend** | Railway | API Node.js + Express | Incluido en Railway |
| **Base de Datos** | Railway MySQL | Persistencia de datos | Incluido en Railway |
| **Cache** | Railway Redis | Sesiones y cache | Incluido en Railway |
| **Almacenamiento** | Cloudinary | Imágenes de propiedades | $0 (Free Tier) |
| **CI/CD** | Vercel + Railway | Despliegue automático | $0 (incluido) |
| **SSL/TLS** | Let's Encrypt | Certificados SSL | $0 |
| **CDN** | Vercel + Cloudinary | Distribución de contenido | $0 |

**Costos Totales Estimados: $5-20/mes**

#### **Diagrama de Infraestructura**
![Diagrama de Infraestructura](docs/infraestructura/infraestructura.png)

```mermaid
graph TB
    subgraph "Desarrollo Local"
        DEV[Desarrollador]
        DOCKER[Docker Compose]
        DEV --> DOCKER
    end
    
    subgraph "GitHub"
        REPO[Repositorio]
        REPO --> VERCEL
        REPO --> RAILWAY
    end
    
    subgraph "Frontend - Vercel"
        VERCEL[Vercel Platform]
        CDN[CDN Global]
        VERCEL --> CDN
    end
    
    subgraph "Backend - Railway"
        RAILWAY[Railway Platform]
        API[Node.js API]
        DB[(MySQL Database)]
        REDIS[(Redis Cache)]
        RAILWAY --> API
        API --> DB
        API --> REDIS
    end
    
    subgraph "Servicios Externos"
        CLOUDINARY[Cloudinary]
        GEO[Utilidades Geográficas]
        MAPS[Google Maps API]
        FIREBASE[Firebase Push]
        WHATSAPP[WhatsApp Business API]
    end
    
    subgraph "Monitoreo"
        LOGS[Railway Logs]
        METRICS[Vercel Analytics]
    end
    
    DEV --> REPO
    API --> CLOUDINARY
    API --> GEO
    API --> MAPS
    API --> FIREBASE
    API --> WHATSAPP
    RAILWAY --> LOGS
    VERCEL --> METRICS
    
    style VERCEL fill:#000,color:#fff
    style RAILWAY fill:#0066ff,color:#fff
    style CLOUDINARY fill:#ff6b35,color:#fff
    style REPO fill:#333,color:#fff
```

#### **Servicios y Configuración**

##### **1. Frontend - Vercel**
**Configuración:**
- **Framework:** React + Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18.x
- **Environment Variables:** Configuradas desde dashboard

**Características:**
- Despliegue automático desde GitHub
- SSL/TLS automático
- CDN global automático
- Preview deployments por PR
- Analytics integrado

##### **2. Backend - Railway**
**Configuración:**
- **Runtime:** Node.js 18.x
- **Start Command:** `npm start`
- **Port:** `process.env.PORT`
- **Environment Variables:** Configuradas desde dashboard

**Servicios Incluidos:**
- **MySQL Database:** Instancia dedicada con backups automáticos
- **Redis Cache:** Instancia dedicada para sesiones y cache
- **Logs:** Logs centralizados y accesibles
- **Metrics:** Monitoreo básico incluido

##### **3. Almacenamiento - Cloudinary**
**Configuración:**
- **Cloud Name:** Configurado en variables de entorno
- **API Key/Secret:** Configurados en backend
- **Transformations:** Optimización automática de imágenes

**Características:**
- 25GB de almacenamiento gratuito
- Optimización automática de imágenes
- CDN global incluido
- Transformaciones on-the-fly

##### **4. CI/CD - Despliegue Automático**

**Configuración de Despliegue Automático:**

**Vercel (Frontend):**
- **Trigger:** Push a rama `main`
- **Configuración:** Conectado directamente al repositorio GitHub
- **Automatización:** Despliegue automático al hacer merge a main
- **Preview:** URLs automáticas por Pull Request

**Railway (Backend):**
- **Trigger:** Push a rama `main`
- **Configuración:** Conectado directamente al repositorio GitHub
- **Automatización:** Despliegue automático al hacer merge a main
- **Variables de entorno:** Configuradas desde dashboard de Railway

**Proceso Simplificado:**
1. **Desarrollo en feature branch**
2. **Crear Pull Request**
3. **Code review y aprobación**
4. **Merge a main** → **Despliegue automático**

**Configuración en Vercel:**
```bash
# Conectar repositorio en Vercel Dashboard
# Framework Preset: Vite
# Build Command: npm run build
# Output Directory: dist
# Install Command: npm install
# Root Directory: frontend
```

**Configuración en Railway:**
```bash
# Conectar repositorio en Railway Dashboard
# Service Type: Node.js
# Start Command: npm start
# Root Directory: backend
# Environment Variables: Configuradas en dashboard
```

#### **Proceso de Despliegue**

##### **Entornos Configurados:**

1. **Desarrollo Local**
   - Docker Compose para servicios locales
   - Base de datos local con datos de prueba
   - Hot reload para desarrollo

2. **Staging (Preview)**
   - Despliegue automático por Pull Request
   - URL única por PR para testing
   - Base de datos separada para testing

3. **Producción**
   - Despliegue automático desde `main` branch
   - Base de datos de producción
   - SSL y dominio configurado

##### **Flujo de Despliegue:**
![Flujo de Despliegue](docs/despliegue/despliegue.png)

```mermaid
graph LR
    A[Desarrollo Local] --> B[Push a Feature Branch]
    B --> C[Crear Pull Request]
    C --> D[Preview Automático]
    D --> E[Code Review]
    E --> F[Merge a Main]
    F --> G[Deploy Automático a Producción]
    
    style A fill:#e1f5fe
    style D fill:#fff3e0
    style G fill:#e8f5e8
```

##### **Pasos del Proceso:**

1. **Desarrollo Local:**
   ```bash
   # Clonar repositorio
   git clone https://github.com/usuario/zonmatch.git
   cd zonmatch
   
   # Configurar variables de entorno
   cp .env.example .env
   # Editar .env con valores locales
   
   # Ejecutar con Docker
   docker-compose up -d
   ```

2. **Crear Feature Branch:**
   ```bash
   git checkout -b feature/nueva-funcionalidad
   # Desarrollar cambios
   git add .
   git commit -m "feat: nueva funcionalidad"
   git push origin feature/nueva-funcionalidad
   ```

3. **Pull Request:**
   - Crear PR en GitHub
   - Se genera preview deployment automáticamente
   - Code review y aprobación

4. **Merge a Main:**
   - Al hacer merge, se dispara deploy automático
   - Frontend se despliega en Vercel automáticamente
   - Backend se despliega en Railway automáticamente

5. **Verificación Post-Deploy:**
   - Verificar endpoints de API
   - Verificar funcionalidades críticas
   - Monitorear logs por errores

##### **Scripts de Automatización:**

**`scripts/deploy.sh`:**
```bash
#!/bin/bash
set -e

echo "Iniciando despliegue..."

# Verificar que estamos en main
if [[ $(git branch --show-current) != "main" ]]; then
    echo "Error: Debes estar en la rama main"
    exit 1
fi

# Ejecutar tests
echo "Ejecutando tests..."
npm run test

# Build del frontend
echo "Build del frontend..."
cd frontend && npm run build && cd ..

# Deploy automático via GitHub Actions
echo "Push a main para trigger de deploy..."
git push origin main

echo "Despliegue iniciado. Revisar GitHub Actions para progreso."
```

**`scripts/rollback.sh`:**
```bash
#!/bin/bash
set -e

echo "Iniciando rollback..."

# Obtener commit anterior
PREVIOUS_COMMIT=$(git log --oneline -2 | tail -1 | cut -d' ' -f1)

echo "Revertiendo a commit: $PREVIOUS_COMMIT"
git revert --no-edit HEAD
git push origin main

echo "Rollback completado. Revisar GitHub Actions."
```

#### **Configuración de Seguridad**

##### **SSL/TLS:**
- **Vercel:** SSL automático con Let's Encrypt
- **Railway:** SSL automático incluido
- **Cloudinary:** HTTPS obligatorio

##### **Variables de Entorno:**
```bash
# Frontend (Vercel)
REACT_APP_API_URL=https://api.zonmatch.com
REACT_APP_CLOUDINARY_CLOUD_NAME=zonmatch
REACT_APP_GOOGLE_MAPS_API_KEY=xxx

# Backend (Railway)
DATABASE_URL=mysql://user:pass@host:port/db
REDIS_URL=redis://host:port
JWT_SECRET=xxx
# Sistema de matching basado en reglas geográficas
# No requiere API keys externas para el matching
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

#### **Monitoreo y Logs**

##### **Railway Logs:**
- Logs centralizados accesibles desde dashboard
- Filtros por servicio y nivel
- Retención de 30 días

##### **Vercel Analytics:**
- Métricas de rendimiento automáticas
- Análisis de usuarios
- Core Web Vitals

##### **Health Checks:**
```javascript
// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0'
  });
});
```

#### **Escalabilidad Futura**

**Fase 1 (Actual):**
- Railway plan básico ($5-20/mes)
- Vercel hobby plan (gratis)
- Cloudinary free tier

**Fase 2 (Crecimiento):**
- Railway plan pro ($50/mes)
- Vercel pro plan ($20/mes)
- Cloudinary paid plan ($89/mes)
- Implementar auto-scaling

**Fase 3 (Escala):**
- Migración a AWS/GCP
- Kubernetes para orquestación
- Microservicios
- Load balancers

Esta infraestructura proporciona una base sólida y económica para el desarrollo inicial de Zonmatch, con capacidad de escalar según el crecimiento del proyecto.

### **2.7. Seguridad**

ZonMatch implementa múltiples capas de seguridad para proteger tanto los datos de los usuarios como la integridad del sistema. A continuación se detallan las principales prácticas de seguridad implementadas:

#### **1. Autenticación y Autorización**

**JWT (JSON Web Tokens) con verificación de estado:**
- Tokens JWT firmados con clave secreta para autenticación stateless
- Verificación de validez del token en cada request autenticado
- Validación de usuario activo en base de datos para cada token
- Expiración automática de tokens para limitar ventanas de vulnerabilidad

```typescript
// Ejemplo de verificación de token
const decoded = jwt.verify(token, JWT_CONFIG.SECRET) as IJWTPayload;
const user = await User.findByPk(decoded.user_id);

if (!user || !user.is_active) {
  return res.status(401).json({
    success: false,
    message: 'Usuario no válido o inactivo',
    error: 'INVALID_USER'
  });
}
```

**Sistema de roles y permisos:**
- Roles diferenciados: `user`, `agent`, `admin`
- Middleware de autorización basado en roles
- Acceso restringido a funcionalidades según el tipo de usuario

#### **2. Protección de Contraseñas**

**Hashing seguro con bcrypt:**
- Algoritmo bcrypt con factor de costo 12 para hashing de contraseñas
- Salt automático generado por bcrypt para cada contraseña
- Comparación segura de contraseñas sin almacenar texto plano

```typescript
// Ejemplo de creación de usuario con hash seguro
public static async createUser(userData: any): Promise<User> {
  const hashedPassword = await bcrypt.hash(userData.password, 12);
  return this.create({
    ...userData,
    password_hash: hashedPassword
  });
}
```

**Políticas de contraseñas robustas:**
- Mínimo 8 caracteres de longitud
- Requerimiento de mayúsculas, minúsculas, números y caracteres especiales
- Validación en tiempo real durante el registro

#### **3. Rate Limiting y Protección contra Ataques**

**Rate limiting diferenciado por tipo de operación:**
- Autenticación: 10 intentos por 15 minutos
- Creación de propiedades: 10 por hora por usuario
- Operaciones de escritura: 50 por 15 minutos
- Favoritos: 100 operaciones por 15 minutos

```typescript
// Ejemplo de rate limiting para autenticación
export const authRateLimit = rateLimit({
  windowMs: 900000, // 15 minutos
  max: 10, // máximo 10 intentos
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intenta nuevamente en 15 minutos.',
    error: 'RATE_LIMIT_EXCEEDED'
  }
});
```

**Protección contra ataques de fuerza bruta:**
- Límites progresivos de intentos fallidos
- Bloqueo temporal de IPs sospechosas
- Logging de intentos de acceso fallidos

#### **4. Validación y Sanitización de Datos**

**Validación exhaustiva de entrada:**
- Validación de tipos de datos con express-validator
- Sanitización automática de strings (trim, normalize)
- Validación de formatos específicos (email, teléfono, UUID)
- Límites de longitud para prevenir ataques de buffer overflow

```typescript
// Ejemplo de validación de registro
export const registerValidators = [
  body('email')
    .isEmail()
    .withMessage('El email debe ser válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial')
];
```

**Protección contra inyección SQL:**
- Uso de Sequelize ORM con prepared statements
- Validación de parámetros antes de consultas
- Escape automático de caracteres especiales

#### **5. Headers de Seguridad HTTP**

**Configuración de Helmet.js:**
- Content Security Policy (CSP) restrictiva
- Headers de seguridad estándar (X-Frame-Options, X-Content-Type-Options)
- Prevención de clickjacking y MIME type sniffing

```typescript
// Configuración de seguridad con Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

#### **6. Configuración CORS Segura**

**Política CORS restrictiva:**
- Origen específico configurado (no wildcard)
- Métodos HTTP permitidos explícitamente
- Headers autorizados limitados
- Credenciales habilitadas solo para dominios confiables

```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

#### **7. Gestión Segura de Variables de Entorno**

**Separación de configuraciones:**
- Variables sensibles en archivos .env
- Valores por defecto seguros para desarrollo
- Validación de variables críticas al inicio de la aplicación
- No exposición de secretos en logs o respuestas

#### **8. Recuperación Segura de Contraseñas**

**Sistema de tokens temporales:**
- Tokens únicos con expiración de 15 minutos
- Un solo uso por token (invalidación automática)
- Validación de email antes de envío
- Enlaces seguros con tokens no predecibles

#### **9. Logging y Monitoreo de Seguridad**

**Logging estructurado:**
- Registro de intentos de autenticación fallidos
- Tracking de operaciones sensibles
- Logs de errores sin exposición de datos sensibles
- Rotación automática de logs

```typescript
// Ejemplo de manejo seguro de errores
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error no manejado:', error);
  
  // No exponer detalles internos en producción
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'INTERNAL_ERROR'
  });
});
```

#### **10. Configuración de Base de Datos Segura**

**Conexión encriptada:**
- Conexiones SSL/TLS a la base de datos
- Pool de conexiones limitado para prevenir DoS
- Timeouts configurados apropiadamente
- Charset UTF-8 para prevenir inyección de caracteres

```typescript
// Configuración segura de base de datos
const sequelize = new Sequelize(databaseUrl, {
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  }
});
```

#### **11. Validación de Archivos y Uploads**

**Restricciones de archivos:**
- Validación de tipos MIME permitidos
- Límites de tamaño de archivo (10MB máximo)
- Sanitización de nombres de archivo
- Almacenamiento seguro en Cloudinary con URLs firmadas

#### **12. Manejo Seguro de Errores**

**Respuestas de error consistentes:**
- No exposición de información sensible en errores
- Códigos de estado HTTP apropiados
- Mensajes de error genéricos para usuarios finales
- Logging detallado para administradores

Estas prácticas de seguridad proporcionan una base sólida para proteger la aplicación ZonMatch contra las principales amenazas de seguridad web, manteniendo al mismo tiempo una experiencia de usuario fluida y funcional.

### **2.8. Tests**

El sistema de Zonmatch implementa un conjunto comprehensivo de tests para garantizar la calidad y confiabilidad de todas las funcionalidades críticas. Los tests están organizados por módulos y cubren tanto casos de uso normales como casos edge.

#### **2.8.1. Tests de Utilidades Geográficas**

**Cobertura de Tests:**
- **20 tests unitarios** implementados para el módulo `geoUtils.ts`
- **9 suites de pruebas** organizadas por funcionalidad
- **100% de cobertura** de funciones críticas
- **Casos edge** y validaciones de error incluidas

**Funcionalidades Testeadas:**

1. **Verificación de Puntos en Polígonos**
   - ✅ Punto dentro del polígono (algoritmo Ray Casting)
   - ✅ Punto fuera del polígono
   - ✅ Múltiples polígonos de búsqueda
   - ✅ Polígonos inválidos (menos de 3 puntos)

2. **Cálculo de Distancias**
   - ✅ Distancia entre dos puntos (fórmula de Haversine)
   - ✅ Distancia al polígono más cercano
   - ✅ Precisión de cálculos geográficos (±1%)
   - ✅ Casos especiales (mismo punto, coordenadas extremas)

3. **Validaciones Geográficas**
   - ✅ Coordenadas válidas (-90° a 90°, -180° a 180°)
   - ✅ Polígonos válidos (estructura y puntos)
   - ✅ Manejo de coordenadas inválidas (NaN, fuera de rango)
   - ✅ Validación de estructuras de datos

4. **Sistema de Scoring**
   - ✅ Score perfecto (1.0) para puntos dentro de polígonos
   - ✅ Score proporcional a la distancia
   - ✅ Score cero para puntos muy lejanos
   - ✅ Configuración de distancias máximas

5. **Cálculos de Polígonos**
   - ✅ Centroide de polígonos
   - ✅ Área aproximada en km²
   - ✅ Manejo de polígonos complejos
   - ✅ Casos de error (polígonos vacíos)

**Configuración de Testing:**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  testTimeout: 10000,
  verbose: true
};
```

**Ejecución de Tests:**
```bash
# Tests específicos de utilidades geográficas
npm test -- --testPathPattern=geoUtils.test.ts

# Todos los tests
npm test

# Tests con cobertura
npm run test:coverage
```

**Resultados de Tests:**
```
Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        2.235 s
```

#### **2.8.2. Tests de Integración**

**Script de Verificación Automática:**
- ✅ Verificación de sintaxis TypeScript
- ✅ Ejecución de tests unitarios
- ✅ Validación de ejemplos de uso
- ✅ Verificación de configuraciones

**Ejemplo de Uso Verificado:**
- ✅ Simulación de búsqueda de propiedades
- ✅ Ranking por proximidad geográfica
- ✅ Filtrado de propiedades por zona
- ✅ Cálculo de scores de ubicación

#### **2.8.3. Casos de Prueba Específicos**

**Datos de Prueba Geográficos:**
```typescript
// Polígonos de prueba (Ciudad de México)
const testPolygon = {
  coordinates: [
    { lat: 19.4, lng: -99.1 },
    { lat: 19.4, lng: -99.2 },
    { lat: 19.5, lng: -99.2 },
    { lat: 19.5, lng: -99.1 }
  ]
};

// Puntos de prueba
const cdmx = { lat: 19.4326, lng: -99.1332 };
const guadalajara = { lat: 20.6597, lng: -103.3496 };
```

**Validaciones de Precisión:**
- Distancia CDMX-Guadalajara: **461.07 km** (verificado)
- Distancia CDMX-Monterrey: **705.93 km** (verificado)
- Precisión de cálculos: **±1%** (tolerancia aceptada)

#### **2.8.4. Estrategia de Testing**

**Principios Aplicados:**
1. **Test-Driven Development (TDD)**: Tests escritos antes de la implementación
2. **Cobertura Completa**: Todas las funciones críticas tienen tests
3. **Casos Edge**: Manejo de datos inválidos y casos límite
4. **Validación de Precisión**: Verificación de cálculos geográficos
5. **Documentación Viva**: Tests como documentación del comportamiento

**Herramientas Utilizadas:**
- **Jest**: Framework de testing principal
- **TypeScript**: Tipado fuerte para detectar errores
- **ts-jest**: Transpilación de TypeScript para Jest
- **Supertest**: Testing de APIs (para futuras implementaciones)

#### **2.8.5. Métricas de Calidad**

**Cobertura de Código:**
- **Líneas de código**: 100% de funciones críticas
- **Ramas de código**: 95%+ de casos cubiertos
- **Funciones**: 100% de funciones públicas testeadas

**Rendimiento de Tests:**
- **Tiempo de ejecución**: < 3 segundos
- **Tests paralelos**: Configurados para máximo rendimiento
- **Timeout**: 10 segundos para cálculos geográficos complejos

**Mantenibilidad:**
- **Tests legibles**: Nombres descriptivos y claros
- **Datos de prueba**: Reutilizables y bien organizados
- **Configuración centralizada**: Fácil de mantener y actualizar

Los tests implementados proporcionan una base sólida para el desarrollo continuo del sistema, garantizando que las funcionalidades geográficas críticas para el matching de propiedades funcionen correctamente en todos los escenarios posibles.

#### **2.8.6. Tests de MatchingService**

**Cobertura de Tests:**
- **20 tests unitarios** implementados para el módulo `MatchingService`
- **8 suites de pruebas** organizadas por funcionalidad
- **100% de cobertura** de métodos críticos
- **Casos edge** y validaciones de error incluidas

**Funcionalidades Testeadas:**

1. **Cálculo de Criterios de Matching**
   - ✅ Cálculo correcto de scores de precio, características, ubicación y preferencias
   - ✅ Validación de pesos configurables para cada criterio
   - ✅ Manejo de datos faltantes o inválidos
   - ✅ Cálculo de score total ponderado

2. **Sistema de Scoring por Precio**
   - ✅ Score perfecto (1.0) para precios dentro del rango
   - ✅ Score proporcional para precios fuera del rango
   - ✅ Score perfecto cuando no hay restricciones de precio
   - ✅ Manejo de rangos de precio inválidos

3. **Sistema de Scoring por Características**
   - ✅ Cálculo correcto de score basado en habitaciones, baños y metros cuadrados
   - ✅ Score perfecto cuando no hay criterios de características
   - ✅ Manejo de características faltantes
   - ✅ Validación de rangos de características

4. **Sistema de Scoring por Preferencias**
   - ✅ Cálculo de score basado en amenidades coincidentes
   - ✅ Score perfecto cuando no hay restricciones de amenidades
   - ✅ Score proporcional a la cantidad de amenidades coincidentes
   - ✅ Manejo de amenidades vacías o nulas

5. **Sistema de Scoring por Ciudad/Estado**
   - ✅ Score perfecto para coincidencia exacta de ciudad y estado
   - ✅ Score parcial cuando solo coincide la ciudad
   - ✅ Score perfecto cuando no hay criterios de ciudad/estado
   - ✅ Manejo de datos de ubicación faltantes

6. **Validación de Propiedades**
   - ✅ Validación correcta de propiedades válidas
   - ✅ Detección de propiedades inválidas
   - ✅ Detección de campos faltantes (título, precio, coordenadas)
   - ✅ Validación de tipos de datos

7. **Validación de Búsquedas**
   - ✅ Validación correcta de búsquedas válidas
   - ✅ Detección de búsquedas sin criterios
   - ✅ Detección de rangos inválidos
   - ✅ Validación de criterios mínimos

8. **Estadísticas del Sistema**
   - ✅ Obtención de estadísticas de matching
   - ✅ Cálculo de métricas de rendimiento
   - ✅ Manejo de datos vacíos
   - ✅ Formateo correcto de resultados

**Configuración de Testing:**
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts'],
  testTimeout: 10000,
  verbose: true
};
```

**Mocks Implementados:**
```typescript
// Mock de sequelize.query para consultas SQL
jest.mock('sequelize', () => ({
  QueryTypes: {
    SELECT: 'SELECT'
  }
}));

// Mock de modelos de Sequelize
jest.mock('../models/Property');
jest.mock('../models/Search');
jest.mock('../models/Match');
jest.mock('../models/User');
jest.mock('../models/Polygon');
jest.mock('../models/PropertyAmenity');
jest.mock('../models/Amenity');
```

**Datos de Prueba:**
```typescript
// Propiedad de prueba
const mockProperty: PropertyForMatching = {
  id_property: 'prop-123',
  user_id: 'user-123',
  title: 'Casa en Roma',
  description: 'Hermosa casa en la colonia Roma',
  property_type: 'house',
  operation_type: 'sale',
  price: 5000000,
  currency: 'MXN',
  bedrooms: 3,
  bathrooms: 2,
  sq_meters: 120,
  year_built: 2020,
  condition: 'new',
  address: 'Calle Roma 123',
  city: 'Ciudad de México',
  state: 'CDMX',
  latitude: 19.4200,
  longitude: -99.1500,
  amenities: ['parking', 'garden', 'security'],
  status: 'active'
};

// Búsqueda de prueba
const mockSearch: SearchForMatching = {
  id_search: 'search-123',
  user_id: 'user-456',
  name: 'Búsqueda Roma',
  property_type: 'house',
  operation_type: 'sale',
  price_min: 4000000,
  price_max: 6000000,
  bedrooms_min: 2,
  bathrooms_min: 2,
  sq_meters_min: 100,
  sq_meters_max: 150,
  amenities: ['parking', 'garden'],
  city: 'Ciudad de México',
  state: 'CDMX',
  is_active: true
};
```

**Ejecución de Tests:**
```bash
# Tests específicos de MatchingService
npm test -- --testPathPattern=matchingService.test.ts

# Todos los tests
npm test

# Tests con cobertura
npm run test:coverage
```

**Resultados de Tests:**
```
Test Suites: 1 passed, 1 total
Tests:       20 passed, 20 total
Snapshots:   0 total
Time:        3.054 s
```

#### **2.8.7. Tests de Integración del Sistema de Matching**

**Script de Verificación Automática:**
- ✅ Verificación de sintaxis TypeScript
- ✅ Ejecución de tests unitarios
- ✅ Validación de ejemplos de uso
- ✅ Verificación de configuraciones
- ✅ Validación de tipos TypeScript
- ✅ Verificación de documentación

**Ejemplo de Uso Verificado:**
- ✅ Simulación de matching entre propiedades y búsquedas
- ✅ Cálculo de scores de compatibilidad
- ✅ Validación de criterios de matching
- ✅ Manejo de casos edge y errores

#### **2.8.8. Casos de Prueba Específicos del Matching**

**Datos de Prueba de Matching:**
```typescript
// Caso de match exitoso
const successfulMatch = {
  property: mockProperty,
  search: mockSearch,
  expectedScore: 0.85,
  expectedCriteria: {
    price: 0.9,
    location: 1.0,
    features: 0.8,
    preferences: 0.7
  }
};

// Caso de match fallido
const failedMatch = {
  property: { ...mockProperty, price: 10000000 },
  search: { ...mockSearch, price_max: 5000000 },
  expectedScore: 0.2,
  reason: 'Precio fuera del rango'
};
```

**Validaciones de Precisión:**
- Score de precio: **±5%** de precisión
- Score de características: **±10%** de precisión
- Score de ubicación: **±15%** de precisión
- Score total: **±10%** de precisión

#### **2.8.9. Estrategia de Testing del Matching**

**Principios Aplicados:**
1. **Test-Driven Development (TDD)**: Tests escritos antes de la implementación
2. **Cobertura Completa**: Todos los métodos críticos tienen tests
3. **Casos Edge**: Manejo de datos inválidos y casos límite
4. **Validación de Algoritmos**: Verificación de cálculos de matching
5. **Documentación Viva**: Tests como documentación del comportamiento

**Herramientas Utilizadas:**
- **Jest**: Framework de testing principal
- **TypeScript**: Tipado fuerte para detectar errores
- **ts-jest**: Transpilación de TypeScript para Jest
- **Mocks**: Simulación de dependencias externas

#### **2.8.10. Métricas de Calidad del Matching**

**Cobertura de Código:**
- **Líneas de código**: 100% de métodos críticos
- **Ramas de código**: 95%+ de casos cubiertos
- **Funciones**: 100% de funciones públicas testeadas

**Rendimiento de Tests:**
- **Tiempo de ejecución**: < 4 segundos
- **Tests paralelos**: Configurados para máximo rendimiento
- **Timeout**: 10 segundos para cálculos complejos

**Mantenibilidad:**
- **Tests legibles**: Nombres descriptivos y claros
- **Datos de prueba**: Reutilizables y bien organizados
- **Configuración centralizada**: Fácil de mantener y actualizar

Los tests del MatchingService proporcionan una base sólida para el sistema de coincidencias automáticas, garantizando que el algoritmo de matching funcione correctamente en todos los escenarios posibles y mantenga la precisión requerida para el negocio.

---

## 3. Modelo de Datos

### **3.1. Diagrama del Modelo de Datos**
![Diagrama del Modelo de Datos](docs/modelo-datos/modelo%20de%20datos.png)
```mermaid
erDiagram
    User {
        uuid id_user PK
        varchar email UK
        varchar password_hash
        enum role
        varchar first_name
        varchar last_name
        varchar phone
        varchar profile_picture
        text bio
        json preferences
        json notification_settings
        enum verification_status
        datetime last_login
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    Property {
        uuid id_property PK
        uuid user_id FK
        varchar title
        text description
        enum property_type
        enum operation_type
        decimal price
        varchar currency
        decimal price_per_sqm
        int bedrooms
        int bathrooms
        int total_bathrooms
        decimal sq_meters
        decimal sq_meters_land
        int floors
        int floor_number
        int parking_spaces
        int year_built
        enum condition
        varchar address
        varchar neighborhood
        varchar city
        varchar state
        varchar zip_code
        decimal latitude
        decimal longitude
        varchar location_accuracy
        json amenities
        enum status
        boolean featured
        int views_count
        int contact_count
        datetime last_updated
        datetime created_at
        datetime updated_at
    }

    PropertyImage {
        uuid id_property_image PK
        uuid property_id FK
        longtext url
        varchar cloudinary_id
        boolean is_primary
        int order_index
        varchar alt_text
        datetime created_at
        datetime updated_at
    }

    Amenity {
        uuid id_amenity PK
        varchar name UK
        varchar category
        varchar icon
        text description
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    PropertyAmenity {
        uuid id_property_amenity PK
        uuid property_id FK
        uuid amenity_id FK
        datetime created_at
    }

    Search {
        uuid id_search PK
        uuid user_id FK
        varchar name
        enum property_type
        enum operation_type
        decimal price_min
        decimal price_max
        int bedrooms_min
        int bathrooms_min
        decimal sq_meters_min
        decimal sq_meters_max
        json amenities
        json neighborhoods
        varchar city
        varchar state
        boolean is_active
        enum notification_frequency
        datetime created_at
        datetime updated_at
    }

    Polygon {
        uuid id_polygon PK
        uuid user_id FK
        uuid search_id FK
        varchar name
        json coordinates
        varchar color
        boolean is_active
        datetime created_at
    }

    Match {
        uuid id_match PK
        uuid user_id FK
        uuid property_id FK
        uuid search_id FK
        decimal match_percentage
        json match_criteria
        enum status
        datetime notified_at
        datetime created_at
        datetime updated_at
    }

    Favorite {
        uuid id_favorite PK
        uuid user_id FK
        uuid property_id FK
        text notes
        datetime created_at
    }

    Message {
        uuid id_message PK
        uuid sender_id FK
        uuid receiver_id FK
        uuid property_id FK
        text content
        enum message_type
        datetime read_at
        boolean is_deleted
        datetime created_at
    }

    Notification {
        uuid id_notification PK
        uuid user_id FK
        enum type
        varchar title
        text content
        json data
        datetime read_at
        datetime sent_at
        datetime created_at
    }

    PropertyView {
        uuid id_property_view PK
        uuid property_id FK
        uuid user_id FK
        varchar ip_address
        text user_agent
        datetime viewed_at
    }

    PasswordReset {
        uuid id_password_reset PK
        uuid user_id FK
        varchar token
        datetime expires_at
        boolean used
        datetime created_at
    }

    User ||--o{ Property : "publishes"
    User ||--o{ Search : "creates"
    User ||--o{ Polygon : "defines"
    User ||--o{ Match : "receives"
    User ||--o{ Favorite : "saves"
    User ||--o{ Message : "sends"
    User ||--o{ Message : "receives"
    User ||--o{ Notification : "receives"
    User ||--o{ PasswordReset : "requests"
    Property ||--o{ PropertyImage : "has"
    Property ||--o{ PropertyAmenity : "has"
    Property ||--o{ Match : "matched_in"
    Property ||--o{ Favorite : "favorited_in"
    Property ||--o{ Message : "discussed_in"
    Property ||--o{ PropertyView : "viewed_in"
    Amenity ||--o{ PropertyAmenity : "belongs_to"
    Search ||--o{ Polygon : "has"
    Search ||--o{ Match : "generates"
    User ||--o{ PropertyView : "views"
```


### **3.2. Descripción de Entidades Principales**

#### **1. User (Usuarios)**
**Propósito:** Gestión de usuarios del sistema con diferentes roles y perfiles.

**Clave Primaria:** `id_user` (UUID, PRIMARY KEY)

**Atributos Principales:**
- `email` (VARCHAR, UNIQUE, NOT NULL): Correo electrónico del usuario
- `password_hash` (VARCHAR, NOT NULL): Hash de la contraseña (bcrypt)
- `role` (ENUM, NOT NULL): Rol del usuario (user, agent, admin)
- `first_name` (VARCHAR, NOT NULL): Nombre del usuario
- `last_name` (VARCHAR, NOT NULL): Apellido del usuario
- `phone` (VARCHAR, UNIQUE): Número telefónico opcional
- `profile_picture` (VARCHAR): URL de la foto de perfil
- `bio` (TEXT): Descripción personal del usuario
- `preferences` (JSON): Preferencias de búsqueda guardadas
- `notification_settings` (JSON): Configuración de notificaciones
- `verification_status` (ENUM): Estado de verificación (email, phone, id, verified)
- `last_login` (DATETIME): Último acceso al sistema
- `is_active` (BOOLEAN, DEFAULT true): Estado activo/inactivo

**Relaciones:**
- **1:N** con Property (un usuario puede publicar múltiples propiedades)
- **1:N** con Search (un usuario puede tener múltiples búsquedas guardadas)
- **1:N** con Polygon (un usuario puede definir múltiples zonas de interés)
- **1:N** con Match (un usuario puede recibir múltiples coincidencias)
- **1:N** con Favorite (un usuario puede guardar múltiples favoritos)
- **1:N** con Message (como sender y receiver)
- **1:N** con Notification (un usuario puede recibir múltiples notificaciones)

**Índices:**
- `idx_email` (email)
- `idx_role` (role)
- `idx_is_active` (is_active)

#### **2. Property (Propiedades)**
**Propósito:** Almacenamiento de todas las propiedades inmobiliarias del sistema.

**Clave Primaria:** `id_property` (UUID, PRIMARY KEY)
**Clave Foránea:** `user_id` (UUID, NOT NULL) → User.id_user

**Atributos Básicos:**
- `title` (VARCHAR, NOT NULL): Título de la propiedad
- `description` (TEXT): Descripción detallada
- `property_type` (ENUM, NOT NULL): Tipo de propiedad (house, apartment, office, land, commercial)
- `operation_type` (ENUM, NOT NULL): Tipo de operación (sale, rent, transfer)
- `price` (DECIMAL, NOT NULL): Precio de la propiedad
- `currency` (VARCHAR, DEFAULT 'MXN'): Moneda del precio

**Características Físicas:**
- `bedrooms` (INT, DEFAULT 0): Número de habitaciones
- `bathrooms` (INT, DEFAULT 0): Número de baños completos
- `total_bathrooms` (INT, DEFAULT 0): Total de baños (completos + medios)
- `sq_meters` (DECIMAL): Metros cuadrados construidos
- `sq_meters_land` (DECIMAL): Metros cuadrados de terreno
- `floors` (INT, DEFAULT 1): Número de pisos
- `floor_number` (INT): Piso específico (para departamentos)
- `parking_spaces` (INT, DEFAULT 0): Espacios de estacionamiento
- `year_built` (INT): Año de construcción
- `condition` (ENUM): Estado (new, used, construction)

**Ubicación:**
- `address` (VARCHAR, NOT NULL): Dirección completa
- `neighborhood` (VARCHAR): Colonia/barrio
- `city` (VARCHAR, NOT NULL): Ciudad
- `state` (VARCHAR, NOT NULL): Estado
- `zip_code` (VARCHAR): Código postal
- `latitude` (DECIMAL): Latitud para geolocalización
- `longitude` (DECIMAL): Longitud para geolocalización
- `location_accuracy` (VARCHAR): Precisión de la ubicación

**Estado y Métricas:**
- `status` (ENUM): Estado (active, inactive, sold, rented)
- `featured` (BOOLEAN, DEFAULT false): Propiedad destacada
- `views_count` (INT, DEFAULT 0): Número de vistas
- `contact_count` (INT, DEFAULT 0): Número de contactos
- `last_updated` (DATETIME): Última actualización

**Relaciones:**
- **N:1** con User (muchas propiedades pertenecen a un usuario)
- **1:N** con PropertyImage (una propiedad tiene múltiples imágenes)
- **1:N** con PropertyAmenity (una propiedad tiene múltiples amenidades)
- **1:N** con Match (una propiedad puede aparecer en múltiples coincidencias)
- **1:N** con Favorite (una propiedad puede ser favorita de múltiples usuarios)
- **1:N** con Message (una propiedad puede ser discutida en múltiples mensajes)
- **1:N** con PropertyView (una propiedad puede ser vista múltiples veces)

**Índices:**
- `idx_user_id` (user_id)
- `idx_property_type` (property_type)
- `idx_operation_type` (operation_type)
- `idx_price` (price)
- `idx_status` (status)
- `idx_location` (latitude, longitude)
- `idx_featured` (featured)

#### **3. PropertyImage (Imágenes de Propiedades)**
**Propósito:** Gestión de imágenes asociadas a las propiedades.

**Clave Primaria:** `id_property_image` (UUID, PRIMARY KEY)
**Clave Foránea:** `property_id` (UUID, NOT NULL) → Property.id_property

**Atributos:**
- `url` (LONGTEXT, NOT NULL): URL de la imagen (soporta imágenes base64)
- `cloudinary_id` (VARCHAR): ID en Cloudinary para gestión
- `is_primary` (BOOLEAN, DEFAULT false): Indica si es la imagen principal
- `order_index` (INT, DEFAULT 0): Orden de las imágenes
- `alt_text` (VARCHAR): Texto alternativo para accesibilidad

**Relaciones:**
- **N:1** con Property (múltiples imágenes pertenecen a una propiedad)

**Índices:**
- `idx_property_id` (property_id)
- `idx_is_primary` (is_primary)
- `idx_order_index` (order_index)

#### **4. Amenity (Amenidades)**
**Propósito:** Catálogo de amenidades disponibles para las propiedades.

**Clave Primaria:** `id_amenity` (UUID, PRIMARY KEY)

**Atributos:**
- `name` (VARCHAR, NOT NULL): Nombre de la amenidad
- `category` (VARCHAR, NOT NULL): Categoría (básicas, lujo, accesibilidad, etc.)
- `icon` (VARCHAR): Ícono para la interfaz de usuario
- `is_active` (BOOLEAN, DEFAULT true): Estado activo/inactivo

**Relaciones:**
- **1:N** con PropertyAmenity (una amenidad puede estar en múltiples propiedades)

**Índices:**
- `idx_category` (category)
- `idx_is_active` (is_active)

#### **5. PropertyAmenity (Relación Propiedad-Amenidad)**
**Propósito:** Tabla de relación N:N entre propiedades y amenidades.

**Clave Primaria:** `id_property_amenity` (UUID, PRIMARY KEY)
**Clave Foránea:** `property_id` (UUID, NOT NULL) → Property.id_property
**Clave Foránea:** `amenity_id` (UUID, NOT NULL) → Amenity.id_amenity

**Restricciones:**
- `UNIQUE(property_id, amenity_id)`: Evita duplicados

**Índices:**
- `idx_property_amenity` (property_id, amenity_id)

#### **6. Search (Búsquedas Guardadas)**
**Propósito:** Almacenamiento de búsquedas guardadas por los usuarios.

**Clave Primaria:** `id_search` (UUID, PRIMARY KEY)
**Clave Foránea:** `user_id` (UUID, NOT NULL) → User.id_user

**Atributos de Filtros:**
- `name` (VARCHAR, NOT NULL): Nombre de la búsqueda guardada
- `property_type` (ENUM): Tipo de propiedad buscada
- `operation_type` (ENUM): Tipo de operación
- `price_min` (DECIMAL): Precio mínimo
- `price_max` (DECIMAL): Precio máximo
- `bedrooms_min` (INT): Habitaciones mínimas
- `bathrooms_min` (INT): Baños mínimos
- `sq_meters_min` (DECIMAL): Metros cuadrados mínimos
- `sq_meters_max` (DECIMAL): Metros cuadrados máximos
- `amenities` (JSON): Amenidades requeridas
- `neighborhoods` (JSON): Colonias de interés
- `city` (VARCHAR): Ciudad de la búsqueda
- `state` (VARCHAR): Estado de la búsqueda
- `is_active` (BOOLEAN, DEFAULT true): Búsqueda activa
- `notification_frequency` (ENUM): Frecuencia de notificaciones

**Relaciones:**
- **N:1** con User (múltiples búsquedas pertenecen a un usuario)
- **1:N** con Polygon (una búsqueda puede tener múltiples polígonos)
- **1:N** con Match (una búsqueda puede generar múltiples coincidencias)

**Índices:**
- `idx_user_id` (user_id)
- `idx_is_active` (is_active)
- `idx_city` (city)
- `idx_state` (state)
- `idx_city_state` (city, state)

#### **7. Polygon (Polígonos de Zonas de Interés)**
**Propósito:** Definición de zonas geográficas de interés para búsquedas.

**Clave Primaria:** `id_polygon` (UUID, PRIMARY KEY)
**Clave Foránea:** `user_id` (UUID, NOT NULL) → User.id_user
**Clave Foránea:** `search_id` (UUID) → Search.id_search (opcional)

**Atributos:**
- `name` (VARCHAR, NOT NULL): Nombre del polígono
- `coordinates` (JSON, NOT NULL): Coordenadas del polígono
- `color` (VARCHAR, DEFAULT '#FF0000'): Color para la interfaz
- `is_active` (BOOLEAN, DEFAULT true): Polígono activo

**Relaciones:**
- **N:1** con User (múltiples polígonos pertenecen a un usuario)
- **N:1** con Search (múltiples polígonos pueden pertenecer a una búsqueda)

**Índices:**
- `idx_user_id` (user_id)
- `idx_search_id` (search_id)

#### **8. Match (Coincidencias)**
**Propósito:** Registro de coincidencias automáticas entre búsquedas y propiedades.

**Clave Primaria:** `id_match` (UUID, PRIMARY KEY)
**Clave Foránea:** `user_id` (UUID, NOT NULL) → User.id_user
**Clave Foránea:** `property_id` (UUID, NOT NULL) → Property.id_property
**Clave Foránea:** `search_id` (UUID) → Search.id_search (opcional)

**Atributos:**
- `match_percentage` (DECIMAL, NOT NULL): Porcentaje de coincidencia
- `match_criteria` (JSON): Criterios que coincidieron
- `status` (ENUM): Estado (new, viewed, contacted, ignored)
- `notified_at` (DATETIME): Cuándo se notificó al usuario

**Relaciones:**
- **N:1** con User (múltiples coincidencias pertenecen a un usuario)
- **N:1** con Property (múltiples coincidencias pueden referir a una propiedad)
- **N:1** con Search (múltiples coincidencias pueden pertenecer a una búsqueda)

**Índices:**
- `idx_user_id` (user_id)
- `idx_property_id` (property_id)
- `idx_search_id` (search_id)
- `idx_status` (status)
- `idx_match_percentage` (match_percentage)

#### **9. Favorite (Favoritos)**
**Propósito:** Propiedades guardadas como favoritas por los usuarios.

**Clave Primaria:** `id_favorite` (UUID, PRIMARY KEY)
**Clave Foránea:** `user_id` (UUID, NOT NULL) → User.id_user
**Clave Foránea:** `property_id` (UUID, NOT NULL) → Property.id_property

**Atributos:**
- `notes` (TEXT): Notas del usuario sobre la propiedad

**Restricciones:**
- `UNIQUE(user_id, property_id)`: Un usuario solo puede favoritear una propiedad una vez

**Relaciones:**
- **N:1** con User (múltiples favoritos pertenecen a un usuario)
- **N:1** con Property (múltiples usuarios pueden favoritear una propiedad)

**Índices:**
- `idx_user_property` (user_id, property_id)

#### **10. Message (Mensajes)**
**Propósito:** Sistema de mensajería interna entre usuarios.

**Clave Primaria:** `id_message` (UUID, PRIMARY KEY)
**Clave Foránea:** `sender_id` (UUID, NOT NULL) → User.id_user
**Clave Foránea:** `receiver_id` (UUID, NOT NULL) → User.id_user
**Clave Foránea:** `property_id` (UUID, NOT NULL) → Property.id_property

**Atributos:**
- `content` (TEXT, NOT NULL): Contenido del mensaje
- `message_type` (ENUM): Tipo de mensaje (text, image, file)
- `read_at` (DATETIME): Cuándo se leyó el mensaje
- `is_deleted` (BOOLEAN, DEFAULT false): Mensaje eliminado

**Relaciones:**
- **N:1** con User como sender (múltiples mensajes enviados por un usuario)
- **N:1** con User como receiver (múltiples mensajes recibidos por un usuario)
- **N:1** con Property (múltiples mensajes pueden referir a una propiedad)

**Índices:**
- `idx_sender_id` (sender_id)
- `idx_receiver_id` (receiver_id)
- `idx_property_id` (property_id)
- `idx_read_at` (read_at)

#### **11. Notification (Notificaciones)**
**Propósito:** Sistema de notificaciones del usuario.

**Clave Primaria:** `id_notification` (UUID, PRIMARY KEY)
**Clave Foránea:** `user_id` (UUID, NOT NULL) → User.id_user

**Atributos:**
- `type` (ENUM): Tipo de notificación (match, message, system, property_update)
- `title` (VARCHAR, NOT NULL): Título de la notificación
- `content` (TEXT, NOT NULL): Contenido de la notificación
- `data` (JSON): Datos adicionales de la notificación
- `read_at` (DATETIME): Cuándo se leyó la notificación
- `sent_at` (DATETIME, NOT NULL): Cuándo se envió la notificación

**Relaciones:**
- **N:1** con User (múltiples notificaciones pertenecen a un usuario)

**Índices:**
- `idx_user_id` (user_id)
- `idx_type` (type)
- `idx_read_at` (read_at)

#### **12. PropertyView (Vistas de Propiedades)**
**Propósito:** Tracking de vistas de propiedades para analytics.

**Clave Primaria:** `id_property_view` (UUID, PRIMARY KEY)
**Clave Foránea:** `property_id` (UUID, NOT NULL) → Property.id_property
**Clave Foránea:** `user_id` (UUID) → User.id_user (opcional, para usuarios no registrados)

**Atributos:**
- `ip_address` (VARCHAR): IP del visitante
- `user_agent` (TEXT): User agent del navegador
- `viewed_at` (DATETIME, NOT NULL): Cuándo se vio la propiedad

**Relaciones:**
- **N:1** con Property (múltiples vistas pertenecen a una propiedad)
- **N:1** con User (múltiples vistas pueden pertenecer a un usuario)

**Índices:**
- `idx_property_id` (property_id)
- `idx_user_id` (user_id)
- `idx_viewed_at` (viewed_at)

#### **13. PasswordReset (Reseteo de Contraseñas)**
**Propósito:** Gestión de tokens para reseteo de contraseñas.

**Clave Primaria:** `id_password_reset` (UUID, PRIMARY KEY)
**Clave Foránea:** `user_id` (UUID, NOT NULL) → User.id_user

**Atributos:**
- `token` (VARCHAR, NOT NULL): Token único para reseteo
- `expires_at` (DATETIME, NOT NULL): Fecha de expiración del token
- `used` (BOOLEAN, DEFAULT false): Indica si el token ya fue usado
- `created_at` (DATETIME, NOT NULL): Fecha de creación

**Relaciones:**
- **N:1** con User (múltiples tokens de reseteo pueden pertenecer a un usuario)

**Índices:**
- `idx_user_id` (user_id)
- `idx_token` (token)
- `idx_expires_at` (expires_at)

#### **Restricciones Globales del Sistema:**

1. **Integridad Referencial:** Todas las claves foráneas tienen CASCADE DELETE donde es apropiado
2. **Claves Primarias UUID:** Todas las entidades utilizan UUID como claves primarias para mejor escalabilidad
3. **Índices Geoespaciales:** Para búsquedas por ubicación en Property
4. **Índices de Texto:** Para búsquedas full-text en Property.title y Property.description
5. **Soft Deletes:** Implementados en User y Property para mantener historial
6. **Timestamps:** Todas las entidades principales tienen created_at y updated_at
7. **Validaciones:** Implementadas a nivel de aplicación y base de datos
8. **Relaciones N:N:** Implementadas correctamente con tablas intermedias (PropertyAmenity)
9. **Amenidades Categorizadas:** Sistema de amenidades organizadas por categorías (básicas, lujo, accesibilidad, tecnología, servicios)

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

### 4.1 Endpoints Principales de ZonMatch

#### 1. **POST /api/auth/login** - Autenticación de Usuario
**Descripción:** Endpoint para autenticar usuarios y obtener token de acceso JWT.

**Rate Limiting:** 10 requests/minuto por IP

**Validaciones:**
- `email`: Debe ser un email válido y normalizado
- `password`: Campo requerido

**Parámetros de entrada:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id_user": "uuid-del-usuario",
      "email": "usuario@ejemplo.com",
      "role": "user",
      "first_name": "Juan",
      "last_name": "Pérez",
      "phone": "+526621234567",
      "profile_picture": null,
      "bio": null,
      "verification_status": "verified",
      "last_login": "2025-09-15T20:43:42.790Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Respuestas de error:**
- **401 - Credenciales inválidas:**
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "error": "INVALID_CREDENTIALS"
}
```

- **401 - Cuenta desactivada:**
```json
{
  "success": false,
  "message": "Cuenta desactivada",
  "error": "ACCOUNT_DEACTIVATED"
}
```

- **400 - Error de validación:**
```json
{
  "success": false,
  "message": "El correo electrónico debe ser válido",
  "validation_errors": [
    {
      "field": "email",
      "message": "El correo electrónico debe ser válido"
    }
  ]
}
```

---

#### 2. **GET /api/search/advanced** - Búsqueda Avanzada de Propiedades
**Descripción:** Endpoint público para buscar propiedades con filtros avanzados y validación geográfica estricta.

**Rate Limiting:** Sin límite (endpoint público)

**Validaciones de Query Parameters:**
- `page`: Entero positivo (default: 1)
- `limit`: Entre 1 y 50 (default: 10)
- `property_type`: house, apartment, office, land, commercial
- `operation_type`: sale, rent, transfer
- `price_min/max`: Numérico
- `bedrooms_min/bathrooms_min`: Entero positivo
- `sq_meters_min/max`: Numérico
- `city/state`: Máximo 100 caracteres
- `amenities`: String separado por comas
- `featured`: Booleano
- `sort_by`: created_at, price, sq_meters, views_count
- `sort_order`: ASC, DESC

**Ejemplo de petición:**
```
GET /api/search/advanced?property_type=house&operation_type=sale&price_min=500000&price_max=2000000&bedrooms_min=2&city=Hermosillo&sort_by=price&sort_order=ASC&page=1&limit=10
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Propiedades obtenidas exitosamente",
  "data": [
    {
      "id_property": "uuid-de-propiedad",
      "title": "Casa en Zona Residencial",
      "description": "Hermosa casa con jardín y estacionamiento",
      "property_type": "house",
      "operation_type": "sale",
      "price": "1500000.00",
      "currency": "MXN",
      "price_per_sqm": "12500.00",
      "bedrooms": 3,
      "bathrooms": 2,
      "total_bathrooms": 0,
      "sq_meters": "120.00",
      "sq_meters_land": null,
      "floors": 1,
      "floor_number": null,
      "parking_spaces": 2,
      "year_built": 2020,
      "condition": "excellent",
      "address": "Calle Principal 123, Col. Centro",
      "neighborhood": "Centro",
      "city": "Hermosillo",
      "state": "Sonora",
      "zip_code": "83000",
      "latitude": "29.07290000",
      "longitude": "-110.95590000",
      "location_accuracy": "high",
      "amenities": ["Estacionamiento", "Jardín", "Seguridad 24/7"],
      "status": "active",
      "featured": true,
      "views_count": 45,
      "contact_count": 3,
      "last_updated": "2025-09-15T20:40:25.000Z",
      "createdAt": "2025-09-15T20:40:25.000Z",
      "updatedAt": "2025-09-15T20:40:25.000Z",
      "images": [
        {
          "id_property_image": "uuid-imagen",
          "url": "https://res.cloudinary.com/dye8kuzbl/image/upload/v1757708845/...",
          "alt_text": "Fachada principal",
          "is_primary": true,
          "order_index": 0
        }
      ],
      "owner": {
        "id_user": "uuid-propietario",
        "first_name": "María",
        "last_name": "García",
        "email": "maria@ejemplo.com",
        "phone": "+526621234567"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "total_pages": 3
  }
}
```

**Respuesta de error (400):**
```json
{
  "success": false,
  "message": "Página debe ser un entero positivo",
  "validation_errors": [
    {
      "field": "page",
      "message": "Página debe ser un entero positivo"
    }
  ]
}
```

---

#### 3. **POST /api/properties** - Crear Nueva Propiedad
**Descripción:** Endpoint protegido para que usuarios autenticados creen nuevas propiedades. Genera matches automáticamente con búsquedas existentes.

**Rate Limiting:** 5 creaciones/hora por usuario

**Headers requeridos:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Validaciones de entrada:**
- `title`: 5-255 caracteres (requerido)
- `description`: Máximo 2000 caracteres (opcional)
- `property_type`: house, apartment, office, land, commercial (requerido)
- `operation_type`: sale, rent, transfer (requerido)
- `price`: Número positivo (requerido)
- `currency`: 3 caracteres (opcional, default: MXN)
- `bedrooms/bathrooms`: Entero positivo (opcional)
- `sq_meters`: Número positivo (opcional)
- `address`: 10-500 caracteres (requerido)
- `city/state`: 2-100 caracteres (requerido)
- `latitude/longitude`: Coordenadas válidas (opcional)
- `amenities`: Array de strings (opcional)
- `temp_images`: Array de imágenes temporales (opcional)

**Parámetros de entrada:**
```json
{
  "title": "Casa Moderna en Zona Premium",
  "description": "Casa de 3 habitaciones con acabados de lujo",
  "property_type": "house",
  "operation_type": "sale",
  "price": 2500000,
  "currency": "MXN",
  "bedrooms": 3,
  "bathrooms": 2,
  "sq_meters": 150,
  "address": "Av. Principal 456, Col. Residencial",
  "city": "Hermosillo",
  "state": "Sonora",
  "latitude": 29.0729,
  "longitude": -110.9559,
  "amenities": ["Estacionamiento", "Jardín", "Seguridad 24/7", "Internet"],
  "status": "active",
  "temp_images": [
    {
      "temp_id": "temp-uuid-1",
      "url": "https://res.cloudinary.com/...",
      "alt_text": "Fachada principal"
    }
  ]
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Propiedad creada exitosamente",
  "data": {
    "id_property": "uuid-nueva-propiedad",
    "title": "Casa Moderna en Zona Premium",
    "description": "Casa de 3 habitaciones con acabados de lujo",
    "property_type": "house",
    "operation_type": "sale",
    "price": "2500000.00",
    "currency": "MXN",
    "price_per_sqm": "16666.67",
    "bedrooms": 3,
    "bathrooms": 2,
    "total_bathrooms": 0,
    "sq_meters": "150.00",
    "sq_meters_land": null,
    "floors": 1,
    "floor_number": null,
    "parking_spaces": 0,
    "year_built": null,
    "condition": null,
    "address": "Av. Principal 456, Col. Residencial",
    "neighborhood": null,
    "city": "Hermosillo",
    "state": "Sonora",
    "zip_code": null,
    "latitude": "29.07290000",
    "longitude": "-110.95590000",
    "location_accuracy": null,
    "amenities": ["Estacionamiento", "Jardín", "Seguridad 24/7", "Internet"],
    "status": "active",
    "featured": false,
    "views_count": 0,
    "contact_count": 0,
    "user_id": "uuid-usuario-autenticado",
    "last_updated": "2025-09-15T20:45:30.000Z",
    "createdAt": "2025-09-15T20:45:30.000Z",
    "updatedAt": "2025-09-15T20:45:30.000Z",
    "images": [
      {
        "id_property_image": "uuid-imagen-final",
        "url": "https://res.cloudinary.com/dye8kuzbl/image/upload/v1757708845/...",
        "alt_text": "Fachada principal",
        "is_primary": true,
        "order_index": 0
      }
    ]
  }
}
```

**Respuestas de error:**
- **400 - Error de validación:**
```json
{
  "success": false,
  "message": "El título debe tener entre 5 y 255 caracteres",
  "validation_errors": [
    {
      "field": "title",
      "message": "El título debe tener entre 5 y 255 caracteres"
    },
    {
      "field": "price",
      "message": "El precio debe ser un número positivo"
    }
  ]
}
```

- **401 - No autenticado:**
```json
{
  "success": false,
  "message": "Token inválido o expirado",
  "error": "INVALID_TOKEN"
}
```

- **429 - Rate limit excedido:**
```json
{
  "success": false,
  "message": "Demasiadas solicitudes de creación de propiedades. Intenta nuevamente en 1 hora.",
  "error": "RATE_LIMIT_EXCEEDED"
}
```

---

### 4.2 Endpoints Adicionales Importantes

#### **Gestión de Búsquedas Guardadas**
- **GET /api/search/saved** - Obtener búsquedas guardadas del usuario
- **POST /api/search/saved** - Crear nueva búsqueda guardada
- **PUT /api/search/saved/:id** - Actualizar búsqueda guardada
- **DELETE /api/search/saved/:id** - Eliminar búsqueda guardada

#### **Sistema de Matches**
- **GET /api/matches** - Obtener matches del usuario (perspectiva buscador)
- **GET /api/matches/properties** - Obtener matches de propiedades (perspectiva propietario)
- **PUT /api/matches/:id/status** - Actualizar estado del match
- **POST /api/matches/generate/property/:id** - Generar matches para propiedad específica

#### **Gestión de Favoritos**
- **GET /api/favorites** - Obtener propiedades favoritas
- **POST /api/favorites/:propertyId** - Agregar a favoritos
- **DELETE /api/favorites/:propertyId** - Remover de favoritos
- **GET /api/favorites/:propertyId/status** - Verificar estado de favorito

#### **Sistema de Notificaciones**
- **GET /api/notifications** - Obtener notificaciones del usuario
- **PATCH /api/notifications/:id/read** - Marcar como leída
- **PATCH /api/notifications/mark-all-read** - Marcar todas como leídas
- **DELETE /api/notifications/:id** - Eliminar notificación

#### **Gestión de Propiedades Avanzada**
- **GET /api/properties/my-properties** - Obtener propiedades del usuario
- **PUT /api/properties/:id** - Actualizar propiedad
- **PATCH /api/properties/:id/featured** - Toggle destacada
- **PATCH /api/properties/:id/status** - Actualizar estado
- **POST /api/properties/:id/increment-views** - Incrementar vistas

### 4.3 Características Especiales de la API

#### **Validación Geográfica Estricta**
- Solo las propiedades **dentro** de los polígonos de búsqueda generan matches
- Distancia máxima de 1km para consideraciones de proximidad
- Algoritmo Ray Casting para verificación de puntos dentro de polígonos
- Validación de coordenadas: latitud (-90 a 90), longitud (-180 a 180)

#### **Sistema de Matching Automático**
- Al crear/editar propiedades se generan matches automáticamente
- Al crear/editar búsquedas se generan matches automáticamente
- Notificaciones en tiempo real via WebSocket (Socket.IO)
- Cálculo de porcentaje de coincidencia basado en criterios múltiples

#### **Rate Limiting Detallado**
- **Autenticación:** 10 requests/minuto por IP
- **Propiedades:** 5 creaciones/hora por usuario
- **Búsquedas:** 50 requests/minuto por usuario
- **Matches:** 50 requests/minuto por usuario
- **Favoritos:** 30 requests/minuto por usuario
- **Notificaciones:** 100 requests/minuto por usuario

#### **Paginación Consistente**
- Todos los endpoints de listado incluyen paginación
- Parámetros estándar: `page`, `limit`, `total`, `total_pages`
- Límite máximo: 50 elementos por página
- Límite por defecto: 10 elementos

#### **Sistema de Imágenes Avanzado**
- Integración con Cloudinary para almacenamiento
- Soporte para imágenes temporales durante creación
- Validación de tipos de archivo y tamaños
- Generación automática de URLs optimizadas
- Soporte para múltiples imágenes por propiedad

#### **Validaciones Robustas**
- Validación de entrada con express-validator
- Sanitización automática de datos
- Mensajes de error detallados por campo
- Validación de tipos de datos específicos
- Normalización de emails y teléfonos

#### **Sistema de Roles y Permisos**
- **user:** Usuario estándar (crear propiedades, búsquedas, favoritos)
- **agent:** Agente inmobiliario (funcionalidades extendidas)
- **admin:** Administrador (acceso completo al sistema)

#### **WebSocket en Tiempo Real**
- Conexión autenticada con JWT
- Notificaciones instantáneas de matches
- Gestión de conexiones por usuario
- Reconexión automática en caso de desconexión

#### **Manejo de Errores Estructurado**
- Códigos de error consistentes
- Mensajes descriptivos en español
- Logging detallado para debugging
- Respuestas de error estandarizadas

#### **Seguridad Avanzada**
- Autenticación JWT con expiración
- Rate limiting por endpoint
- Validación de entrada estricta
- Sanitización de datos de usuario
- Headers de seguridad configurados

---

## 5. Historias de Usuario

**Historia de Usuario 1**
  Como buscador de propiedades, quiero definir zonas de interés dibujando polígonos en el mapa para encontrar propiedades solo en las áreas que realmente me interesan.

**Historia de Usuario 2**
  Como agente inmobiliario, quiero recibir notificaciones automáticas cuando una nueva propiedad coincide con búsquedas activas de clientes para contactar prospectos calificados inmediatamente.

**Historia de Usuario 3**
  Como buscador, quiero guardar propiedades como favoritas y compararlas en una tabla para tomar decisiones informadas entre mis opciones preferidas.

**Historia de Usuario 4**
  Como usuario interesado en una propiedad, quiero contactar al publicador por chat interno o WhatsApp para obtener información adicional de forma inmediata.

**Historia de Usuario 5**
  Como publicador, quiero ver métricas de rendimiento de mis propiedades (vistas, contactos, matches) para optimizar mis publicaciones y estrategia comercial.

**Historia de Usuario Core 1**
  Historia de Usuario 1: Búsqueda Geográfica con Polígonos
  Rol del usuario: Buscador de propiedades (comprador o inquilino)
  Objetivo: Definir zonas de interés personalizadas dibujando figuras directamente en el mapa
  Beneficio esperado: Encontrar propiedades solo en las áreas geográficas específicas que realmente le interesan, eliminando resultados irrelevantes fuera de su zona de interés.
  Criterios de aceptación:
  [ ] El usuario puede acceder a la herramienta de dibujo de figuras desde la pantalla de búsqueda
  [ ] El sistema muestra solo las propiedades que están dentro de las figuras dibujadas
  [ ] El usuario puede editar, eliminar o desactivar figuras existentes
  [ ] Las figuras se guardan automáticamente y persisten entre sesiones
  [ ] El sistema valida que al menos una figura esté activa para realizar la búsqueda
  [ ] La búsqueda se actualiza en tiempo real al modificar los datos o las figuras
  Dependencias o notas relevantes:
  Requiere integración con Google Maps API
  Las figuras dibujadas se almacenan en la tabla Polygon vinculados al usuario
  Debe funcionar correctamente en dispositivos móviles y desktop

**Historia de Usuario 2**
  Historia de Usuario 2: Sistema de Matches Automáticos
  Rol del usuario: Agente inmobiliario o publicador
  Objetivo: Recibir notificaciones automáticas cuando una nueva propiedad coincide con búsquedas activas de clientes
  Beneficio esperado: Contactar prospectos calificados inmediatamente cuando publico una propiedad, aumentando las posibilidades de conversión y reduciendo el tiempo de venta.
  Criterios de aceptación:
  [ ] El sistema detecta automáticamente cuando una nueva propiedad coincide con búsquedas activas
  [ ] Se genera una notificación inmediata al publicador cuando hay un match
  [ ] La notificación incluye: datos del buscador, porcentaje de coincidencia, y criterios que coincidieron
  [ ] El publicador puede ver el perfil del buscador interesado
  [ ] El sistema calcula el porcentaje de match basado en: precio (40%), ubicación (30%), características (20%), preferencias (10%)
  [ ] Las notificaciones se envían por múltiples canales: in-app, email, y opcionalmente WhatsApp
  [ ] El publicador puede marcar la notificación como leída, contactada o ignorada
  [ ] Se mantiene un historial de todos los matches generados
  Dependencias o notas relevantes:
  Requiere algoritmo de matching con utilidades geográficas
  Depende de que los usuarios tengan búsquedas activas guardadas
  El sistema debe ejecutarse en tiempo real o con frecuencia alta
  Requiere integración con sistema de notificaciones

**Historia de Usuario 3**
  Historia de Usuario 3: Sistema de Contacto Dual
  Rol del usuario: Buscador interesado en una propiedad
  Objetivo: Contactar al publicador de una propiedad usando chat interno o WhatsApp
  Beneficio esperado: Obtener información adicional sobre la propiedad y establecer comunicación directa con el agente, eligiendo el canal de contacto más conveniente para mí.
  Criterios de aceptación:
  [ ] Desde la ficha de propiedad, el usuario ve un botón "Contactar" prominente
  [ ] Al hacer clic, se muestra un modal con dos opciones: "Chat Interno" y "WhatsApp"
  [ ] Si elige chat interno:
  [ ] Se abre una conversación persistente vinculada a la propiedad
  [ ] Se muestra el nombre del agente y la propiedad en el contexto
  [ ] Los mensajes se guardan y son accesibles desde la bandeja de mensajes
  [ ] Se muestran indicadores de estado (en línea, última conexión)
  [ ] Si elige WhatsApp:
  [ ] Se genera un enlace wa.me con mensaje prellenado
  [ ] El mensaje incluye: "Hola, vi tu propiedad en Zonmatch y me interesa más información"
  [ ] En móvil abre la app de WhatsApp, en desktop abre WhatsApp Web
  [ ] Solo funciona si el agente tiene WhatsApp habilitado en su perfil
  [ ] El sistema registra qué canal de contacto utilizó el usuario para analytics
  [ ] La conversación queda vinculada a la propiedad específica
  Dependencias o notas relevantes:
  Requiere que el agente tenga configurado su número de WhatsApp (opcional)
  El chat interno requiere sistema de mensajería en tiempo real
  Debe funcionar correctamente en dispositivos móviles y desktop
  Requiere integración con WhatsApp Business API para funcionalidad avanzada
---

## 6. Tickets de Trabajo

### **TICKET #1: Frontend - Sistema de Notificaciones en Tiempo Real**

#### **Título del Ticket**
Implementación del Sistema de Notificaciones en Tiempo Real para el Frontend de Zonmatch

#### **Descripción General del Problema**
Zonmatch requiere un sistema de notificaciones en tiempo real que permita a los usuarios recibir alertas instantáneas cuando:
- Se generan nuevos matches entre sus búsquedas guardadas y propiedades publicadas
- Se crean, actualizan o eliminan propiedades relevantes
- Se crean o modifican búsquedas guardadas
- Se reciben mensajes o comunicaciones del sistema

El sistema actual carece de esta funcionalidad crítica, lo que limita la experiencia del usuario y reduce la efectividad del matching automático, ya que los usuarios no son notificados proactivamente de oportunidades relevantes.

#### **Objetivo del Ticket**
Desarrollar un sistema completo de notificaciones en tiempo real en el frontend que:
1. Se conecte al backend mediante WebSocket (Socket.IO)
2. Muestre notificaciones en tiempo real en la interfaz de usuario
3. Permita gestionar el estado de las notificaciones (leídas/no leídas)
4. Integre con el sistema de navegación para redirigir a páginas relevantes
5. Mantenga persistencia del estado de notificaciones
6. Proporcione una interfaz intuitiva para gestionar notificaciones

#### **Alcance y Entregables Esperados**

### Entregables Principales:
1. **Servicio de Notificaciones (`notificationService.ts`)**
   - Cliente Socket.IO para conexión en tiempo real
   - Métodos para autenticación WebSocket
   - Gestión de eventos de notificación
   - API HTTP para operaciones CRUD de notificaciones

2. **Store de Estado (`notificationStore.ts`)**
   - Estado global con Zustand
   - Persistencia local con localStorage
   - Acciones para gestionar notificaciones
   - Estado de conexión WebSocket

3. **Componente de Centro de Notificaciones (`NotificationCenter.tsx`)**
   - Interfaz para mostrar notificaciones
   - Filtros por tipo y estado (leídas/no leídas)
   - Acciones para marcar como leídas/eliminar
   - Navegación contextual a páginas relevantes

4. **Integración en Navbar (`Navbar.tsx`)**
   - Badge de notificaciones no leídas
   - Acceso rápido al centro de notificaciones
   - Indicador visual de estado de conexión

5. **Página de Notificaciones (`Notifications.tsx`)**
   - Vista completa de todas las notificaciones
   - Gestión avanzada (marcar todas como leídas, eliminar, etc.)
   - Filtros y búsqueda

6. **Tipos TypeScript (`notifications.ts`)**
   - Interfaces para notificaciones
   - Tipos para eventos WebSocket
   - Enums para estados y tipos

#### **Pasos de Desarrollo de Inicio a Fin**

##### Fase 1: Configuración Base
1. **Instalar dependencias necesarias:**
   ```bash
   npm install socket.io-client
   npm install @types/socket.io-client
   ```

2. **Crear estructura de tipos TypeScript:**
   - Definir interfaces para `INotification`, `NotificationType`, `NotificationData`
   - Crear enums para estados y tipos de notificación
   - Configurar tipos para eventos WebSocket

3. **Configurar API base:**
   - Actualizar `config/api.ts` con endpoints de notificaciones
   - Configurar proxy de Vite para WebSocket
   - Establecer configuración de conexión Socket.IO

##### Fase 2: Servicio de Notificaciones
1. **Implementar `notificationService.ts`:**
   - Configurar cliente Socket.IO con autenticación JWT
   - Implementar métodos de conexión/desconexión
   - Crear listeners para eventos de notificación
   - Implementar métodos HTTP para CRUD de notificaciones
   - Manejar reconexión automática y errores de conexión

2. **Implementar `notificationStore.ts`:**
   - Configurar store Zustand con persistencia
   - Definir estado inicial y acciones
   - Implementar middleware de persistencia
   - Crear selectores para notificaciones filtradas

##### Fase 3: Componentes de UI
1. **Desarrollar `NotificationCenter.tsx`:**
   - Crear drawer lateral con lista de notificaciones
   - Implementar filtros por tipo y estado
   - Añadir acciones de marcar como leído/eliminar
   - Implementar navegación contextual
   - Añadir scroll personalizado y animaciones

2. **Actualizar `Navbar.tsx`:**
   - Integrar badge de notificaciones no leídas
   - Añadir botón de acceso al centro de notificaciones
   - Implementar indicador de estado de conexión
   - Manejar eventos de clic y navegación

3. **Desarrollar `Notifications.tsx`:**
   - Crear página completa de gestión de notificaciones
   - Implementar tabla con paginación
   - Añadir filtros avanzados y búsqueda
   - Crear acciones masivas (marcar todas, eliminar todas)

##### Fase 4: Integración y Testing
1. **Integrar en `App.tsx`:**
   - Inicializar servicio de notificaciones
   - Configurar listeners globales
   - Manejar estado de autenticación

2. **Implementar navegación contextual:**
   - Configurar rutas para diferentes tipos de notificación
   - Implementar redirección automática
   - Manejar parámetros de URL para contexto

3. **Testing y optimización:**
   - Probar conexión WebSocket en diferentes escenarios
   - Validar persistencia de estado
   - Optimizar rendimiento de re-renders
   - Probar navegación contextual

#### **Requisitos Técnicos**

##### Lenguajes y Frameworks:
- TypeScript 4.9+
- React 18+
- Socket.IO Client 4.7+
- Zustand 4.4+
- Material-UI 5.14+

##### Dependencias Principales:
```json
{
  "socket.io-client": "^4.7.4",
  "zustand": "^4.4.7",
  "@mui/material": "^5.14.20",
  "@mui/icons-material": "^5.14.19",
  "react-router-dom": "^6.20.1"
}
```

##### Configuraciones Requeridas:
- Proxy de Vite para WebSocket: `ws://localhost:3001`
- Variables de entorno para URL del backend
- Configuración de CORS en backend
- JWT token para autenticación WebSocket

##### Arquitectura de Componentes:
```
src/
├── services/
│   └── notificationService.ts
├── store/
│   └── notificationStore.ts
├── components/
│   ├── NotificationCenter.tsx
│   └── Navbar.tsx (actualizado)
├── pages/
│   └── Notifications.tsx
├── types/
│   └── notifications.ts
└── config/
    └── api.ts (actualizado)
```

#### **Criterios de Aceptación**

##### Funcionalidad Core:
- [ ] Las notificaciones se reciben en tiempo real via WebSocket
- [ ] El badge de notificaciones muestra el conteo correcto de no leídas
- [ ] Las notificaciones se pueden marcar como leídas individualmente
- [ ] Las notificaciones se pueden eliminar individualmente
- [ ] La navegación contextual funciona para todos los tipos de notificación
- [ ] El estado de notificaciones persiste entre sesiones
- [ ] La reconexión automática funciona cuando se pierde la conexión

##### Interfaz de Usuario:
- [ ] El centro de notificaciones se abre/cierra correctamente
- [ ] Los filtros por tipo y estado funcionan correctamente
- [ ] El scroll funciona correctamente en listas largas
- [ ] Las animaciones y transiciones son fluidas
- [ ] La interfaz es responsive en móviles y desktop
- [ ] Los indicadores de estado de conexión son claros

##### Integración:
- [ ] Las notificaciones se integran correctamente con el sistema de autenticación
- [ ] La navegación contextual redirige a las páginas correctas
- [ ] El sistema funciona correctamente con el backend
- [ ] No hay memory leaks o conexiones WebSocket duplicadas

##### Rendimiento:
- [ ] Las notificaciones se renderizan eficientemente
- [ ] No hay re-renders innecesarios
- [ ] El estado se actualiza de forma optimizada
- [ ] La conexión WebSocket es estable y eficiente

#### **Riesgos y Dependencias**

##### Riesgos Técnicos:
1. **Conexión WebSocket inestable:** Implementar reconexión automática y manejo de errores robusto
2. **Memory leaks:** Limpiar listeners y conexiones al desmontar componentes
3. **Rendimiento con muchas notificaciones:** Implementar paginación y virtualización
4. **Conflictos de estado:** Usar patrones inmutables y evitar mutaciones directas

##### Dependencias:
1. **Backend WebSocket:** Requiere que el backend tenga Socket.IO configurado
2. **Autenticación JWT:** Depende del sistema de autenticación existente
3. **API de notificaciones:** Requiere endpoints REST para CRUD de notificaciones
4. **Sistema de routing:** Depende de React Router para navegación contextual

##### Mitigaciones:
- Implementar fallbacks para cuando WebSocket no esté disponible
- Crear mocks para testing sin dependencias del backend
- Implementar loading states y error boundaries
- Documentar configuración requerida del backend

#### **Ejemplo de Implementación**

##### Servicio de Notificaciones (`notificationService.ts`):
```typescript
import { io, Socket } from 'socket.io-client';
import { buildApiUrl } from '@/config/api';

class NotificationService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io('http://localhost:3001', {
        auth: { token },
        transports: ['websocket']
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        reject(error);
      });

      this.socket.on('notifications', (notifications) => {
        // Actualizar store con notificaciones
      });

      this.socket.on('new_notification', (notification) => {
        // Agregar nueva notificación al store
      });
    });
  }

  async getNotifications(): Promise<INotification[]> {
    const response = await fetch(buildApiUrl('/api/notifications'), {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }

  async markAsRead(notificationId: string): Promise<void> {
    await fetch(buildApiUrl(`/api/notifications/${notificationId}/read`), {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
}

export default new NotificationService();
```

##### Store de Estado (`notificationStore.ts`):
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { INotification } from '@/types/notifications';

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  isConnected: boolean;
  loading: boolean;
  
  // Acciones
  setNotifications: (notifications: INotification[]) => void;
  addNotification: (notification: INotification) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  setConnectionStatus: (status: boolean) => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isConnected: false,
      loading: false,

      setNotifications: (notifications) => {
        const unreadCount = notifications.filter(n => !n.read_at).length;
        set({ notifications, unreadCount });
      },

      addNotification: (notification) => {
        const { notifications } = get();
        const newNotifications = [notification, ...notifications];
        const unreadCount = newNotifications.filter(n => !n.read_at).length;
        set({ notifications: newNotifications, unreadCount });
      },

      markAsRead: (id) => {
        const { notifications } = get();
        const updatedNotifications = notifications.map(n =>
          n.id_notification === id ? { ...n, read_at: new Date().toISOString() } : n
        );
        const unreadCount = updatedNotifications.filter(n => !n.read_at).length;
        set({ notifications: updatedNotifications, unreadCount });
      },

      deleteNotification: (id) => {
        const { notifications } = get();
        const filteredNotifications = notifications.filter(n => n.id_notification !== id);
        const unreadCount = filteredNotifications.filter(n => !n.read_at).length;
        set({ notifications: filteredNotifications, unreadCount });
      },

      setConnectionStatus: (status) => set({ isConnected: status })
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({ notifications: state.notifications })
    }
  )
);
```

##### Componente de Centro de Notificaciones (`NotificationCenter.tsx`):
```typescript
import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { Close as CloseIcon, Circle as CircleIcon } from '@mui/icons-material';
import { useNotificationStore } from '@/store/notificationStore';
import { INotification } from '@/types/notifications';

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ open, onClose }) => {
  const { notifications, markAsRead, deleteNotification } = useNotificationStore();
  const [activeTab, setActiveTab] = useState(0);

  const handleNotificationClick = async (notification: INotification) => {
    if (!notification.read_at) {
      await markAsRead(notification.id_notification);
    }
    // Navegar según el tipo de notificación
    // ... lógica de navegación
    onClose();
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 0: return true; // Todas
      case 1: return !notification.read_at; // No leídas
      case 2: return notification.read_at; // Leídas
      default: return true;
    }
  });

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 400, height: '100vh' }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Notificaciones</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Todas" />
          <Tab label="No leídas" />
          <Tab label="Leídas" />
        </Tabs>

        <Box sx={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
          {filteredNotifications.map((notification) => (
            <ListItem
              key={notification.id_notification}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                cursor: 'pointer',
                backgroundColor: notification.read_at ? 'transparent' : 'action.hover',
                '&:hover': { backgroundColor: 'action.selected' }
              }}
            >
              <ListItemIcon>
                {notification.read_at ? (
                  <CircleIcon color="disabled" />
                ) : (
                  <CircleIcon color="primary" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={notification.message}
              />
              <Chip
                label={notification.type}
                size="small"
                color="primary"
                variant="outlined"
              />
            </ListItem>
          ))}
        </Box>
      </Box>
    </Drawer>
  );
};

export default NotificationCenter;
```

Este ticket proporciona una guía completa y detallada para implementar el sistema de notificaciones en tiempo real en el frontend, siguiendo las mejores prácticas de desarrollo y arquitectura de software.

---

### **TICKET #2: Backend - Sistema de Matching Inteligente**

#### **Título del Ticket**
Implementación del Sistema de Matching Inteligente con Algoritmos Geográficos para el Backend de Zonmatch

#### **Descripción General del Problema**
Zonmatch requiere un sistema de matching inteligente que genere coincidencias automáticas entre propiedades publicadas y búsquedas guardadas de usuarios. El sistema actual carece de algoritmos sofisticados que consideren múltiples criterios ponderados, especialmente la validación geográfica estricta, lo que resulta en matches imprecisos o propiedades que no cumplen con los requisitos de ubicación de los usuarios.

El problema principal es que el sistema de matching debe ser capaz de:
- Validar estrictamente que las propiedades estén dentro de las zonas geográficas definidas por los usuarios
- Calcular scores de coincidencia basados en múltiples criterios ponderados
- Generar notificaciones automáticas cuando se detecten matches relevantes
- Manejar grandes volúmenes de datos de forma eficiente
- Proporcionar resultados precisos y relevantes para los usuarios

#### **Objetivo del Ticket**
Desarrollar un sistema completo de matching inteligente en el backend que:
1. Implemente algoritmos geográficos avanzados para validación de ubicación
2. Calcule scores de coincidencia basados en criterios ponderados
3. Genere matches automáticos entre propiedades y búsquedas
4. Notifique a usuarios y propietarios cuando se detecten coincidencias
5. Optimice el rendimiento para manejar grandes volúmenes de datos
6. Proporcione flexibilidad para ajustar criterios de matching

#### **Alcance y Entregables Esperados**

### Entregables Principales:
1. **Servicio de Matching (`MatchingService.ts`)**
   - Algoritmos de matching basados en reglas
   - Cálculo de scores de coincidencia
   - Generación automática de matches
   - Integración con sistema de notificaciones

2. **Utilidades Geográficas (`geoUtils.ts`)**
   - Validación de punto en polígono
   - Cálculo de distancias geográficas
   - Scoring de ubicación
   - Validación estricta de zonas geográficas

3. **Constantes de Configuración (`geoConstants.ts`)**
   - Configuración de distancias máximas
   - Pesos para criterios de matching
   - Umbrales de coincidencia
   - Configuración de algoritmos geográficos

4. **Controlador de Matching (`MatchingController.ts`)**
   - Endpoints para generar matches
   - Endpoints para consultar matches existentes
   - Endpoints para estadísticas de matching
   - Validación de parámetros de entrada

5. **Modelo de Match (`Match.ts`)**
   - Definición del modelo Sequelize
   - Relaciones con otras entidades
   - Validaciones de datos
   - Índices para optimización

6. **Migración de Base de Datos**
   - Tabla de matches con índices optimizados
   - Relaciones con propiedades y búsquedas
   - Campos para metadatos de matching
   - Triggers para actualizaciones automáticas

#### **Pasos de Desarrollo de Inicio a Fin**

##### Fase 1: Configuración Base y Modelos
1. **Crear modelo de Match:**
   - Definir estructura de la tabla matches
   - Establecer relaciones con User, Property y Search
   - Configurar índices para optimización
   - Implementar validaciones de datos

2. **Crear migración de base de datos:**
   - Script de migración para tabla matches
   - Índices compuestos para consultas eficientes
   - Constraints de integridad referencial
   - Triggers para actualizaciones automáticas

3. **Configurar constantes geográficas:**
   - Definir distancias máximas permitidas
   - Configurar pesos para criterios de matching
   - Establecer umbrales de coincidencia
   - Configurar parámetros de algoritmos

##### Fase 2: Algoritmos Geográficos
1. **Implementar utilidades geográficas:**
   - Algoritmo de punto en polígono (Ray Casting)
   - Cálculo de distancias geodésicas
   - Validación estricta de ubicación
   - Scoring de proximidad geográfica

2. **Desarrollar algoritmos de matching:**
   - Algoritmo de coincidencia por criterios
   - Cálculo de scores ponderados
   - Validación de umbrales mínimos
   - Optimización de consultas geográficas

3. **Implementar validaciones estrictas:**
   - Verificación de intersección geográfica
   - Validación de polígonos de búsqueda
   - Cálculo de scores de ubicación
   - Aplicación de reglas de negocio

##### Fase 3: Servicio de Matching
1. **Desarrollar MatchingService:**
   - Métodos para generar matches automáticos
   - Algoritmos de búsqueda eficientes
   - Cálculo de scores de coincidencia
   - Integración con sistema de notificaciones

2. **Implementar optimizaciones:**
   - Caché de consultas frecuentes
   - Índices geográficos optimizados
   - Consultas SQL eficientes
   - Manejo de grandes volúmenes de datos

3. **Integrar con notificaciones:**
   - Generación automática de notificaciones
   - Notificación a usuarios y propietarios
   - Manejo de eventos de matching
   - Persistencia de resultados

##### Fase 4: API y Testing
1. **Desarrollar controlador de matching:**
   - Endpoints REST para matching
   - Validación de parámetros
   - Manejo de errores
   - Documentación de API

2. **Implementar testing:**
   - Tests unitarios para algoritmos
   - Tests de integración para matching
   - Tests de rendimiento
   - Tests de validación geográfica

3. **Optimización y monitoreo:**
   - Profiling de rendimiento
   - Optimización de consultas
   - Monitoreo de métricas
   - Ajuste de parámetros

#### **Requisitos Técnicos**

##### Lenguajes y Frameworks:
- Node.js 18+
- TypeScript 4.9+
- Express.js 4.x
- Sequelize 6.x
- MySQL 8.0+

##### Dependencias Principales:
```json
{
  "sequelize": "^6.35.0",
  "mysql2": "^3.6.5",
  "express": "^4.18.2",
  "joi": "^17.11.0",
  "winston": "^3.11.0",
  "socket.io": "^4.7.4"
}
```

##### Librerías Geográficas:
```json
{
  "turf": "^6.5.0",
  "@turf/boolean-point-in-polygon": "^6.5.0",
  "@turf/distance": "^6.5.0",
  "@turf/helpers": "^6.5.0"
}
```

##### Configuraciones Requeridas:
- Base de datos MySQL con soporte espacial
- Índices geográficos optimizados
- Configuración de Redis para caché
- Variables de entorno para parámetros de matching

##### Arquitectura de Servicios:
```
src/
├── services/
│   ├── MatchingService.ts
│   └── NotificationService.ts
├── utils/
│   ├── geoUtils.ts
│   └── geoConstants.ts
├── controllers/
│   └── MatchingController.ts
├── models/
│   └── Match.ts
└── database/
    └── migrations/
        └── create-matches.js
```

#### **Criterios de Aceptación**

##### Funcionalidad Core:
- [ ] Los algoritmos geográficos validan correctamente la ubicación de propiedades
- [ ] El sistema genera matches automáticos entre propiedades y búsquedas
- [ ] Los scores de coincidencia se calculan correctamente con criterios ponderados
- [ ] Las notificaciones se envían automáticamente cuando se detectan matches
- [ ] El sistema maneja eficientemente grandes volúmenes de datos
- [ ] La validación geográfica es estricta y precisa

##### Rendimiento:
- [ ] Las consultas de matching se ejecutan en menos de 2 segundos
- [ ] El sistema puede procesar 1000+ propiedades simultáneamente
- [ ] Los índices geográficos optimizan las consultas espaciales
- [ ] El caché mejora el rendimiento de consultas repetitivas
- [ ] La memoria se mantiene estable durante operaciones intensivas

##### Precisión:
- [ ] Los matches geográficos tienen 100% de precisión
- [ ] Los scores de coincidencia reflejan la relevancia real
- [ ] No se generan matches falsos positivos
- [ ] Los criterios de matching son configurables
- [ ] Los umbrales de coincidencia son efectivos

##### Integración:
- [ ] El sistema se integra correctamente con el modelo de datos existente
- [ ] Las notificaciones se envían a través del sistema de notificaciones
- [ ] Los matches se persisten correctamente en la base de datos
- [ ] La API proporciona endpoints funcionales para matching
- [ ] El sistema es compatible con el frontend existente

#### **Riesgos y Dependencias**

##### Riesgos Técnicos:
1. **Rendimiento con grandes volúmenes:** Implementar paginación y procesamiento por lotes
2. **Precisión geográfica:** Validar exhaustivamente algoritmos de punto en polígono
3. **Complejidad de consultas:** Optimizar consultas SQL con índices apropiados
4. **Sincronización de datos:** Manejar consistencia entre matches y notificaciones

##### Dependencias:
1. **Base de datos MySQL:** Requiere soporte para tipos de datos espaciales
2. **Sistema de notificaciones:** Depende del NotificationService existente
3. **Modelos de datos:** Requiere User, Property y Search models
4. **Configuración de Redis:** Para caché de consultas frecuentes

##### Mitigaciones:
- Implementar tests exhaustivos para algoritmos geográficos
- Crear índices optimizados para consultas espaciales
- Implementar monitoreo de rendimiento en tiempo real
- Documentar configuración requerida de la base de datos

#### **Ejemplo de Implementación**

##### Servicio de Matching (`MatchingService.ts`):
```typescript
import { Op } from 'sequelize';
import { Property, Search, Match, User } from '../models';
import { calculateLocationScore, isPointInAnyPolygon } from '../utils/geoUtils';
import { MATCHING_CONFIG } from '../utils/geoConstants';
import NotificationService from './notificationService';

export class MatchingService {
  /**
   * Genera matches automáticos para una propiedad específica
   */
  static async generateMatchesForProperty(propertyId: string): Promise<void> {
    try {
      // Obtener la propiedad con sus datos
      const property = await Property.findByPk(propertyId, {
        include: ['images', 'amenities']
      });

      if (!property || property.status !== 'active') {
        return;
      }

      // Obtener búsquedas activas que podrían coincidir
      const activeSearches = await Search.findAll({
        where: {
          status: 'active',
          notification_frequency: {
            [Op.ne]: 'never'
          }
        },
        include: ['polygons']
      });

      const matches: any[] = [];

      for (const search of activeSearches) {
        const matchScore = await this.calculateMatchScore(property, search);
        
        if (matchScore >= MATCHING_CONFIG.MIN_MATCH_THRESHOLD) {
          matches.push({
            user_id: search.user_id,
            property_id: property.id_property,
            search_id: search.id_search,
            match_percentage: matchScore,
            match_criteria: this.generateMatchCriteria(property, search),
            status: 'pending'
          });
        }
      }

      if (matches.length > 0) {
        await this.saveMatches(matches);
        await this.sendMatchNotifications(matches);
      }

    } catch (error) {
      console.error('Error generando matches para propiedad:', error);
      throw error;
    }
  }

  /**
   * Calcula el score de coincidencia entre una propiedad y una búsqueda
   */
  private static async calculateMatchScore(property: any, search: any): Promise<number> {
    let totalScore = 0;
    let criteriaCount = 0;

    // 1. Validación geográfica (obligatoria)
    const locationScore = this.calculateLocationScore(property, search);
    if (locationScore === 0) {
      return 0; // No hay match si no está en la zona
    }
    totalScore += locationScore * MATCHING_CONFIG.WEIGHTS.LOCATION;
    criteriaCount++;

    // 2. Tipo de propiedad
    if (search.property_type && property.property_type === search.property_type) {
      totalScore += MATCHING_CONFIG.WEIGHTS.PROPERTY_TYPE;
      criteriaCount++;
    }

    // 3. Tipo de operación
    if (search.operation_type && property.operation_type === search.operation_type) {
      totalScore += MATCHING_CONFIG.WEIGHTS.OPERATION_TYPE;
      criteriaCount++;
    }

    // 4. Rango de precio
    const priceScore = this.calculatePriceScore(property, search);
    if (priceScore > 0) {
      totalScore += priceScore * MATCHING_CONFIG.WEIGHTS.PRICE;
      criteriaCount++;
    }

    // 5. Características (habitaciones, baños, área)
    const characteristicsScore = this.calculateCharacteristicsScore(property, search);
    if (characteristicsScore > 0) {
      totalScore += characteristicsScore * MATCHING_CONFIG.WEIGHTS.CHARACTERISTICS;
      criteriaCount++;
    }

    // 6. Amenidades
    const amenitiesScore = this.calculateAmenitiesScore(property, search);
    if (amenitiesScore > 0) {
      totalScore += amenitiesScore * MATCHING_CONFIG.WEIGHTS.AMENITIES;
      criteriaCount++;
    }

    // Normalizar score a porcentaje
    const maxPossibleScore = Object.values(MATCHING_CONFIG.WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    return Math.round((totalScore / maxPossibleScore) * 100);
  }

  /**
   * Calcula el score de ubicación geográfica
   */
  private static calculateLocationScore(property: any, search: any): number {
    if (!search.polygons || search.polygons.length === 0) {
      return 0;
    }

    const propertyPoint = {
      lat: property.latitude,
      lng: property.longitude
    };

    const searchPolygons = search.polygons.map((polygon: any) => ({
      coordinates: polygon.coordinates,
      name: polygon.name
    }));

    // Validación estricta: debe estar dentro del polígono
    if (isPointInAnyPolygon(propertyPoint, searchPolygons)) {
      return 1.0; // Score perfecto si está dentro
    }

    return 0; // No hay match si no está en la zona
  }

  /**
   * Calcula el score de precio
   */
  private static calculatePriceScore(property: any, search: any): number {
    if (!search.price_min && !search.price_max) {
      return 1.0; // Sin restricciones de precio
    }

    const propertyPrice = property.price;
    let score = 0;

    if (search.price_min && search.price_max) {
      // Rango de precio definido
      if (propertyPrice >= search.price_min && propertyPrice <= search.price_max) {
        score = 1.0;
      } else {
        // Penalizar por estar fuera del rango
        const minDiff = Math.abs(propertyPrice - search.price_min);
        const maxDiff = Math.abs(propertyPrice - search.price_max);
        const avgDiff = (minDiff + maxDiff) / 2;
        const range = search.price_max - search.price_min;
        score = Math.max(0, 1 - (avgDiff / range));
      }
    } else if (search.price_min) {
      // Solo precio mínimo
      score = propertyPrice >= search.price_min ? 1.0 : 0;
    } else if (search.price_max) {
      // Solo precio máximo
      score = propertyPrice <= search.price_max ? 1.0 : 0;
    }

    return score;
  }

  /**
   * Calcula el score de características
   */
  private static calculateCharacteristicsScore(property: any, search: any): number {
    let score = 0;
    let criteriaCount = 0;

    // Habitaciones
    if (search.bedrooms_min && property.bedrooms) {
      if (property.bedrooms >= search.bedrooms_min) {
        score += 1.0;
      }
      criteriaCount++;
    }

    // Baños
    if (search.bathrooms_min && property.bathrooms) {
      if (property.bathrooms >= search.bathrooms_min) {
        score += 1.0;
      }
      criteriaCount++;
    }

    // Área
    if (search.sq_meters_min && property.sq_meters) {
      if (property.sq_meters >= search.sq_meters_min) {
        score += 1.0;
      }
      criteriaCount++;
    }

    return criteriaCount > 0 ? score / criteriaCount : 1.0;
  }

  /**
   * Calcula el score de amenidades
   */
  private static calculateAmenitiesScore(property: any, search: any): number {
    if (!search.amenities || search.amenities.length === 0) {
      return 1.0; // Sin restricciones de amenidades
    }

    if (!property.amenities || property.amenities.length === 0) {
      return 0; // Propiedad sin amenidades
    }

    const propertyAmenities = property.amenities;
    const searchAmenities = search.amenities;
    
    const matchingAmenities = searchAmenities.filter((amenity: string) =>
      propertyAmenities.includes(amenity)
    );

    return matchingAmenities.length / searchAmenities.length;
  }

  /**
   * Genera criterios de match para documentación
   */
  private static generateMatchCriteria(property: any, search: any): any {
    return {
      location: {
        property_coordinates: {
          lat: property.latitude,
          lng: property.longitude
        },
        search_polygons: search.polygons?.length || 0,
        within_polygon: true
      },
      property_type: property.property_type === search.property_type,
      operation_type: property.operation_type === search.operation_type,
      price: {
        property_price: property.price,
        search_range: {
          min: search.price_min,
          max: search.price_max
        }
      },
      characteristics: {
        bedrooms: property.bedrooms >= (search.bedrooms_min || 0),
        bathrooms: property.bathrooms >= (search.bathrooms_min || 0),
        sq_meters: property.sq_meters >= (search.sq_meters_min || 0)
      },
      amenities: {
        matching: search.amenities?.filter((amenity: string) =>
          property.amenities?.includes(amenity)
        ) || [],
        total_required: search.amenities?.length || 0
      }
    };
  }

  /**
   * Guarda los matches en la base de datos
   */
  private static async saveMatches(matches: any[]): Promise<void> {
    try {
      await Match.bulkCreate(matches);
      console.log(`✅ Guardados ${matches.length} matches`);
    } catch (error) {
      console.error('❌ Error guardando matches:', error);
      throw error;
    }
  }

  /**
   * Envía notificaciones de matches
   */
  private static async sendMatchNotifications(matches: any[]): Promise<void> {
    try {
      for (const match of matches) {
        // Notificar al usuario que tiene la búsqueda
        await NotificationService.sendNotificationToUser(
          match.user_id,
          'match',
          '¡Nuevo Match Encontrado!',
          `Se encontró una propiedad que coincide con tu búsqueda (${match.match_percentage}% de coincidencia)`,
          {
            match_id: `${match.property_id}-${match.search_id}`,
            property_id: match.property_id,
            search_id: match.search_id,
            match_percentage: match.match_percentage
          }
        );

        // Notificar al propietario de la propiedad
        const property = await Property.findByPk(match.property_id);
        if (property && property.user_id) {
          await NotificationService.sendNotificationToUser(
            property.user_id,
            'match',
            '¡Tu Propiedad Tiene un Nuevo Match!',
            `Tu propiedad coincide con una búsqueda (${match.match_percentage}% de coincidencia)`,
            {
              match_id: `${match.property_id}-${match.search_id}`,
              property_id: match.property_id,
              search_id: match.search_id,
              match_percentage: match.match_percentage
            }
          );
        }
      }
    } catch (error) {
      console.error('❌ Error enviando notificaciones de matches:', error);
    }
  }
}
```

##### Utilidades Geográficas (`geoUtils.ts`):
```typescript
import { booleanPointInPolygon, distance } from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Polygon {
  coordinates: number[][];
  name: string;
}

/**
 * Verifica si un punto está dentro de cualquier polígono
 */
export function isPointInAnyPolygon(point: Coordinate, polygons: Polygon[]): boolean {
  const turfPoint = point([point.lng, point.lat]);
  
  for (const poly of polygons) {
    const turfPolygon = polygon([poly.coordinates]);
    if (booleanPointInPolygon(turfPoint, turfPolygon)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Calcula la distancia entre dos puntos geográficos
 */
export function calculateDistance(point1: Coordinate, point2: Coordinate): number {
  const from = point([point1.lng, point1.lat]);
  const to = point([point2.lng, point2.lat]);
  
  return distance(from, to, { units: 'kilometers' });
}

/**
 * Calcula el score de ubicación basado en proximidad a polígonos
 */
export function calculateLocationScore(
  propertyPoint: Coordinate,
  searchPolygons: Polygon[],
  maxDistance: number = 1
): number {
  // Si está dentro de algún polígono, score perfecto
  if (isPointInAnyPolygon(propertyPoint, searchPolygons)) {
    return 1.0;
  }

  // Validación estricta: Si no está dentro del polígono, score 0
  return 0;
}
```

##### Constantes de Configuración (`geoConstants.ts`):
```typescript
export const MATCHING_CONFIG = {
  // Umbral mínimo de coincidencia para generar match
  MIN_MATCH_THRESHOLD: 50,
  
  // Pesos para criterios de matching
  WEIGHTS: {
    LOCATION: 40,        // Ubicación es el criterio más importante
    PROPERTY_TYPE: 20,   // Tipo de propiedad
    OPERATION_TYPE: 15,  // Tipo de operación
    PRICE: 15,           // Rango de precio
    CHARACTERISTICS: 7,  // Características (habitaciones, baños, área)
    AMENITIES: 3         // Amenidades
  },
  
  // Configuración geográfica
  GEOGRAPHIC: {
    MAX_DISTANCE_KM: 1,      // Distancia máxima para considerar "cerca"
    VERY_FAR_DISTANCE_KM: 2, // Distancia para considerar "muy lejos"
    MIN_DISTANCE_KM: 0.1     // Distancia mínima
  }
} as const;

export const DISTANCE_CONFIG = {
  // Distancia máxima para considerar una propiedad "cerca" de una zona
  MAX_DISTANCE_KM: 1,
  
  // Distancia máxima para búsquedas por radio
  MAX_RADIUS_KM: 50,
  
  // Distancia mínima para considerar una propiedad "lejos"
  MIN_DISTANCE_KM: 0.1,
  
  // Distancia para considerar una propiedad "muy lejos" (score = 0)
  VERY_FAR_DISTANCE_KM: 2
} as const;
```

Este ticket proporciona una guía completa y detallada para implementar el sistema de matching inteligente en el backend, siguiendo las mejores prácticas de desarrollo y arquitectura de software.

---

### **TICKET #3: Base de Datos - Optimización y Escalabilidad**

#### **Título del Ticket**
Optimización y Escalabilidad de la Base de Datos MySQL para Zonmatch

#### **Descripción General del Problema**
Zonmatch requiere una base de datos MySQL optimizada y escalable que pueda manejar eficientemente grandes volúmenes de datos geográficos, consultas complejas de matching, y operaciones de alta concurrencia. El sistema actual carece de optimizaciones específicas para consultas geográficas, índices compuestos eficientes, y estrategias de particionado que permitan escalar horizontalmente.

Los principales problemas identificados son:
- Consultas geográficas lentas sin índices espaciales optimizados
- Falta de particionado para tablas de alto volumen (properties, matches)
- Ausencia de estrategias de caché para consultas frecuentes
- Configuración de base de datos no optimizada para cargas de trabajo geográficas
- Falta de monitoreo y métricas de rendimiento
- Ausencia de estrategias de backup y recuperación para datos críticos

#### **Objetivo del Ticket**
Optimizar y escalar la base de datos MySQL para Zonmatch mediante:
1. Implementación de índices espaciales optimizados para consultas geográficas
2. Configuración de particionado para tablas de alto volumen
3. Optimización de consultas SQL complejas
4. Implementación de estrategias de caché con Redis
5. Configuración de replicación y alta disponibilidad
6. Establecimiento de monitoreo y métricas de rendimiento
7. Implementación de estrategias de backup y recuperación

#### **Alcance y Entregables Esperados**

### Entregables Principales:
1. **Índices Espaciales Optimizados**
   - Índices SPATIAL para coordenadas geográficas
   - Índices compuestos para consultas de matching
   - Índices de texto completo para búsquedas
   - Índices de cobertura para consultas frecuentes

2. **Estrategia de Particionado**
   - Particionado por rango para tabla properties
   - Particionado por hash para tabla matches
   - Particionado por fecha para tablas de logs
   - Scripts de mantenimiento de particiones

3. **Optimización de Consultas**
   - Rewrite de consultas SQL complejas
   - Implementación de vistas materializadas
   - Optimización de JOINs geográficos
   - Uso de EXPLAIN para análisis de rendimiento

4. **Configuración de Caché**
   - Estrategia de caché con Redis
   - Caché de consultas frecuentes
   - Caché de resultados de matching
   - Invalidación inteligente de caché

5. **Replicación y Alta Disponibilidad**
   - Configuración de replicación maestro-esclavo
   - Configuración de cluster MySQL
   - Failover automático
   - Balanceador de carga para lecturas

6. **Monitoreo y Métricas**
   - Dashboard de métricas de rendimiento
   - Alertas de rendimiento
   - Logs de consultas lentas
   - Análisis de uso de recursos

7. **Backup y Recuperación**
   - Estrategia de backup incremental
   - Backup de datos geográficos
   - Procedimientos de recuperación
   - Testing de recuperación de desastres

#### **Pasos de Desarrollo de Inicio a Fin**

##### Fase 1: Análisis y Auditoría
1. **Auditoría de rendimiento actual:**
   - Análisis de consultas lentas
   - Identificación de cuellos de botella
   - Análisis de uso de índices
   - Evaluación de configuración actual

2. **Análisis de datos geográficos:**
   - Evaluación de consultas espaciales
   - Análisis de patrones de acceso
   - Identificación de optimizaciones geográficas
   - Evaluación de precisión de datos

3. **Análisis de carga de trabajo:**
   - Patrones de consultas por hora/día
   - Picos de tráfico identificados
   - Análisis de concurrencia
   - Evaluación de recursos necesarios

##### Fase 2: Optimización de Índices
1. **Implementar índices espaciales:**
   - Crear índices SPATIAL para coordenadas
   - Optimizar consultas de punto en polígono
   - Implementar índices para consultas de proximidad
   - Validar rendimiento de consultas geográficas

2. **Crear índices compuestos:**
   - Índices para consultas de matching
   - Índices para filtros combinados
   - Índices de cobertura para consultas frecuentes
   - Optimizar orden de columnas en índices

3. **Implementar índices de texto:**
   - Índices FULLTEXT para búsquedas
   - Índices para búsquedas de propiedades
   - Optimización de consultas de texto
   - Configuración de stopwords

##### Fase 3: Particionado y Escalabilidad
1. **Implementar particionado de tablas:**
   - Particionado por rango para properties
   - Particionado por hash para matches
   - Particionado por fecha para logs
   - Scripts de mantenimiento automático

2. **Configurar replicación:**
   - Configuración maestro-esclavo
   - Configuración de cluster
   - Implementar failover automático
   - Configurar balanceador de carga

3. **Optimizar configuración MySQL:**
   - Ajustar parámetros de rendimiento
   - Configurar buffer pools
   - Optimizar configuración de conexiones
   - Configurar query cache

##### Fase 4: Caché y Monitoreo
1. **Implementar estrategia de caché:**
   - Configurar Redis para caché
   - Implementar caché de consultas
   - Configurar invalidación de caché
   - Optimizar TTL de caché

2. **Configurar monitoreo:**
   - Implementar dashboard de métricas
   - Configurar alertas de rendimiento
   - Implementar logging de consultas
   - Configurar análisis de recursos

3. **Implementar backup y recuperación:**
   - Configurar backup incremental
   - Implementar backup de datos geográficos
   - Crear procedimientos de recuperación
   - Testing de recuperación de desastres

#### **Requisitos Técnicos**

##### Base de Datos:
- MySQL 8.0+ con soporte espacial
- InnoDB como motor de almacenamiento
- Soporte para particionado
- Configuración de replicación

##### Herramientas de Monitoreo:
- MySQL Enterprise Monitor
- Percona Monitoring and Management
- Grafana para dashboards
- Prometheus para métricas

##### Herramientas de Caché:
- Redis 6.0+
- Redis Cluster para alta disponibilidad
- Configuración de persistencia

##### Herramientas de Backup:
- MySQL Enterprise Backup
- mysqldump para backups lógicos
- XtraBackup para backups físicos
- Scripts de automatización

##### Configuración de Servidor:
- Mínimo 8GB RAM
- SSD para almacenamiento
- CPU multi-core
- Red de alta velocidad

#### **Criterios de Aceptación**

##### Rendimiento:
- [ ] Las consultas geográficas se ejecutan en menos de 100ms
- [ ] Las consultas de matching se completan en menos de 2 segundos
- [ ] El sistema puede manejar 1000+ consultas concurrentes
- [ ] Los índices espaciales mejoran el rendimiento en 80%+
- [ ] El caché reduce las consultas a BD en 60%+

##### Escalabilidad:
- [ ] El particionado permite escalar horizontalmente
- [ ] La replicación distribuye la carga de lectura
- [ ] El cluster puede manejar fallos automáticamente
- [ ] El sistema puede crecer a 1M+ propiedades
- [ ] La configuración soporta 10K+ usuarios concurrentes

##### Disponibilidad:
- [ ] El sistema tiene 99.9% de uptime
- [ ] El failover se completa en menos de 30 segundos
- [ ] Los backups se ejecutan sin impacto en rendimiento
- [ ] La recuperación de desastres funciona correctamente
- [ ] El monitoreo detecta problemas proactivamente

##### Consistencia:
- [ ] Los datos geográficos mantienen precisión
- [ ] Las transacciones mantienen consistencia ACID
- [ ] La replicación mantiene consistencia eventual
- [ ] Los backups son consistentes y recuperables
- [ ] No hay pérdida de datos en operaciones críticas

#### **Riesgos y Dependencias**

##### Riesgos Técnicos:
1. **Pérdida de datos durante migración:** Implementar backups completos antes de cambios
2. **Downtime durante optimización:** Planificar ventanas de mantenimiento
3. **Incompatibilidad de índices:** Validar compatibilidad con aplicaciones existentes
4. **Rendimiento degradado temporalmente:** Monitorear métricas durante cambios

##### Dependencias:
1. **Hardware adecuado:** Requiere servidores con recursos suficientes
2. **Configuración de red:** Requiere red de alta velocidad para replicación
3. **Personal especializado:** Requiere DBA con experiencia en MySQL
4. **Herramientas de monitoreo:** Requiere licencias de herramientas comerciales

##### Mitigaciones:
- Implementar cambios en ambiente de staging primero
- Crear rollback plans para cada cambio
- Monitorear métricas en tiempo real
- Capacitar al equipo en nuevas configuraciones

#### **Ejemplo de Implementación**

##### Índices Espaciales Optimizados:
```sql
-- Índice espacial para coordenadas de propiedades
ALTER TABLE properties 
ADD SPATIAL INDEX idx_property_location (POINT(longitude, latitude));

-- Índice compuesto para consultas de matching
CREATE INDEX idx_matching_criteria ON properties 
(property_type, operation_type, status, created_at);

-- Índice de cobertura para consultas frecuentes
CREATE INDEX idx_property_search ON properties 
(property_type, operation_type, price, bedrooms, bathrooms, status) 
INCLUDE (id_property, title, city, state);

-- Índice FULLTEXT para búsquedas de texto
ALTER TABLE properties 
ADD FULLTEXT INDEX idx_property_text (title, description, amenities);
```

##### Configuración de Particionado:
```sql
-- Particionado por rango para tabla properties
ALTER TABLE properties 
PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- Particionado por hash para tabla matches
ALTER TABLE matches 
PARTITION BY HASH(user_id) 
PARTITIONS 8;
```

##### Consultas Optimizadas:
```sql
-- Consulta optimizada para matching geográfico
SELECT p.*, 
       ST_Distance_Sphere(
           POINT(p.longitude, p.latitude),
           POINT(?, ?)
       ) as distance
FROM properties p
WHERE p.status = 'active'
  AND p.property_type = ?
  AND p.operation_type = ?
  AND p.price BETWEEN ? AND ?
  AND ST_Contains(
      ST_GeomFromText('POLYGON((...))'),
      POINT(p.longitude, p.latitude)
  )
ORDER BY distance
LIMIT 50;

-- Consulta optimizada para estadísticas de matching
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_matches,
    AVG(match_percentage) as avg_score
FROM matches 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date;
```

##### Configuración de Caché Redis:
```typescript
// Configuración de caché para consultas frecuentes
const cacheConfig = {
  // Caché de propiedades por filtros
  propertySearch: {
    key: 'property_search',
    ttl: 300, // 5 minutos
    strategy: 'write-through'
  },
  
  // Caché de matches por usuario
  userMatches: {
    key: 'user_matches',
    ttl: 600, // 10 minutos
    strategy: 'write-behind'
  },
  
  // Caché de estadísticas
  statistics: {
    key: 'statistics',
    ttl: 3600, // 1 hora
    strategy: 'write-through'
  }
};

// Implementación de caché
class DatabaseCache {
  private redis: Redis;
  
  async getCachedQuery(key: string, queryFn: () => Promise<any>): Promise<any> {
    const cached = await this.redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const result = await queryFn();
    await this.redis.setex(key, 300, JSON.stringify(result));
    return result;
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

##### Scripts de Monitoreo:
```sql
-- Query para identificar consultas lentas
SELECT 
    query_time,
    lock_time,
    rows_sent,
    rows_examined,
    sql_text
FROM mysql.slow_log 
WHERE start_time >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY query_time DESC
LIMIT 10;

-- Query para monitorear uso de índices
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    CARDINALITY,
    SUB_PART,
    PACKED,
    NULLABLE
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'zonmatch'
ORDER BY CARDINALITY DESC;

-- Query para monitorear particiones
SELECT 
    TABLE_NAME,
    PARTITION_NAME,
    TABLE_ROWS,
    DATA_LENGTH,
    INDEX_LENGTH
FROM information_schema.PARTITIONS 
WHERE TABLE_SCHEMA = 'zonmatch'
  AND PARTITION_NAME IS NOT NULL
ORDER BY TABLE_ROWS DESC;
```

Este ticket proporciona una guía completa y detallada para optimizar y escalar la base de datos MySQL de Zonmatch, siguiendo las mejores prácticas de administración de bases de datos y arquitectura de sistemas.

---

## 7. Pull Requests

### **PULL REQUEST #1: Sistema de Notificaciones en Tiempo Real**

#### **Título del PR**
`feat: Implementar sistema de notificaciones en tiempo real en ZonMatch`

#### **Descripción General**
Implementación completa del sistema de notificaciones en tiempo real para ZonMatch, incluyendo servicios de Socket.IO, gestión de notificaciones en el frontend y backend, y mejoras en la experiencia de usuario con un centro de notificaciones y configuración personalizable.

Este PR introduce la funcionalidad crítica de notificaciones instantáneas que permite a los usuarios recibir alertas en tiempo real cuando se generan matches, se crean/actualizan propiedades relevantes, o se reciben comunicaciones del sistema.

#### **Alcance de los Cambios**
- **Frontend:** Servicios de notificaciones, componentes UI, store de estado
- **Backend:** Servicio de notificaciones, integración con Socket.IO
- **Base de Datos:** Modelo de notificaciones, migraciones
- **Infraestructura:** Configuración de WebSocket, variables de entorno

#### **Detalle de Modificaciones Técnicas**

**Archivos Principales Modificados:**
- `frontend/src/services/notificationService.ts` - Servicio cliente Socket.IO
- `frontend/src/store/notificationStore.ts` - Store Zustand para estado global
- `frontend/src/components/NotificationCenter.tsx` - Centro de notificaciones
- `frontend/src/pages/Notifications.tsx` - Página de gestión de notificaciones
- `frontend/src/components/Navbar.tsx` - Integración de badge de notificaciones
- `backend/src/services/notificationService.ts` - Servicio backend Socket.IO
- `backend/src/models/Notification.ts` - Modelo de datos
- `backend/src/routes/notifications.ts` - Rutas API REST
- `backend/src/controllers/notificationController.ts` - Controlador de notificaciones

**Funcionalidades Implementadas:**
- Conexión WebSocket con autenticación JWT
- Persistencia de estado con localStorage
- Navegación contextual desde notificaciones
- Filtros por tipo y estado (leídas/no leídas)
- Reconexión automática en caso de pérdida de conexión
- Integración con sistema de matching existente

#### **Buenas Prácticas Aplicadas**
- **Clean Code:** Separación clara de responsabilidades entre servicios, stores y componentes
- **Patrón Singleton:** Implementación del NotificationService como singleton
- **Error Handling:** Manejo robusto de errores de conexión y reconexión automática
- **TypeScript:** Tipado estricto con interfaces bien definidas
- **Responsive Design:** Interfaz adaptativa para móviles y desktop
- **Performance:** Optimización de re-renders con Zustand y memoización
- **Security:** Autenticación JWT para conexiones WebSocket
- **Testing:** Estructura preparada para testing unitario e integración

#### **Impacto en el Proyecto**

**Mejoras Aportadas:**
- ✅ Experiencia de usuario significativamente mejorada con notificaciones instantáneas
- ✅ Mayor engagement de usuarios al recibir alertas proactivas
- ✅ Mejora en la efectividad del sistema de matching al notificar automáticamente
- ✅ Interfaz moderna y profesional con centro de notificaciones
- ✅ Persistencia de estado entre sesiones
- ✅ Navegación contextual que mejora la usabilidad

**Riesgos Potenciales:**
- ⚠️ Dependencia de conexión WebSocket estable
- ⚠️ Posible impacto en rendimiento con muchas notificaciones simultáneas
- ⚠️ Requiere configuración correcta de CORS y variables de entorno
- ⚠️ Memory leaks potenciales si no se limpian listeners correctamente

#### **Revisiones o Pruebas Realizadas**
- **Testing de Conexión:** Verificación de conexión WebSocket en diferentes escenarios
- **Testing de Persistencia:** Validación de persistencia de estado entre sesiones
- **Testing de Navegación:** Verificación de navegación contextual a páginas correctas
- **Testing de Reconexión:** Pruebas de reconexión automática tras pérdida de conexión
- **Testing de Responsive:** Verificación de funcionamiento en móviles y desktop
- **Testing de Integración:** Validación de integración con sistema de matching existente

#### **Checklist de Aprobación**
- [ ] Las notificaciones se reciben en tiempo real via WebSocket
- [ ] El badge de notificaciones muestra el conteo correcto de no leídas
- [ ] Las notificaciones se pueden marcar como leídas/eliminar individualmente
- [ ] La navegación contextual funciona para todos los tipos de notificación
- [ ] El estado de notificaciones persiste entre sesiones
- [ ] La reconexión automática funciona correctamente
- [ ] La interfaz es responsive en móviles y desktop
- [ ] No hay memory leaks o conexiones WebSocket duplicadas
- [ ] La integración con el backend funciona correctamente
- [ ] Los tests unitarios pasan correctamente

#### **Notas Adicionales o Dependencias**
- **Dependencias:** Requiere Socket.IO en backend, Zustand en frontend
- **Configuración:** Variables de entorno para URL de WebSocket y JWT
- **Infraestructura:** Configuración de CORS para WebSocket
- **Compatibilidad:** Funciona con el sistema de matching existente
- **Escalabilidad:** Preparado para manejar múltiples usuarios concurrentes

---

### **PULL REQUEST #2: Sistema de Coincidencias Automáticas (Matching Inteligente)**

#### **Título del PR**
`feat: Implementar el sistema de coincidencias automáticas en Zonmatch`

#### **Descripción General**
Implementación del sistema de matching inteligente que constituye el núcleo funcional de ZonMatch. Este PR introduce la lógica de coincidencias automáticas basada en criterios geográficos, de precio, características de la propiedad y preferencias del usuario, incluyendo nuevas utilidades geográficas, servicios de matching y mejoras en la interfaz de usuario para gestionar matches.

Este PR es fundamental para el funcionamiento del proyecto ya que automatiza el proceso de encontrar propiedades que coincidan con las búsquedas de los usuarios, utilizando algoritmos de scoring y validación geográfica estricta.

#### **Alcance de los Cambios**
- **Backend:** Servicios de matching, utilidades geográficas, algoritmos de scoring
- **Frontend:** Interfaz de gestión de matches, visualización de coincidencias
- **Base de Datos:** Tablas de matches, índices de optimización
- **Algoritmos:** Lógica de validación geográfica, cálculo de distancias, scoring

#### **Detalle de Modificaciones Técnicas**

**Archivos Principales Modificados:**
- `backend/src/services/matchingService.ts` - Servicio principal de matching
- `backend/src/utils/geoUtils.ts` - Utilidades geográficas y cálculos
- `backend/src/utils/geoConstants.ts` - Constantes de configuración geográfica
- `backend/src/controllers/matchController.ts` - Controlador de matches
- `backend/src/routes/matches.ts` - Rutas API para matches
- `frontend/src/pages/Matches.tsx` - Página de gestión de matches
- `frontend/src/components/MatchCard.tsx` - Componente de tarjeta de match
- `frontend/src/store/matchStore.ts` - Store para estado de matches
- `backend/database/migrations/007-create-matches.js` - Migración de tabla matches

**Funcionalidades Implementadas:**
- **Algoritmo de Matching Geográfico:** Validación estricta de polígonos de búsqueda
- **Sistema de Scoring:** Cálculo de porcentajes de coincidencia basado en múltiples criterios
- **Validación de Distancia:** Verificación de proximidad con rango configurable (1km máximo)
- **Matching por Criterios:** Coincidencia por precio, tipo de propiedad, amenidades
- **Notificaciones Automáticas:** Integración con sistema de notificaciones
- **Gestión de Estado:** Persistencia y actualización de matches
- **Interfaz de Usuario:** Visualización y gestión de matches encontrados

#### **Buenas Prácticas Aplicadas**
- **Clean Code:** Separación clara entre lógica de negocio y presentación
- **Algoritmos Eficientes:** Optimización de consultas geográficas y cálculos
- **Validación Estricta:** Verificación geográfica como criterio principal
- **Configurabilidad:** Parámetros ajustables para diferentes escenarios
- **Error Handling:** Manejo robusto de errores en cálculos geográficos
- **TypeScript:** Tipado estricto para interfaces de datos geográficos
- **Performance:** Optimización de consultas SQL con índices espaciales
- **Testing:** Estructura preparada para testing de algoritmos de matching

#### **Impacto en el Proyecto**

**Mejoras Aportadas:**
- ✅ **Funcionalidad Core:** Implementación del propósito principal de la aplicación
- ✅ **Precisión Geográfica:** Validación estricta de ubicaciones dentro de polígonos
- ✅ **Automatización:** Eliminación de búsqueda manual de propiedades
- ✅ **Escalabilidad:** Algoritmos optimizados para manejar grandes volúmenes de datos
- ✅ **Flexibilidad:** Sistema configurable para diferentes tipos de búsqueda
- ✅ **Integración:** Conexión perfecta con sistema de notificaciones
- ✅ **Experiencia de Usuario:** Interfaz intuitiva para gestionar matches

**Riesgos Potenciales:**
- ⚠️ **Complejidad Geográfica:** Posibles errores en cálculos de polígonos complejos
- ⚠️ **Performance:** Impacto en rendimiento con muchas búsquedas simultáneas
- ⚠️ **Precisión:** Dependencia de la calidad de los datos geográficos
- ⚠️ **Configuración:** Requiere ajuste fino de parámetros para diferentes mercados

#### **Revisiones o Pruebas Realizadas**
- **Testing Geográfico:** Validación de algoritmos de punto-en-polígono
- **Testing de Scoring:** Verificación de cálculos de porcentajes de coincidencia
- **Testing de Performance:** Pruebas de carga con múltiples búsquedas
- **Testing de Integración:** Validación de integración con sistema de notificaciones
- **Testing de Edge Cases:** Manejo de casos límite geográficos
- **Testing de UI:** Verificación de interfaz de gestión de matches

#### **Checklist de Aprobación**
- [ ] Los matches se generan correctamente para búsquedas válidas
- [ ] La validación geográfica funciona con polígonos complejos
- [ ] El sistema de scoring produce resultados consistentes
- [ ] Las notificaciones se envían automáticamente al generar matches
- [ ] La interfaz de matches es funcional y responsive
- [ ] Los cálculos de distancia son precisos
- [ ] El rendimiento es aceptable con datos de prueba
- [ ] Los edge cases geográficos se manejan correctamente
- [ ] La integración con la base de datos funciona sin errores
- [ ] Los tests unitarios de algoritmos pasan correctamente

#### **Notas Adicionales o Dependencias**
- **Dependencias:** Requiere bibliotecas de cálculo geográfico, MySQL con soporte espacial
- **Configuración:** Variables de entorno para parámetros de matching
- **Datos:** Requiere datos geográficos precisos en formato GeoJSON
- **Compatibilidad:** Integrado con sistema de notificaciones y propiedades
- **Escalabilidad:** Preparado para manejar miles de propiedades y búsquedas

---

### **PULL REQUEST #3: Gestión Avanzada de Imágenes con Cloudinary**

#### **Título del PR**
`feat: Implementar gestión avanzada de imágenes con Cloudinary`

#### **Descripción General**
Implementación completa del sistema de gestión de imágenes utilizando Cloudinary como servicio de almacenamiento y procesamiento en la nube. Este PR incluye funcionalidades de subida, sincronización, reordenamiento de imágenes, verificación de estructura de carpetas y mejoras en la experiencia de usuario para la edición de propiedades.

Este PR es fundamental para la gestión de contenido multimedia del proyecto, proporcionando una solución robusta y escalable para el manejo de imágenes de propiedades con optimización automática, transformaciones y CDN global.

#### **Alcance de los Cambios**
- **Backend:** Servicios de Cloudinary, controladores de imágenes, middleware de subida
- **Frontend:** Componentes de subida, galería de imágenes, reordenamiento
- **Infraestructura:** Configuración de Cloudinary, variables de entorno
- **Base de Datos:** Modelo de imágenes, migraciones, sincronización

#### **Detalle de Modificaciones Técnicas**

**Archivos Principales Modificados:**
- `backend/src/config/cloudinary.ts` - Configuración de Cloudinary
- `backend/src/services/imageService.ts` - Servicio de gestión de imágenes
- `backend/src/controllers/imageController.ts` - Controlador de imágenes
- `backend/src/routes/images.ts` - Rutas API para imágenes
- `backend/src/middleware/upload.ts` - Middleware de subida de archivos
- `frontend/src/components/ImageUpload.tsx` - Componente de subida
- `frontend/src/components/ImageGallery.tsx` - Galería de imágenes
- `frontend/src/components/ImageReorder.tsx` - Reordenamiento de imágenes
- `backend/database/migrations/010-create-property-images.js` - Migración de imágenes
- `backend/database/seeders/006-property-images.js` - Datos de prueba

**Funcionalidades Implementadas:**
- **Subida de Imágenes:** Upload múltiple con validación de tipos y tamaños
- **Optimización Automática:** Compresión y redimensionamiento en la nube
- **CDN Global:** Distribución rápida de imágenes a nivel mundial
- **Transformaciones:** Redimensionamiento, recorte y efectos automáticos
- **Reordenamiento:** Interfaz drag-and-drop para ordenar imágenes
- **Sincronización:** Mantenimiento de consistencia entre BD y Cloudinary
- **Gestión de Estados:** Loading, error handling y feedback visual
- **Validación:** Verificación de tipos de archivo y límites de tamaño

#### **Buenas Prácticas Aplicadas**
- **Clean Code:** Separación clara entre lógica de negocio y presentación
- **Error Handling:** Manejo robusto de errores de subida y sincronización
- **Performance:** Optimización de imágenes y lazy loading
- **Security:** Validación de tipos de archivo y sanitización
- **UX/UI:** Interfaz intuitiva con feedback visual claro
- **TypeScript:** Tipado estricto para interfaces de imágenes
- **Testing:** Estructura preparada para testing de componentes
- **Scalability:** Arquitectura preparada para grandes volúmenes de imágenes

#### **Impacto en el Proyecto**

**Mejoras Aportadas:**
- ✅ **Gestión Profesional:** Sistema robusto de manejo de imágenes
- ✅ **Performance:** Carga rápida de imágenes con CDN global
- ✅ **Escalabilidad:** Capacidad ilimitada de almacenamiento en la nube
- ✅ **Optimización:** Reducción automática de tamaños de archivo
- ✅ **Experiencia de Usuario:** Interfaz intuitiva para gestión de imágenes
- ✅ **Confiabilidad:** Backup automático y alta disponibilidad
- ✅ **Flexibilidad:** Transformaciones dinámicas según necesidades
- ✅ **Costo-Efectividad:** Pago por uso sin costos de infraestructura

**Riesgos Potenciales:**
- ⚠️ **Dependencia Externa:** Dependencia del servicio de Cloudinary
- ⚠️ **Costos:** Posibles costos elevados con alto volumen de imágenes
- ⚠️ **Latencia:** Dependencia de conexión a internet para subida
- ⚠️ **Migración:** Complejidad para migrar a otro proveedor en el futuro

#### **Revisiones o Pruebas Realizadas**
- **Testing de Subida:** Validación de diferentes tipos y tamaños de archivo
- **Testing de Sincronización:** Verificación de consistencia BD-Cloudinary
- **Testing de Performance:** Pruebas de carga con múltiples imágenes
- **Testing de UI/UX:** Validación de interfaz de usuario
- **Testing de Error Handling:** Manejo de errores de red y validación
- **Testing de Transformaciones:** Verificación de optimizaciones automáticas

#### **Checklist de Aprobación**
- [ ] Las imágenes se suben correctamente a Cloudinary
- [ ] La sincronización entre BD y Cloudinary funciona sin errores
- [ ] El reordenamiento de imágenes es funcional
- [ ] Las validaciones de tipo y tamaño funcionan correctamente
- [ ] La interfaz de usuario es intuitiva y responsive
- [ ] El manejo de errores es robusto y claro
- [ ] Las optimizaciones automáticas funcionan correctamente
- [ ] El CDN distribuye las imágenes rápidamente
- [ ] La integración con el sistema de propiedades funciona
- [ ] Los tests unitarios de componentes pasan correctamente

#### **Notas Adicionales o Dependencias**
- **Dependencias:** Requiere cuenta de Cloudinary, bibliotecas de upload
- **Configuración:** Variables de entorno para API keys de Cloudinary
- **Infraestructura:** Configuración de CORS para subida de archivos
- **Compatibilidad:** Integrado con sistema de propiedades existente
- **Escalabilidad:** Preparado para manejar miles de imágenes por propiedad

---

