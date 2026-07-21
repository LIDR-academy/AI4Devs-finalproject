// Package stream is the streamer domain: the live-stream model, input validation,
// opaque id and creatorKey generation, and the Service that lists, starts, ends,
// and authenticates streams.
//
// Storage is abstracted behind the Store interface (defined here, where it is
// consumed) so the domain is testable with a hand-written fake and the Valkey
// dependency is confined to its own package.
package stream

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"
	"unicode/utf8"
)

// Limits on client-supplied fields, counted in Unicode code points. The
// description limit is the cross-scope contract with qc-portal; the username and
// title limits are server-authoritative.
const (
	MaxUsernameRunes    = 200
	MaxTitleRunes       = 200
	MaxDescriptionRunes = 100

	// creatorKeyBytes is the entropy of a creatorKey credential.
	creatorKeyBytes = 32
	// idBytes is the entropy of a stream id.
	idBytes = 16
)

// ErrNotFound is returned when no live stream has the given id.
var ErrNotFound = errors.New("stream not found")

// ValidationError describes invalid client input. Its message is safe to return
// to the client verbatim (it contains no storage or credential detail).
type ValidationError struct {
	Message string
}

// Error implements error.
func (e ValidationError) Error() string { return e.Message }

// Stream is a live stream as stored and returned over the wire. It never carries
// the creatorKey — that is private and returned only once, at creation.
type Stream struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// Created is the result of starting a stream: the public stream plus the
// creatorKey, which is returned only in the create response and never again.
type Created struct {
	Stream
	CreatorKey string `json:"creatorKey"`
}

// Store persists live streams. A stream exists in the Store if and only if it is
// live. Implementations must be safe for concurrent use.
type Store interface {
	// List returns all live streams (never including creatorKey). Order is unspecified.
	List(ctx context.Context) ([]Stream, error)
	// Add stores a new live stream together with its private creatorKey.
	Add(ctx context.Context, s Stream, creatorKey string) error
	// Remove deletes the stream with the given id, returning ErrNotFound when no
	// such stream is live.
	Remove(ctx context.Context, id string) error
	// Creator returns the stream's username and private creatorKey, or ErrNotFound
	// when the stream is not live.
	Creator(ctx context.Context, id string) (username, creatorKey string, err error)
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

// Create validates the input, generates an opaque id and creatorKey, stores the
// stream, and returns it with the creatorKey. A ValidationError means the input
// was rejected at the boundary.
func (s *Service) Create(ctx context.Context, username, title, description string) (Created, error) {
	username, title, description, err := validate(username, title, description)
	if err != nil {
		return Created{}, err
	}

	id, err := randomToken(idBytes)
	if err != nil {
		return Created{}, fmt.Errorf("creating stream id: %w", err)
	}
	creatorKey, err := randomToken(creatorKeyBytes)
	if err != nil {
		return Created{}, fmt.Errorf("creating stream key: %w", err)
	}

	st := Stream{ID: id, Username: username, Title: title, Description: description}
	if err := s.store.Add(ctx, st, creatorKey); err != nil {
		return Created{}, fmt.Errorf("storing stream %s: %w", id, err)
	}
	return Created{Stream: st, CreatorKey: creatorKey}, nil
}

// End removes the stream with the given id. It returns ErrNotFound when the
// stream is not live. Message deletion and connection teardown are orchestrated
// by the caller (they belong to the chat store and the hub).
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

// Username returns the stream's username, or ErrNotFound when it is not live.
func (s *Service) Username(ctx context.Context, id string) (string, error) {
	username, _, err := s.store.Creator(ctx, id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return "", ErrNotFound
		}
		return "", fmt.Errorf("reading username for stream %s: %w", id, err)
	}
	return username, nil
}

// VerifyCreator reports whether key is the stream's creatorKey (constant-time
// compare) and returns the stream's username. It returns ErrNotFound when the
// stream is not live. A non-matching or empty key is not an error: isCreator is
// false and the caller treats the connection as a viewer.
func (s *Service) VerifyCreator(ctx context.Context, id, key string) (isCreator bool, username string, err error) {
	username, storedKey, err := s.store.Creator(ctx, id)
	if err != nil {
		if errors.Is(err, ErrNotFound) {
			return false, "", ErrNotFound
		}
		return false, "", fmt.Errorf("verifying creator for stream %s: %w", id, err)
	}
	if key != "" && subtle.ConstantTimeCompare([]byte(key), []byte(storedKey)) == 1 {
		return true, username, nil
	}
	return false, username, nil
}

// validate trims username and title and enforces the code-point bounds.
// Description is not trimmed (whitespace may be meaningful) but is bounded.
func validate(username, title, description string) (string, string, string, error) {
	username = strings.TrimSpace(username)
	if username == "" {
		return "", "", "", ValidationError{Message: "username is required"}
	}
	if utf8.RuneCountInString(username) > MaxUsernameRunes {
		return "", "", "", ValidationError{Message: fmt.Sprintf("username must be at most %d characters", MaxUsernameRunes)}
	}

	title = strings.TrimSpace(title)
	if title == "" {
		return "", "", "", ValidationError{Message: "title is required"}
	}
	if utf8.RuneCountInString(title) > MaxTitleRunes {
		return "", "", "", ValidationError{Message: fmt.Sprintf("title must be at most %d characters", MaxTitleRunes)}
	}

	if utf8.RuneCountInString(description) > MaxDescriptionRunes {
		return "", "", "", ValidationError{Message: fmt.Sprintf("description must be at most %d characters", MaxDescriptionRunes)}
	}
	return username, title, description, nil
}

// randomToken returns an opaque, URL-safe token of n random bytes, base64
// raw-url encoded.
func randomToken(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", fmt.Errorf("reading random bytes: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}
