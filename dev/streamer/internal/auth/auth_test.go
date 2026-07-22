package auth_test

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"runtime"
	"sync/atomic"
	"testing"
	"time"

	"github.com/lestrrat-go/jwx/v2/jwa"
	"github.com/lestrrat-go/jwx/v2/jwk"
	"github.com/lestrrat-go/jwx/v2/jwt"

	"github.com/quickchat/streamer/internal/auth"
)

const testKID = "test-kid"

// jwksFixture is a stubbed JWKS endpoint plus the signing key behind it.
type jwksFixture struct {
	signKey jwk.Key // private key (for signing test tokens)
	url     string
	hits    *int64
}

func newJWKSFixture(t *testing.T) *jwksFixture {
	t.Helper()
	raw, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("gen key: %v", err)
	}
	signKey, err := jwk.FromRaw(raw)
	if err != nil {
		t.Fatalf("jwk from raw: %v", err)
	}
	_ = signKey.Set(jwk.KeyIDKey, testKID)
	_ = signKey.Set(jwk.AlgorithmKey, jwa.RS256)

	pub, err := jwk.FromRaw(raw.Public())
	if err != nil {
		t.Fatalf("jwk pub: %v", err)
	}
	_ = pub.Set(jwk.KeyIDKey, testKID)
	_ = pub.Set(jwk.AlgorithmKey, jwa.RS256)
	set := jwk.NewSet()
	_ = set.AddKey(pub)
	body, err := json.Marshal(set)
	if err != nil {
		t.Fatalf("marshal jwks: %v", err)
	}

	var hits int64
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		atomic.AddInt64(&hits, 1)
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(body)
	}))
	t.Cleanup(srv.Close)
	return &jwksFixture{signKey: signKey, url: srv.URL, hits: &hits}
}

// newFlakyJWKSFixture is like newJWKSFixture but its endpoint replies 503 for the
// first failFirst requests before serving the JWKS — simulating a cold start where
// security is not yet resolvable/serving when streamer's initial fetch runs.
func newFlakyJWKSFixture(t *testing.T, failFirst int64) *jwksFixture {
	t.Helper()
	raw, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		t.Fatalf("gen key: %v", err)
	}
	signKey, err := jwk.FromRaw(raw)
	if err != nil {
		t.Fatalf("jwk from raw: %v", err)
	}
	_ = signKey.Set(jwk.KeyIDKey, testKID)
	_ = signKey.Set(jwk.AlgorithmKey, jwa.RS256)

	pub, err := jwk.FromRaw(raw.Public())
	if err != nil {
		t.Fatalf("jwk pub: %v", err)
	}
	_ = pub.Set(jwk.KeyIDKey, testKID)
	_ = pub.Set(jwk.AlgorithmKey, jwa.RS256)
	set := jwk.NewSet()
	_ = set.AddKey(pub)
	body, err := json.Marshal(set)
	if err != nil {
		t.Fatalf("marshal jwks: %v", err)
	}

	var hits int64
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		if atomic.AddInt64(&hits, 1) <= failFirst {
			http.Error(w, "unavailable", http.StatusServiceUnavailable)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write(body)
	}))
	t.Cleanup(srv.Close)
	return &jwksFixture{signKey: signKey, url: srv.URL, hits: &hits}
}

func (f *jwksFixture) sign(t *testing.T, key jwk.Key, claims map[string]any, exp time.Time) string {
	t.Helper()
	b := jwt.NewBuilder().Expiration(exp).IssuedAt(time.Now())
	for k, v := range claims {
		b = b.Claim(k, v)
	}
	tok, err := b.Build()
	if err != nil {
		t.Fatalf("build token: %v", err)
	}
	signed, err := jwt.Sign(tok, jwt.WithKey(jwa.RS256, key))
	if err != nil {
		t.Fatalf("sign token: %v", err)
	}
	return string(signed)
}

func newVerifier(t *testing.T, url string) auth.Verifier {
	t.Helper()
	v, err := auth.NewJWKSVerifier(context.Background(), url, slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatalf("NewJWKSVerifier: %v", err)
	}
	return v
}

func validClaims() map[string]any {
	return map[string]any{"userId": "user-123", "username": "alice"}
}

func TestVerifyValidToken(t *testing.T) {
	f := newJWKSFixture(t)
	v := newVerifier(t, f.url)
	token := f.sign(t, f.signKey, validClaims(), time.Now().Add(time.Hour))

	claims, err := v.Verify(context.Background(), token)
	if err != nil {
		t.Fatalf("Verify: %v", err)
	}
	if claims.UserID != "user-123" || claims.Username != "alice" {
		t.Fatalf("claims = %+v, want user-123/alice", claims)
	}
}

