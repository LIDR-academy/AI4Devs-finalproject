package hub_test

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/coder/websocket"

	"github.com/quickchat/streamer/internal/chat"
	"github.com/quickchat/streamer/internal/hub"
)

// fakeAuth: room "missing" is not live; key "goodkey" is the creator "alice".
type fakeAuth struct{}

func (fakeAuth) VerifyCreator(_ context.Context, roomID, key string) (bool, string, error) {
	if roomID == "missing" {
		return false, "", errors.New("room not found")
	}
	if key == "goodkey" {
		return true, "alice", nil
	}
	return false, "alice", nil
}

// memMsgStore is a minimal in-memory chat.MessageStore for the Poster.
type memMsgStore struct {
	mu  sync.Mutex
	seq int
}

func (m *memMsgStore) Append(_ context.Context, _ string, msg chat.Message) (chat.Message, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.seq++
	msg.ID = strconv.Itoa(m.seq)
	return msg, nil
}
func (m *memMsgStore) History(context.Context, string, string, int) ([]chat.Message, string, error) {
	return nil, "", nil
}
func (m *memMsgStore) DeleteRoom(context.Context, string) error { return nil }

type wsFixture struct {
	url     string
	hub     *hub.Hub
	returns chan struct{}
}

func newWSFixture(t *testing.T, roomID string) *wsFixture {
	t.Helper()
	log := slog.New(slog.NewTextHandler(io.Discard, nil))
	h := hub.New(log)
	poster := chat.NewService(&memMsgStore{}, 500, 200, nil)
	returns := make(chan struct{}, 16)

	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h.ServeWS(w, r, roomID, fakeAuth{}, poster)
		returns <- struct{}{}
	}))
	t.Cleanup(srv.Close)

	return &wsFixture{url: "ws" + strings.TrimPrefix(srv.URL, "http"), hub: h, returns: returns}
}

func dial(t *testing.T, url string) *websocket.Conn {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	c, _, err := websocket.Dial(ctx, url, nil)
	if err != nil {
		t.Fatalf("dial: %v", err)
	}
	t.Cleanup(func() { _ = c.Close(websocket.StatusNormalClosure, "") })
	return c
}

func writeJSON(t *testing.T, c *websocket.Conn, v string) {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := c.Write(ctx, websocket.MessageText, []byte(v)); err != nil {
		t.Fatalf("write: %v", err)
	}
}

func readJSON(t *testing.T, c *websocket.Conn) map[string]any {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, data, err := c.Read(ctx)
	if err != nil {
		t.Fatalf("read: %v", err)
	}
	var m map[string]any
	if err := json.Unmarshal(data, &m); err != nil {
		t.Fatalf("decode frame %q: %v", data, err)
	}
	return m
}

func TestJoinAsCreator(t *testing.T) {
	fx := newWSFixture(t, "live")
	c := dial(t, fx.url)
	writeJSON(t, c, `{"type":"join","creatorKey":"goodkey"}`)

	f := readJSON(t, c)
	if f["type"] != "welcome" || f["role"] != "streamer" || f["sender"] != "alice" {
		t.Fatalf("welcome = %v, want streamer/alice", f)
	}
}

func TestJoinAsViewer(t *testing.T) {
	fx := newWSFixture(t, "live")
	c := dial(t, fx.url)
	writeJSON(t, c, `{"type":"join"}`)

	f := readJSON(t, c)
	if f["type"] != "welcome" || f["role"] != "viewer" {
		t.Fatalf("welcome = %v, want viewer", f)
	}
	if sender, _ := f["sender"].(string); !regexp.MustCompile(`^[a-z]+-[a-z0-9]+$`).MatchString(sender) {
		t.Fatalf("viewer sender = %v, want word-alphanumeric", f["sender"])
	}
}

