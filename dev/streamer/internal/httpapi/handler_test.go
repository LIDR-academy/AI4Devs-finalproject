package httpapi_test

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/quickchat/streamer/internal/httpapi"
	"github.com/quickchat/streamer/internal/stream"
)

// fakeStore is an in-memory Store for handler tests.
type fakeStore struct {
	mu      sync.Mutex
	streams map[string]stream.Stream
}

func newFakeStore() *fakeStore { return &fakeStore{streams: make(map[string]stream.Stream)} }

func (f *fakeStore) List(context.Context) ([]stream.Stream, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	out := make([]stream.Stream, 0, len(f.streams))
	for _, s := range f.streams {
		out = append(out, s)
	}
	return out, nil
}

func (f *fakeStore) Add(_ context.Context, s stream.Stream) error {
	f.mu.Lock()
	defer f.mu.Unlock()
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

// fakePinger reports a fixed readiness result.
type fakePinger struct{ err error }

func (p fakePinger) Ping(context.Context) error { return p.err }

func newServer(t *testing.T, store stream.Store, ping httpapi.Pinger) http.Handler {
	t.Helper()
	svc := stream.NewService(store)
	log := slog.New(slog.NewTextHandler(io.Discard, nil))
	return httpapi.NewHandler(svc, ping, log)
}

func do(t *testing.T, h http.Handler, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()
	var r *http.Request
	if body == "" {
		r = httptest.NewRequest(method, path, nil)
	} else {
		r = httptest.NewRequest(method, path, strings.NewReader(body))
	}
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	return w
}

func decodeError(t *testing.T, w *httptest.ResponseRecorder) {
	t.Helper()
	if ct := w.Header().Get("Content-Type"); !strings.HasPrefix(ct, "application/json") {
		t.Fatalf("error response Content-Type = %q, want application/json", ct)
	}
	var body struct {
		Error string `json:"error"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("error body is not valid JSON: %v (%q)", err, w.Body.String())
	}
	if body.Error == "" {
		t.Fatalf("error body has empty error field: %q", w.Body.String())
	}
}

func TestListEmpty(t *testing.T) {
	h := newServer(t, newFakeStore(), fakePinger{})
	w := do(t, h, http.MethodGet, "/streams", "")
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", w.Code)
	}
	if got := strings.TrimSpace(w.Body.String()); got != "[]" {
		t.Fatalf("body = %q, want []", got)
	}
}

func TestCreateAndList(t *testing.T) {
	h := newServer(t, newFakeStore(), fakePinger{})

	// Title only → description defaults to "".
	w := do(t, h, http.MethodPost, "/streams", `{"title":"only title"}`)
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want 201; body=%s", w.Code, w.Body.String())
	}
	var created stream.Stream
	if err := json.Unmarshal(w.Body.Bytes(), &created); err != nil {
		t.Fatalf("decode create response: %v", err)
	}
	if created.ID == "" || created.Title != "only title" || created.Description != "" {
		t.Fatalf("created = %+v, want id set, title 'only title', empty description", created)
	}

	// Title + description echoes both.
	w = do(t, h, http.MethodPost, "/streams", `{"title":"  trimmed  ","description":"desc"}`)
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want 201", w.Code)
	}
	var second stream.Stream
	if err := json.Unmarshal(w.Body.Bytes(), &second); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if second.Title != "trimmed" || second.Description != "desc" {
		t.Fatalf("second = %+v, want trimmed title and desc", second)
	}

	// Both appear in the list.
	w = do(t, h, http.MethodGet, "/streams", "")
	var list []stream.Stream
	if err := json.Unmarshal(w.Body.Bytes(), &list); err != nil {
		t.Fatalf("decode list: %v", err)
	}
	if len(list) != 2 {
		t.Fatalf("list length = %d, want 2", len(list))
	}
}

func TestCreateValidationErrors(t *testing.T) {
	tests := []struct {
		name string
		body string
	}{
		{name: "empty title", body: `{"title":""}`},
		{name: "whitespace title", body: `{"title":"   "}`},
		{name: "missing title", body: `{"description":"d"}`},
		{name: "description over 100", body: `{"title":"ok","description":"` + strings.Repeat("a", 101) + `"}`},
		{name: "title over 200", body: `{"title":"` + strings.Repeat("a", 201) + `"}`},
		{name: "malformed json", body: `{"title":`},
		{name: "body over 8KiB", body: `{"title":"` + strings.Repeat("a", 9000) + `"}`},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			store := newFakeStore()
			h := newServer(t, store, fakePinger{})
			w := do(t, h, http.MethodPost, "/streams", tt.body)
			if w.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want 400; body=%s", w.Code, w.Body.String())
			}
			decodeError(t, w)
			if len(store.streams) != 0 {
				t.Fatalf("a stream was created despite validation failure")
			}
		})
	}
}

func TestDelete(t *testing.T) {
	store := newFakeStore()
	h := newServer(t, store, fakePinger{})

	w := do(t, h, http.MethodPost, "/streams", `{"title":"to delete"}`)
	var created stream.Stream
	_ = json.Unmarshal(w.Body.Bytes(), &created)

	// Existing → 204.
	w = do(t, h, http.MethodDelete, "/streams/"+created.ID, "")
	if w.Code != http.StatusNoContent {
		t.Fatalf("delete status = %d, want 204", w.Code)
	}

	// Already gone → 404 with error body.
	w = do(t, h, http.MethodDelete, "/streams/"+created.ID, "")
	if w.Code != http.StatusNotFound {
		t.Fatalf("second delete status = %d, want 404", w.Code)
	}
	decodeError(t, w)
}

func TestMethodNotAllowed(t *testing.T) {
	h := newServer(t, newFakeStore(), fakePinger{})
	w := do(t, h, http.MethodPut, "/streams", "")
	if w.Code != http.StatusMethodNotAllowed {
		t.Fatalf("status = %d, want 405", w.Code)
	}
	decodeError(t, w)
}

func TestUnknownPath(t *testing.T) {
	h := newServer(t, newFakeStore(), fakePinger{})
	w := do(t, h, http.MethodGet, "/nope", "")
	if w.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404", w.Code)
	}
	decodeError(t, w)
}

func TestHealthz(t *testing.T) {
	h := newServer(t, newFakeStore(), fakePinger{})
	w := do(t, h, http.MethodGet, "/healthz", "")
	if w.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", w.Code)
	}
}

func TestReadyz(t *testing.T) {
	// Reachable store → 200.
	h := newServer(t, newFakeStore(), fakePinger{err: nil})
	if w := do(t, h, http.MethodGet, "/readyz", ""); w.Code != http.StatusOK {
		t.Fatalf("readyz (ok) status = %d, want 200", w.Code)
	}

	// Unreachable store → 503 with error body.
	h = newServer(t, newFakeStore(), fakePinger{err: context.DeadlineExceeded})
	w := do(t, h, http.MethodGet, "/readyz", "")
	if w.Code != http.StatusServiceUnavailable {
		t.Fatalf("readyz (down) status = %d, want 503", w.Code)
	}
	decodeError(t, w)
}
