<?php

namespace App\Providers;

use App\Listeners\ActivateVerifiedUser;
use App\Listeners\RejectNonActiveUserLogin;
use App\Models\Role;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Events\Authenticated;
use Illuminate\Auth\Events\Login;
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
        Gate::before(function (mixed $user, string $ability, array $arguments = []): ?bool {
            // F7 — Gate::before invokes the closure without consulting its type hint
            // (canBeCalledWithUser() does not), so any non-User authenticatable would
            // otherwise reach ->hasRole() and fatal. Decline instead of assuming.
            if (! $user instanceof User) {
                return null;
            }

            // Story 0008 re-audit F6 — when the check's own target IS the Super Admin role,
            // defer to RolePolicy instead of short-circuiting true/false here. Without this,
            // a Super Admin actor's Gate::authorize('delete', $superAdminRole) legitimately
            // passed this bypass before RolePolicy was ever consulted, making the policy
            // layer not "independently effective" for that one actor -- contradicting the
            // story's own acceptance criterion. The model-level guards on App\Models\Role
            // still refuse the mutation either way; this closes the policy-layer gap on top
            // of them. See RolePolicyTest for the inverted assertion this produces.
            $target = $arguments[0] ?? null;
            if ($target instanceof Role && $target->name === Role::superAdminName()) {
                return null;
            }

            // Story 0008 — Role::superAdminName() is the single implementation of
            // this resolution (config()'s default plus the `??` fallback for a
            // present-but-null key -- see docs/security/authorization-patterns.md), shared
            // with the selectable() scope, the model-level immutability guards, RolePolicy
            // and the seeder, so the role that bypasses every permission check can never
            // drift from the role that is protected/hidden.
            // F5 — the 'web' guard is explicit, so a same-named role created on another
            // guard can never satisfy the bypass.
            return $user->hasRole(Role::superAdminName(), 'web') ? true : null;
        });
    }

    /**
     * Register application event listeners.
     */
    protected function configureEventListeners(): void
    {
        Event::listen(Verified::class, ActivateVerifiedUser::class);

        // Story 0007: safety net for remember-me/recaller re-authentication
        // and the two-factor mid-challenge race -- both handlers are needed;
        // see App\Listeners\RejectNonActiveUserLogin's class docblock for why.
        Event::listen(Login::class, RejectNonActiveUserLogin::class);
        Event::listen(Authenticated::class, [RejectNonActiveUserLogin::class, 'handleAuthenticated']);
    }
}
