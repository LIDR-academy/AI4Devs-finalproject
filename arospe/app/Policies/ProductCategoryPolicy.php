<?php

namespace App\Policies;

use App\Models\ProductCategory;
use App\Models\User;

/**
 * Authorization rules for the Product Categories catalog (story 0023).
 *
 * Product categories are a product sub-resource (D-8/RQ-1) and inherit the
 * already-seeded `products.*` module's permissions -- no new module slug,
 * no RolePermissionSeeder change.
 *
 * Created now even though it has zero call sites (D-9): a rule enforced
 * only in a future component would be bypassed by every other caller of
 * the CreateProductCategory/RenameProductCategory/DeleteProductCategory
 * actions, so the policy is the right home for it regardless of which
 * consumer (story 0025's UI) arrives first.
 *
 * `hasPermissionTo()` inside a policy body is correct even though it does
 * not itself reach `Gate::before` -- a policy method is only ever reached
 * *through* the Gate, and a Super Admin actor is granted before the policy
 * is consulted at all.
 */
class ProductCategoryPolicy
{
    /**
     * Named once on the class that owns the rule, per naming.md's "name a
     * permission once on the class that owns the rule" convention.
     */
    public const VIEW_PERMISSION = 'products.view';

    public const CREATE_PERMISSION = 'products.create';

    public const EDIT_PERMISSION = 'products.edit';

    public const DELETE_PERMISSION = 'products.delete';

    /**
     * Determine whether the user can view the product category catalog.
     */
    public function viewAny(User $actor): bool
    {
        return $actor->hasPermissionTo(self::VIEW_PERMISSION);
    }

    /**
     * Determine whether the user can create a product category.
     */
    public function create(User $actor): bool
    {
        return $actor->hasPermissionTo(self::CREATE_PERMISSION);
    }

    /**
     * Determine whether the user can rename a product category.
     *
     * No target-dependent branch -- there is no untouchable row in this
     * domain, the same shape SalesRegionPolicy::update() already
     * established. Kept as an instance method anyway, so a future per-row
     * Gate::allows() UI hint reuses the identical method a target-dependent
     * rule would need.
     */
    public function update(User $actor, ProductCategory $target): bool
    {
        return $actor->hasPermissionTo(self::EDIT_PERMISSION);
    }

    /**
     * Determine whether the user can delete a product category.
     */
    public function delete(User $actor, ProductCategory $target): bool
    {
        return $actor->hasPermissionTo(self::DELETE_PERMISSION);
    }
}