func TestJoinNonexistentRoom(t *testing.T) {
	fx := newWSFixture(t, "missing")
	c := dial(t, fx.url)
	writeJSON(t, c, `{"type":"join"}`)

	f := readJSON(t, c)
	if f["type"] != "error" || f["reason"] != hub.ReasonRoomNotFound {
		t.Fatalf("frame = %v, want terminal error reason %q", f, hub.ReasonRoomNotFound)
	}
	// Terminal: the connection is then closed (error-then-close invariant).
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if _, _, err := c.Read(ctx); err == nil {
		t.Fatalf("expected the connection to be closed after a terminal error")
	}
}

func TestMessageBroadcast(t *testing.T) {
	fx := newWSFixture(t, "live")
	c1 := dial(t, fx.url)
	c2 := dial(t, fx.url)
	writeJSON(t, c1, `{"type":"join"}`)
	writeJSON(t, c2, `{"type":"join"}`)
	readJSON(t, c1) // welcome
	readJSON(t, c2) // welcome

	writeJSON(t, c1, `{"type":"message","text":"hello room"}`)

	for _, c := range []*websocket.Conn{c1, c2} {
		f := readJSON(t, c)
		if f["type"] != "message" {
			t.Fatalf("frame = %v, want message", f)
		}
		msg, _ := f["message"].(map[string]any)
		if msg["text"] != "hello room" || msg["id"] == "" || msg["role"] != "viewer" {
			t.Fatalf("broadcast message = %v, want text/id/role", msg)
		}
	}
}

func TestEmptyMessageRejectedToSenderOnly(t *testing.T) {
	fx := newWSFixture(t, "live")
	c := dial(t, fx.url)
	writeJSON(t, c, `{"type":"join"}`)
	readJSON(t, c) // welcome

	writeJSON(t, c, `{"type":"message","text":"   "}`)
	f := readJSON(t, c)
	if f["type"] != "error" {
		t.Fatalf("frame = %v, want error for empty message", f)
	}
	// Non-terminal: the connection stays open, so a following valid message is
	// still accepted and broadcast (no close after a validation error).
	writeJSON(t, c, `{"type":"message","text":"still here"}`)
	next := readJSON(t, c)
	if next["type"] != "message" {
		t.Fatalf("frame = %v, want a broadcast after a non-terminal error", next)
	}
}

func TestRoomClosedWhileConnected(t *testing.T) {
	fx := newWSFixture(t, "live")
	c := dial(t, fx.url)
	writeJSON(t, c, `{"type":"join"}`)
	readJSON(t, c) // welcome

	fx.hub.CloseRoom("live")

	f := readJSON(t, c)
	if f["type"] != "error" || f["reason"] != hub.ReasonRoomEnded {
		t.Fatalf("frame = %v, want terminal error reason %q", f, hub.ReasonRoomEnded)
	}
	waitReturn(t, fx) // ServeWS returned → no leak
}

func TestClientDropIsCleanedUp(t *testing.T) {
	fx := newWSFixture(t, "live")
	c := dial(t, fx.url)
	writeJSON(t, c, `{"type":"join"}`)
	readJSON(t, c) // welcome

	if fx.hub.RoomSize("live") != 1 {
		t.Fatalf("RoomSize = %d, want 1 after join", fx.hub.RoomSize("live"))
	}

	// Drop the connection; the server must tear down both pumps and unregister.
	_ = c.Close(websocket.StatusNormalClosure, "bye")

	waitReturn(t, fx)
	if fx.hub.RoomSize("live") != 0 {
		t.Fatalf("RoomSize = %d after drop, want 0 (leak)", fx.hub.RoomSize("live"))
	}
}

// waitReturn blocks until one ServeWS invocation returns, proving its goroutines
// stopped, or fails after a bounded deadline.
func waitReturn(t *testing.T, fx *wsFixture) {
	t.Helper()
	select {
	case <-fx.returns:
	case <-time.After(5 * time.Second):
		t.Fatalf("ServeWS did not return within the deadline (possible goroutine leak)")
	}
}
