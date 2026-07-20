package hub

import (
	"encoding/json"
	"io"
	"log/slog"
	"testing"
)

func testLogger() *slog.Logger { return slog.New(slog.NewTextHandler(io.Discard, nil)) }

// newTestClient builds a client with a buffered send channel and an initialized
// stop channel the test can observe.
func newTestClient(buf int) *client {
	return &client{send: make(chan []byte, buf), stop: make(chan struct{})}
}

// stopped reports whether the client has been asked to stop.
func stopped(c *client) bool {
	select {
	case <-c.stop:
		return true
	default:
		return false
	}
}

func TestBroadcastReachesAllInRoom(t *testing.T) {
	h := New(testLogger())
	c1 := newTestClient(4)
	c2 := newTestClient(4)
	other := newTestClient(4)
	h.register("r1", c1)
	h.register("r1", c2)
	h.register("r2", other)

	h.Broadcast("r1", []byte("hi"))

	for _, c := range []*client{c1, c2} {
		select {
		case got := <-c.send:
			if string(got) != "hi" {
				t.Fatalf("got %q, want hi", got)
			}
		default:
			t.Fatalf("client in r1 did not receive broadcast")
		}
	}
	select {
	case got := <-other.send:
		t.Fatalf("client in r2 unexpectedly received %q", got)
	default:
	}
}

func TestBroadcastDisconnectsSlowConsumer(t *testing.T) {
	h := New(testLogger())
	c := newTestClient(1)
	h.register("r", c)

	h.Broadcast("r", []byte("one")) // fills the buffer
	h.Broadcast("r", []byte("two")) // buffer full → client stopped

	if !stopped(c) {
		t.Fatalf("slow consumer was not stopped when its buffer filled")
	}
}

func TestCloseRoomNotifiesAndDrops(t *testing.T) {
	h := New(testLogger())
	c := newTestClient(4)
	h.register("r", c)

	h.CloseRoom("r")

	if !stopped(c) {
		t.Fatalf("CloseRoom did not stop the client")
	}
	if h.RoomSize("r") != 0 {
		t.Fatalf("RoomSize = %d after CloseRoom, want 0", h.RoomSize("r"))
	}
	select {
	case payload := <-c.send:
		var f errorFrame
		if err := json.Unmarshal(payload, &f); err != nil || f.Type != "error" || f.Reason != "room ended" {
			t.Fatalf("queued frame = %q, want room-ended error", payload)
		}
	default:
		t.Fatalf("CloseRoom did not queue a room-ended error")
	}
}

func TestCloseAllStopsEveryClient(t *testing.T) {
	h := New(testLogger())
	c1 := newTestClient(4)
	c2 := newTestClient(4)
	h.register("r1", c1)
	h.register("r2", c2)

	h.CloseAll()

	if !stopped(c1) || !stopped(c2) {
		t.Fatalf("CloseAll did not stop every client")
	}
	if h.RoomSize("r1") != 0 || h.RoomSize("r2") != 0 {
		t.Fatalf("rooms not emptied by CloseAll")
	}
}

func TestUnregisterRemovesEmptyRoom(t *testing.T) {
	h := New(testLogger())
	c := newTestClient(4)
	h.register("r", c)
	if h.RoomSize("r") != 1 {
		t.Fatalf("RoomSize = %d, want 1", h.RoomSize("r"))
	}
	h.unregister("r", c)
	if h.RoomSize("r") != 0 {
		t.Fatalf("RoomSize = %d after unregister, want 0", h.RoomSize("r"))
	}
}
