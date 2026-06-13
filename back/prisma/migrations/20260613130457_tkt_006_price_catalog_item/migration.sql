-- CreateTable
CREATE TABLE "PriceCatalogItem" (
    "id" TEXT NOT NULL,
    "normalizedName" TEXT NOT NULL,
    "category" TEXT,
    "sourceLabel" TEXT,
    "referencePriceEur" DECIMAL(10,2) NOT NULL,
    "currencyCode" TEXT NOT NULL DEFAULT 'EUR',
    "effectiveDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceCatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceCatalogItem_normalizedName_effectiveDate_idx" ON "PriceCatalogItem"("normalizedName", "effectiveDate");

-- Seed baseline MVP reference dataset
INSERT INTO "PriceCatalogItem" (
    "id",
    "normalizedName",
    "category",
    "sourceLabel",
    "referencePriceEur",
    "currencyCode",
    "effectiveDate"
)
VALUES
    ('pcat-whole-milk-20260115', 'whole milk', 'Dairy', 'MVP Catalog', 1.69, 'EUR', DATE '2026-01-15'),
    ('pcat-tomato-sauce-20260115', 'tomato sauce', 'Pantry', 'MVP Catalog', 2.29, 'EUR', DATE '2026-01-15'),
    ('pcat-olive-oil-20260115', 'olive oil', 'Pantry', 'MVP Catalog', 6.49, 'EUR', DATE '2026-01-15');
