<?php

namespace App\Actions\Shipping;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\ShippingZone;
use Illuminate\Support\Facades\DB;

class DeleteShippingZone
{
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

    /**
     * Delete a shipping zone.
     *
     * Corrected at Phase 4 security audit (finding F-1): this docblock
     * previously claimed "D-9: this action deliberately self-authorizes
     * nothing" -- see CreateShippingZone's docblock for the full
     * correction. Authorizes `delete` on `$shippingZone` as its own first
     * statement, the identical self-authorizing shape
     * App\Actions\ProductCategories\DeleteProductCategory already uses.
     *
     * This gate call MUST stay ABOVE the DB::transaction() below, and MUST
     * stay above wherever story 0036 adds its own in-use-by-a-rate-rule
     * count guard (see the D-1 note below) -- a reversed order would leak
     * the in-use count to an actor who does not even hold
     * `shipping.delete`, the identical ordering rule
     * App\Actions\ProductCategories\DeleteProductCategory's own docblock
     * states for the same reason.
     *
     * D-1: hard-blocking a delete while a shipping_rates row still
     * references the zone is CONFIRMED but NOT implementable here --
     * `shipping_rates` does not exist until story 0036. This file exists
     * NOW, as its own file, with a body that is a plain instance ->delete()
     * -- specifically so 0036 EXTENDS this one file (adding an in-use count
     * guard before the delete, and a QueryException 1451 catch around it)
     * rather than introducing the rule somewhere new. The
     * DB::transaction() wrapper is deliberate pre-shaping too, even though
     * today's body is a single statement: 0036's guard must count-and-delete
     * atomically, and adding the transaction later is exactly the diff a
     * reviewer waves through. The `bool` return keeps the success signature
     * stable while 0036 changes only the refusal mechanism.
     */
    public function __invoke(ShippingZone $shippingZone): bool
    {
        $this->logRefusedPrivilegedAttempt->authorize(
            'delete',
            $shippingZone,
            targetType: 'shipping_zone',
            targetId: $shippingZone->id,
        );

        return DB::transaction(fn (): bool => (bool) $shippingZone->delete());
    }
}
