# Diagramas C4 - ConectaPH

Documentación de la arquitectura del sistema ConectaPH usando notación C4.

## 1. Diagrama de Contexto (C4 Context)

Muestra el sistema ConectaPH y sus interacciones con actores externos y sistemas.

```mermaid
C4Context
    title Diagrama de Contexto - Sistema ConectaPH
    
    Person(residente, "Residente", "Usuario que reserva zonas comunes desde su apartamento")
    Person(admin, "Administrador", "Gestiona reservas y configura reglas de disponibilidad")
    Person(vigilancia, "Personal de Vigilancia", "Controla acceso de invitados autorizados")
    
    System(conectaph, "ConectaPH", "Plataforma web para gestión de reservas de zonas comunes en copropiedades")
    
    System_Ext(email, "Servicio de Email", "Envía notificaciones por correo (SendGrid/Gmail)")
    System_Ext(sms, "Servicio SMS", "Envía notificaciones por SMS (Twilio)")
    
    BiRel(residente, conectaph, "Crea y consulta reservas")
    BiRel(admin, conectaph, "Aprueba reservas y configura reglas")
    BiRel(vigilancia, conectaph, "Consulta invitados y registra acceso")
    
    Rel(conectaph, email, "Envía notificaciones", "SMTP")
    Rel(conectaph, sms, "Envía alertas", "API REST")
    
    UpdateElementStyle(residente, $fontColor="white", $bgColor="#FF6B6B")
    UpdateElementStyle(admin, $fontColor="white", $bgColor="#4ECDC4")
    UpdateElementStyle(vigilancia, $fontColor="white", $bgColor="#45B7D1")
    UpdateElementStyle(conectaph, $fontColor="white", $bgColor="#5F27CD")
    UpdateElementStyle(email, $fontColor="white", $bgColor="#9C88FF")
    UpdateElementStyle(sms, $fontColor="white", $bgColor="#9C88FF")
```

---

## 2. Diagrama de Contenedores (C4 Container)

Muestra los contenedores principales: Frontend, Backend (Microservicios), Base de Datos e Infraestructura.

```mermaid
C4Container
    title Diagrama de Contenedores - Arquitectura ConectaPH
    
    Person(usuario, "Usuario", "Residente, Administrador o Vigilancia")
    
    System_Boundary(c1, "Navegador del Usuario") {
        Container(frontend, "Aplicación Web", "React / Vue.js", "Interfaz de usuario responsiva para gestión de reservas")
    }
    
    System_Boundary(c2, "Sistema ConectaPH - Backend") {
        Container(apigw, "API Gateway", "Express / Kong", "Punto de entrada único, enrutamiento y autenticación")
        Container(auth, "Auth Service", "Node.js", "Gestión de usuarios, roles y autenticación JWT")
        Container(reservation, "Reservation Service", "Node.js", "Crear, aprobar y gestionar reservas")
        Container(resource, "Resource Service", "Node.js", "Gestión de zonas comunes y reglas")
        Container(guest, "Guest Service", "Node.js", "Gestión de invitados autorizados")
        Container(access, "Access Service", "Node.js", "Control de ingresos y egresos")
        Container(notification, "Notification Service", "Node.js", "Envío de notificaciones por email y SMS")
    }
    
    System_Boundary(c3, "Infraestructura de Datos") {
        ContainerDb(db, "Base de Datos", "PostgreSQL", "Almacena usuarios, reservas, invitados, accesos, auditoría")
        Container(cache, "Cache", "Redis", "Caché de sesiones y datos frecuentes")
        Container(queue, "Cola de Mensajes", "RabbitMQ", "Cola para notificaciones asincrónicas")
    }
    
    System_Ext(smtp, "Servicio SMTP", "SendGrid / Gmail", "Envío de emails")
    
    Rel(usuario, frontend, "Interactúa usando", "HTTPS")
    Rel(frontend, apigw, "Solicita datos y realiza acciones", "REST/JSON")
    
    Rel(apigw, auth, "Valida credenciales")
    Rel(apigw, reservation, "Gestiona reservas")
    Rel(apigw, resource, "Gestiona recursos")
    Rel(apigw, guest, "Gestiona invitados")
    Rel(apigw, access, "Registra acceso")
    Rel(apigw, notification, "Envía notificaciones")
    
    Rel(auth, db, "Lee/escribe usuarios")
    Rel(reservation, db, "Lee/escribe reservas")
    Rel(resource, db, "Lee/escribe recursos")
    Rel(guest, db, "Lee/escribe invitados")
    Rel(access, db, "Lee/escribe accesos")
    Rel(notification, db, "Lee auditoría")
    
    Rel(apigw, cache, "Almacena sesiones")
    
    Rel(notification, queue, "Publica mensajes")
    Rel(queue, smtp, "Envía emails")
    
    UpdateElementStyle(usuario, $fontColor="white", $bgColor="#FF6B6B")
    UpdateElementStyle(apigw, $fontColor="white", $bgColor="#5F27CD")
    UpdateElementStyle(auth, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(reservation, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(resource, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(guest, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(access, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(notification, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(db, $fontColor="white", $bgColor="#FFA502")
    UpdateElementStyle(cache, $fontColor="white", $bgColor="#FF6348")
    UpdateElementStyle(queue, $fontColor="white", $bgColor="#FFD700")
```

