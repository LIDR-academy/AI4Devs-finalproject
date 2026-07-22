package stream_test

import (
	"context"
	"errors"
	"strings"
	"sync"
	"testing"

	"github.com/quickchat/streamer/internal/stream"
)

type stored struct {
	s     stream.Stream
	owner string
}

// fakeStore is a hand-written in-memory Store with a one-per-user slot.
type fakeStore struct {
	mu      sync.Mutex
	streams map[string]stored
	byUser  map[string]string // ownerID → streamID
}

func newFakeStore() *fakeStore {
	return &fakeStore{streams: make(map[string]stored), byUser: make(map[string]string)}
}

func (f *fakeStore) List(context.Context) ([]stream.Stream, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	out := make([]stream.Stream, 0, len(f.streams))
	for _, v := range f.streams {
		out = append(out, v.s)
	}
	return out, nil
}

func (f *fakeStore) Add(_ context.Context, s stream.Stream, ownerID string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	if _, ok := f.byUser[ownerID]; ok {
		return stream.ErrAlreadyStreaming
	}
	f.byUser[ownerID] = s.ID
	f.streams[s.ID] = stored{s: s, owner: ownerID}
	return nil
}

func (f *fakeStore) Remove(_ context.Context, id string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	v, ok := f.streams[id]
	if !ok {
		return stream.ErrNotFound
	}
	delete(f.streams, id)
	delete(f.byUser, v.owner)
	return nil
}

func (f *fakeStore) Get(_ context.Context, id string) (stream.Stream, string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	v, ok := f.streams[id]
	if !ok {
		return stream.Stream{}, "", stream.ErrNotFound
	}
	return v.s, v.owner, nil
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
	title200 := strings.Repeat("あ", 200)
	title201 := strings.Repeat("あ", 201)

	tests := []struct {
		name        string
		title       string
		description string
		wantTitle   string
		wantDesc    string
		wantInvalid bool
	}{
		{name: "title only", title: "My stream", wantTitle: "My stream", wantDesc: ""},
		{name: "title and description", title: "Cooking", description: "pasta", wantTitle: "Cooking", wantDesc: "pasta"},
		{name: "title trimmed", title: "  spaced  ", wantTitle: "spaced"},
		{name: "description at 100", title: "t", description: desc100, wantTitle: "t", wantDesc: desc100},
		{name: "title at 200", title: title200, wantTitle: title200},
		{name: "empty title", title: "", wantInvalid: true},
		{name: "whitespace title", title: "   ", wantInvalid: true},
		{name: "title over 200", title: title201, wantInvalid: true},
		{name: "description over 100", title: "t", description: desc101, wantInvalid: true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := stream.NewService(newFakeStore())
			got, err := svc.Create(context.Background(), "user-1", "alice", tt.title, tt.description)
			if tt.wantInvalid {
				var ve stream.ValidationError
				if !errors.As(err, &ve) {
					t.Fatalf("Create() err = %v, want ValidationError", err)
				}
				return
			}
			if err != nil {
				t.Fatalf("Create() error: %v", err)
			}
			if got.Username != "alice" || got.Title != tt.wantTitle || got.Description != tt.wantDesc || got.ID == "" {
				t.Fatalf("Create() = %+v, want username alice + title %q", got, tt.wantTitle)
			}
		})
	}
}

func TestOneStreamPerUser(t *testing.T) {
	svc := stream.NewService(newFakeStore())
	if _, err := svc.Create(context.Background(), "user-1", "alice", "first", ""); err != nil {
		t.Fatalf("first Create: %v", err)
	}
	_, err := svc.Create(context.Background(), "user-1", "alice", "second", "")
	if !errors.Is(err, stream.ErrAlreadyStreaming) {
		t.Fatalf("second Create err = %v, want ErrAlreadyStreaming", err)
	}
	// A different user can create.
	if _, err := svc.Create(context.Background(), "user-2", "bob", "other", ""); err != nil {
		t.Fatalf("other user Create: %v", err)
	}
}

func TestOwnerAndUsername(t *testing.T) {
	svc := stream.NewService(newFakeStore())
	created, err := svc.Create(context.Background(), "user-1", "alice", "t", "")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}

	owner, err := svc.Owner(context.Background(), created.ID)
	if err != nil || owner != "user-1" {
		t.Fatalf("Owner = (%q, %v), want user-1", owner, err)
	}
	username, err := svc.Username(context.Background(), created.ID)
	if err != nil || username != "alice" {
		t.Fatalf("Username = (%q, %v), want alice", username, err)
	}
	if _, err := svc.Owner(context.Background(), "nope"); !errors.Is(err, stream.ErrNotFound) {
		t.Fatalf("Owner(missing) err = %v, want ErrNotFound", err)
	}
}

func TestEndFreesSlot(t *testing.T) {
	svc := stream.NewService(newFakeStore())
	created, err := svc.Create(context.Background(), "user-1", "alice", "t", "")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if err := svc.End(context.Background(), created.ID); err != nil {
		t.Fatalf("End: %v", err)
	}
	// Slot freed: the same user can create again.
	if _, err := svc.Create(context.Background(), "user-1", "alice", "again", ""); err != nil {
		t.Fatalf("Create after End: %v", err)
	}
	if err := svc.End(context.Background(), "nope"); !errors.Is(err, stream.ErrNotFound) {
		t.Fatalf("End(missing) err = %v, want ErrNotFound", err)
	}
}

func TestListEmptyNonNil(t *testing.T) {
	svc := stream.NewService(newFakeStore())
	list, err := svc.List(context.Background())
	if err != nil || list == nil || len(list) != 0 {
		t.Fatalf("List() = (%v, %v), want empty non-nil", list, err)
	}
}
