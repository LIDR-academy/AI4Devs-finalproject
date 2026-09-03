<?php

namespace App\Enums;

/**
 * Which of the two tiers of App\Actions\Products\ResolveProductTaxRate
 * decided the answer (story 0026, D9). Epic 3 must record *why* a rate
 * applied, not just that it did -- a backed enum reads better at the call
 * site than a `bool $isExactMatch` named after one of its two states.
 *
 * No `label()` method -- nothing renders it yet, matching 0016's deferral
 * of `SalesRegionKind::label()` until a real consumer exists.
 */
enum TaxRateResolutionTier: string
{
    /** The destination is one the product is directly assigned to. */
    case AssignedRegion = 'assigned_region';

    /** No assigned entry matched the destination; the catalog default decided. */
    case CatalogDefault = 'catalog_default';
}
