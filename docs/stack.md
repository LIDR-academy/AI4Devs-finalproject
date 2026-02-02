3.1 Backend (API REST)
- Runtime: Node.js v22.x (Active LTS).
- Framework: NestJS v11.x.
- Lenguaje: TypeScript v5.6+.
- ORM: TypeORM v0.3.x.
- Validación: class-validator + class-transformer (Seguridad en DTOs).
- Documentación: Swagger (OpenAPI 3.0).

3.2 Frontend (SPA)
- Core: React v19.2.
- Build System: Vite v6.x.
- Styling: Tailwind CSS v4.0.
-State Management:
TanStack Query para sincronizar con NestJS.
Zustand para controlar la UI y la sesión.
- Forms: React Hook Form.

3.3 Infraestructura de Datos
- Base de Datos: PostgreSQL v17 (Imagen Docker: postgres:17-alpine).
- Storage: File System Local (MVP) / S3 Compatible (Producción) para imágenes.