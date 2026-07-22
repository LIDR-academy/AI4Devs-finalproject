package user

import (
	"context"
	"sync"
)

// fakeRepo is a hand-written in-memory Repository for unit tests. It enforces
// the same unique-email and unique-username guarantees as the real MongoDB
// implementation and is safe for concurrent use, so idempotency-under-race can
// be exercised deterministically without a database.
type fakeRepo struct {
	mu         sync.Mutex
	byEmail    map[string]User
	byUsername map[string]struct{}

	// injected failures for error-path tests.
	findErr   error
	insertErr error

	inserts int
}

func newFakeRepo() *fakeRepo {
	return &fakeRepo{
		byEmail:    make(map[string]User),
		byUsername: make(map[string]struct{}),
	}
}

func (f *fakeRepo) FindByEmail(_ context.Context, email string) (User, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.findErr != nil {
		return User{}, f.findErr
	}
	if u, ok := f.byEmail[email]; ok {
		return u, nil
	}
	return User{}, ErrNotFound
}

func (f *fakeRepo) Insert(_ context.Context, u User) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.insertErr != nil {
		return f.insertErr
	}
	if _, ok := f.byEmail[u.Email]; ok {
		return ErrDuplicateEmail
	}
	if _, ok := f.byUsername[u.Username]; ok {
		return ErrDuplicateUsername
	}
	f.byEmail[u.Email] = u
	f.byUsername[u.Username] = struct{}{}
	f.inserts++
	return nil
}

// count returns how many records currently exist.
func (f *fakeRepo) count() int {
	f.mu.Lock()
	defer f.mu.Unlock()
	return len(f.byEmail)
}

// seedUsername marks a username as already taken, to force a collision.
func (f *fakeRepo) seedUsername(name string) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.byUsername[name] = struct{}{}
}
