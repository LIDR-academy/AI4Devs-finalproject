-- US-037 / TK-131: baja lógica de recetas. Aditiva con default — las recetas existentes
-- quedan activas.
ALTER TABLE "Recipe" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
