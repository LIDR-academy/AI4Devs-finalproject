// Package auth verifies security-issued access tokens locally against a cached
// JWKS. Verification is stateless — the JWKS is fetched once and refreshed in the
// background, so there is no per-request call to the security service. The
// JWT/JWKS library is confined to this package behind the Verifier interface.
package auth

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/lestrrat-go/jwx/v2/jwk"
	"github.com/lestrrat-go/jwx/v2/jwt"
)

// minRefresh bounds how often the JWKS is refetched once it has loaded.
const minRefresh = 15 * time.Minute

// initialRetryBackoff and maxRetryBackoff bound the background retry used only
// when the very first JWKS fetch fails (cold start: security not resolvable yet).
// The cache's own periodic refresh is floored at minRefresh — far too slow to
// recover a cold start — so this loop drives faster attempts until the key set
// first loads, then hands back to the cache.
const (
	initialRetryBackoff = 250 * time.Millisecond
	maxRetryBackoff     = 30 * time.Second
)

// ErrUnauthenticated is the single failure returned for any token that cannot be
// trusted (absent, malformed, bad signature, expired, or missing a claim).
// Callers never branch on the reason.
var ErrUnauthenticated = errors.New("unauthenticated")

// Claims is the verified identity carried by an access token.
type Claims struct {
	UserID   string
	Username string
}

// Verifier verifies a bearer access token and returns its claims.
type Verifier interface {
	Verify(ctx context.Context, token string) (Claims, error)
}

// JWKSVerifier verifies tokens against a background-refreshed JWKS.
type JWKSVerifier struct {
	cache *jwk.Cache
	url   string
}

// NewJWKSVerifier registers the JWKS URL with a context-bound cache (the refresh
// worker stops when ctx is cancelled) and warms it once. A warm failure is
// logged, not fatal: tokens are treated as unauthenticated until the key set
// loads, so protected actions gate rather than being wrongly accepted.
//
// On a cold start streamer may boot before security is DNS-resolvable (streamer
// is intentionally not health-gated on security, to avoid a startup deadlock), so
// the warm fetch can fail. When it does, a background goroutine retries with
// backoff until the key set first loads — otherwise the cache's own refresh,
// floored at minRefresh, would leave the verifier rejecting every token for up to
// that window. The goroutine is bound to ctx: it stops at shutdown, no leak.
func NewJWKSVerifier(ctx context.Context, jwksURL string, log *slog.Logger) (*JWKSVerifier, error) {
	cache := jwk.NewCache(ctx)
	if err := cache.Register(jwksURL, jwk.WithMinRefreshInterval(minRefresh)); err != nil {
		return nil, fmt.Errorf("registering jwks url: %w", err)
	}
	v := &JWKSVerifier{cache: cache, url: jwksURL}
	if _, err := cache.Refresh(ctx, jwksURL); err != nil {
		log.Warn("initial JWKS fetch failed; retrying in background until it loads", "error", err)
		go v.retryInitialLoad(ctx, log)
	}
	return v, nil
}

// retryInitialLoad re-fetches the JWKS with exponential backoff until it first
// loads, then returns and lets the cache's periodic refresh take over. Each
// attempt is a fresh fetch, so DNS is re-resolved every time and an initial
// NXDOMAIN is not cached. Bound to ctx via the select on ctx.Done() — it exits on
// success or shutdown and never outlives the app.
func (v *JWKSVerifier) retryInitialLoad(ctx context.Context, log *slog.Logger) {
	backoff := initialRetryBackoff
	timer := time.NewTimer(backoff)
	defer timer.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-timer.C:
		}
		_, err := v.cache.Refresh(ctx, v.url)
		if err == nil {
			log.Info("JWKS loaded after retry; token verification enabled")
			return
		}
		log.Warn("JWKS retry fetch failed; will retry", "error", err, "backoff", backoff.String())
		backoff *= 2
		if backoff > maxRetryBackoff {
			backoff = maxRetryBackoff
		}
		timer.Reset(backoff)
	}
}

// Verify returns the token's claims, or ErrUnauthenticated. It reads the JWKS
// from the in-memory cache (no network call per verify), checks the signature and
// expiry, and requires the userId and username claims.
func (v *JWKSVerifier) Verify(ctx context.Context, token string) (Claims, error) {
	if token == "" {
		return Claims{}, ErrUnauthenticated
	}
	set, err := v.cache.Get(ctx, v.url)
	if err != nil {
		return Claims{}, ErrUnauthenticated // key set not available yet
	}
	tok, err := jwt.Parse([]byte(token), jwt.WithKeySet(set), jwt.WithValidate(true))
	if err != nil {
		return Claims{}, ErrUnauthenticated // bad signature, expired, or malformed
	}

	userID, ok := stringClaim(tok, "userId")
	if !ok {
		return Claims{}, ErrUnauthenticated
	}
	username, ok := stringClaim(tok, "username")
	if !ok {
		return Claims{}, ErrUnauthenticated
	}
	return Claims{UserID: userID, Username: username}, nil
}

func stringClaim(tok jwt.Token, name string) (string, bool) {
	raw, ok := tok.Get(name)
	if !ok {
		return "", false
	}
	s, ok := raw.(string)
	if !ok || s == "" {
		return "", false
	}
	return s, true
}
