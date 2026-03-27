# Security Rules for latearte

Este documento define los estándares de seguridad mandatorios para proteger la integridad cultural, los activos de monetización y la privacidad del usuario en **latearte**.

## 1. Gestión de Identidad y Autenticación (Auth)
- **Estándar**: Todas las sesiones de usuario deben gestionarse exclusivamente mediante **JSON Web Tokens (JWT)**.
- **Sin Estado**: El backend debe ser apátrida (Stateless). Toda validación de sesión debe realizarse decodificando la firma del JWT en el API Gateway o microservicios.
- **Almacenamiento Seguro**: Los tokens deben almacenarse en el frontend utilizando prácticas seguras (ej. Cookies `HttpOnly` o similar) para mitigar el riesgo de robo de tokens.

## 2. Control de Acceso Basado en Roles (RBAC)
Se establecen tres niveles de privilegio estrictos que deben ser validados en cada endpoint:
- **USUARIO**: Acceso a consulta de obras, filtrado y gestión de su propia *Watchlist*.
- **CURADOR**: Permisos para la creación y edición de metadatos (Obras, Hitos, Datos de Contexto).
- **ADMIN**: Control total del sistema, gestión de usuarios y configuración de infraestructura.

**Regla**: Ninguna acción de escritura (`POST`, `PUT`, `DELETE`) puede ejecutarse sin verificar el rol correspondiente en el token JWT.

## 3. Integridad en Monetización y Afiliados
- **Generación Dinámica**: Los enlaces a plataformas externas (MUBI, Netflix, etc.) y sus parámetros de rastreo de afiliados **no deben estar hard-coded** en el frontend.
- **Firma en Backend**: Todo botón de reproducción o link de afiliado debe solicitarse dinámicamente al backend, el cual inyectará los parámetros de monetización y los firmará antes de entregarlos al cliente.
- **Protección**: Se prohíbe exponer las claves de API de terceros en el código cliente.

## 4. Protección de Datos y Defensa
- **Sanitización (XSS)**: Todo contenido curado o introducido por usuarios (ej. notas en Watchlist) debe ser sanitizado antes de ser renderizado para prevenir ataques de Cross-Site Scripting.
- **SECRETOS**: Las llaves de API y credenciales de base de datos nunca deben almacenarse en el código fuente. Se deben utilizar variables de entorno (`.env`) y, en producción, servicios como AWS Secrets Manager.
- **Aislamiento**: Solo el **API Gateway** debe estar expuesto a Internet. Los microservicios y bases de datos deben residir en redes privadas (VPC).

---
**Fuente**: [Diseño de arquitectura Arteflujo_ Hub Cultural.md](file:///c:/Documentos/Cursos/Lidr/IA4Devs/AI4Devs-finalproject/documentacion/Dise%C3%B1o%20de%20arquitectura%20Arteflujo_%20Hub%20Cultural.md)
