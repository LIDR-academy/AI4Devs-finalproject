//go:build integration

// Integration tests for the Valkey-backed Store. Excluded from the default
// `go test ./...` run; enable with `go test -tags integration ./...` and a
// reachable Valkey named by VALKEY_ADDR (e.g. localhost:6379).
package valkey_test

import (
	"context"
	"errors"
	"os"
	"strconv"
	"testing"

	"github.com/quickchat/streamer/internal/chat"
	"github.com/quickchat/streamer/internal/stream"
	"github.com/quickchat/streamer/internal/valkey"
)

func newTestStore(t *testing.T, chatCap int) *valkey.Store {
	t.Helper()
	addr := os.Getenv("VALKEY_ADDR")
	if addr == "" {
		t.Skip("VALKEY_ADDR not set; skipping integration test")
	}
	s := valkey.New(addr, os.Getenv("VALKEY_PASSWORD"), 0, chatCap)
	t.Cleanup(func() { _ = s.Close() })
	if err := s.Ping(context.Background()); err != nil {
		t.Fatalf("Ping: %v", err)
	}
	return s
}

func TestStreamAddListRemoveWithContractFields(t *testing.T) {
	s := newTestStore(t, 1000)
	ctx := context.Background()

	st := stream.Stream{ID: "it-" + t.Name(), Username: "alice", Title: "integration", Description: "é"}
	t.Cleanup(func() { _ = s.Remove(ctx, st.ID); _ = s.DeleteRoom(ctx, st.ID) })

	if err := s.Add(ctx, st, "secret-key"); err != nil {
		t.Fatalf("Add: %v", err)
	}

	// List carries username but never the creatorKey.
	list, err := s.List(ctx)
	if err != nil {
		t.Fatalf("List: %v", err)
	}
	var found *stream.Stream
	for i := range list {
		if list[i].ID == st.ID {
			found = &list[i]
		}
	}
	if found == nil || found.Username != "alice" {
		t.Fatalf("listed stream = %+v, want username alice", found)
	}

	// Creator returns username + private key.
	username, key, err := s.Creator(ctx, st.ID)
	if err != nil || username != "alice" || key != "secret-key" {
		t.Fatalf("Creator = (%q, %q, %v), want alice/secret-key", username, key, err)
	}

	if ok, _ := s.Exists(ctx, st.ID); !ok {
		t.Fatalf("Exists = false, want true")
	}
	if err := s.Remove(ctx, st.ID); err != nil {
		t.Fatalf("Remove: %v", err)
	}
	if _, _, err := s.Creator(ctx, st.ID); !errors.Is(err, stream.ErrNotFound) {
		t.Fatalf("Creator after remove = %v, want ErrNotFound", err)
	}
}

func TestMessageAppendHistoryPagination(t *testing.T) {
	s := newTestStore(t, 1000)
	ctx := context.Background()
	room := "it-" + t.Name()
	t.Cleanup(func() { _ = s.DeleteRoom(ctx, room) })

	// Append 5 messages.
	for i := 0; i < 5; i++ {
		if _, err := s.Append(ctx, room, chat.Message{Sender: "u", Role: chat.RoleViewer, Text: "m" + strconv.Itoa(i), Ts: "t"}); err != nil {
			t.Fatalf("Append: %v", err)
		}
	}

	// Latest page of 2 → newest two, oldest→newest, with a cursor.
	page, next, err := s.History(ctx, room, "", 2)
	if err != nil {
		t.Fatalf("History: %v", err)
	}
	if len(page) != 2 || page[0].Text != "m3" || page[1].Text != "m4" {
		t.Fatalf("latest page = %+v, want [m3 m4]", page)
	}
	if next == "" {
		t.Fatalf("expected a cursor with older history")
	}

	// Older page via the cursor (exclusive).
	page2, _, err := s.History(ctx, room, next, 2)
	if err != nil {
		t.Fatalf("History(before): %v", err)
	}
	if len(page2) != 2 || page2[0].Text != "m1" || page2[1].Text != "m2" {
		t.Fatalf("second page = %+v, want [m1 m2]", page2)
	}
}

func TestMessageCapDropsOldest(t *testing.T) {
	s := newTestStore(t, 3) // small cap
	ctx := context.Background()
	room := "it-" + t.Name()
	t.Cleanup(func() { _ = s.DeleteRoom(ctx, room) })

	for i := 0; i < 6; i++ {
		if _, err := s.Append(ctx, room, chat.Message{Sender: "u", Role: chat.RoleViewer, Text: "m" + strconv.Itoa(i), Ts: "t"}); err != nil {
			t.Fatalf("Append: %v", err)
		}
	}

	// Ask for more than the cap; stored history never exceeds it.
	page, _, err := s.History(ctx, room, "", 100)
	if err != nil {
		t.Fatalf("History: %v", err)
	}
	if len(page) != 3 {
		t.Fatalf("history len = %d, want capped at 3", len(page))
	}
	if page[0].Text != "m3" || page[2].Text != "m5" {
		t.Fatalf("history = %+v, want the newest 3 (m3..m5)", page)
	}
}

func TestDeleteRoomRemovesMessages(t *testing.T) {
	s := newTestStore(t, 1000)
	ctx := context.Background()
	room := "it-" + t.Name()

	if _, err := s.Append(ctx, room, chat.Message{Sender: "u", Role: chat.RoleViewer, Text: "hi", Ts: "t"}); err != nil {
		t.Fatalf("Append: %v", err)
	}
	if err := s.DeleteRoom(ctx, room); err != nil {
		t.Fatalf("DeleteRoom: %v", err)
	}
	page, _, err := s.History(ctx, room, "", 10)
	if err != nil {
		t.Fatalf("History: %v", err)
	}
	if len(page) != 0 {
		t.Fatalf("history after delete = %+v, want empty", page)
	}
}
