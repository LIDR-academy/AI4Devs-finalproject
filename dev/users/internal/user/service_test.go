package user

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

// seqIDs returns an id generator producing deterministic ids id-1, id-2, ...
func seqIDs() func() string {
	var n int64
	return func() string {
		return fmt.Sprintf("id-%d", atomic.AddInt64(&n, 1))
	}
}

func fixedClock() Clock {
	t := time.Date(2026, 1, 1, 0, 0, 0, 0, time.UTC)
	return func() time.Time { return t }
}

func TestGetOrCreate_NewEmailCreatesOne(t *testing.T) {
	t.Parallel()
	repo := newFakeRepo()
	s := NewService(repo, fixedClock(), seqIDs())

	u, created, err := s.GetOrCreate(context.Background(), "a@example.com")
	if err != nil {
		t.Fatalf("GetOrCreate: %v", err)
	}
	if !created {
		t.Fatalf("created = false, want true on first sight")
	}
	if u.ID == "" || u.Username == "" {
		t.Fatalf("returned user missing id/username: %+v", u)
	}
	if u.Email != "a@example.com" {
		t.Fatalf("email = %q, want a@example.com", u.Email)
	}
	if repo.count() != 1 {
		t.Fatalf("record count = %d, want 1", repo.count())
	}
}

func TestGetOrCreate_ReturningEmailIsStable(t *testing.T) {
	t.Parallel()
	repo := newFakeRepo()
	s := NewService(repo, fixedClock(), seqIDs())

	first, _, err := s.GetOrCreate(context.Background(), "a@example.com")
	if err != nil {
		t.Fatalf("first GetOrCreate: %v", err)
	}
	second, created, err := s.GetOrCreate(context.Background(), "a@example.com")
	if err != nil {
		t.Fatalf("second GetOrCreate: %v", err)
	}
	if created {
		t.Fatalf("created = true on repeat, want false")
	}
	if second.ID != first.ID || second.Username != first.Username {
		t.Fatalf("returning user changed: first=%+v second=%+v", first, second)
	}
	if repo.count() != 1 {
		t.Fatalf("record count = %d, want 1", repo.count())
	}
}

func TestGetOrCreate_ConcurrentFirstTimeNeverDuplicates(t *testing.T) {
	t.Parallel()
	repo := newFakeRepo()
	s := NewService(repo, fixedClock(), seqIDs())

	const goroutines = 16
	var wg sync.WaitGroup
	var createdCount int64
	ids := make([]string, goroutines)
	usernames := make([]string, goroutines)

	start := make(chan struct{})
	for i := 0; i < goroutines; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			<-start
			u, created, err := s.GetOrCreate(context.Background(), "race@example.com")
			if err != nil {
				t.Errorf("goroutine %d: %v", i, err)
				return
			}
			if created {
				atomic.AddInt64(&createdCount, 1)
			}
			ids[i] = u.ID
			usernames[i] = u.Username
		}(i)
	}
	close(start)
	wg.Wait()

	if repo.count() != 1 {
		t.Fatalf("record count = %d, want exactly 1", repo.count())
	}
	if createdCount != 1 {
		t.Fatalf("created=true count = %d, want exactly 1", createdCount)
	}
	// All callers observe the same identity.
	for i := 1; i < goroutines; i++ {
		if ids[i] != ids[0] || usernames[i] != usernames[0] {
			t.Fatalf("callers saw different identities: %q/%q vs %q/%q",
				ids[0], usernames[0], ids[i], usernames[i])
		}
	}
}

func TestGetOrCreate_UsernameCollisionRegenerates(t *testing.T) {
	t.Parallel()
	repo := newFakeRepo()
	repo.seedUsername("taken00")
	s := NewService(repo, fixedClock(), seqIDs())

	// First generation collides, second is free.
	var calls int
	s.genUsername = func() (string, error) {
		calls++
		if calls == 1 {
			return "taken00", nil
		}
		return "free01", nil
	}

	u, created, err := s.GetOrCreate(context.Background(), "a@example.com")
	if err != nil {
		t.Fatalf("GetOrCreate: %v", err)
	}
	if !created || u.Username != "free01" {
		t.Fatalf("expected created with regenerated username free01, got created=%v username=%q", created, u.Username)
	}
}

func TestGetOrCreate_UsernameCollisionExhaustionErrors(t *testing.T) {
	t.Parallel()
	repo := newFakeRepo()
	repo.seedUsername("always")
	s := NewService(repo, fixedClock(), seqIDs())
	s.genUsername = func() (string, error) { return "always", nil }

	_, _, err := s.GetOrCreate(context.Background(), "a@example.com")
	if err == nil {
		t.Fatalf("expected error after exhausting username attempts")
	}
	if !errors.Is(err, ErrDuplicateUsername) {
		t.Fatalf("error = %v, want wrapped ErrDuplicateUsername", err)
	}
	if repo.count() != 0 {
		t.Fatalf("record count = %d, want 0 (nothing persisted)", repo.count())
	}
}

func TestGetOrCreate_UsernameGenerationErrorPropagates(t *testing.T) {
	t.Parallel()
	repo := newFakeRepo()
	s := NewService(repo, fixedClock(), seqIDs())
	sentinel := errors.New("no randomness")
	s.genUsername = func() (string, error) { return "", sentinel }

	_, _, err := s.GetOrCreate(context.Background(), "a@example.com")
	if !errors.Is(err, sentinel) {
		t.Fatalf("error = %v, want wrapped sentinel", err)
	}
}

func TestGetOrCreate_LookupErrorPropagates(t *testing.T) {
	t.Parallel()
	repo := newFakeRepo()
	repo.findErr = errors.New("mongo down")
	s := NewService(repo, fixedClock(), seqIDs())

	_, _, err := s.GetOrCreate(context.Background(), "a@example.com")
	if err == nil {
		t.Fatalf("expected error when lookup fails")
	}
	if repo.count() != 0 {
		t.Fatalf("record count = %d, want 0", repo.count())
	}
}

func TestGetOrCreate_InsertErrorPropagates(t *testing.T) {
	t.Parallel()
	repo := newFakeRepo()
	repo.insertErr = errors.New("write failed")
	s := NewService(repo, fixedClock(), seqIDs())

	_, created, err := s.GetOrCreate(context.Background(), "a@example.com")
	if err == nil {
		t.Fatalf("expected error when insert fails")
	}
	if created {
		t.Fatalf("created = true on failed insert, want false")
	}
}

// TestGetOrCreate_EmailRaceRefetches simulates losing the insert race: the
// first insert for the email is made out-of-band, then GetOrCreate must
// re-fetch and return created=false rather than erroring.
func TestGetOrCreate_EmailRaceRefetches(t *testing.T) {
	t.Parallel()
	repo := newFakeRepo()
	s := NewService(repo, fixedClock(), seqIDs())

	// Pre-existing record inserted by a "concurrent" winner.
	winner := User{ID: "winner", Email: "a@example.com", Username: "winner00", CreatedAt: time.Now().UTC()}
	if err := repo.Insert(context.Background(), winner); err != nil {
		t.Fatalf("seeding winner: %v", err)
	}

	u, created, err := s.GetOrCreate(context.Background(), "a@example.com")
	if err != nil {
		t.Fatalf("GetOrCreate: %v", err)
	}
	if created {
		t.Fatalf("created = true, want false when record already exists")
	}
	if u.ID != "winner" || u.Username != "winner00" {
		t.Fatalf("returned %+v, want the winner's record", u)
	}
}
