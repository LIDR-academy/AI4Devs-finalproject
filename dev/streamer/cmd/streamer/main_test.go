package main

import (
	"context"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestServeShutsDownOnContextCancel(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}

	srv := &http.Server{
		Handler: http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusOK)
		}),
		ReadHeaderTimeout: readHeaderTimeout,
	}
	log := slog.New(slog.NewTextHandler(io.Discard, nil))

	ctx, cancel := context.WithCancel(context.Background())
	done := make(chan error, 1)
	go func() { done <- serve(ctx, srv, ln, log) }()

	url := "http://" + ln.Addr().String() + "/"

	// The server is up and answering before shutdown.
	resp, err := http.Get(url)
	if err != nil {
		t.Fatalf("request before shutdown: %v", err)
	}
	_ = resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("status before shutdown = %d, want 200", resp.StatusCode)
	}

	// Cancelling the context triggers a clean shutdown.
	cancel()
	select {
	case err := <-done:
		if err != nil {
			t.Fatalf("serve returned error: %v", err)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("serve did not return within the shutdown deadline")
	}

	// After shutdown the listener is closed, so new requests fail.
	if _, err := http.Get(url); err == nil {
		t.Fatal("expected request after shutdown to fail")
	}
}

func TestHealthcheck(t *testing.T) {
	tests := []struct {
		name    string
		status  int
		wantErr bool
	}{
		{name: "readyz ok", status: http.StatusOK, wantErr: false},
		{name: "readyz not ready", status: http.StatusServiceUnavailable, wantErr: true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.URL.Path != "/readyz" {
					w.WriteHeader(http.StatusNotFound)
					return
				}
				w.WriteHeader(tt.status)
			}))
			defer ts.Close()

			t.Setenv("STREAMER_ADDR", strings.TrimPrefix(ts.URL, "http://"))

			err := healthcheck()
			if tt.wantErr && err == nil {
				t.Fatalf("healthcheck() = nil, want error")
			}
			if !tt.wantErr && err != nil {
				t.Fatalf("healthcheck() = %v, want nil", err)
			}
		})
	}
}
