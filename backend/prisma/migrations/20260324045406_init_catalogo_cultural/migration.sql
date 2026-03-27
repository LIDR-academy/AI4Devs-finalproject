-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USUARIO', 'CURADOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "EjeVertical" AS ENUM ('SHORT_LIST', 'STAGE', 'CINEMA');

-- CreateEnum
CREATE TYPE "EstadoAcceso" AS ENUM ('ABIERTO', 'SUSCRIPCION', 'VOD');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "avatar_url" TEXT,
    "rol" "UserRole" NOT NULL DEFAULT 'USUARIO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plataformas_origen" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "url_base" TEXT NOT NULL,
    "logo_url" TEXT,
    "permite_iframe" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plataformas_origen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obras" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "titulo_original" TEXT,
    "sinopsis" TEXT,
    "director" TEXT,
    "anio" INTEGER,
    "duracion_min" INTEGER NOT NULL,
    "vibe_mood" TEXT,
    "valor_cultural" INTEGER DEFAULT 0,
    "imagen_poster_url" TEXT,
    "url_contenido" TEXT NOT NULL,
    "permite_iframe" BOOLEAN NOT NULL DEFAULT false,
    "eje_vertical" "EjeVertical" NOT NULL,
    "estado_acceso" "EstadoAcceso" NOT NULL DEFAULT 'ABIERTO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "plataforma_id" TEXT NOT NULL,

    CONSTRAINT "obras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hitos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT,
    "festival" TEXT,
    "anio" INTEGER,
    "resultado" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "obra_id" TEXT NOT NULL,

    CONSTRAINT "hitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "datos_contexto" (
    "id" TEXT NOT NULL,
    "marca_tiempo" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipo" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,
    "obra_id" TEXT NOT NULL,

    CONSTRAINT "datos_contexto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watchlist" (
    "id" TEXT NOT NULL,
    "notas" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" TEXT NOT NULL,
    "obra_id" TEXT NOT NULL,

    CONSTRAINT "watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "plataformas_origen_nombre_key" ON "plataformas_origen"("nombre");

-- CreateIndex
CREATE INDEX "obras_duracion_min_idx" ON "obras"("duracion_min");

-- CreateIndex
CREATE INDEX "obras_vibe_mood_idx" ON "obras"("vibe_mood");

-- CreateIndex
CREATE UNIQUE INDEX "watchlist_usuario_id_obra_id_key" ON "watchlist"("usuario_id", "obra_id");

-- AddForeignKey
ALTER TABLE "obras" ADD CONSTRAINT "obras_plataforma_id_fkey" FOREIGN KEY ("plataforma_id") REFERENCES "plataformas_origen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hitos" ADD CONSTRAINT "hitos_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "datos_contexto" ADD CONSTRAINT "datos_contexto_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_obra_id_fkey" FOREIGN KEY ("obra_id") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;
