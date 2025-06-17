-- CreateEnum
CREATE TYPE "tipo_equipo" AS ENUM ('INTERNO', 'EXTERNO');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('NEGOCIO', 'TECNOLOGIA', 'ADMIN');

-- CreateTable
CREATE TABLE "tareas_extended" (
    "id" SERIAL NOT NULL,
    "redmine_task_id" INTEGER NOT NULL,
    "orden_prioridad" INTEGER,
    "factor_carga" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "estimacion_sprints" INTEGER,
    "fecha_inicio_planificada" DATE,
    "fecha_fin_planificada" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tareas_extended_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "tipo_equipo" NOT NULL,
    "capacidad" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matriz_afinidad" (
    "id" SERIAL NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "departamento_id" INTEGER NOT NULL,
    "nivel_afinidad" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matriz_afinidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones" (
    "id" SERIAL NOT NULL,
    "tarea_id" INTEGER NOT NULL,
    "equipo_id" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estimaciones" (
    "id" SERIAL NOT NULL,
    "tarea_id" INTEGER NOT NULL,
    "estimacion_anterior" INTEGER,
    "estimacion_nueva" INTEGER,
    "factor_carga_anterior" DOUBLE PRECISION,
    "factor_carga_nueva" DOUBLE PRECISION,
    "usuario_id" INTEGER NOT NULL,
    "fecha_cambio" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historial_estimaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'NEGOCIO',
    "reset_password_token" VARCHAR(255),
    "reset_password_expire" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tareas_extended_redmine_task_id_key" ON "tareas_extended"("redmine_task_id");

-- CreateIndex
CREATE INDEX "tareas_extended_redmine_task_id_idx" ON "tareas_extended"("redmine_task_id");

-- CreateIndex
CREATE UNIQUE INDEX "equipos_nombre_key" ON "equipos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_nombre_key" ON "departamentos"("nombre");

-- CreateIndex
CREATE INDEX "matriz_afinidad_equipo_id_idx" ON "matriz_afinidad"("equipo_id");

-- CreateIndex
CREATE INDEX "matriz_afinidad_departamento_id_idx" ON "matriz_afinidad"("departamento_id");

-- CreateIndex
CREATE UNIQUE INDEX "matriz_afinidad_equipo_id_departamento_id_key" ON "matriz_afinidad"("equipo_id", "departamento_id");

-- CreateIndex
CREATE INDEX "asignaciones_tarea_id_idx" ON "asignaciones"("tarea_id");

-- CreateIndex
CREATE INDEX "asignaciones_equipo_id_idx" ON "asignaciones"("equipo_id");

-- CreateIndex
CREATE INDEX "asignaciones_fecha_asignacion_idx" ON "asignaciones"("fecha_asignacion");

-- CreateIndex
CREATE INDEX "historial_estimaciones_tarea_id_idx" ON "historial_estimaciones"("tarea_id");

-- CreateIndex
CREATE INDEX "historial_estimaciones_usuario_id_idx" ON "historial_estimaciones"("usuario_id");

-- CreateIndex
CREATE INDEX "historial_estimaciones_fecha_cambio_idx" ON "historial_estimaciones"("fecha_cambio");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "matriz_afinidad" ADD CONSTRAINT "matriz_afinidad_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matriz_afinidad" ADD CONSTRAINT "matriz_afinidad_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_tarea_id_fkey" FOREIGN KEY ("tarea_id") REFERENCES "tareas_extended"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_equipo_id_fkey" FOREIGN KEY ("equipo_id") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estimaciones" ADD CONSTRAINT "historial_estimaciones_tarea_id_fkey" FOREIGN KEY ("tarea_id") REFERENCES "tareas_extended"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
