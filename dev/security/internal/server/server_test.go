package server_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/quickchat/security/internal/server"
)

func TestHealthEndpoint(t *testing.T) {
	srv := server.New(":0", nil)
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)

	srv.Handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	var body map[string]string
	if err := json.NewDecoder(rec.Body).Decode(&body); err != nil {
		t.Fatalf("decoding health body: %v", err)
	}
	if body["status"] != "ok" {
		t.Errorf("status field = %q, want ok", body["status"])
	}
}

func TestServerHasTimeouts(t *testing.T) {
	srv := server.New(":0", nil)
	if srv.ReadTimeout == 0 || srv.WriteTimeout == 0 || srv.IdleTimeout == 0 || srv.ReadHeaderTimeout == 0 {
		t.Errorf("server must set all timeouts, got read=%v write=%v idle=%v header=%v",
			srv.ReadTimeout, srv.WriteTimeout, srv.IdleTimeout, srv.ReadHeaderTimeout)
	}
}

func TestRunGracefulShutdown(t *testing.T) {
	srv := server.New("127.0.0.1:0", nil)
	ctx, cancel := context.WithCancel(context.Background())

	done := make(chan error, 1)
	go func() { done <- server.Run(ctx, srv) }()

	// Cancel to trigger graceful shutdown; Run must return without error.
	cancel()

	select {
	case err := <-done:
		if err != nil {
			t.Fatalf("Run returned error on clean shutdown: %v", err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("Run did not return after context cancellation")
	}
}
