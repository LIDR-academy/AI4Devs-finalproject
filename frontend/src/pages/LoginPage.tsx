/**
 * LoginPage
 *
 * Public page that renders the "Iniciar sesión con Google" button.
 * Accessible at /login — outside the AuthGuard.
 *
 * Behavior:
 * - If the user already has an active session → redirects to / (AuthGuard will handle routing).
 * - On Google success → calls authStore.loginWithGoogle(credential) → stores session → Navigate to /.
 * - On Google error / cancellation (C5) → stays on /login, does not throw.
 *
 * Note: GoogleOAuthProvider must wrap this component (set up in App.tsx).
 */

import { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuthStore } from '@state/authStore';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';

// Reuse hero styles from MeditationBuilderPage
function LoginHero() {
  return (
    <header className="meditation-builder__header meditation-builder--compact">
      <div className="meditation-builder__hero-glow" aria-hidden="true" />

      {/* Decorative scattered symbols */}
      <div className="meditation-builder__deco" aria-hidden="true">
        <span className="deco-symbol deco-symbol--1">☸</span>
        <span className="deco-symbol deco-symbol--2">∞</span>
        <span className="deco-symbol deco-symbol--3">✦</span>
        <span className="deco-symbol deco-symbol--4">◉</span>
        <span className="deco-symbol deco-symbol--5">✿</span>
        <span className="deco-symbol deco-symbol--6">☯</span>
        <span className="deco-symbol deco-symbol--7">❂</span>
        <span className="deco-symbol deco-symbol--8">✶</span>
        <span className="deco-symbol deco-symbol--9">⊕</span>
        <span className="deco-symbol deco-symbol--10">❋</span>
        <span className="deco-symbol deco-symbol--11">◈</span>
        <span className="deco-symbol deco-symbol--12">✧</span>
        <span className="deco-symbol deco-symbol--m1">○</span>
        <span className="deco-symbol deco-symbol--m2">♱</span>
        <span className="deco-symbol deco-symbol--m3">⌘</span>
        <span className="deco-symbol deco-symbol--m4">✾</span>
        <span className="deco-symbol deco-symbol--m5">⋆</span>
        <span className="deco-symbol deco-symbol--m6">◌</span>
      </div>

      <div className="meditation-builder__hero-content">
        <p className="meditation-builder__hero-eyebrow">Your personal sanctuary</p>
        <h1 className="meditation-builder__hero-title">Meditation Builder</h1>
        <p className="meditation-builder__hero-sub">Craft immersive meditations with AI-generated voice, visuals &amp; music</p>
      </div>
    </header>
  );
}

export function LoginPage() {
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const resetError = useAuthStore((state) => state.resetError);
  const navigate = useNavigate();

  // Clear any stale error when the page mounts
  useEffect(() => {
    resetError();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Already authenticated → go to the builder
  if (session) {
    return <Navigate to="/" replace />;
  }

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate('/', { replace: true });
    } catch {
      // error is already set in authStore — rendered below
    }
  };

  const handleError = () => {
    // C5: user cancelled the Google flow — stay on /login without error
  };

  return (
    <div className="app">
      <AppHeader />
      <main className="app__main">
        <LoginHero />

        <div className="login-page">
          <div className="login-card">
            <div className="login-card__logo-wrap">
              <img src="/stressed4heaven-logo.png" alt="logo" className="login-card__logo--large" />
            </div>

            <div className="login-card__header">
              <div className="login-card__tagline">Instant AI-guided meditations — voice, visuals & music</div>
              <div className="login-card__badge">No credit card • Instant access</div>
            </div>

            <p className="login-subtitle">
              Sign in with Google to instantly create, preview and save immersive AI-guided meditations. Try it free and start crafting your calm.
            </p>

            <div className="login-card__benefits">
              <span>🎧 Voice</span>
              <span>🖼️ Visuals</span>
              <span>🎵 Music</span>
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <div className="login-button-wrapper">
              {isLoading ? (
                <p className="login-loading">Iniciando sesión…</p>
              ) : (
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={handleError}
                  useOneTap={false}
                  context="signin"
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
