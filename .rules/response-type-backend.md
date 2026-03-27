# Backend Response Standards for latearte

Este documento define el formato y estándar técnico mandatorio para todas las respuestas y entregas de código del **Backend** de **latearte**.

## 1. Perfil de Comunicación
- **Audiencia**: Arquitecto de Software Senior. 
- **Restricción**: Queda prohibido el uso de explicaciones básicas sobre programación, conceptos de microservicios o introducciones genéricas (ej. "Aquí tienes la solución...").
- **Tono**: Directo y estrictamente técnico. Toda aclaración debe presentarse como **JSDoc** o en una sección final de **"Consideraciones de Arquitectura"**.

## 2. Estándares de Código y Base de Datos
- **Prisma ORM**: Ante cualquier cambio en la estructura de datos, se debe entregar el bloque de código completo del modelo afectado dentro de `schema.prisma`. No se permiten fragmentos incompletos.
- **NestJS & TypeScript**: 
    - Toda lógica de negocio debe implementarse bajo el framework NestJS.
    - Es obligatorio el uso de **DTOs (Data Transfer Objects)** decorados para validación (ej. `class-validator`) e **Interfaces** para asegurar el tipado fuerte en todo el flujo de datos.
    - Se debe priorizar la inyección de dependencias y el desacoplamiento modular.

## 3. Arquitectura y Resiliencia
- **Escalabilidad**: Toda solución debe diseñarse para permitir la escalabilidad independiente de cada módulo (`aggregator`, `auth`, `curated`, `user`).
- **Comunicación**: Priorizar patrones **Orientados a Eventos** (ej. mediante Kafka/RabbitMQ) para la comunicación entre servicios.
- **Motor de Agregación (Aggregator Engine)**:
    - Las implementaciones deben incluir obligatoriamente el patrón **Circuit Breaker** para gestionar fallos en APIs externas (YouTube, MUBI, etc.).
    - Se debe integrar una estrategia de **Caché en Redis** para la indexación de metadatos y optimización de cuotas.

## 4. Contexto de Infraestructura
- **Docker**: Ante la creación de un nuevo microservicio o dependencia, se debe sugerir la actualización correspondiente en el archivo `docker-compose.yml` raíz.
- **Contenedores**: Garantizar que el servicio sea apátrida (stateless) para su correcto funcionamiento en entornos como **AWS Fargate**.

## 5. Formato de Salida Requerido
1. **Solución Técnica**: Bloques de código (Prisma, NestJS DTO, NestJS Service/Controller).
2. **Infraestructura**: Cambios en `docker-compose.yml` o `.env` (si aplica).
3. **Consideraciones de Arquitectura**: Lista bulleted con impactos en escalabilidad, performance o seguridad.

---
**Fuente**: [Diseño de arquitectura Arteflujo_ Hub Cultural.md](file:///c:/Documentos/Cursos/Lidr/IA4Devs/AI4Devs-finalproject/documentacion/Dise%C3%B1o%20de%20arquitectura%20Arteflujo_%20Hub%20Cultural.md)
