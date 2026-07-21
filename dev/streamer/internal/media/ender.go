package media

import (
	"context"
	"errors"
	"fmt"
	"log/slog"

	"github.com/quickchat/streamer/internal/stream"
)

// RoomController controls LiveKit rooms server-to-server (satisfied by
// internal/livekit).
type RoomController interface {
	// DeleteRoom deletes the LiveKit room, disconnecting all participants.
	DeleteRoom(ctx context.Context, room string) error
	// HasActivePublisher reports whether the room has a participant publishing a
	// track (used for the DELETE escape-hatch decision).
	HasActivePublisher(ctx context.Context, room string) (bool, error)
}

// ChatDeleter deletes a room's stored messages (satisfied by chat.Service).
type ChatDeleter interface {
	DeleteRoom(ctx context.Context, roomID string) error
}

// StreamEnder removes a stream from storage (satisfied by stream.Service).
type StreamEnder interface {
	End(ctx context.Context, id string) error
}

// RoomCloser closes a room's live chat connections (satisfied by hub.Hub).
type RoomCloser interface {
	CloseRoom(id string)
}

// RoomEnder is the single room-teardown cascade, shared by the DELETE handler and
// the reaper. It is idempotent: ending an already-gone room is a no-op.
type RoomEnder struct {
	chat    ChatDeleter
	streams StreamEnder
	hub     RoomCloser
	rooms   RoomController
	log     *slog.Logger
}

// NewRoomEnder wires the cascade dependencies.
func NewRoomEnder(chat ChatDeleter, streams StreamEnder, hub RoomCloser, rooms RoomController, log *slog.Logger) *RoomEnder {
	return &RoomEnder{chat: chat, streams: streams, hub: hub, rooms: rooms, log: log}
}

// EndRoom deletes the room's messages, removes the Valkey stream, closes its live
// chat connections (firing the room-ended broadcast), and deletes the LiveKit
// room. Messages are deleted first so a failure aborts before the stream is
// removed. A LiveKit delete failure is logged but does not fail the end — the
// Valkey delete stands (design D6). If the stream is already gone, EndRoom is a
// no-op.
func (e *RoomEnder) EndRoom(ctx context.Context, id string) error {
	if err := e.chat.DeleteRoom(ctx, id); err != nil {
		return fmt.Errorf("deleting messages for room %s: %w", id, err)
	}

	if err := e.streams.End(ctx, id); err != nil {
		if errors.Is(err, stream.ErrNotFound) {
			return nil // already ended; idempotent
		}
		return fmt.Errorf("ending stream %s: %w", id, err)
	}

	e.hub.CloseRoom(id)

	if err := e.rooms.DeleteRoom(ctx, id); err != nil {
		// LiveKit unreachable: the room dies with its token source regardless.
		e.log.Error("deleting livekit room", "room", id, "error", err)
	}
	return nil
}