---

## 3. Diagrama de Componentes (C4 Component)

Muestra los componentes internos del Reservation Service como ejemplo detallado de un microservicio.

```mermaid
C4Component
    title Diagrama de Componentes - Reservation Service
    
    Container(apigw, "API Gateway", "Express")
    
    System_Boundary(c1, "Reservation Service") {
        Component(controller, "Reservation Controller", "Express Router", "Maneja solicitudes HTTP")
        Component(service, "Reservation Service", "Business Logic", "Lógica de negocio de reservas")
        Component(validation, "Validation Middleware", "Joi/Yup", "Valida datos de entrada")
        Component(auth_middleware, "Auth Middleware", "JWT", "Verifica autenticación")
        Component(repository, "Reservation Repository", "Data Access", "CRUD en base de datos")
        Component(event_emitter, "Event Emitter", "Event Bus", "Emite eventos de reserva")
    }
    
    ContainerDb(db, "PostgreSQL")
    Container(queue, "RabbitMQ")
    
    Rel(apigw, controller, "Enruta solicitudes")
    Rel(controller, validation, "Valida", "solicitud")
    Rel(validation, auth_middleware, "Verifica token")
    Rel(auth_middleware, service, "Procesa")
    Rel(service, repository, "Ejecuta queries")
    Rel(repository, db, "Lee/escribe datos")
    Rel(service, event_emitter, "Emite evento")
    Rel(event_emitter, queue, "Publica a cola")
    Rel(controller, apigw, "Retorna respuesta")
    
    UpdateElementStyle(controller, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(service, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(validation, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(auth_middleware, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(repository, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(event_emitter, $fontColor="white", $bgColor="#00D4FF")
```

---

## 4. Diagrama de Despliegue (C4 Deployment)

Muestra cómo se despliegan los contenedores en el ambiente on-premise.

