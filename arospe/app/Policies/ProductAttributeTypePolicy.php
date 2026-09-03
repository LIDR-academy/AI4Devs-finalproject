<?php

namespace App\Policies;

use App\Models\ProductAttributeType;
use App\Models\User;

/**
 * Authorization rules for the product variant attribute taxonomy (story
 * 0028).
 *
 * Attribute types are a product sub-resource and inherit the already-seeded
 * `products.*` module's permissions -- no new module slug, no
 * RolePermissionSeeder change (D6). Mirrors App\Policies\
 * ProductCategoryPolicy's exact shape: four abilities, each backed by a
 * public const *_PERMISSION constant naming the exact permission it gates
 * on, no target-dependent branch anywhere -- update()/delete() still take
 * the target instance as a parameter (never used inside the body) so a
 * future per-row rule needs no signature change.
 */
class ProductAttributeTypePolicy
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
     * Determine whether the user can view the attribute type list.
     */
    public function viewAny(User $actor): bool
    {
        return $actor->hasPermissionTo(self::VIEW_PERMISSION);
    }

    /**
     * Determine whether the user can create an attribute type.
     */
    public function create(User $actor): bool
    {
        return $actor->hasPermissionTo(self::CREATE_PERMISSION);
    }

    /**
     * Determine whether the user can update an attribute type (rename it,
     * or edit its value list).
     *
     * No target-dependent branch -- there is no untouchable row in this
     * domain, the same shape SalesRegionPolicy::update() and
     * ProductCategoryPolicy::update() already establish.
     */
    public function update(User $actor, ProductAttributeType $target): bool
    {
        return $actor->hasPermissionTo(self::EDIT_PERMISSION);
    }

    /**
     * Determine whether the user can delete an attribute type.
     */
    public function delete(User $actor, ProductAttributeType $target): bool
    {
        return $actor->hasPermissionTo(self::DELETE_PERMISSION);
    }
}
