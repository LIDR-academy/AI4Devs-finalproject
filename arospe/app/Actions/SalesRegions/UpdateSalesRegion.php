<?php

namespace App\Actions\SalesRegions;

use App\Actions\Auth\LogRefusedPrivilegedAttempt;
use App\Models\SalesRegion;

/**
 * The single named writer of the plain #[Fillable] triple on SalesRegion
 * (`code`, `description`, `rate`) -- story 0017.
 */
class UpdateSalesRegion
{
    public function __construct(
        private readonly LogRefusedPrivilegedAttempt $logRefusedPrivilegedAttempt,
    ) {}

    /**
     * Update a Sales Region entry's tax rate, description and code.
     *
     * `fill()`, not `forceFill()` -- these three columns ARE in #[Fillable],
     * and the omission of every other column (slug, name, parent_id, kind,
     * sort_order, is_default, is_active) is precisely this repo's
     * mass-assignment guard. Do not widen it.
     *
     * Authorizes itself as the first statement (0008a convention), via
     * LogRefusedPrivilegedAttempt so a refusal is logged before it throws --
     * independently of App\Livewire\SalesRegions\Index's own check, so a
     * future non-dashboard caller inherits the same guard.
     *
     * Phase 4 finding (docs/security/model-instance-trust.md): $region is a
     * caller-supplied instance, and save() persists EVERY dirty attribute on
     * it, not only the three named below -- the #[Fillable] allow-list
     * constrains fill()'s array, not what an UPDATE actually writes. A
     * caller that dirtied a structural column (slug, name, ...) before
     * calling this action would have it persist too. The fix is to write
     * through an instance this action hydrates itself, whose dirty set
     * starts empty, so nothing the caller staged can ride along.
     */
    public function __invoke(SalesRegion $region, ?string $code, ?string $description, ?string $rate): SalesRegion
    {
        // targetType/targetId passed explicitly: LogRefusedPrivilegedAttempt::resolveTarget()
        // only auto-resolves User and Role Gate targets, not SalesRegion.
        $this->logRefusedPrivilegedAttempt->authorize('update', $region, targetType: 'sales_region', targetId: $region->id);

        $target = SalesRegion::query()->whereKey($region->getKey())->firstOrFail();

        // tap($target)->fill([...])->save() would NOT return $target here:
        // HigherOrderTapProxy::__call() returns the raw target only from the
        // FIRST chained call: ->fill() returns $target as the real (already
        // unwrapped) instance, so the second call, ->save(), runs directly
        // on $target and returns its own bool -- not the tapped subject.
        // Wrapping the already-fill()ed instance keeps ->save() as the one
        // (and therefore first) proxied call, which is what makes tap()
        // return $target.
        return tap($target->fill([
            'code' => $code,
            'description' => $description,
            'rate' => $rate,
        ]))->save();
    }
}
