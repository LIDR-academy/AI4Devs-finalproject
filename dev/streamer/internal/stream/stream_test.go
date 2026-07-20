package stream_test

import (
	"context"
	"errors"
	"strings"
	"sync"
	"testing"
	"unicode/utf8"

	"github.com/quickchat/streamer/internal/stream"
)

// fakeStore is a hand-written in-memory Store for domain tests.
type fakeStore struct {
	mu      sync.Mutex
	streams map[string]stream.Stream
	addErr  error
	listErr error
}

func newFakeStore() *fakeStore {
	return &fakeStore{streams: make(map[string]stream.Stream)}
}

func (f *fakeStore) List(context.Context) ([]stream.Stream, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.listErr != nil {
		return nil, f.listErr
	}
	out := make([]stream.Stream, 0, len(f.streams))
	for _, s := range f.streams {
		out = append(out, s)
	}
	return out, nil
}

func (f *fakeStore) Add(_ context.Context, s stream.Stream) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.addErr != nil {
		return f.addErr
	}
	f.streams[s.ID] = s
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

func TestServiceCreate(t *testing.T) {
	// A 100-code-point description built from multi-byte runes; 101 is one over.
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
		{name: "title only", title: "My stream", description: "", wantTitle: "My stream", wantDesc: ""},
		{name: "title and description", title: "Cooking", description: "live pasta", wantTitle: "Cooking", wantDesc: "live pasta"},
		{name: "title is trimmed", title: "  spaced  ", description: "", wantTitle: "spaced", wantDesc: ""},
		{name: "description at 100 code points", title: "ok", description: desc100, wantTitle: "ok", wantDesc: desc100},
		{name: "title at 200 code points", title: title200, description: "", wantTitle: title200, wantDesc: ""},
		{name: "empty title rejected", title: "", wantInvalid: true},
		{name: "whitespace-only title rejected", title: "   \t ", wantInvalid: true},
		{name: "description over 100 rejected", title: "ok", description: desc101, wantInvalid: true},
		{name: "title over 200 rejected", title: title201, wantInvalid: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := stream.NewService(newFakeStore())
			got, err := svc.Create(context.Background(), tt.title, tt.description)

			if tt.wantInvalid {
				var ve stream.ValidationError
				if !errors.As(err, &ve) {
					t.Fatalf("Create() error = %v, want ValidationError", err)
				}
				if ve.Message == "" {
					t.Fatalf("ValidationError message is empty")
				}
				return
			}

			if err != nil {
				t.Fatalf("Create() unexpected error: %v", err)
			}
			if got.Title != tt.wantTitle {
				t.Errorf("title = %q, want %q", got.Title, tt.wantTitle)
			}
			if got.Description != tt.wantDesc {
				t.Errorf("description = %q, want %q", got.Description, tt.wantDesc)
			}
			if got.ID == "" {
				t.Errorf("id is empty")
			}
		})
	}
}

func TestServiceCreateGeneratesUniqueURLSafeIDs(t *testing.T) {
	svc := stream.NewService(newFakeStore())
	seen := make(map[string]bool)
	for i := 0; i < 100; i++ {
		s, err := svc.Create(context.Background(), "t", "")
		if err != nil {
			t.Fatalf("Create() error: %v", err)
		}
		if seen[s.ID] {
			t.Fatalf("duplicate id generated: %q", s.ID)
		}
		seen[s.ID] = true
		if strings.ContainsAny(s.ID, "+/=") {
			t.Fatalf("id %q is not URL-safe", s.ID)
		}
		if !utf8.ValidString(s.ID) {
			t.Fatalf("id %q is not valid UTF-8", s.ID)
		}
	}
}

func TestServiceCreatePersists(t *testing.T) {
	fs := newFakeStore()
	svc := stream.NewService(fs)

	created, err := svc.Create(context.Background(), "persisted", "d")
	if err != nil {
		t.Fatalf("Create() error: %v", err)
	}

	list, err := svc.List(context.Background())
	if err != nil {
		t.Fatalf("List() error: %v", err)
	}
	if len(list) != 1 || list[0] != created {
		t.Fatalf("List() = %+v, want exactly the created stream %+v", list, created)
	}
}

func TestServiceListEmptyReturnsNonNil(t *testing.T) {
	svc := stream.NewService(newFakeStore())
	list, err := svc.List(context.Background())
	if err != nil {
		t.Fatalf("List() error: %v", err)
	}
	if list == nil {
		t.Fatalf("List() returned nil, want empty non-nil slice")
	}
	if len(list) != 0 {
		t.Fatalf("List() = %+v, want empty", list)
	}
}

func TestServiceEnd(t *testing.T) {
	fs := newFakeStore()
	svc := stream.NewService(fs)

	created, err := svc.Create(context.Background(), "to end", "")
	if err != nil {
		t.Fatalf("Create() error: %v", err)
	}

	if err := svc.End(context.Background(), created.ID); err != nil {
		t.Fatalf("End() unexpected error: %v", err)
	}

	// Ending again is a not-found.
	if err := svc.End(context.Background(), created.ID); !errors.Is(err, stream.ErrNotFound) {
		t.Fatalf("End() second call error = %v, want ErrNotFound", err)
	}

	// Ending an unknown id is a not-found.
	if err := svc.End(context.Background(), "does-not-exist"); !errors.Is(err, stream.ErrNotFound) {
		t.Fatalf("End() unknown id error = %v, want ErrNotFound", err)
	}
}
