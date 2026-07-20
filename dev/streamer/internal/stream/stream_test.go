package stream_test

import (
	"context"
	"errors"
	"strings"
	"sync"
	"testing"

	"github.com/quickchat/streamer/internal/stream"
)

// stored is a stream plus its private creatorKey, as the fake store holds it.
type stored struct {
	s   stream.Stream
	key string
}

// fakeStore is a hand-written in-memory Store for domain tests.
type fakeStore struct {
	mu      sync.Mutex
	streams map[string]stored
}

func newFakeStore() *fakeStore { return &fakeStore{streams: make(map[string]stored)} }

func (f *fakeStore) List(context.Context) ([]stream.Stream, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	out := make([]stream.Stream, 0, len(f.streams))
	for _, v := range f.streams {
		out = append(out, v.s) // never includes the key
	}
	return out, nil
}

func (f *fakeStore) Add(_ context.Context, s stream.Stream, key string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.streams[s.ID] = stored{s: s, key: key}
	return nil
}

func (f *fakeStore) Remove(_ context.Context, id string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	if _, ok := f.streams[id]; !ok {
		return stream.ErrNotFound
	}
	delete(f.streams, id)
	return nil
}

func (f *fakeStore) Creator(_ context.Context, id string) (string, string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	v, ok := f.streams[id]
	if !ok {
		return "", "", stream.ErrNotFound
	}
	return v.s.Username, v.key, nil
}

func (f *fakeStore) Exists(_ context.Context, id string) (bool, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	_, ok := f.streams[id]
	return ok, nil
}

func TestServiceCreate(t *testing.T) {
	desc100 := strings.Repeat("é", 100)
	desc101 := strings.Repeat("é", 101)
	name200 := strings.Repeat("あ", 200)
	name201 := strings.Repeat("あ", 201)

	tests := []struct {
		name        string
		username    string
		title       string
		description string
		wantUser    string
		wantTitle   string
		wantDesc    string
		wantInvalid bool
	}{
		{name: "username and title only", username: "alice", title: "My stream", wantUser: "alice", wantTitle: "My stream", wantDesc: ""},
		{name: "with description", username: "bob", title: "Cooking", description: "pasta", wantUser: "bob", wantTitle: "Cooking", wantDesc: "pasta"},
		{name: "username and title trimmed", username: "  al  ", title: "  spaced  ", wantUser: "al", wantTitle: "spaced", wantDesc: ""},
		{name: "description at 100 code points", username: "u", title: "t", description: desc100, wantUser: "u", wantTitle: "t", wantDesc: desc100},
		{name: "username at 200 code points", username: name200, title: "t", wantUser: name200, wantTitle: "t"},
		{name: "empty username rejected", username: "", title: "t", wantInvalid: true},
		{name: "whitespace username rejected", username: "  ", title: "t", wantInvalid: true},
		{name: "empty title rejected", username: "u", title: "", wantInvalid: true},
		{name: "username over 200 rejected", username: name201, title: "t", wantInvalid: true},
		{name: "description over 100 rejected", username: "u", title: "t", description: desc101, wantInvalid: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := stream.NewService(newFakeStore())
			got, err := svc.Create(context.Background(), tt.username, tt.title, tt.description)

			if tt.wantInvalid {
				var ve stream.ValidationError
				if !errors.As(err, &ve) {
					t.Fatalf("Create() error = %v, want ValidationError", err)
				}
				return
			}
			if err != nil {
				t.Fatalf("Create() unexpected error: %v", err)
			}
			if got.Username != tt.wantUser || got.Title != tt.wantTitle || got.Description != tt.wantDesc {
				t.Fatalf("Create() = %+v, want user %q title %q desc %q", got, tt.wantUser, tt.wantTitle, tt.wantDesc)
			}
			if got.ID == "" {
				t.Errorf("id is empty")
			}
			if got.CreatorKey == "" {
				t.Errorf("creatorKey is empty")
			}
		})
	}
}

func TestCreatorKeyNotInList(t *testing.T) {
	svc := stream.NewService(newFakeStore())
	created, err := svc.Create(context.Background(), "alice", "t", "")
	if err != nil {
		t.Fatalf("Create() error: %v", err)
	}
	list, err := svc.List(context.Background())
	if err != nil {
		t.Fatalf("List() error: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("list length = %d, want 1", len(list))
	}
	// The public Stream type has no creatorKey field; assert the listed data equals
	// the created public stream and the key is only on the Created result.
	if list[0] != created.Stream {
		t.Fatalf("listed = %+v, want %+v", list[0], created.Stream)
	}
	if created.CreatorKey == "" {
		t.Fatalf("expected a creatorKey on create")
	}
}

func TestVerifyCreator(t *testing.T) {
	svc := stream.NewService(newFakeStore())
	created, err := svc.Create(context.Background(), "alice", "t", "")
	if err != nil {
		t.Fatalf("Create() error: %v", err)
	}

	// Matching key → creator, username returned.
	isCreator, username, err := svc.VerifyCreator(context.Background(), created.ID, created.CreatorKey)
	if err != nil || !isCreator || username != "alice" {
		t.Fatalf("VerifyCreator(match) = (%v, %q, %v), want (true, alice, nil)", isCreator, username, err)
	}

	// Non-matching key → not creator, but username still returned, no error.
	isCreator, username, err = svc.VerifyCreator(context.Background(), created.ID, "wrong")
	if err != nil || isCreator || username != "alice" {
		t.Fatalf("VerifyCreator(wrong) = (%v, %q, %v), want (false, alice, nil)", isCreator, username, err)
	}

	// Empty key → not creator, no error.
	isCreator, _, err = svc.VerifyCreator(context.Background(), created.ID, "")
	if err != nil || isCreator {
		t.Fatalf("VerifyCreator(empty) = (%v, _, %v), want (false, _, nil)", isCreator, err)
	}

	// Missing room → ErrNotFound.
	if _, _, err := svc.VerifyCreator(context.Background(), "nope", "x"); !errors.Is(err, stream.ErrNotFound) {
		t.Fatalf("VerifyCreator(missing) err = %v, want ErrNotFound", err)
	}
}

func TestServiceEndAndExists(t *testing.T) {
	svc := stream.NewService(newFakeStore())
	created, err := svc.Create(context.Background(), "alice", "to end", "")
	if err != nil {
		t.Fatalf("Create() error: %v", err)
	}

	if ok, _ := svc.Exists(context.Background(), created.ID); !ok {
		t.Fatalf("Exists() = false, want true for a live stream")
	}
	if err := svc.End(context.Background(), created.ID); err != nil {
		t.Fatalf("End() unexpected error: %v", err)
	}
	if ok, _ := svc.Exists(context.Background(), created.ID); ok {
		t.Fatalf("Exists() = true after End, want false")
	}
	if err := svc.End(context.Background(), created.ID); !errors.Is(err, stream.ErrNotFound) {
		t.Fatalf("End() second call = %v, want ErrNotFound", err)
	}
}

func TestServiceListEmptyReturnsNonNil(t *testing.T) {
	svc := stream.NewService(newFakeStore())
	list, err := svc.List(context.Background())
	if err != nil {
		t.Fatalf("List() error: %v", err)
	}
	if list == nil || len(list) != 0 {
		t.Fatalf("List() = %v, want empty non-nil slice", list)
	}
}
