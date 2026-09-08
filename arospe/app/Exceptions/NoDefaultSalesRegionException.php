<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown by `App\Actions\Products\ResolveProductTaxRate` (story 0026, D5)
 * when the Sales Region catalog carries no `is_default` row at all. This is
 * a genuine invariant violation -- story 0017's `SetDefaultSalesRegion` /
 * `SetSalesRegionActive` guarantee production can never reach this state --
 * and must be distinguishable from an unconfigured rate, or "the developer
 * forgot to arrange a default" would read as "the administrator hasn't set
 * a rate". Deliberately no `render()`: this is a programming/data-integrity
 * error, not a refusal a request-bound consumer should catch and turn into
 * a user-facing response.
 */
class NoDefaultSalesRegionException extends RuntimeException
{
    //
}