func TestVerifyRejects(t *testing.T) {
	f := newJWKSFixture(t)
	v := newVerifier(t, f.url)

	// A different key → signature won't verify against the JWKS.
	otherRaw, _ := rsa.GenerateKey(rand.Reader, 2048)
	otherKey, _ := jwk.FromRaw(otherRaw)
	_ = otherKey.Set(jwk.KeyIDKey, testKID)
	_ = otherKey.Set(jwk.AlgorithmKey, jwa.RS256)

	valid := f.sign(t, f.signKey, validClaims(), time.Now().Add(time.Hour))

	tests := map[string]string{
		"empty":         "",
		"garbage":       "not-a-jwt",
		"tampered":      valid[:len(valid)-3] + "xyz",
		"expired":       f.sign(t, f.signKey, validClaims(), time.Now().Add(-time.Hour)),
		"wrong key":     f.sign(t, otherKey, validClaims(), time.Now().Add(time.Hour)),
		"missing user":  f.sign(t, f.signKey, map[string]any{"username": "alice"}, time.Now().Add(time.Hour)),
		"missing uname": f.sign(t, f.signKey, map[string]any{"userId": "u1"}, time.Now().Add(time.Hour)),
	}
	for name, token := range tests {
		t.Run(name, func(t *testing.T) {
			if _, err := v.Verify(context.Background(), token); !errors.Is(err, auth.ErrUnauthenticated) {
				t.Fatalf("Verify(%s) err = %v, want ErrUnauthenticated", name, err)
			}
		})
	}
}

func TestVerifyDoesNotCallJWKSPerRequest(t *testing.T) {
	f := newJWKSFixture(t)
	v := newVerifier(t, f.url) // one initial warm fetch

	token := f.sign(t, f.signKey, validClaims(), time.Now().Add(time.Hour))
	for i := 0; i < 50; i++ {
		if _, err := v.Verify(context.Background(), token); err != nil {
			t.Fatalf("Verify: %v", err)
		}
	}
	if got := atomic.LoadInt64(f.hits); got > 1 {
		t.Fatalf("JWKS endpoint hit %d times across 50 verifies, want 1 (cached, no per-request fetch)", got)
	}
}

// TestVerifierRecoversFromFailedInitialFetch is the regression test for the
// cold-start bug: streamer boots before security is resolvable, so the initial
// JWKS fetch fails. The verifier must recover on its own — the background retry
// loads the key set and verification starts accepting a valid token WITHOUT a
// process restart. Before the fix the verifier held zero keys and rejected every
// token indefinitely.
func TestVerifierRecoversFromFailedInitialFetch(t *testing.T) {
	f := newFlakyJWKSFixture(t, 1) // the constructor's warm fetch fails, the retry succeeds

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	v, err := auth.NewJWKSVerifier(ctx, f.url, slog.New(slog.NewTextHandler(io.Discard, nil)))
	if err != nil {
		t.Fatalf("NewJWKSVerifier: %v", err)
	}

	token := f.sign(t, f.signKey, validClaims(), time.Now().Add(time.Hour))

	// Immediately after construction the key set has not loaded, so verification
	// gates (rejects) rather than being wrongly accepted.
	if _, err := v.Verify(context.Background(), token); !errors.Is(err, auth.ErrUnauthenticated) {
		t.Fatalf("expected gating before the JWKS loads, got err=%v", err)
	}

	// Without a restart, the background retry must load the keys and verification
	// must start succeeding. Bounded poll (no fixed sleep): the pre-fix bug would
	// keep gating until the deadline fires.
	deadline := time.Now().Add(5 * time.Second)
	for {
		claims, err := v.Verify(context.Background(), token)
		if err == nil {
			if claims.UserID != "user-123" || claims.Username != "alice" {
				t.Fatalf("claims = %+v, want user-123/alice", claims)
			}
			break
		}
		if !errors.Is(err, auth.ErrUnauthenticated) {
			t.Fatalf("unexpected verify error while recovering: %v", err)
		}
		if time.Now().After(deadline) {
			t.Fatalf("verifier never recovered from a failed initial JWKS fetch (still gating after 5s); endpoint hits=%d",
				atomic.LoadInt64(f.hits))
		}
		runtime.Gosched()
	}
}

// TestRefreshWorkerStopsOnContextCancel proves the background JWKS refresh worker
// is bound to the construction context and exits when it is cancelled — no leaked
// goroutine at shutdown (design D-B). An unreachable URL keeps goroutine accounting
// clean: the warm fetch fails immediately (logged, not fatal) so no idle HTTP
// connection lingers, while the worker still starts. Many workers are spawned so
// the goroutine delta dominates scheduler noise.
func TestRefreshWorkerStopsOnContextCancel(t *testing.T) {
	const unreachable = "http://127.0.0.1:1/jwks.json"
	log := slog.New(slog.NewTextHandler(io.Discard, nil))

	base := runtime.NumGoroutine()

	const n = 25
	cancels := make([]context.CancelFunc, n)
	for i := range cancels {
		ctx, cancel := context.WithCancel(context.Background())
		cancels[i] = cancel
		if _, err := auth.NewJWKSVerifier(ctx, unreachable, log); err != nil {
			t.Fatalf("NewJWKSVerifier: %v", err)
		}
	}

	// Sanity: the workers are actually running, so a later return to baseline is
	// meaningful proof they stopped (a `go` statement counts immediately).
	if got := runtime.NumGoroutine(); got <= base {
		t.Fatalf("expected refresh workers to raise goroutine count above baseline %d, got %d", base, got)
	}

	for _, cancel := range cancels {
		cancel()
	}

	// Bounded wait (no fixed sleep) for the workers to observe cancellation and
	// exit; a leak would hold the count above baseline until the deadline.
	deadline := time.Now().Add(2 * time.Second)
	for runtime.NumGoroutine() > base {
		if time.Now().After(deadline) {
			t.Fatalf("goroutines did not return to baseline %d after cancel; still %d (refresh worker leaked)",
				base, runtime.NumGoroutine())
		}
		runtime.Gosched()
	}
}
