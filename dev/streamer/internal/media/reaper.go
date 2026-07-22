package media

import (
	"context"
	"log/slog"
	"sync"
	"time"
)

// LiveKit webhook event types the reaper reacts to.
const (
	eventRoomStarted       = "room_started"
	eventRoomFinished      = "room_finished"
	eventParticipantJoined = "participant_joined"
	eventParticipantLeft   = "participant_left"

	// reapTimeout bounds the room-end cascade fired by a grace timer.
	reapTimeout = 10 * time.Second
)

// EndRoomer ends a room (satisfied by *RoomEnder).
type EndRoomer interface {
	EndRoom(ctx context.Context, id string) error
}

// UsernameLookup returns a room's publisher identity — its username (satisfied by
// stream.Service).
type UsernameLookup interface {
	Username(ctx context.Context, id string) (string, error)
}

// timer is a cancellable one-shot timer (satisfied by *time.Timer).
type timer interface {
	Stop() bool
}

// timerFunc schedules f after d and returns a cancellable timer. Injectable so
// tests drive grace windows deterministically.
type timerFunc func(d time.Duration, f func()) timer

func realTimer(d time.Duration, f func()) timer { return time.AfterFunc(d, f) }

type roomState struct {
	hasPublisher bool
	t            timer
}

// Reaper ends abandoned rooms. Driven by verified LiveKit webhooks, it starts a
// creation-grace timer when a room appears without a publisher and a
// departure-grace timer when the publisher leaves; a publisher (re)joining
// cancels the pending timer. A fired timer ends the room. All per-room state is
// guarded by one mutex; timers are cancelled on Shutdown, leaking no goroutine.
type Reaper struct {
	ender          EndRoomer
	names          UsernameLookup
	departureGrace time.Duration
	creationGrace  time.Duration
	log            *slog.Logger
	newTimer       timerFunc

	mu      sync.Mutex
	rooms   map[string]*roomState
	stopped bool
}

// NewReaper returns a Reaper with the given grace windows.
func NewReaper(ender EndRoomer, names UsernameLookup, departureGrace, creationGrace time.Duration, log *slog.Logger) *Reaper {
	return &Reaper{
		ender:          ender,
		names:          names,
		departureGrace: departureGrace,
		creationGrace:  creationGrace,
		log:            log,
		newTimer:       realTimer,
		rooms:          make(map[string]*roomState),
	}
}

// HandleEvent updates reaper state from a verified LiveKit webhook event.
func (r *Reaper) HandleEvent(ctx context.Context, eventType, room, identity string) {
	switch eventType {
	case eventRoomStarted:
		r.onRoomStarted(room)
	case eventParticipantJoined:
		r.onPublisherPresence(ctx, room, identity, true)
	case eventParticipantLeft:
		r.onPublisherPresence(ctx, room, identity, false)
	case eventRoomFinished:
		r.onRoomFinished(room)
	}
}

func (r *Reaper) onRoomStarted(room string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if r.stopped {
		return
	}
	st := r.ensure(room)
	if st.hasPublisher {
		return
	}
	r.arm(room, st, r.creationGrace)
}

// onPublisherPresence handles a participant joining/leaving. Only the publisher
// (identity == the room's username) matters; viewers are ignored.
func (r *Reaper) onPublisherPresence(ctx context.Context, room, identity string, present bool) {
	username, err := r.names.Username(ctx, room)
	if err != nil || identity != username {
		return // room gone, lookup failed, or a viewer — not the publisher
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	if r.stopped {
		return
	}
	st := r.ensure(room)
	st.hasPublisher = present
	if present {
		r.cancel(st) // publisher back: cancel any pending reap
	} else {
		r.arm(room, st, r.departureGrace) // publisher gone: start departure grace
	}
}

func (r *Reaper) onRoomFinished(room string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	if st := r.rooms[room]; st != nil {
		r.cancel(st)
		delete(r.rooms, room)
	}
}

// Shutdown stops all pending timers so no reap fires after shutdown.
func (r *Reaper) Shutdown() {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.stopped = true
	for _, st := range r.rooms {
		r.cancel(st)
	}
	r.rooms = make(map[string]*roomState)
}

// ensure returns the room's state, creating it if absent. Caller holds the lock.
func (r *Reaper) ensure(room string) *roomState {
	st := r.rooms[room]
	if st == nil {
		st = &roomState{}
		r.rooms[room] = st
	}
	return st
}

// arm schedules a reap of room after d, replacing any pending timer. Caller holds
// the lock.
func (r *Reaper) arm(room string, st *roomState, d time.Duration) {
	r.cancel(st)
	st.t = r.newTimer(d, func() { r.reap(room) })
}

// cancel stops a room's pending timer. Caller holds the lock.
func (r *Reaper) cancel(st *roomState) {
	if st.t != nil {
		st.t.Stop()
		st.t = nil
	}
}

// reap ends a room whose grace timer fired. It runs in the timer's goroutine.
func (r *Reaper) reap(room string) {
	r.mu.Lock()
	st := r.rooms[room]
	if st == nil || r.stopped {
		r.mu.Unlock()
		return
	}
	delete(r.rooms, room)
	r.mu.Unlock()

	ctx, cancel := context.WithTimeout(context.Background(), reapTimeout)
	defer cancel()
	if err := r.ender.EndRoom(ctx, room); err != nil {
		r.log.Error("reaping room", "room", room, "error", err)
	}
}
