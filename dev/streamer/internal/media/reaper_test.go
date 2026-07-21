package media

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"sync"
	"testing"
	"time"
)

type fakeTimer struct{ stopped bool }

func (t *fakeTimer) Stop() bool { t.stopped = true; return true }

type recEnder struct {
	mu    sync.Mutex
	ended []string
}

func (e *recEnder) EndRoom(_ context.Context, id string) error {
	e.mu.Lock()
	defer e.mu.Unlock()
	e.ended = append(e.ended, id)
	return nil
}

func (e *recEnder) count() int {
	e.mu.Lock()
	defer e.mu.Unlock()
	return len(e.ended)
}

// mapNames maps room → publisher username; unknown rooms error.
type mapNames map[string]string

func (m mapNames) Username(_ context.Context, id string) (string, error) {
	if u, ok := m[id]; ok {
		return u, nil
	}
	return "", errors.New("not found")
}

type pending struct {
	fn    func()
	timer *fakeTimer
}

// newTestReaper returns a reaper with an injected timer factory and a pointer to
// the most recently armed timer.
func newTestReaper(ender EndRoomer, names UsernameLookup) (*Reaper, *pending) {
	log := slog.New(slog.NewTextHandler(io.Discard, nil))
	r := NewReaper(ender, names, 30*time.Second, 120*time.Second, log)
	last := &pending{}
	r.newTimer = func(_ time.Duration, f func()) timer {
		ft := &fakeTimer{}
		last.fn, last.timer = f, ft
		return ft
	}
	return r, last
}

func TestReaperDepartureReap(t *testing.T) {
	ender := &recEnder{}
	r, last := newTestReaper(ender, mapNames{"r1": "alice"})
	ctx := context.Background()

	r.HandleEvent(ctx, eventParticipantJoined, "r1", "alice") // publisher present
	r.HandleEvent(ctx, eventParticipantLeft, "r1", "alice")   // publisher gone → departure grace
	if last.fn == nil {
		t.Fatal("no departure timer armed")
	}
	last.fn() // grace elapsed

	if ender.count() != 1 || ender.ended[0] != "r1" {
		t.Fatalf("ended = %v, want [r1]", ender.ended)
	}
}

func TestReaperTransientBlipDoesNotReap(t *testing.T) {
	ender := &recEnder{}
	r, last := newTestReaper(ender, mapNames{"r1": "alice"})
	ctx := context.Background()

	r.HandleEvent(ctx, eventParticipantJoined, "r1", "alice")
	r.HandleEvent(ctx, eventParticipantLeft, "r1", "alice") // departure grace armed
	departureTimer := last.timer
	r.HandleEvent(ctx, eventParticipantJoined, "r1", "alice") // publisher back within grace

	if !departureTimer.stopped {
		t.Fatal("departure timer was not cancelled on publisher return")
	}
	if ender.count() != 0 {
		t.Fatalf("room reaped despite a transient blip: %v", ender.ended)
	}
}

func TestReaperCreationGraceReap(t *testing.T) {
	ender := &recEnder{}
	r, last := newTestReaper(ender, mapNames{})
	r.HandleEvent(context.Background(), eventRoomStarted, "r2", "")
	if last.fn == nil {
		t.Fatal("no creation-grace timer armed")
	}
	last.fn()
	if ender.count() != 1 || ender.ended[0] != "r2" {
		t.Fatalf("ended = %v, want [r2]", ender.ended)
	}
}

func TestReaperCreationGraceCancelledByPublisher(t *testing.T) {
	ender := &recEnder{}
	r, last := newTestReaper(ender, mapNames{"r3": "alice"})
	ctx := context.Background()

	r.HandleEvent(ctx, eventRoomStarted, "r3", "")
	creationTimer := last.timer
	r.HandleEvent(ctx, eventParticipantJoined, "r3", "alice") // publisher shows up in time

	if !creationTimer.stopped {
		t.Fatal("creation timer not cancelled when publisher arrived")
	}
	if ender.count() != 0 {
		t.Fatalf("room reaped despite publisher arriving: %v", ender.ended)
	}
}

func TestReaperIgnoresViewers(t *testing.T) {
	ender := &recEnder{}
	r, last := newTestReaper(ender, mapNames{"r5": "alice"})
	// A viewer (not the publisher) leaving must not arm a departure timer.
	r.HandleEvent(context.Background(), eventParticipantLeft, "r5", "bob")
	if last.fn != nil {
		t.Fatal("a viewer leaving armed a reap timer")
	}
	if ender.count() != 0 {
		t.Fatalf("viewer event caused a reap: %v", ender.ended)
	}
}

func TestReaperShutdownStopsTimers(t *testing.T) {
	ender := &recEnder{}
	r, last := newTestReaper(ender, mapNames{})
	r.HandleEvent(context.Background(), eventRoomStarted, "r6", "")
	armed := last.timer

	r.Shutdown()

	if !armed.stopped {
		t.Fatal("Shutdown did not stop the pending timer")
	}
	// Even if a stopped timer's callback somehow fires, no reap happens after shutdown.
	last.fn()
	if ender.count() != 0 {
		t.Fatalf("reap fired after shutdown: %v", ender.ended)
	}
}
