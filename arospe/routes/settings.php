<?php

use App\Http\Controllers\ConfirmEmailChangeController;
use App\Livewire\Settings\Appearance;
use App\Livewire\Settings\Profile;
use App\Livewire\Settings\Security;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::livewire('settings/profile', Profile::class)->name('profile.edit');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::livewire('settings/appearance', Appearance::class)->name('appearance.edit');

    Route::livewire('settings/security', Security::class)
        ->middleware([
            'password.confirm',
        ])
        ->name('security.edit');
});

// Deliberately outside both `auth` groups above: what this route proves is
// control of the mailbox (via the signed, address-bound, single-use,
// 60-minute link), not an authenticated session. An `auth` requirement would
// deadlock the case an administrator most needs it for — changing the
// address of an `Inactive` user, who (once story 0007 lands) cannot sign in
// at all and could never reach the link that would activate them.
Route::get('settings/email/confirm/{user}/{hash}', ConfirmEmailChangeController::class)
    ->middleware(['signed', 'throttle:6,1'])
    ->name('email-change.confirm');

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
