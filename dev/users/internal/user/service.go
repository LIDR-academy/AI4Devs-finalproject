package user

import (
	"context"
	"errors"
	"fmt"
	"time"
)

// ErrDuplicateEmail is returned by Repository.Insert when a record with the
// same email already exists (unique-index violation on email). It signals a
// lost create race: another caller inserted the user first.
var ErrDuplicateEmail = errors.New("duplicate email")

// ErrDuplicateUsername is returned by Repository.Insert when the generated
// username collides with an existing one (unique-index violation on username).
// The service responds by regenerating and retrying.
var ErrDuplicateUsername = errors.New("duplicate username")

// ErrNotFound is returned by Repository.FindByEmail when no record exists.
var ErrNotFound = errors.New("user not found")

// maxUsernameAttempts bounds username regeneration on collision. With a
// ~1.7M-combination suffix per word, exhausting this many attempts indicates a
// systemic problem, not bad luck, so we surface it as an error.
const maxUsernameAttempts = 5

// Repository is the persistence port the service depends on. It is defined here,
// where it is consumed, and kept small. Implementations enforce uniqueness on
// both email and username via unique indexes and report violations as the
// sentinel errors above.
type Repository interface {
	// FindByEmail returns the user for email, or ErrNotFound if none exists.
	FindByEmail(ctx context.Context, email string) (User, error)
	// Insert persists u. It returns ErrDuplicateEmail or ErrDuplicateUsername
	// if the corresponding unique constraint is violated.
	Insert(ctx context.Context, u User) error
}

// Clock returns the current time. It is injected so tests are deterministic.
type Clock func() time.Time

// Service turns a verified email into a stable user identity. It is the single
// owner of the get-or-create idempotency rule.
type Service struct {
	repo        Repository
	clock       Clock
	newID       func() string
	genUsername func() (string, error)
}

// NewService builds a Service backed by repo. clock and idGen default to
// production implementations when nil, keeping construction boring at the call
// site while remaining injectable in tests.
func NewService(repo Repository, clock Clock, idGen func() string) *Service {
	if clock == nil {
		clock = time.Now
	}
	if idGen == nil {
		idGen = newObjectID
	}
	return &Service{
		repo:        repo,
		clock:       clock,
		newID:       idGen,
		genUsername: GenerateUsername,
	}
}

// GetOrCreate returns the user for email, creating one on first sight. The
// bool result is true only when a new record was actually persisted. It is
// idempotent by email: concurrent first-time calls yield exactly one user, and
// every caller receives the same id and username. A returned user always has a
// non-empty ID and Username.
func (s *Service) GetOrCreate(ctx context.Context, email string) (User, bool, error) {
	existing, err := s.repo.FindByEmail(ctx, email)
	if err == nil {
		return existing, false, nil
	}
	if !errors.Is(err, ErrNotFound) {
		return User{}, false, fmt.Errorf("looking up user by email: %w", err)
	}

	// Not found: attempt to create. A concurrent creator may win the email
	// race, in which case we re-fetch and return the winner's record.
	created, err := s.create(ctx, email)
	if err == nil {
		return created, true, nil
	}
	if errors.Is(err, ErrDuplicateEmail) {
		winner, ferr := s.repo.FindByEmail(ctx, email)
		if ferr != nil {
			return User{}, false, fmt.Errorf("fetching user after email race: %w", ferr)
		}
		return winner, false, nil
	}
	return User{}, false, err
}

// create builds and inserts a new user, regenerating the username on collision
// up to maxUsernameAttempts. ErrDuplicateEmail is propagated for the caller to
// resolve via re-fetch.
func (s *Service) create(ctx context.Context, email string) (User, error) {
	for attempt := 0; attempt < maxUsernameAttempts; attempt++ {
		username, err := s.genUsername()
		if err != nil {
			return User{}, fmt.Errorf("generating username: %w", err)
		}
		u := User{
			ID:        s.newID(),
			Email:     email,
			Username:  username,
			CreatedAt: s.clock().UTC(),
		}
		err = s.repo.Insert(ctx, u)
		if err == nil {
			return u, nil
		}
		if errors.Is(err, ErrDuplicateUsername) {
			continue // regenerate and retry
		}
		return User{}, fmt.Errorf("inserting user: %w", err)
	}
	return User{}, fmt.Errorf("generating a unique username after %d attempts: %w", maxUsernameAttempts, ErrDuplicateUsername)
}
