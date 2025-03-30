-- Habilitar la extensión uuid-ossp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tipo enum para el estado
CREATE TYPE estado_reporte AS ENUM ('abierto', 'cerrado', 'animal_encontrado');

-- Crear tabla mascotas
CREATE TABLE "mascotas" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "nombre" VARCHAR(255) NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "raza" VARCHAR(100) NOT NULL,
    "color" VARCHAR(50) NOT NULL,
    "edad" INTEGER NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla reporte_perdida
CREATE TABLE "reporte_perdida" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "usuario_id" UUID NOT NULL,
    "mascota_id" UUID NOT NULL,
    "ubicacion" VARCHAR(255) NOT NULL,
    "fecha_reporte" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "estado" estado_reporte NOT NULL DEFAULT 'abierto',
    "descripcion" TEXT,
    "encontrada" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_mascota" FOREIGN KEY ("mascota_id") 
        REFERENCES "mascotas" ("id") ON DELETE CASCADE
);

-- Crear tabla historial_reporte
CREATE TABLE "historial_reporte" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "reporte_id" UUID NOT NULL,
    "estado" estado_reporte NOT NULL DEFAULT 'abierto',
    "fecha_cambio" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "comentario" TEXT,
    "email" VARCHAR(255) NOT NULL DEFAULT 'sin_email@ejemplo.com',
    "telefono" VARCHAR(20) NOT NULL DEFAULT '000000000',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_reporte" FOREIGN KEY ("reporte_id") 
        REFERENCES "reporte_perdida" ("id") ON DELETE CASCADE
);

-- Crear tabla imagenes
CREATE TABLE "imagenes" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "reporte_id" UUID NOT NULL,
    "url" VARCHAR(255) NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "fk_reporte_imagen" FOREIGN KEY ("reporte_id") 
        REFERENCES "reporte_perdida" ("id") ON DELETE CASCADE
);

-- Crear índices
CREATE INDEX "idx_reporte_usuario" ON "reporte_perdida" ("usuario_id");
CREATE INDEX "idx_reporte_mascota" ON "reporte_perdida" ("mascota_id");
CREATE INDEX "idx_historial_reporte" ON "historial_reporte" ("reporte_id");
CREATE INDEX "idx_imagenes_reporte" ON "imagenes" ("reporte_id"); 