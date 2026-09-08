<?php

namespace App\Actions\Shipping;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Actions\NormalizeForSearch;
use App\Concerns\ShippingZoneValidationRules;
use App\Models\ShippingZone;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CreateShippingZone
{
    use ShippingZoneValidationRules;

    /**
     * Constructor injection: __invoke()'s single domain argument is this
     * action's whole public signature, called that way by every direct-call
     * test -- so both collaborators are resolved from the container without
     * widening that signature. See docs/conventions/code-style.md's
     * constructor-injection exception.
     */
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
        private readonly NormalizeForSearch $normalizeForSearch,
    ) {}

    /**
     * Create a new shipping zone.
     *
     * Corrected at Phase 4 security audit (finding F-1): this docblock
     * previously claimed this action "deliberately self-authorizes
     * NOTHING, matching App\Actions\Users\CreateUser/UpdateUser" -- that
     * citation was FALSE. CreateUser/UpdateUser both self-authorize as
     * their own first statement (docs/conventions/base-standards.md's "an
     * authorization rule belongs to the action, not to one of its
     * callers" convention). The correct, real precedent to mirror is
     * App\Actions\ProductCategories\CreateProductCategory (story 0025):
     * authorizes `create` on `ShippingZone::class` as its own first
     * statement, so a future Artisan command, queued job or REST
     * controller inherits the same refusal a consuming UI story's own
     * `Gate::authorize()` call would otherwise be the ONLY place this rule
     * exists. `targetType: 'shipping_zone'` is passed explicitly, since
     * LogRefusedPrivilegedAttempt::resolveTarget() auto-resolves only User
     * and Role instances/classes; there is no `targetId` yet, matching
     * CreateProductCategory's own class-level create-time call.
     *
     * The name is trimmed BEFORE validation, not after: Laravel's
     * `required` treats a string of spaces as present, so without this a
     * whitespace-only name would validate and persist.
     */
    public function __invoke(string $name): ShippingZone
    {
        $this->logRefusedPrivilegedAttempt->authorize('create', ShippingZone::class, targetType: 'shipping_zone');

        $name = trim($name);

        Validator::make(
            ['name' => $name],
            ['name' => $this->shippingZoneNameRules($this->normalizeForSearch)],
        )->validate();

        try {
            return ShippingZone::create(['name' => $name]);
        } catch (QueryException $e) {
            if ($e->getCode() === '23000') {
                // The unique index is the last-word RACE guard behind the
                // normalised-comparison validation rule above, not the
                // primary defence -- see D-6/R-2. Converted to the same
                // clean ValidationException shape
                // App\Actions\Users\CreateUser already uses for `email`.
                throw ValidationException::withMessages([
                    'name' => trans('validation.unique', ['attribute' => 'name']),
                ]);
            }

            throw $e;
        }
    }
}
