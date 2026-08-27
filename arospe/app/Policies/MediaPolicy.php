<?php

namespace App\Policies;

use App\Models\Media;
use App\Models\User;

/**
 * Authorization rules for the Shared Media Gallery (story 0019).
 *
 * `viewAny` (media.view) and `create` (media.create) are what this story
 * exercises; `update` (media.edit, story 0020) and `delete` (media.delete,
 * unused -- D11) are seeded ahead of their consumers and are correct from
 * the start rather than skipped, matching this catalog's normal state (see
 * docs/architecture/authorization.md#permission-catalog). Neither `update`
 * nor `delete` branches on its `$target` -- there is no target-dependent
 * rule in this domain today, the same shape SalesRegionPolicy::update()
 * already established.
 *
 * `hasPermissionTo()` inside a policy body is correct even though it does
 * not itself reach `Gate::before` -- a policy method is only ever reached
 * *through* the Gate, and a Super Admin actor is granted before the policy
 * is consulted at all.
 */
class MediaPolicy
{
    /**
     * Named once on the class that owns the rule, per naming.md's "name a
     * permission once on the class that owns the rule" convention.
     */
    public const VIEW_PERMISSION = 'media.view';

    public const CREATE_PERMISSION = 'media.create';

    public const EDIT_PERMISSION = 'media.edit';

    public const DELETE_PERMISSION = 'media.delete';

    /**
     * Determine whether the user can browse/search the media gallery.
     */
    public function viewAny(User $actor): bool
    {
        return $actor->hasPermissionTo(self::VIEW_PERMISSION);
    }

    /**
     * Determine whether the user can upload a new media item.
     */
    public function create(User $actor): bool
    {
        return $actor->hasPermissionTo(self::CREATE_PERMISSION);
    }

    /**
     * Determine whether the user can update a media item's title/description
     * (story 0020 -- unused this story).
     */
    public function update(User $actor, Media $target): bool
    {
        return $actor->hasPermissionTo(self::EDIT_PERMISSION);
    }

    /**
     * Determine whether the user can delete a media item (unused -- D11,
     * no story implements media deletion yet).
     */
    public function delete(User $actor, Media $target): bool
    {
        return $actor->hasPermissionTo(self::DELETE_PERMISSION);
    }
}
