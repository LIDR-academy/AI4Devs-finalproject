<?php

namespace App\Actions\Shipping;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\NormalizeForSearch;
use App\Concerns\ShippingZoneValidationRules;
use App\Models\ShippingZone;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class RenameShippingZone
{
    use ShippingZoneValidationRules;

    /**
     * Constructor injection for the same reason as CreateShippingZone:
     * __invoke()'s two domain arguments are this action's whole public
     * signature.
     */
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        private readonly NormalizeForSearch $normalizeForSearch,
    ) {}

    /**
     * Rename an existing shipping zone.
     *
     * Corrected at Phase 4 security audit (finding F-1) -- see
     * CreateShippingZone's docblock for the full correction; the "D-9,
     * self-authorizes nothing, matching CreateUser/UpdateUser" citation was
     * false. Authorizes `update` on `$shippingZone` as its own first
     * statement, the identical self-authorizing shape
     * App\Actions\ProductCategories\RenameProductCategory already uses.
     * `targetType`/`targetId` are passed explicitly since
     * LogRefusedPrivilegedAttempt::resolveTarget() auto-resolves only User
     * and Role instances.
     *
     * The uniqueness rule ignores the target's own id (R-2), which is what
     * makes saving a zone under its own unchanged name succeed.
     */
    public function __invoke(ShippingZone $shippingZone, string $name): ShippingZone
    {
        $this->logRefusedPrivilegedAttempt->authorize(
            'update',
            $shippingZone,
            targetType: 'shipping_zone',
            targetId: $shippingZone->id,
        );

        $name = trim($name);

        Validator::make(
            ['name' => $name],
            ['name' => $this->shippingZoneNameRules($this->normalizeForSearch, $shippingZone->id)],
        )->validate();

        try {
            $shippingZone->update(['name' => $name]);
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                // Last-word race guard behind the validation rule above --
                // see CreateShippingZone's identical catch and D-6/R-2.
                throw ValidationException::withMessages([
                    'name' => trans('validation.unique', ['attribute' => 'name']),
                ]);
            }

            throw $e;
        }

        return $shippingZone;
    }
}
