<?php

namespace App\Enums;

/**
 * A Sales Region entry's type.
 *
 * Seeder-enforced invariant: `kind === FiscalTerritory` if and only if
 * `parent_id IS NOT NULL`. Both cases are address-resolvable; there is no
 * `Grouping` case — supranational grouping entries (Unión Europea,
 * Internacional) were removed from the catalog by decision D11 in
 * ai-spec/tasks/in-progress/0016-sales-region-catalog-schema-and-seeder.md,
 * since nothing in this system knows which countries are EU members, so a
 * grouping entry could only ever be matched manually.
 */
enum SalesRegionKind: string
{
    case Country = 'country';
    case FiscalTerritory = 'fiscal_territory';
}
