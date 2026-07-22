// Package stream is the streamer domain: the live-stream model, input validation,
// opaque id generation, and the Service that lists, starts, ends, and resolves
// ownership of streams. Ownership is by the authenticated user's id (userId
// claim); the old creatorKey is retired.
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

// Limits on client-supplied fields, counted in Unicode code points.
const (
	MaxTitleRunes       = 200
	MaxDescriptionRunes = 100

	idBytes = 16
)

// ErrNotFound is returned when no live stream has the given id.
var ErrNotFound = errors.New("stream not found")

// ErrAlreadyStreaming is returned when a user who already owns an active stream
// tries to start another (one active stream per user).
var ErrAlreadyStreaming = errors.New("user already has an active stream")

// ValidationError describes invalid client input. Its message is safe to return
// to the client verbatim.
type ValidationError struct {
	Message string
}

// Error implements error.
func (e ValidationError) Error() string { return e.Message }

// Stream is a live stream as stored and returned over the wire. The owner's
// userId is stored privately and never serialized.
type Stream struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// Store persists live streams. A stream exists in the Store if and only if it is
// live. Implementations must be safe for concurrent use.
type Store interface {
	// List returns all live streams. Order is unspecified.
	List(ctx context.Context) ([]Stream, error)
	// Add stores a new live stream owned by ownerID. It returns ErrAlreadyStreaming
	// when the owner already has an active stream (enforced atomically).
	Add(ctx context.Context, s Stream, ownerID string) error
	// Remove deletes the stream and frees the owner's active-stream slot,
	// returning ErrNotFound when no such stream is live.
	Remove(ctx context.Context, id string) error
	// Get returns the public stream and its owner's userId, or ErrNotFound.
	Get(ctx context.Context, id string) (Stream, string, error)
	// Exists reports whether a stream with the id is live.
	Exists(ctx context.Context, id string) (bool, error)
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

// Create validates the input, generates an opaque id, and stores the stream owned
// by ownerID with the account username. It returns ErrAlreadyStreaming when the
// owner already has an active stream, or a ValidationError for bad input.
func (s *Service) Create(ctx context.Context, ownerID, username, title, description string) (Stream, error) {
	title, description, err := validate(title, description)
	if err != nil {
		return Stream{}, err
	}

	id, err := randomToken(idBytes)
	if err != nil {
		return Stream{}, fmt.Errorf("creating stream id: %w", err)
	}

	st := Stream{ID: id, Username: username, Title: title, Description: description}
	if err := s.store.Add(ctx, st, ownerID); err != nil {
		if errors.Is(err, ErrAlreadyStreaming) {
			return Stream{}, ErrAlreadyStreaming
		}
		return Stream{}, fmt.Errorf("storing stream %s: %w", id, err)
	}
	return st, nil
}

// End removes the stream and frees the owner's slot. It returns ErrNotFound when
// the stream is not live.
func (s *Service) End(ctx context.Context, id string) error {
	if err := s.store.Remove(ctx, id); err != nil {
		if errors.Is(err, ErrNotFound) {
			return ErrNotFound
		}
		return fmt.Errorf("ending stream %s: %w", id, err)
	}
	return nil
}

// Exists reports whether a stream with the id is live.
func (s *Service) Exists(ctx context.Context, id string) (bool, error) {
	ok, err := s.store.Exists(ctx, id)
	if err != nil {
		return false, fmt.Errorf("checking stream %s: %w", id, err)
	}
	return ok, nil
}

// Owner returns the stream's owner userId, or ErrNotFound when it is not live.
func (s *Service) Owner(ctx context.Context, id string) (string, error) {
	_, ownerID, err := s.store.Get(ctx, id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return "", ErrNotFound
		}
		return "", fmt.Errorf("reading owner of stream %s: %w", id, err)
	}
	return ownerID, nil
}

// Username returns the stream's account username, or ErrNotFound when it is not
// live.
func (s *Service) Username(ctx context.Context, id string) (string, error) {
	st, _, err := s.store.Get(ctx, id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return "", ErrNotFound
		}
		return "", fmt.Errorf("reading username of stream %s: %w", id, err)
	}
	return st.Username, nil
}

// validate trims the title and enforces the code-point bounds. Description is not
// trimmed (whitespace may be meaningful) but is bounded.
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

// randomToken returns an opaque, URL-safe token of n random bytes.
func randomToken(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("reading random bytes: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}
