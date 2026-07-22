//go:build integration

// These tests exercise the real MongoDB behavior (unique indexes, duplicate-key
// mapping, idempotency under concurrency). They are excluded from the default
// `go test ./...` run by the integration build tag and require a running
// MongoDB reachable via MONGO_TEST_URI. Run with:
//
//	MONGO_TEST_URI=mongodb://... go test -tags=integration ./internal/mongostore/
package mongostore

import (
	"context"
	"os"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"quickchat/users/internal/user"
)

func newTestRepo(t *testing.T) *Repo {
	t.Helper()
	uri := os.Getenv("MONGO_TEST_URI")
	if uri == "" {
		t.Skip("MONGO_TEST_URI not set; skipping integration test")
	}
	ctx, cancel := context.WithTimeout(context.Background(), ConnectTimeout)
	defer cancel()

	// Use a dedicated database and drop it so each run starts clean.
	repo, disconnect, err := Connect(ctx, uri, "quickchat_it")
	if err != nil {
		t.Fatalf("connect: %v", err)
	}
	t.Cleanup(func() {
		dropCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		_ = repo.coll.Database().Drop(dropCtx)
		_ = disconnect(dropCtx)
	})
	dropCtx, cancel2 := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel2()
	if err := repo.coll.Database().Drop(dropCtx); err != nil {
		t.Fatalf("dropping test db: %v", err)
	}
	// Recreate indexes after the drop.
	if err := ensureIndexes(dropCtx, repo.coll); err != nil {
		t.Fatalf("ensuring indexes: %v", err)
	}
	return repo
}

func TestIntegration_IdempotentByEmail(t *testing.T) {
	repo := newTestRepo(t)
	svc := user.NewService(repo, nil, nil)
	ctx := context.Background()

	first, created, err := svc.GetOrCreate(ctx, "a@example.com")
	if err != nil || !created {
		t.Fatalf("first: created=%v err=%v", created, err)
	}
	second, created, err := svc.GetOrCreate(ctx, "a@example.com")
	if err != nil || created {
		t.Fatalf("second: created=%v err=%v", created, err)
	}
	if second.ID != first.ID || second.Username != first.Username {
		t.Fatalf("returning user changed: %+v vs %+v", first, second)
	}
}

func TestIntegration_ConcurrentCreateExactlyOne(t *testing.T) {
	repo := newTestRepo(t)
	svc := user.NewService(repo, nil, nil)

	const goroutines = 20
	var wg sync.WaitGroup
	var createdCount int64
	start := make(chan struct{})
	for i := 0; i < goroutines; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			<-start
			_, created, err := svc.GetOrCreate(context.Background(), "race@example.com")
			if err != nil {
				t.Errorf("get-or-create: %v", err)
				return
			}
			if created {
				atomic.AddInt64(&createdCount, 1)
			}
		}()
	}
	close(start)
	wg.Wait()

	if createdCount != 1 {
		t.Fatalf("created count = %d, want exactly 1", createdCount)
	}
}

func TestIntegration_UniqueUsernameIndexEnforced(t *testing.T) {
	repo := newTestRepo(t)
	ctx := context.Background()

	u1 := user.User{ID: "id-1", Email: "a@example.com", Username: "dupname", CreatedAt: time.Now().UTC()}
	if err := repo.Insert(ctx, u1); err != nil {
		t.Fatalf("insert u1: %v", err)
	}
	// Different email, same username → username collision.
	u2 := user.User{ID: "id-2", Email: "b@example.com", Username: "dupname", CreatedAt: time.Now().UTC()}
	err := repo.Insert(ctx, u2)
	if err != user.ErrDuplicateUsername {
		t.Fatalf("insert u2 err = %v, want ErrDuplicateUsername", err)
	}
	// Same email → email collision.
	u3 := user.User{ID: "id-3", Email: "a@example.com", Username: "othername", CreatedAt: time.Now().UTC()}
	err = repo.Insert(ctx, u3)
	if err != user.ErrDuplicateEmail {
		t.Fatalf("insert u3 err = %v, want ErrDuplicateEmail", err)
	}
}
