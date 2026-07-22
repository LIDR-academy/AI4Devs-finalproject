package media_test

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"testing"

	"github.com/quickchat/streamer/internal/media"
	"github.com/quickchat/streamer/internal/stream"
)

type recChat struct{ deleted []string }

func (c *recChat) DeleteRoom(_ context.Context, id string) error {
	c.deleted = append(c.deleted, id)
	return nil
}

type recStreamEnder struct{ err error }

func (s *recStreamEnder) End(context.Context, string) error { return s.err }

type recHub struct{ closed []string }

func (h *recHub) CloseRoom(id string) { h.closed = append(h.closed, id) }

type recRooms struct {
	deleted   []string
	deleteErr error
}

func (r *recRooms) DeleteRoom(_ context.Context, room string) error {
	r.deleted = append(r.deleted, room)
	return r.deleteErr
}

func newEnder(chat *recChat, streams *recStreamEnder, hub *recHub, rooms *recRooms) *media.RoomEnder {
	log := slog.New(slog.NewTextHandler(io.Discard, nil))
	return media.NewRoomEnder(chat, streams, hub, rooms, log)
}

func TestEndRoomFullCascade(t *testing.T) {
	c, s, h, r := &recChat{}, &recStreamEnder{}, &recHub{}, &recRooms{}
	if err := newEnder(c, s, h, r).EndRoom(context.Background(), "room1"); err != nil {
		t.Fatalf("EndRoom: %v", err)
	}
	if len(c.deleted) != 1 || len(h.closed) != 1 || len(r.deleted) != 1 {
		t.Fatalf("cascade incomplete: chat=%v hub=%v rooms=%v", c.deleted, h.closed, r.deleted)
	}
}

func TestEndRoomLiveKitFailureStillSucceeds(t *testing.T) {
	c, s, h := &recChat{}, &recStreamEnder{}, &recHub{}
	r := &recRooms{deleteErr: errors.New("livekit down")}
	// LiveKit delete fails, but the Valkey/chat teardown stands and EndRoom succeeds.
	if err := newEnder(c, s, h, r).EndRoom(context.Background(), "room1"); err != nil {
		t.Fatalf("EndRoom should succeed despite LiveKit error, got %v", err)
	}
	if len(c.deleted) != 1 || len(h.closed) != 1 {
		t.Fatalf("Valkey/chat teardown did not complete: chat=%v hub=%v", c.deleted, h.closed)
	}
}

func TestEndRoomAlreadyGoneIsNoOp(t *testing.T) {
	c, h, r := &recChat{}, &recHub{}, &recRooms{}
	s := &recStreamEnder{err: stream.ErrNotFound}
	if err := newEnder(c, s, h, r).EndRoom(context.Background(), "room1"); err != nil {
		t.Fatalf("EndRoom on gone stream should be nil, got %v", err)
	}
	// Stream already gone → we stop before closing connections or the LiveKit room.
	if len(h.closed) != 0 || len(r.deleted) != 0 {
		t.Fatalf("cascade continued past a gone stream: hub=%v rooms=%v", h.closed, r.deleted)
	}
}
