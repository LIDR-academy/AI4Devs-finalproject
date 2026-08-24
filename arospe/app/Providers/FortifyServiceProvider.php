<?php

namespace App\Providers;

use App\Actions\Fortify\AuthenticateUser;
use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Fortify;
use Laravel\Passkeys\Passkey;
use Laravel\Passkeys\Passkeys;

class FortifyServiceProvider extends ServiceProvider
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
        $this->configureActions();
        $this->configureViews();
        $this->configureRateLimiting();
        $this->configurePasswordConfirmationRateLimiting();
        $this->configurePasskeys();
    }

    /**
     * Configure Fortify actions.
     */
    private function configureActions(): void
    {
        Fortify::resetUserPasswordsUsing(ResetUserPassword::class);
        Fortify::createUsersUsing(CreateNewUser::class);

        // Story 0007: an object instance, not a class string -- unlike
        // resetUserPasswordsUsing()/createUsersUsing(), authenticateUsing()
        // stores the raw callable and later calls
        // call_user_func($callback, $request) on it directly.
        Fortify::authenticateUsing(app(AuthenticateUser::class));
    }

    /**
     * Configure passkey sign-in authorization.
     *
     * Story 0007: passkey login bypasses Fortify's pipeline entirely, so it
     * is never reached by Fortify::authenticateUsing() above -- it needs
     * this separate enforcement point instead.
     */
    private function configurePasskeys(): void
    {
        // Passkeys::$userModel defaults to (and is never overridden away
        // from) App\Models\User in this app -- but the vendor callable type
        // is declared against Laravel\Passkeys\Contracts\PasskeyUser, which
        // App\Models\User does not itself implement, hence the mismatch.
        // isActive() only exists on the concrete model, which is the whole
        // point of typing it this way instead of against the narrower
        // vendor contract.
        //
        // $user is genuinely nullable here: Passkey::user() is a BelongsTo
        // relation scoped by the model's SoftDeletingScope, so it resolves
        // null for a soft-deleted owner (story 0005) -- and
        // Passkeys::allowsLogin() calls this callback with $passkey->user
        // unchecked, so a non-nullable parameter throws a TypeError instead
        // of cleanly refusing. trashed() is redundant given the relation
        // already scopes it out, but costs nothing and matches this
        // codebase's belt-and-braces soft-delete convention (see
        // docs/security/soft-delete-patterns.md).
        Passkeys::authorizeLoginUsing(
            // @phpstan-ignore argument.type
            fn (Request $request, ?User $user, Passkey $passkey): bool => $user !== null && ! $user->trashed() && $user->isActive()
        );
    }

    /**
     * Configure Fortify views.
     */
    private function configureViews(): void
    {
        Fortify::loginView(fn () => view('livewire.auth.login'));
        Fortify::verifyEmailView(fn () => view('livewire.auth.verify-email'));
        Fortify::twoFactorChallengeView(fn () => view('livewire.auth.two-factor-challenge'));
        Fortify::confirmPasswordView(fn () => view('livewire.auth.confirm-password'));
        Fortify::registerView(fn () => view('livewire.auth.register'));
        Fortify::resetPasswordView(fn () => view('livewire.auth.reset-password'));
        Fortify::requestPasswordResetLinkView(fn () => view('livewire.auth.forgot-password'));
    }

    /**
     * Configure rate limiting.
     */
    private function configureRateLimiting(): void
    {
        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('passkeys', function (Request $request) {
            $credentialId = $request->input('credential.id');

            return Limit::perMinute(10)->by(
                ($credentialId ?: $request->session()->getId()).'|'.$request->ip(),
            );
        });
    }

    /**
     * Rate limit `password.confirm.store` (story 0015a, Phase 4 finding F3 /
     * decision D8).
     *
     * Verified in vendor source: unlike `login`, `two-factor` and
     * `passkeys`, `Laravel\Fortify\routes\routes.php` registers
     * `password.confirm.store` with no `config('fortify.limiters.*')` lookup
     * at all -- there is no config key this route consults, so a limiter
     * cannot be wired the way the other three are. Once story 0015a makes
     * this route the sole barrier in front of
     * role/status/delete/promote-to-Administrator/third-party-email-change,
     * an unthrottled attacker holding a hijacked session could guess the
     * account's own password against it without limit.
     *
     * The route object is appended to directly, after every provider
     * (vendor and app) has finished booting -- `$this->app->booted()`,
     * rather than doing this inline in `boot()`, because
     * Laravel\Fortify\FortifyServiceProvider registers this route from its
     * own `boot()` too, and provider boot order between packages is not a
     * contract this app should depend on. `Route::middleware()` on an
     * already-registered `Illuminate\Routing\Route` instance appends to its
     * existing middleware stack rather than replacing it.
     *
     * `refreshNameLookups()` first is not optional, and was found only by
     * tracing real execution rather than reading the vendor source:
     * `RouteCollection::add()` populates its name-lookup table from
     * `$route->getName()` at the moment the route is added to the
     * collection, but Fortify's routes.php calls `->name(...)` as a
     * separate fluent call **after** `Route::post(...)` has already
     * returned (and therefore already been `add()`-ed) -- so the route is
     * genuinely registered, but `getByName('password.confirm.store')`
     * returns `null` until something rebuilds the name-lookup table.
     * `Illuminate\Foundation\Support\Providers\RouteServiceProvider`
     * ordinarily does exactly that from its own `$this->app->booted()`
     * callback, registered while loading *this app's own* `routes/web.php`
     * -- which the framework's provider-registration order places *before*
     * package-discovered providers such as vendor Fortify's, so that
     * rebuild runs before Fortify's routes even exist to be looked up by
     * name. Calling `refreshNameLookups()` again here, immediately before
     * the lookup, is what makes this deterministic rather than order-
     * dependent on a callback this class does not own.
     */
    private function configurePasswordConfirmationRateLimiting(): void
    {
        RateLimiter::for('confirm-password', function (Request $request) {
            return Limit::perMinute(5)->by((string) ($request->user()?->id ?: $request->ip()));
        });

        $this->app->booted(function (): void {
            Route::getRoutes()->refreshNameLookups();
            Route::getRoutes()->getByName('password.confirm.store')?->middleware('throttle:confirm-password');
        });
    }
}
