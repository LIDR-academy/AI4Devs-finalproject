<?php

namespace App\Providers;

use App\Listeners\ActivateVerifiedUser;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureAuthorization();
        $this->configureEventListeners();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    /**
     * Let the Super Admin role bypass every permission check.
     */
    protected function configureAuthorization(): void
    {
        Gate::before(function (mixed $user): ?bool {
            // F7 — Gate::before invokes the closure without consulting its type hint
            // (canBeCalledWithUser() does not), so any non-User authenticatable would
            // otherwise reach ->hasRole() and fatal. Decline instead of assuming.
            if (! $user instanceof User) {
                return null;
            }

            // F6 — literal fallback: a missing, explicitly-null, or renamed config key
            // must fail *safe* (no bypass), not throw a TypeError that breaks every check
            // app-wide. The `?? 'Super Admin'` is required in addition to the config()
            // default: Laravel's config() only substitutes its own default when the key is
            // absent, not when the key exists with a null value (Arr::exists() considers a
            // present-but-null key to exist), so an explicitly-null config value would
            // otherwise still reach hasRole(null, ...) and throw.
            // F5 — the 'web' guard is explicit, so a same-named role created on another
            // guard can never satisfy the bypass.
            $superAdminRoleName = config('auth.super_admin.role', 'Super Admin') ?? 'Super Admin';

            return $user->hasRole($superAdminRoleName, 'web') ? true : null;
        });
    }

    /**
     * Register application event listeners.
     */
    protected function configureEventListeners(): void
    {
        Event::listen(Verified::class, ActivateVerifiedUser::class);
    }
}
