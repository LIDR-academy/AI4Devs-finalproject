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

	"github.com/quickchat/streamer/internal/auth"
	"github.com/quickchat/streamer/internal/chat"
	"github.com/quickchat/streamer/internal/hub"
)

// fakeVerifier: "owner-token" → the owner; "viewer-token" → a signed-in non-owner;
// anything else → unauthenticated.
type fakeVerifier struct{}

func (fakeVerifier) Verify(_ context.Context, token string) (auth.Claims, error) {
	switch token {
	case "owner-token":
		return auth.Claims{UserID: "owner-1", Username: "alice"}, nil
	case "viewer-token":
		return auth.Claims{UserID: "user-2", Username: "bob"}, nil
	default:
		return auth.Claims{}, auth.ErrUnauthenticated
	}
}

// fakeOwner: room "missing" is not live; "live" is owned by owner-1.
type fakeOwner struct{}

func (fakeOwner) Owner(_ context.Context, roomID string) (string, error) {
	if roomID == "missing" {
		return "", errors.New("not live")
	}
	return "owner-1", nil
}

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
		h.ServeWS(w, r, roomID, fakeVerifier{}, fakeOwner{}, poster)
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

func TestJoinOwner(t *testing.T) {
	fx := newWSFixture(t, "live")
	c := dial(t, fx.url)
	writeJSON(t, c, `{"type":"join","token":"owner-token"}`)
	f := readJSON(t, c)
	if f["type"] != "welcome" || f["role"] != "streamer" || f["sender"] != "alice" {
		t.Fatalf("welcome = %v, want streamer/alice", f)
	}
}

func TestJoinSignedInNonOwner(t *testing.T) {
	fx := newWSFixture(t, "live")
	c := dial(t, fx.url)
	writeJSON(t, c, `{"type":"join","token":"viewer-token"}`)
	f := readJSON(t, c)
	if f["type"] != "welcome" || f["role"] != "viewer" || f["sender"] != "bob" {
		t.Fatalf("welcome = %v, want viewer/bob", f)
	}
}

func TestJoinAnonymousReadOnly(t *testing.T) {
	fx := newWSFixture(t, "live")
	c := dial(t, fx.url)
	writeJSON(t, c, `{"type":"join"}`)
	f := readJSON(t, c)
	if f["type"] != "welcome" || f["role"] != "viewer" {
		t.Fatalf("welcome = %v, want viewer", f)
	}
	if sender, _ := f["sender"].(string); !regexp.MustCompile(`^[a-z]+-[a-z0-9]+$`).MatchString(sender) {
		t.Fatalf("anon sender = %v, want generated id", f["sender"])
	}
}

func TestJoinNonexistentRoom(t *testing.T) {
	fx := newWSFixture(t, "missing")
	c := dial(t, fx.url)
	writeJSON(t, c, `{"type":"join","token":"owner-token"}`)
	f := readJSON(t, c)
	if f["type"] != "error" || f["reason"] != hub.ReasonRoomNotFound {
		t.Fatalf("frame = %v, want terminal room-not-found", f)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if _, _, err := c.Read(ctx); err == nil {
		t.Fatal("expected close after terminal error")
	}
}

func TestAuthenticatedMessageBroadcastsToAll(t *testing.T) {
	fx := newWSFixture(t, "live")
	owner := dial(t, fx.url)
	anon := dial(t, fx.url)
	writeJSON(t, owner, `{"type":"join","token":"owner-token"}`)
	writeJSON(t, anon, `{"type":"join"}`) // read-only viewer
	readJSON(t, owner)                    // welcome
	readJSON(t, anon)                     // welcome

	writeJSON(t, owner, `{"type":"message","text":"hi all"}`)

	// Both the owner and the read-only viewer receive the broadcast.
	for _, c := range []*websocket.Conn{owner, anon} {
		f := readJSON(t, c)
		msg, _ := f["message"].(map[string]any)
		if f["type"] != "message" || msg["text"] != "hi all" || msg["role"] != "streamer" {
			t.Fatalf("broadcast = %v, want streamer message to all", f)
		}
	}
}

func TestReadOnlyMessageRejectedAuthRequired(t *testing.T) {
	fx := newWSFixture(t, "live")
	c := dial(t, fx.url)
	writeJSON(t, c, `{"type":"join"}`) // anonymous → read-only
	readJSON(t, c)                     // welcome

	writeJSON(t, c, `{"type":"message","text":"let me in"}`)
	f := readJSON(t, c)
	if f["type"] != "error" || f["reason"] != hub.ReasonAuthRequired {
		t.Fatalf("frame = %v, want auth_required error", f)
	}
	// Non-terminal: the connection stays open (invalid frame still gets a reply).
	writeJSON(t, c, `{"type":"message"}`)
	if next := readJSON(t, c); next["type"] != "error" {
		t.Fatalf("connection closed after auth_required; got %v", next)
	}
}

func TestClientDropIsCleanedUp(t *testing.T) {
	fx := newWSFixture(t, "live")
	c := dial(t, fx.url)
	writeJSON(t, c, `{"type":"join","token":"owner-token"}`)
	readJSON(t, c)

	if fx.hub.RoomSize("live") != 1 {
		t.Fatalf("RoomSize = %d, want 1", fx.hub.RoomSize("live"))
	}
	_ = c.Close(websocket.StatusNormalClosure, "bye")

	select {
	case <-fx.returns:
	case <-time.After(5 * time.Second):
		t.Fatal("ServeWS did not return (possible leak)")
	}
	if fx.hub.RoomSize("live") != 0 {
		t.Fatalf("RoomSize = %d after drop, want 0", fx.hub.RoomSize("live"))
	}
}
