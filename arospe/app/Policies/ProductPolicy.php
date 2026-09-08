<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

/**
 * Authorization rules for the Products catalog (story 0024).
 *
 * Gates on the already-seeded `products.*` permissions -- the same module
 * App\Policies\ProductCategoryPolicy already uses, since a product category
 * is a product sub-resource (0023 D-8/RQ-1). No new permission module slug,
 * no RolePermissionSeeder change.
 *
 * Unlike ProductCategoryPolicy (zero call sites at ship time), three of the
 * four abilities here have real call sites in this story (D-15, reversed at
 * the split): App\Actions\Products\CreateProduct/UpdateProduct/DeleteProduct
 * each authorize themselves as their own first statement, before any
 * transaction opens. `viewAny` is defined with no caller until story 0027's
 * list screen -- the same deliberate shape App\Policies\MediaPolicy shipped
 * in story 0019 (four abilities, two used at ship time), per
 * docs/architecture/authorization.md's "define an ability when you can name
 * what will ask it".
 *
 * `hasPermissionTo()` inside a policy body is correct even though it does
 * not itself reach `Gate::before` -- a policy method is only ever reached
 * *through* the Gate, and a Super Admin actor is granted before the policy
 * is consulted at all.
 */
class ProductPolicy
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
     * Determine whether the user can view the product catalog.
     */
    public function viewAny(User $actor): bool
    {
        return $actor->hasPermissionTo(self::VIEW_PERMISSION);
    }

    /**
     * Determine whether the user can create a product.
     */
    public function create(User $actor): bool
    {
        return $actor->hasPermissionTo(self::CREATE_PERMISSION);
    }

    /**
     * Determine whether the user can update a product.
     *
     * No target-dependent branch -- there is no untouchable row in this
     * domain. Kept as an instance method anyway so a future per-row
     * `Gate::allows()` UI hint (story 0027) reuses this exact method.
     */
    public function update(User $actor, Product $target): bool
    {
        return $actor->hasPermissionTo(self::EDIT_PERMISSION);
    }

    /**
     * Determine whether the user can delete a product.
     *
     * The category-in-use-style guard for a product referenced by future
     * order lines (Epic 3) does NOT belong here -- a policy denial renders
     * a 403 ("unauthorized"), which would be a lie: the actor holds
     * `products.delete` and the answer is still no. That guard belongs in
     * App\Actions\Products\DeleteProduct itself, the same shape
     * 0024b establishes for product categories.
     */
    public function delete(User $actor, Product $target): bool
    {
        return $actor->hasPermissionTo(self::DELETE_PERMISSION);
    }
}
