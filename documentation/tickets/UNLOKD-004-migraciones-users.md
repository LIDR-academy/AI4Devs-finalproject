# [UNLOKD-004] Crear Migraciones de Base de Datos (USERS, CONTACTS)

## Tipo
- [x] Feature

## Épica
EPIC-1: Fundación - Autenticación y Usuarios

## Prioridad
- [x] P0 - Blocker

## Sprint
Sprint 1 (06/01 - 19/01)

## Estimación
**Story Points**: 2

## Descripción
Crear el esquema Prisma completo para tablas USERS y CONTACTS, generar migraciones y ejecutar en la base de datos MySQL. Incluye índices para optimización.

## Caso de Uso Relacionado
- UC-001, UC-002, UC-003, UC-004

## Criterios de Aceptación
- [ ] Esquema Prisma `schema.prisma` definido con modelos User y Contact
- [ ] Migración generada con `npx prisma migrate dev`
- [ ] Tablas creadas en MySQL con todos los campos según diseño
- [ ] Índices creados: USERS(email UNIQUE), USERS(username UNIQUE), CONTACTS(owner_user_id, contact_user_id UNIQUE)
- [ ] Seeds opcionales para datos de prueba
- [ ] Documentación de esquema

## Tareas Técnicas
- [ ] Definir modelo User en `prisma/schema.prisma`
- [ ] Definir modelo Contact en `prisma/schema.prisma`
- [ ] Generar migración: `npx prisma migrate dev --name init_users_contacts`
- [ ] Ejecutar migración en MySQL local
- [ ] Crear archivo `prisma/seed.ts` con datos de prueba
- [ ] Actualizar `package.json` con script `prisma:seed`

## Dependencias
- UNLOKD-001: Setup proyecto

## Esquema Prisma Ejemplo
```prisma
model User {
  id            BigInt   @id @default(autoincrement())
  email         String   @unique @db.VarChar(100)
  username      String   @unique @db.VarChar(50)
  password_hash String   @db.VarChar(255)
  display_name  String   @db.VarChar(255)
  avatar_url    String?  @db.VarChar(255)
  is_active     Boolean  @default(true)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt
  last_login_at DateTime?

  @@map("users")
}
```

## Tablas DB
- USERS (11 campos)
- CONTACTS (4 campos)

## Labels
`database`, `prisma`, `migrations`, `sprint-1`, `p0-blocker`

