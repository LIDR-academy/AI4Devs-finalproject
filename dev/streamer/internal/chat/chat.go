// Package chat is the room-chat domain: the message model, message validation,
// server-stamped viewer identities, and the Service that posts messages and reads
// cursor-paginated history. Storage is abstracted behind MessageStore so the
// domain is testable with a hand-written fake.
package chat

import (
	"context"
	"crypto/rand"
	"encoding/base32"
	"errors"
	"fmt"
	"strings"
	"time"
	"unicode/utf8"
)

// Role is a chat participant's server-stamped role.
const (
	RoleStreamer = "streamer"
	RoleViewer   = "viewer"
)

// ErrRoomNotFound is returned by the store when a room has no message log.
var ErrRoomNotFound = errors.New("room not found")

// ValidationError describes an invalid message. Its message is safe to send back
// to the offending connection as an error reason.
type ValidationError struct {
	Message string
}

// Error implements error.
func (e ValidationError) Error() string { return e.Message }

// Message is a stored chat message. ID is the server-authoritative, stable id
// (identical in the live broadcast and in history), and doubles as the pagination
// cursor.
type Message struct {
	ID     string `json:"id"`
	Sender string `json:"sender"`
	Role   string `json:"role"`
	Text   string `json:"text"`
	Ts     string `json:"ts"`
}

// MessageStore persists per-room message logs as a capped ring buffer.
type MessageStore interface {
	// Append stores m in the room's log (assigning a server-authoritative ID) and
	// returns the stored message with its ID set.
	Append(ctx context.Context, roomID string, m Message) (Message, error)
	// History returns up to limit messages ordered oldest→newest. With an empty
	// before it returns the latest page; otherwise messages strictly older than the
	// before cursor. nextCursor is the cursor for the next older page, or "" when no
	// older history remains.
	History(ctx context.Context, roomID, before string, limit int) (messages []Message, nextCursor string, err error)
	// DeleteRoom removes the room's entire message log.
	DeleteRoom(ctx context.Context, roomID string) error
}

// Service posts and reads chat messages on top of a MessageStore.
type Service struct {
	store     MessageStore
	maxLength int
	pageSize  int
	now       func() time.Time
}

// NewService returns a chat Service. maxLength bounds message length in code
// points; pageSize is the default and maximum history page. now supplies the
// server clock (injectable for tests); nil uses time.Now.
func NewService(store MessageStore, maxLength, pageSize int, now func() time.Time) *Service {
	if now == nil {
		now = time.Now
	}
	return &Service{store: store, maxLength: maxLength, pageSize: pageSize, now: now}
}

// Post validates text, stamps the server time and identity, stores the message,
// and returns it with its server-authoritative id. A ValidationError means the
// text was rejected.
func (s *Service) Post(ctx context.Context, roomID, sender, role, text string) (Message, error) {
	text = strings.TrimSpace(text)
	if text == "" {
		return Message{}, ValidationError{Message: "message is empty"}
	}
	if utf8.RuneCountInString(text) > s.maxLength {
		return Message{}, ValidationError{Message: fmt.Sprintf("message must be at most %d characters", s.maxLength)}
	}

	m := Message{
		Sender: sender,
		Role:   role,
		Text:   text,
		Ts:     s.now().UTC().Format(time.RFC3339),
	}
	stored, err := s.store.Append(ctx, roomID, m)
	if err != nil {
		return Message{}, fmt.Errorf("storing message in room %s: %w", roomID, err)
	}
	return stored, nil
}

// History returns a page of messages oldest→newest plus the next-older cursor
// ("" when exhausted). limit is clamped to (0, pageSize].
func (s *Service) History(ctx context.Context, roomID, before string, limit int) ([]Message, string, error) {
	if limit <= 0 || limit > s.pageSize {
		limit = s.pageSize
	}
	msgs, next, err := s.store.History(ctx, roomID, before, limit)
	if err != nil {
		return nil, "", fmt.Errorf("reading history for room %s: %w", roomID, err)
	}
	if msgs == nil {
		msgs = []Message{}
	}
	return msgs, next, nil
}

// DeleteRoom removes a room's message log (called when the stream ends).
func (s *Service) DeleteRoom(ctx context.Context, roomID string) error {
	if err := s.store.DeleteRoom(ctx, roomID); err != nil {
		return fmt.Errorf("deleting messages for room %s: %w", roomID, err)
	}
	return nil
}

// viewerWords is a small fixed list for generating friendly viewer ids.
var viewerWords = []string{
	"falcon", "otter", "maple", "ember", "willow", "cobalt", "harbor", "meadow",
	"cedar", "quartz", "raven", "sable", "tundra", "vireo", "zephyr", "onyx",
}

// NewViewerID returns a fresh word+alphanumeric viewer identity (e.g. "falcon-x92k"),
// generated per connection with a cryptographic random source. The word choice is
// cosmetic; the alphanumeric suffix provides uniqueness.
func NewViewerID() (string, error) {
	b := make([]byte, 5)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("reading random bytes: %w", err)
	}
	word := viewerWords[int(b[0])%len(viewerWords)]
	suffix := strings.ToLower(base32.StdEncoding.WithPadding(base32.NoPadding).EncodeToString(b[1:]))
	return word + "-" + suffix, nil
}
