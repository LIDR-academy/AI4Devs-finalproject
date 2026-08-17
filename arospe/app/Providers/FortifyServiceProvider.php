<?php

namespace App\Providers;

use App\Actions\Fortify\AuthenticateUser;
use App\Actions\Fortify\CreateNewUser;
use App\Actions\Fortify\ResetUserPassword;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
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
}
