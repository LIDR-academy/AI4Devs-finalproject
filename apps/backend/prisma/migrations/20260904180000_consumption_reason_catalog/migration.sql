-- ADR-004 / US-030: catálogo administrable de motivos de consumo. Puramente aditiva
-- (tabla nueva, sin tocar nada existente). Incluye la semilla editable — el
-- administrador puede editar/desactivar/ampliar estos motivos después; nunca se
-- borran físicamente (US-030 Escenario 3).

-- CreateTable
CREATE TABLE "ConsumptionReason" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsumptionReason_pkey" PRIMARY KEY ("id")
);

-- Seed: motivos típicos editables (ADR-004 §2 decisión #7)
INSERT INTO "ConsumptionReason" ("id", "label", "isActive", "updatedAt") VALUES
    ('reason-seed-plato', 'Preparación de plato', true, CURRENT_TIMESTAMP),
    ('reason-seed-degustacion', 'Degustación / prueba', true, CURRENT_TIMESTAMP),
    ('reason-seed-cortesia', 'Cortesía a cliente', true, CURRENT_TIMESTAMP),
    ('reason-seed-error', 'Error de manipulación', true, CURRENT_TIMESTAMP),
    ('reason-seed-otro', 'Otro', true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