```mermaid
C4Deployment
    title Diagrama de Despliegue - Infraestructura On-Premise
    
    Deployment_Node(user_browser, "Navegador del Usuario", "Desktop / Mobile") {
        Container(frontend, "ConectaPH Frontend", "React/Vue.js", "SPA")
    }
    
    Deployment_Node(server, "Servidor On-Premise") {
        Deployment_Node(docker, "Docker Engine") {
            Deployment_Node(apigw_container, "api-gateway:3000", "Container") {
                Container(apigw_svc, "API Gateway")
            }
            
            Deployment_Node(auth_container, "auth-service:3001", "Container") {
                Container(auth_svc, "Auth Service")
            }
            
            Deployment_Node(reservation_container, "reservation-service:3002", "Container") {
                Container(reservation_svc, "Reservation Service")
            }
            
            Deployment_Node(resource_container, "resource-service:3003", "Container") {
                Container(resource_svc, "Resource Service")
            }
            
            Deployment_Node(guest_container, "guest-service:3004", "Container") {
                Container(guest_svc, "Guest Service")
            }
            
            Deployment_Node(access_container, "access-service:3005", "Container") {
                Container(access_svc, "Access Service")
            }
            
            Deployment_Node(notification_container, "notification-service:3006", "Container") {
                Container(notification_svc, "Notification Service")
            }
            
            Deployment_Node(postgres_container, "postgres:5432", "Container") {
                ContainerDb(postgres_db, "PostgreSQL")
            }
            
            Deployment_Node(redis_container, "redis:6379", "Container") {
                Container(redis_cache, "Redis")
            }
            
            Deployment_Node(rabbitmq_container, "rabbitmq:5672", "Container") {
                Container(rabbitmq_queue, "RabbitMQ")
            }
        }
    }
    
    Rel(frontend, apigw_svc, "Solicitudes HTTPS", "Puerto 3000")
    Rel(apigw_svc, auth_svc, "Comunica")
    Rel(apigw_svc, reservation_svc, "Comunica")
    Rel(apigw_svc, resource_svc, "Comunica")
    Rel(apigw_svc, guest_svc, "Comunica")
    Rel(apigw_svc, access_svc, "Comunica")
    Rel(apigw_svc, notification_svc, "Comunica")
    
    Rel(auth_svc, postgres_db, "Consulta/Actualiza")
    Rel(reservation_svc, postgres_db, "Consulta/Actualiza")
    Rel(resource_svc, postgres_db, "Consulta/Actualiza")
    Rel(guest_svc, postgres_db, "Consulta/Actualiza")
    Rel(access_svc, postgres_db, "Consulta/Actualiza")
    Rel(notification_svc, postgres_db, "Consulta/Actualiza")
    
    Rel(notification_svc, rabbitmq_queue, "Publica eventos")
    Rel(apigw_svc, redis_cache, "Almacena sesiones")
    
    UpdateElementStyle(frontend, $fontColor="white", $bgColor="#FF6B6B")
    UpdateElementStyle(apigw_svc, $fontColor="white", $bgColor="#5F27CD")
    UpdateElementStyle(auth_svc, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(reservation_svc, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(resource_svc, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(guest_svc, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(access_svc, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(notification_svc, $fontColor="white", $bgColor="#00D4FF")
    UpdateElementStyle(postgres_db, $fontColor="white", $bgColor="#FFA502")
    UpdateElementStyle(redis_cache, $fontColor="white", $bgColor="#FF6348")
    UpdateElementStyle(rabbitmq_queue, $fontColor="white", $bgColor="#FFD700")
```

---

## 5. Relaciones entre diagramas C4

```mermaid
graph TB
    subgraph "Niveles C4"
        L1["1️⃣ Context<br/>Sistema y actores externos<br/>(Alto nivel)"]
        L2["2️⃣ Container<br/>Componentes principales<br/>(Frontend, Backend, BD)"]
        L3["3️⃣ Component<br/>Internals de cada servicio<br/>(Controllers, Services, Repos)"]
        L4["4️⃣ Code<br/>Clases y funciones<br/>(Bajo nivel)"]
    end
    
    L1 --> L2
    L2 --> L3
    L3 --> L4
    
    style L1 fill:#FF6B6B,stroke:#333,color:#fff
    style L2 fill:#5F27CD,stroke:#333,color:#fff
    style L3 fill:#00D4FF,stroke:#333,color:#fff
    style L4 fill:#FFA502,stroke:#333,color:#fff
```

---

## Conclusiones

- **Level 1 (Context):** Visión general del sistema y stakeholders
- **Level 2 (Container):** Arquitectura de microservicios con 7 servicios
- **Level 3 (Component):** Detalles internos de cada servicio (ejemplo: Reservation Service)
- **Level 4 (Code):** Implementación específica de clases y métodos (no incluido en diagramas, es código fuente)

La arquitectura C4 permite comunicación clara en diferentes niveles de abstracción según la audiencia.
