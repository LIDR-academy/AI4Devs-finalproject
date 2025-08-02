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
     - [1.9.1. Registrarse y configurar perfil](#caso-de-uso-191-registrarse-y-configurar-perfil)
     - [1.9.2. Publicar una propiedad](#caso-de-uso-192-publicar-una-propiedad-core)
     - [1.9.3. Buscar propiedades en el mapa](#caso-de-uso-193-buscar-propiedades-en-el-mapa-core)
     - [1.9.4. Generar coincidencias automáticas](#caso-de-uso-194-generar-coincidencias-automáticas-core)
     - [1.9.5. Contactar al publicador](#caso-de-uso-195-contactar-al-publicador-core)
     - [1.9.6. Administrar mis propiedades](#caso-de-uso-196-administrar-mis-propiedades)
     - [1.9.7. Guardar y comparar propiedades favoritas](#caso-de-uso-197-guardar-y-comparar-propiedades-favoritas)
     - [1.9.8. Recuperar contraseña](#caso-de-uso-198-recuperar-contraseña)
     - [1.9.9. Recibir notificaciones de coincidencias](#caso-de-uso-199-recibir-notificaciones-de-coincidencias)
     - [1.9.10. Cerrar sesión y limpiar sesión segura](#caso-de-uso-1910-cerrar-sesión-y-limpiar-sesión-segura)
2. [Arquitectura del sistema](#2-arquitectura-del-sistema)
   - [2.1. Diagrama de arquitectura](#21-diagrama-de-arquitectura)
   - [2.1.2. Tecnologías por Componente](#212-tecnologías-por-componente)
   - [2.1.3. Patrón Arquitectónico: MVC Monolítico Modular](#213-patrón-arquitectónico-mvc-monolítico-modular)
   - [2.2. Descripción de componentes principales](#22-descripción-de-componentes-principales)
     - [2.2.1. Frontend (Cliente)](#221-frontend-cliente)
     - [2.2.2. Backend (Servidor de Negocio)](#222-backend-servidor-de-negocio)
     - [2.2.3. Base de Datos](#223-base-de-datos)
     - [2.2.4. Sistema de Notificaciones](#224-sistema-de-notificaciones)
     - [2.2.5. Módulo de IA para Coincidencias](#225-módulo-de-ia-para-coincidencias)
     - [2.2.6. Servicios Externos / Integraciones](#226-servicios-externos--integraciones)
     - [2.2.7. Middleware y Seguridad](#227-middleware-y-seguridad)
     - [2.2.8. Infraestructura / Orquestación](#228-infraestructura--orquestación)
   - [2.3. Descripción de alto nivel del proyecto y estructura de ficheros](#23-descripción-de-alto-nivel-del-proyecto-y-estructura-de-ficheros)
   - [2.4. Infraestructura y despliegue](#24-infraestructura-y-despliegue)
   - [2.5. Seguridad](#25-seguridad)
   - [2.6. Tests](#26-tests)
3. [Modelo de datos](#3-modelo-de-datos)
4. [Especificación de la API](#4-especificación-de-la-api)
5. [Historias de usuario](#5-historias-de-usuario)
6. [Tickets de trabajo](#6-tickets-de-trabajo)
7. [Pull requests](#7-pull-requests)

---

## 0. Ficha del proyecto

### **0.1. Tu nombre completo:**
Antonio Alejandro Moreno Martinez

### **0.2. Nombre del proyecto:**
Zonmatch

### **0.3. Descripción breve del proyecto:**
Zonmatch revoluciona la forma en que se descubren propiedades inmobiliarias, resolviendo una de las principales fricciones del mercado: la ineficiencia en el emparejamiento entre oferta y demanda. En un entorno donde los portales tradicionales requieren búsquedas manuales extensas y carecen de retroalimentación proactiva, los usuarios se enfrentan a una experiencia fragmentada y poco personalizada.

### **0.4. URL del proyecto:**

> Puede ser pública o privada, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/).

### 0.5. URL o archivo comprimido del repositorio

> Puedes tenerlo alojado en público o en privado, en cuyo caso deberás compartir los accesos de manera segura. Puedes enviarlos a [alvaro@lidr.co](mailto:alvaro@lidr.co) usando algún servicio como [onetimesecret](https://onetimesecret.com/). También puedes compartir por correo un archivo zip con el contenido


---

## 1. Descripción general del producto
Este sistema propone una solución tecnológica basada en una arquitectura moderna compuesta por ReactJS para una interfaz responsiva e intuitiva, Node.js y MySQL para una gestión robusta de datos, y un módulo de IA personalizado para matchmaking que analiza criterios y comportamientos para generar coincidencias automáticas entre inmuebles y buscadores. Los usuarios pueden definir zonas de interés mediante polígonos interactivos sobre el mapa, aplicar múltiples filtros (tipo de propiedad, amenidades, precio, etc.) y recibir notificaciones en tiempo real cuando una propiedad relevante aparece o se publica.

A diferencia de los portales tradicionales, Zonmatch no es solo una vitrina de propiedades, sino un sistema inteligente de conexión inmediata entre intereses complementarios, replicando la lógica de apps de emparejamiento social. Este enfoque dinámico y centrado en el usuario transforma el descubrimiento inmobiliario en una experiencia ágil, proactiva y placentera.

Diseñado para un público amplio y diverso, Zonmatch ofrece funcionalidades especializadas tanto para usuarios individuales que buscan su nuevo hogar, como para agentes, inmobiliarias y constructoras que desean posicionar sus propiedades de forma más eficiente. Todos los actores pueden beneficiarse de algoritmos de coincidencia inversa, sugerencias automatizadas y analíticas en tiempo real para tomar decisiones más rápidas y precisas.

### **1.1. Objetivo:**
Zonmatch tiene como propósito transformar radicalmente la forma en que personas y empresas descubren, ofertan y conectan con propiedades inmobiliarias, eliminando la necesidad de búsquedas manuales complejas, resultados irrelevantes o interacciones pasivas.

A diferencia de plataformas tradicionales, Zonmatch no se basa en mecánicas visuales tipo "swipe", sino que utiliza una lógica de coincidencia automatizada mediante inteligencia artificial. Los usuarios pueden definir filtros detallados (tipo de propiedad, amenidades, presupuesto, etc.) y delimitar zonas de interés dibujando polígonos en el mapa, lo que permite encontrar propiedades relevantes de forma proactiva, sin búsquedas constantes.

El sistema también genera coincidencias inversas: si un nuevo inmueble publicado coincide con los filtros de un buscador activo, el sistema lo notifica automáticamente. Esta doble vía de emparejamiento acelera la conexión entre oferta y demanda.

¿Qué valor aporta?
	•	Ahorro de tiempo en la búsqueda de inmuebles relevantes.
	•	Coincidencias más precisas, gracias a filtros combinados con geolocalización y IA.
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
  - Algoritmo que genera coincidencias automáticas si una propiedad cumple al menos el 50% de los filtros y está dentro del área definida.
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

**IA aplicada:** Crea el perfil base para el sistema de coincidencias automáticas.

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

**IA aplicada:**
- Ordenamiento por relevancia
- Sugerencias si no hay resultados exactos

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

**IA aplicada:**
- Propiedades similares al final del detalle

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

**IA aplicada:**
- Alertas de búsqueda activa coincidente
- Recomendaciones para optimizar publicaciones

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
> Documenta de manera precisa las instrucciones para instalar y poner en marcha el proyecto en local (librerías, backend, frontend, servidor, base de datos, migraciones y semillas de datos, etc.)

---

## 1.9. Casos de Uso Principales del Sistema

### Caso de Uso 1.9.1: Registrarse y configurar perfil
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

### Caso de Uso 1.9.2: Publicar una propiedad *(Core)*
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

### Caso de Uso 1.9.3: Buscar propiedades en el mapa *(Core)*
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

### Caso de Uso 1.9.4: Generar coincidencias automáticas *(Core)*
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

### Caso de Uso 1.9.5: Contactar al publicador *(Core)*
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

### Caso de Uso 1.9.6: Administrar mis propiedades
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

### Caso de Uso 1.9.7: Guardar y comparar propiedades favoritas
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

### Caso de Uso 1.9.8: Recuperar contraseña
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

### Caso de Uso 1.9.9: Recibir notificaciones de coincidencias
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

### Caso de Uso 1.9.10: Cerrar sesión y limpiar sesión segura
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
    
    subgraph "AI Module"
        I[OpenAI Integration]
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

## 2.1.2. Tecnologías por Componente

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **Frontend** | React.js + TypeScript | Componentes reutilizables, tipado fuerte, PWA capabilities |
| **Backend Framework** | Express.js | Framework minimalista y flexible para Node.js |
| **Patrón Backend** | MVC (Model-View-Controller) | Separación clara de responsabilidades |
| **Base de Datos** | MySQL | ACID, transaccional, maduro y confiable |
| **Cache** | Redis | Sesiones, datos temporales, alta velocidad |
| **IA** | OpenAI API | Matching inteligente sin infraestructura propia |
| **Mapas** | Google Maps API | Mejor cobertura y precisión para México |
| **Notificaciones** | Firebase + WhatsApp Business | Push notifications + mensajería externa |
| **Autenticación** | JWT + OAuth2 | Estándar seguro y flexible |
| **Hosting** | AWS EC2 + S3 | Escalabilidad y redundancia |
| **CI/CD** | GitHub Actions | Integración continua y despliegue automático |

## 2.1.3. Patrón Arquitectónico: MVC Monolítico Modular

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


### **2.2. Descripción de componentes principales:**

#### Índice de Componentes Principales

1. **[Frontend (Cliente)](#221-frontend-cliente)**
   - [React.js Application](#2211-reactjs-application)
   - [Componentes Especializados](#2212-componentes-especializados)

2. **[Backend (Servidor de Negocio)](#222-backend-servidor-de-negocio)**
   - [Express.js Server](#2221-expressjs-server)
   - [Controladores (Controllers)](#2222-controladores-controllers)

3. **[Base de Datos](#223-base-de-datos)**
   - [MySQL Database](#2231-mysql-database)
   - [Redis Cache](#2232-redis-cache)

4. **[Sistema de Notificaciones](#224-sistema-de-notificaciones)**
   - [NotificationService](#2241-notificationservice)
   - [Canales de Notificación](#2242-canales-de-notificación)

5. **[Módulo de IA para Coincidencias](#225-módulo-de-ia-para-coincidencias)**
   - [MatchingService](#2251-matchingservice)
   - [Algoritmo de Matching](#2252-algoritmo-de-matching)

6. **[Servicios Externos / Integraciones](#226-servicios-externos--integraciones)**
   - [Google Maps API](#2261-google-maps-api)
   - [OpenAI Integration](#2262-openai-integration)

7. **[Middleware y Seguridad](#227-middleware-y-seguridad)**
   - [Authentication Middleware](#2271-authentication-middleware)
   - [Security Middleware](#2272-security-middleware)

8. **[Infraestructura / Orquestación](#228-infraestructura--orquestación)**
   - [Servidor de Aplicación](#2281-servidor-de-aplicación)
   - [Monitoreo y Logging](#2282-monitoreo-y-logging)

---

## 2.2.1. Frontend (Cliente)

### **2.2.1.1. React.js Application**
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

### **2.2.1.2. Componentes Especializados**

#### **Mapa Interactivo**
**Propósito:** Visualización y selección geográfica de propiedades
**Tecnología:** React Google Maps + Drawing Manager
**Interacciones:** Integración con Google Maps API para geolocalización y dibujo de polígonos

#### **Sistema de Filtros**
**Propósito:** Búsqueda avanzada con múltiples criterios
**Tecnología:** React Hook Form + Yup validation
**Interacciones:** Comunicación con PropertyService para búsquedas dinámicas

## 2.2.2. Backend (Servidor de Negocio)

### **2.2.2.1. Express.js Server**
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

### **2.2.2.2. Controladores (Controllers)**

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
**Tecnología:** Express.js + OpenAI API + algoritmos personalizados
**Interacciones:**
- Comunicación con MatchingService
- Integración con OpenAI para análisis de preferencias
- Notificaciones automáticas a usuarios

## 2.2.3. Base de Datos

### **2.2.3.1. MySQL Database**
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

### **2.2.3.2. Redis Cache**
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

## 2.2.4. Sistema de Notificaciones

### **2.2.4.1. NotificationService**
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

### **2.2.4.2. Canales de Notificación**

#### **Push Notifications (Firebase)**
**Propósito:** Notificaciones instantáneas en navegador
**Tecnología:** Firebase Cloud Messaging
**Interacciones:** Service Workers en frontend para recepción

#### **WhatsApp Business API**
**Propósito:** Contacto directo entre usuarios y agentes
**Tecnología:** WhatsApp Business API + templates
**Interacciones:** Integración con sistema de chat interno

## 2.2.5. Módulo de IA para Coincidencias

### **2.2.5.1. MatchingService**
**Propósito funcional:** Algoritmo inteligente que genera coincidencias automáticas entre propiedades y buscadores.

**Tecnología utilizada:**
- **OpenAI API:** GPT-4 para análisis de preferencias
- **Algoritmos personalizados:** Lógica de matching basada en criterios múltiples
- **Machine Learning:** Análisis de patrones de comportamiento
- **Geolocalización:** Cálculo de distancias y zonas de interés

**Comunicación e interacciones:**
- **APIs externas:** OpenAI para análisis de texto y preferencias
- **Base de datos:** Consulta de propiedades y perfiles de usuario
- **Sistema de notificaciones:** Activación automática de alertas
- **Cache:** Almacenamiento de resultados de matching

**Buenas prácticas aplicadas:**
- **Patrón Strategy:** Diferentes algoritmos de matching
- **Caching inteligente:** Resultados de matching en Redis
- **Fallback mechanisms:** Algoritmos de respaldo si OpenAI falla
- **Métricas:** Tracking de efectividad de coincidencias

### **2.2.5.2. Algoritmo de Matching**
**Propósito:** Evaluación de compatibilidad entre propiedades y buscadores
**Tecnología:** Algoritmos personalizados + OpenAI embeddings
**Criterios de evaluación:**
- Precio (40% del peso)
- Ubicación geográfica (30% del peso)
- Características de la propiedad (20% del peso)
- Preferencias del usuario (10% del peso)

## 2.2.6. Servicios Externos / Integraciones

### **2.2.6.1. Google Maps API**
**Propósito funcional:** Servicios de geolocalización, validación de direcciones y visualización de mapas.

**Tecnología utilizada:**
- **APIs:** Google Maps JavaScript API, Geocoding API, Places API
- **Cliente:** @googlemaps/js-api-loader
- **Funcionalidades:** Geocoding, reverse geocoding, autocompletado

**Comunicación e interacciones:**
- **Frontend:** Integración directa con React Google Maps
- **Backend:** Validación de direcciones en creación de propiedades
- **Cache:** Almacenamiento de resultados de geocoding

### **2.2.6.2. OpenAI Integration**
**Propósito funcional:** Análisis inteligente de preferencias y generación de sugerencias personalizadas.

**Tecnología utilizada:**
- **API:** OpenAI GPT-4
- **Cliente:** openai Node.js library
- **Funcionalidades:** Análisis de texto, embeddings, generación de sugerencias

**Comunicación e interacciones:**
- **MatchingService:** Análisis de preferencias de usuario
- **PropertyService:** Generación de descripciones optimizadas
- **Cache:** Almacenamiento de embeddings para optimización

## 2.2.7. Middleware y Seguridad

### **2.2.7.1. Authentication Middleware**
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

### **2.2.7.2. Security Middleware**
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

## 2.2.8. Infraestructura / Orquestación

### **2.2.8.1. Servidor de Aplicación**
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

### **2.2.8.2. Monitoreo y Logging**
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

### **2.3. Descripción de alto nivel del proyecto y estructura de ficheros**

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
- **IA:** OpenAI API para análisis de preferencias
- **Mapas:** Google Maps API para geolocalización
- **Notificaciones:** Firebase + WhatsApp Business API

#### **Estructura del Repositorio**

```
zonmatch/
├── 📁 backend/                     # Servidor Node.js + TypeScript + Sequelize
│   ├── 📁 src/
│   │   ├── 📁 controllers/        # Capa de Controladores (MVC)
│   │   │   ├── 📄 authController.ts     # Autenticación y autorización
│   │   │   ├── 📄 propertyController.ts # Gestión de propiedades
│   │   │   ├── 📄 searchController.ts   # Búsquedas y filtros
│   │   │   ├── 📄 matchController.ts    # Sistema de coincidencias
│   │   │   ├── 📄 chatController.ts     # Chat interno
│   │   │   └── 📄 userController.ts     # Gestión de usuarios
│   │   ├── 📁 models/             # Capa de Modelos (MVC)
│   │   │   ├── 📄 index.ts              # Configuración de Sequelize
│   │   │   ├── 📄 User.ts               # Usuario con roles
│   │   │   ├── 📄 Property.ts           # Propiedades inmobiliarias
│   │   │   ├── 📄 Search.ts             # Búsquedas guardadas
│   │   │   ├── 📄 Match.ts              # Coincidencias generadas
│   │   │   ├── 📄 Favorite.ts           # Propiedades favoritas
│   │   │   ├── 📄 Message.ts            # Mensajes del chat
│   │   │   └── 📄 Polygon.ts            # Polígonos de zonas de interés
│   │   ├── 📁 services/           # Capa de Servicios (Lógica de negocio)
│   │   │   ├── 📄 matchService.ts       # Algoritmo de coincidencias
│   │   │   ├── 📄 notificationService.ts # Notificaciones
│   │   │   ├── 📄 emailService.ts       # Envío de emails
│   │   │   ├── 📄 mapService.ts         # Servicios de geolocalización
│   │   │   ├── 📄 openAIService.ts      # Integración OpenAI
│   │   │   └── 📄 whatsAppService.ts    # Integración WhatsApp
│   │   ├── 📁 routes/             # Definición de rutas API
│   │   │   ├── 📄 auth.ts               # Rutas de autenticación
│   │   │   ├── 📄 properties.ts         # Rutas de propiedades
│   │   │   ├── 📄 search.ts             # Rutas de búsqueda
│   │   │   ├── 📄 matches.ts            # Rutas de coincidencias
│   │   │   ├── 📄 chat.ts               # Rutas de chat
│   │   │   └── 📄 users.ts              # Rutas de usuarios
│   │   ├── 📁 middleware/         # Middleware de Express
│   │   │   ├── 📄 auth.ts               # Verificación JWT
│   │   │   ├── 📄 roleAuth.ts           # Autorización por roles
│   │   │   ├── 📄 rateLimit.ts          # Límite de intentos
│   │   │   └── 📄 validation.ts         # Validación de datos
│   │   ├── 📁 utils/              # Utilidades compartidas
│   │   │   ├── 📄 jwt.ts                # Manejo de JWT
│   │   │   ├── 📄 bcrypt.ts             # Encriptación
│   │   │   ├── 📄 validation.ts         # Validaciones
│   │   │   └── 📄 helpers.ts            # Funciones auxiliares
│   │   ├── 📁 config/             # Configuraciones
│   │   │   ├── 📄 database.ts           # Configuración MySQL
│   │   │   ├── 📄 jwt.ts                # Configuración JWT
│   │   │   ├── 📄 email.ts              # Configuración email
│   │   │   └── 📄 redis.ts              # Configuración Redis
│   │   ├── 📁 types/              # Tipos TypeScript
│   │   │   ├── 📄 auth.ts               # Tipos de autenticación
│   │   │   ├── 📄 property.ts           # Tipos de propiedades
│   │   │   ├── 📄 user.ts               # Tipos de usuario
│   │   │   └── 📄 api.ts                # Tipos de API
│   │   └── 📄 app.ts              # Punto de entrada
│   ├── 📁 database/
│   │   ├── 📁 migrations/         # Migraciones Sequelize
│   │   │   ├── 📄 001-create-users.ts
│   │   │   ├── 📄 002-create-properties.ts
│   │   │   ├── 📄 003-create-searches.ts
│   │   │   ├── 📄 004-create-matches.ts
│   │   │   ├── 📄 005-create-favorites.ts
│   │   │   ├── 📄 006-create-messages.ts
│   │   │   └── 📄 007-create-polygons.ts
│   │   ├── 📁 seeders/            # Datos de prueba
│   │   │   ├── 📄 001-demo-users.ts
│   │   │   ├── 📄 002-demo-properties.ts
│   │   │   └── 📄 003-demo-searches.ts
│   │   └── 📁 config/             # Configuración de base de datos
│   │       └── 📄 database.js
│   ├── 📁 tests/                  # Tests del backend
│   │   ├── 📁 unit/
│   │   ├── 📁 integration/
│   │   └── 📁 e2e/
│   ├── 📁 docker/                 # Configuración Docker
│   │   ├── 📄 Dockerfile
│   │   └── 📄 docker-compose.yml
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 .env.example
│   └── 📄 .gitignore
├── 📁 frontend/                    # Aplicación React + TypeScript + Vite
│   ├── 📁 src/
│   │   ├── 📁 components/         # Componentes reutilizables
│   │   │   ├── 📁 common/         # Componentes base
│   │   │   │   ├── 📁 Button/
│   │   │   │   ├── 📁 Input/
│   │   │   │   ├── 📁 Modal/
│   │   │   │   ├── 📁 Card/
│   │   │   │   └── 📁 Loading/
│   │   │   ├── 📁 layout/         # Componentes de layout
│   │   │   │   ├── 📁 Header/
│   │   │   │   ├── 📁 Footer/
│   │   │   │   ├── 📁 Sidebar/
│   │   │   │   └── 📁 Navigation/
│   │   │   └── 📁 features/       # Componentes específicos
│   │   │       ├── 📁 auth/       # Autenticación
│   │   │       ├── 📁 properties/ # Propiedades
│   │   │       ├── 📁 search/     # Búsqueda y filtros
│   │   │       ├── 📁 map/        # Mapa y geolocalización
│   │   │       ├── 📁 chat/       # Chat interno
│   │   │       ├── 📁 favorites/  # Favoritos
│   │   │       └── 📁 dashboard/  # Panel de control
│   │   ├── 📁 pages/              # Páginas principales
│   │   │   ├── 📁 Home/
│   │   │   ├── 📁 Login/
│   │   │   ├── 📁 Register/
│   │   │   ├── 📁 Search/
│   │   │   ├── 📁 PropertyDetail/
│   │   │   ├── 📁 Dashboard/
│   │   │   ├── 📁 Favorites/
│   │   │   └── 📁 Chat/
│   │   ├── 📁 hooks/              # Custom hooks
│   │   │   ├── 📄 useAuth.ts      # Hook de autenticación
│   │   │   ├── 📄 useProperties.ts # Hook de propiedades
│   │   │   ├── 📄 useSearch.ts    # Hook de búsqueda
│   │   │   ├── 📄 useMap.ts       # Hook de mapa
│   │   │   └── 📄 useChat.ts      # Hook de chat
│   │   ├── 📁 services/           # Llamadas a la API
│   │   │   ├── 📄 api.ts          # Configuración base
│   │   │   ├── 📄 authService.ts  # Servicios de auth
│   │   │   ├── 📄 propertyService.ts # Servicios de propiedades
│   │   │   ├── 📄 searchService.ts # Servicios de búsqueda
│   │   │   └── 📄 chatService.ts  # Servicios de chat
│   │   ├── 📁 store/              # Estado global con Zustand
│   │   │   ├── 📄 authStore.ts    # Estado de autenticación
│   │   │   ├── 📄 propertyStore.ts # Estado de propiedades
│   │   │   ├── 📄 searchStore.ts  # Estado de búsqueda
│   │   │   ├── 📄 favoriteStore.ts # Estado de favoritos
│   │   │   └── 📄 index.ts        # Store principal
│   │   ├── 📁 utils/              # Utilidades del frontend
│   │   │   ├── 📄 constants.ts    # Constantes
│   │   │   ├── 📄 helpers.ts      # Funciones auxiliares
│   │   │   ├── 📄 validation.ts   # Validaciones
│   │   │   └── 📄 formatters.ts   # Formateadores
│   │   ├── 📁 types/              # Tipos TypeScript
│   │   │   ├── 📄 auth.ts         # Tipos de autenticación
│   │   │   ├── 📄 property.ts     # Tipos de propiedades
│   │   │   ├── 📄 user.ts         # Tipos de usuario
│   │   │   └── 📄 api.ts          # Tipos de API
│   │   ├── 📁 styles/             # Estilos globales
│   │   │   ├── 📄 globals.css
│   │   │   ├── 📄 variables.css
│   │   │   └── 📄 components.css
│   │   ├── 📄 App.tsx
│   │   └── 📄 main.tsx
│   ├── 📁 public/
│   │   ├── 📄 index.html
│   │   └── 📁 assets/
│   ├── 📄 package.json
│   ├── 📄 tsconfig.json
│   ├── 📄 vite.config.ts          # Configuración Vite
│   ├── 📄 .env.example
│   └── 📄 .gitignore
├── 📁 shared/                      # Código compartido
│   ├── 📁 types/                   # Tipos compartidos
│   │   ├── 📄 common.ts            # Tipos comunes
│   │   ├── 📄 api.ts               # Tipos de API compartidos
│   │   └── 📄 validation.ts        # Esquemas de validación
│   └── 📁 constants/               # Constantes compartidas
│       ├── 📄 roles.ts             # Roles del sistema
│       ├── 📄 propertyTypes.ts     # Tipos de propiedad
│       └── 📄 apiEndpoints.ts      # Endpoints de la API
├── 📁 docs/                        # Documentación técnica
│   ├── 📁 casos-uso/              # Diagramas de casos de uso
│   ├── 📁 flujos-usuario/         # Flujos de usuario
│   ├── 📁 diagramas/              # Diagramas técnicos
│   ├── 📁 api/                     # Documentación de la API
│   ├── 📁 deployment/              # Guías de despliegue
│   └── 📁 architecture/            # Documentación de arquitectura
├── 📁 scripts/                     # Scripts de automatización
│   ├── 📄 setup.sh                 # Script de configuración inicial
│   ├── 📄 deploy.sh                # Script de despliegue
│   ├── 📄 backup.sh                # Script de backup
│   └── 📁 docker/                  # Scripts de Docker
├── 📄 docker-compose.yml           # Docker Compose principal
├── 📄 .env.example                 # Variables de entorno ejemplo
├── 📄 .gitignore
└── 📄 README.md                    # Documentación principal
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
  - `matchService.ts`: Algoritmos de matching con OpenAI
  - `notificationService.ts`: Envío de notificaciones multi-canal
  - `emailService.ts`: Servicio de envío de emails
  - `mapService.ts`: Servicios de geolocalización y mapas
  - `openAIService.ts`: Integración con OpenAI API
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

### **2.4. Infraestructura y Despliegue**

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
        OPENAI[OpenAI API]
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
    API --> OPENAI
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

echo "🚀 Iniciando despliegue..."

# Verificar que estamos en main
if [[ $(git branch --show-current) != "main" ]]; then
    echo "❌ Error: Debes estar en la rama main"
    exit 1
fi

# Ejecutar tests
echo "🧪 Ejecutando tests..."
npm run test

# Build del frontend
echo "🏗️ Build del frontend..."
cd frontend && npm run build && cd ..

# Deploy automático via GitHub Actions
echo "📤 Push a main para trigger de deploy..."
git push origin main

echo "✅ Despliegue iniciado. Revisar GitHub Actions para progreso."
```

**`scripts/rollback.sh`:**
```bash
#!/bin/bash
set -e

echo "🔄 Iniciando rollback..."

# Obtener commit anterior
PREVIOUS_COMMIT=$(git log --oneline -2 | tail -1 | cut -d' ' -f1)

echo "⏪ Revertiendo a commit: $PREVIOUS_COMMIT"
git revert --no-edit HEAD
git push origin main

echo "✅ Rollback completado. Revisar GitHub Actions."
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
OPENAI_API_KEY=xxx
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

### **2.5. Seguridad**

> Enumera y describe las prácticas de seguridad principales que se han implementado en el proyecto, añadiendo ejemplos si procede

### **2.6. Tests**

> Describe brevemente algunos de los tests realizados

---

## 3. Modelo de Datos

### **3.1. Diagrama del modelo de datos:**

> Recomendamos usar mermaid para el modelo de datos, y utilizar todos los parámetros que permite la sintaxis para dar el máximo detalle, por ejemplo las claves primarias y foráneas.


### **3.2. Descripción de entidades principales:**

> Recuerda incluir el máximo detalle de cada entidad, como el nombre y tipo de cada atributo, descripción breve si procede, claves primarias y foráneas, relaciones y tipo de relación, restricciones (unique, not null…), etc.

---

## 4. Especificación de la API

> Si tu backend se comunica a través de API, describe los endpoints principales (máximo 3) en formato OpenAPI. Opcionalmente puedes añadir un ejemplo de petición y de respuesta para mayor claridad

---

## 5. Historias de Usuario

> Documenta 3 de las historias de usuario principales utilizadas durante el desarrollo, teniendo en cuenta las buenas prácticas de producto al respecto.

**Historia de Usuario 1**

**Historia de Usuario 2**

**Historia de Usuario 3**

---

## 6. Tickets de Trabajo

> Documenta 3 de los tickets de trabajo principales del desarrollo, uno de backend, uno de frontend, y uno de bases de datos. Da todo el detalle requerido para desarrollar la tarea de inicio a fin teniendo en cuenta las buenas prácticas al respecto. 

**Ticket 1**

**Ticket 2**

**Ticket 3**

---

## 7. Pull Requests

> Documenta 3 de las Pull Requests realizadas durante la ejecución del proyecto

**Pull Request 1**

**Pull Request 2**

**Pull Request 3**

