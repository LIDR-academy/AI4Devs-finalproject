//go:build integration

// Integration tests for the Valkey-backed Store. Excluded from the default
// `go test ./...` run; enable with `go test -tags integration ./...` and a
// reachable Valkey named by VALKEY_ADDR (e.g. localhost:6379).
package valkey_test

import (
	"context"
	"errors"
	"os"
	"testing"

	"github.com/quickchat/streamer/internal/stream"
	"github.com/quickchat/streamer/internal/valkey"
)

func newTestStore(t *testing.T) *valkey.Store {
	t.Helper()
	addr := os.Getenv("VALKEY_ADDR")
	if addr == "" {
		t.Skip("VALKEY_ADDR not set; skipping integration test")
	}
	s := valkey.New(addr, os.Getenv("VALKEY_PASSWORD"), 0)
	t.Cleanup(func() { _ = s.Close() })

	if err := s.Ping(context.Background()); err != nil {
		t.Fatalf("Ping: %v", err)
	}
	return s
}

func TestStoreAddListRemove(t *testing.T) {
	s := newTestStore(t)
	ctx := context.Background()

	st := stream.Stream{ID: "it-" + t.Name(), Title: "integration", Description: "multi-byte é"}
	t.Cleanup(func() { _ = s.Remove(ctx, st.ID) })

	if err := s.Add(ctx, st); err != nil {
		t.Fatalf("Add: %v", err)
	}

	list, err := s.List(ctx)
	if err != nil {
		t.Fatalf("List: %v", err)
	}
	found := false
	for _, got := range list {
		if got.ID == st.ID {
			found = true
			if got.Title != st.Title || got.Description != st.Description {
				t.Fatalf("listed stream = %+v, want %+v", got, st)
			}
		}
	}
	if !found {
		t.Fatalf("added stream %s not found in list", st.ID)
	}

	if err := s.Remove(ctx, st.ID); err != nil {
		t.Fatalf("Remove: %v", err)
	}

	// Removing again is a not-found.
	if err := s.Remove(ctx, st.ID); !errors.Is(err, stream.ErrNotFound) {
		t.Fatalf("second Remove error = %v, want ErrNotFound", err)
	}
}

func TestStoreRemoveMissing(t *testing.T) {
	s := newTestStore(t)
	if err := s.Remove(context.Background(), "definitely-not-live"); !errors.Is(err, stream.ErrNotFound) {
		t.Fatalf("Remove missing error = %v, want ErrNotFound", err)
	}
}
