// Package server builds the security service's HTTP server: the SuperTokens
// middleware (serving /auth/* and JWKS) wrapping the service's own routes, with
// timeouts set and graceful shutdown honored.
package server

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

// New builds an *http.Server listening on addr. The mux carries the service's
// own routes (health); wrap applies the SuperTokens middleware so /auth/* and
// the JWKS endpoint are served (pass nil to skip wrapping, e.g. in tests).
// Read/write/idle timeouts are always set — a zero-timeout server is a bug
// (Go Constitution §6).
func New(addr string, wrap func(http.Handler) http.Handler) *http.Server {
	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", handleHealth)

	var handler http.Handler = mux
	if wrap != nil {
		handler = wrap(mux)
	}

	return &http.Server{
		Addr:              addr,
		Handler:           handler,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
	}
}

// Run starts srv and blocks until ctx is cancelled, then shuts down gracefully
// within a bounded window. It returns an error only for an unexpected server
// failure; a clean shutdown returns nil.
func Run(ctx context.Context, srv *http.Server) error {
	errc := make(chan error, 1)
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			errc <- err
			return
		}
		errc <- nil
	}()

	select {
	case err := <-errc:
		return err
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		return srv.Shutdown(shutdownCtx)
	}
}

// handleHealth reports liveness for compose/devops health checks.
func handleHealth(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}
