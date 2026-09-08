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
use Illuminate\Support\Facades\ParallelTesting;
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
        $this->configureParallelTesting();
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
        // Story 0009 Phase 5 review finding F-C — fail fast on a
        // misconfigured auth.super_admin.role here, at boot, rather than
        // leaving Role::superAdminName()'s own guard to be triggered
        // lazily by whichever request happens to reach it first.
        Role::superAdminName();

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
            //
            // Story 0009 Phase 4 finding F4 — this comparison must read the row's PERSISTED
            // name via the same hydration-safe Role::isSuperAdminRoleRow() RolePolicy itself
            // uses, not $target->name directly: a partially-hydrated (select('id')) or
            // mid-rename Super Admin role used to short-circuit this bypass to true while
            // RolePolicy::update()/delete() -- consulted only when this closure defers --
            // would correctly have returned false, leaving the two to disagree for that one
            // shape. See docs/security/authorization-patterns.md.
            $target = $arguments[0] ?? null;
            if ($target instanceof Role && Role::isSuperAdminRoleRow($target)) {
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

    /**
     * Isolate per-process filesystem state that Laravel's own parallel-testing support does
     * not isolate automatically -- unlike the database (a `testing_test_{token}` schema per
     * process) and `Storage::fake()` (a `{disk}_test_{token}` root per process, both built in),
     * the compiled Blade view cache (`storage/framework/views`) is a single shared directory by
     * default, so every `--parallel` worker compiles into it concurrently. A `tempnam()`/rename
     * race there was the prime suspect behind a batch of unrelated test failures observed under
     * sustained `--parallel` load in this session -- see docs/errors-log.md's 2026-08-28 "open
     * observation" entry. Registering the same token-suffixed path Laravel itself uses for
     * `Storage::fake()` closes that gap without inventing a new convention.
     */
    protected function configureParallelTesting(): void
    {
        if (! $this->app->runningUnitTests()) {
            return;
        }

        ParallelTesting::setUpTestCase(function (string $token): void {
            config(['view.compiled' => storage_path('framework/views/test_'.$token)]);
        });
    }
}
