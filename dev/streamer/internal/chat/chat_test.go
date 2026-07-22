package chat_test

import (
	"context"
	"errors"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/quickchat/streamer/internal/chat"
)

// fakeStore is an in-memory MessageStore. Ids are sequential insertion numbers
// (oldest = smallest), which is enough to exercise the Service.
type fakeStore struct {
	mu        sync.Mutex
	rooms     map[string][]chat.Message
	seq       int
	lastLimit int // limit the Service passed to History
}

func newFakeStore() *fakeStore { return &fakeStore{rooms: make(map[string][]chat.Message)} }

func (f *fakeStore) Append(_ context.Context, roomID string, m chat.Message) (chat.Message, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.seq++
	m.ID = strconv.Itoa(f.seq)
	f.rooms[roomID] = append(f.rooms[roomID], m)
	return m, nil
}

func (f *fakeStore) History(_ context.Context, roomID, before string, limit int) ([]chat.Message, string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.lastLimit = limit

	msgs := f.rooms[roomID]
	end := len(msgs)
	if before != "" {
		for i, m := range msgs {
			if m.ID == before {
				end = i
				break
			}
		}
	}
	start := end - limit
	if start < 0 {
		start = 0
	}
	page := append([]chat.Message(nil), msgs[start:end]...)
	next := ""
	if start > 0 {
		next = msgs[start].ID
	}
	return page, next, nil
}

func (f *fakeStore) DeleteRoom(_ context.Context, roomID string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	delete(f.rooms, roomID)
	return nil
}

func fixedClock() func() time.Time {
	ts := time.Date(2026, 7, 20, 12, 0, 0, 0, time.UTC)
	return func() time.Time { return ts }
}

func TestPostValidation(t *testing.T) {
	tests := []struct {
		name    string
		text    string
		invalid bool
	}{
		{name: "valid", text: "hello"},
		{name: "trimmed still valid", text: "  hi  "},
		{name: "at max length", text: strings.Repeat("é", 500)},
		{name: "empty", text: "", invalid: true},
		{name: "whitespace only", text: "   ", invalid: true},
		{name: "over max length", text: strings.Repeat("é", 501), invalid: true},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			svc := chat.NewService(newFakeStore(), 500, 200, fixedClock())
			m, err := svc.Post(context.Background(), "room1", "alice", chat.RoleViewer, tt.text)
			if tt.invalid {
				var ve chat.ValidationError
				if !errors.As(err, &ve) {
					t.Fatalf("Post() error = %v, want ValidationError", err)
				}
				return
			}
			if err != nil {
				t.Fatalf("Post() unexpected error: %v", err)
			}
			if m.ID == "" {
				t.Errorf("message id is empty")
			}
			if m.Ts != "2026-07-20T12:00:00Z" {
				t.Errorf("ts = %q, want stamped server time", m.Ts)
			}
			if m.Text != strings.TrimSpace(tt.text) {
				t.Errorf("text = %q, want trimmed", m.Text)
			}
		})
	}
}

func TestHistoryLimitClamped(t *testing.T) {
	fs := newFakeStore()
	svc := chat.NewService(fs, 500, 10, fixedClock())

	// limit over pageSize is clamped to pageSize.
	if _, _, err := svc.History(context.Background(), "r", "", 100); err != nil {
		t.Fatalf("History() error: %v", err)
	}
	if fs.lastLimit != 10 {
		t.Fatalf("store received limit %d, want clamped to 10", fs.lastLimit)
	}

	// limit <= 0 defaults to pageSize.
	if _, _, err := svc.History(context.Background(), "r", "", 0); err != nil {
		t.Fatalf("History() error: %v", err)
	}
	if fs.lastLimit != 10 {
		t.Fatalf("store received limit %d, want default 10", fs.lastLimit)
	}
}

func TestHistoryPaginationOrder(t *testing.T) {
	fs := newFakeStore()
	svc := chat.NewService(fs, 500, 2, fixedClock())

	for i := 0; i < 5; i++ {
		if _, err := svc.Post(context.Background(), "r", "u", chat.RoleViewer, "m"+strconv.Itoa(i)); err != nil {
			t.Fatalf("Post: %v", err)
		}
	}

	// Latest page (pageSize 2): the two newest, oldest→newest, with a cursor.
	page, next, err := svc.History(context.Background(), "r", "", 0)
	if err != nil {
		t.Fatalf("History: %v", err)
	}
	if len(page) != 2 || page[0].Text != "m3" || page[1].Text != "m4" {
		t.Fatalf("latest page = %+v, want [m3 m4]", page)
	}
	if next == "" {
		t.Fatalf("expected a non-empty nextCursor with older history")
	}

	// Walk older pages until exhausted; order stays oldest→newest within a page.
	page, next2, err := svc.History(context.Background(), "r", next, 0)
	if err != nil {
		t.Fatalf("History: %v", err)
	}
	if len(page) != 2 || page[0].Text != "m1" || page[1].Text != "m2" {
		t.Fatalf("second page = %+v, want [m1 m2]", page)
	}
	page, next3, err := svc.History(context.Background(), "r", next2, 0)
	if err != nil {
		t.Fatalf("History: %v", err)
	}
	if len(page) != 1 || page[0].Text != "m0" {
		t.Fatalf("third page = %+v, want [m0]", page)
	}
	if next3 != "" {
		t.Fatalf("nextCursor = %q, want empty at exhaustion", next3)
	}
}

func TestDeleteRoom(t *testing.T) {
	fs := newFakeStore()
	svc := chat.NewService(fs, 500, 10, fixedClock())
	if _, err := svc.Post(context.Background(), "r", "u", chat.RoleViewer, "hi"); err != nil {
		t.Fatalf("Post: %v", err)
	}
	if err := svc.DeleteRoom(context.Background(), "r"); err != nil {
		t.Fatalf("DeleteRoom: %v", err)
	}
	page, _, err := svc.History(context.Background(), "r", "", 0)
	if err != nil {
		t.Fatalf("History: %v", err)
	}
	if len(page) != 0 {
		t.Fatalf("history after delete = %+v, want empty", page)
	}
}

func TestNewViewerID(t *testing.T) {
	re := regexp.MustCompile(`^[a-z]+-[a-z0-9]+$`)
	seen := make(map[string]bool)
	for i := 0; i < 100; i++ {
		id, err := chat.NewViewerID()
		if err != nil {
			t.Fatalf("NewViewerID: %v", err)
		}
		if !re.MatchString(id) {
			t.Fatalf("viewer id %q does not match word-alphanumeric", id)
		}
		seen[id] = true
	}
	if len(seen) < 90 {
		t.Fatalf("viewer ids not sufficiently unique: %d distinct of 100", len(seen))
	}
}
