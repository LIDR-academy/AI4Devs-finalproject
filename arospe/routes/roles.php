<?php

use App\Livewire\Roles\Index as RolesIndex;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // `can:roles.manage`, not Spatie's `permission:` — same reason as
    // `users.index` in routes/users.php: Livewire 4's PersistentMiddleware
    // allowlist carries Laravel's `Authorize` (`can:`) but not Spatie's
    // `PermissionMiddleware`, so a `permission:`-gated route would protect
    // the initial GET only, leaving every saveRole()/deleteRole()
    // /livewire/update round-trip unauthorized. See
    // docs/architecture/authorization.md.
    Route::livewire('roles', RolesIndex::class)
        ->middleware(['can:roles.manage'])
        ->name('roles.index');
});
