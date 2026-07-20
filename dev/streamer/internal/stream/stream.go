// Package stream is the streamer domain: the live-stream model, input validation,
// opaque id generation, and the Service that lists, starts, and ends streams.
//
// Storage is abstracted behind the Store interface (defined here, where it is
// consumed) so the domain is testable with a hand-written fake and the Valkey
// dependency is confined to its own package.
package stream

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"
	"unicode/utf8"
)

// Limits on client-supplied fields, counted in Unicode code points. The
// description limit is the cross-scope contract with qc-portal; the title limit
// is server-authoritative (§6 sets no title bound).
const (
	MaxTitleRunes       = 200
	MaxDescriptionRunes = 100
)

// ErrNotFound is returned by Store.Remove and Service.End when no live stream has
// the given id.
var ErrNotFound = errors.New("stream not found")

// ValidationError describes invalid client input. Its message is safe to return
// to the client verbatim (it contains no storage or credential detail).
type ValidationError struct {
	Message string
}

// Error implements error.
func (e ValidationError) Error() string { return e.Message }

// Stream is a live stream as stored and returned over the wire.
type Stream struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// Store persists live streams. A stream exists in the Store if and only if it is
// live. Implementations must be safe for concurrent use.
type Store interface {
	// List returns all live streams. Order is unspecified.
	List(ctx context.Context) ([]Stream, error)
	// Add stores a new live stream.
	Add(ctx context.Context, s Stream) error
	// Remove deletes the stream with the given id, returning ErrNotFound when no
	// such stream is live.
	Remove(ctx context.Context, id string) error
}

// Service implements the stream lifecycle on top of a Store.
type Service struct {
	store Store
}

// NewService returns a Service backed by the given Store.
func NewService(store Store) *Service {
	return &Service{store: store}
}

// List returns all live streams in unspecified order.
func (s *Service) List(ctx context.Context) ([]Stream, error) {
	streams, err := s.store.List(ctx)
	if err != nil {
		return nil, fmt.Errorf("listing streams: %w", err)
	}
	if streams == nil {
		streams = []Stream{}
	}
	return streams, nil
}

// Create validates the input, generates an opaque id, stores the stream, and
// returns it. A ValidationError means the input was rejected at the boundary.
func (s *Service) Create(ctx context.Context, title, description string) (Stream, error) {
	title, description, err := validate(title, description)
	if err != nil {
		return Stream{}, err
	}

	id, err := newID()
	if err != nil {
		return Stream{}, fmt.Errorf("creating stream: %w", err)
	}

	st := Stream{ID: id, Title: title, Description: description}
	if err := s.store.Add(ctx, st); err != nil {
		return Stream{}, fmt.Errorf("storing stream %s: %w", id, err)
	}
	return st, nil
}

// End removes the stream with the given id. It returns ErrNotFound when the
// stream is not live.
func (s *Service) End(ctx context.Context, id string) error {
	if err := s.store.Remove(ctx, id); err != nil {
		if errors.Is(err, ErrNotFound) {
			return ErrNotFound
		}
		return fmt.Errorf("ending stream %s: %w", id, err)
	}
	return nil
}

// validate trims the title and enforces the code-point bounds. Description is not
// trimmed (whitespace may be meaningful) but is bounded. It returns the values to
// store, or a ValidationError.
func validate(title, description string) (string, string, error) {
	title = strings.TrimSpace(title)
	if title == "" {
		return "", "", ValidationError{Message: "title is required"}
	}
	if utf8.RuneCountInString(title) > MaxTitleRunes {
		return "", "", ValidationError{Message: fmt.Sprintf("title must be at most %d characters", MaxTitleRunes)}
	}
	if utf8.RuneCountInString(description) > MaxDescriptionRunes {
		return "", "", ValidationError{Message: fmt.Sprintf("description must be at most %d characters", MaxDescriptionRunes)}
	}
	return title, description, nil
}

// newID returns an opaque, URL-safe id: 16 random bytes, base64 raw-url encoded.
func newID() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("reading random bytes: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}
