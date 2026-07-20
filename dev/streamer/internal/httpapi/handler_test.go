package httpapi_test

import (
	"context"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"sync"
	"testing"

	"github.com/quickchat/streamer/internal/chat"
	"github.com/quickchat/streamer/internal/httpapi"
	"github.com/quickchat/streamer/internal/hub"
	"github.com/quickchat/streamer/internal/stream"
)

// --- fake stream.Store ---

type storedStream struct {
	s   stream.Stream
	key string
}

type fakeStreamStore struct {
	mu      sync.Mutex
	streams map[string]storedStream
}

func newFakeStreamStore() *fakeStreamStore {
	return &fakeStreamStore{streams: make(map[string]storedStream)}
}

func (f *fakeStreamStore) List(context.Context) ([]stream.Stream, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	out := make([]stream.Stream, 0, len(f.streams))
	for _, v := range f.streams {
		out = append(out, v.s)
	}
	return out, nil
}

func (f *fakeStreamStore) Add(_ context.Context, s stream.Stream, key string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.streams[s.ID] = storedStream{s: s, key: key}
	return nil
}

func (f *fakeStreamStore) Remove(_ context.Context, id string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	if _, ok := f.streams[id]; !ok {
		return stream.ErrNotFound
	}
	delete(f.streams, id)
	return nil
}

func (f *fakeStreamStore) Creator(_ context.Context, id string) (string, string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	v, ok := f.streams[id]
	if !ok {
		return "", "", stream.ErrNotFound
	}
	return v.s.Username, v.key, nil
}

func (f *fakeStreamStore) Exists(_ context.Context, id string) (bool, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	_, ok := f.streams[id]
	return ok, nil
}

// --- fake chat.MessageStore ---

type fakeMsgStore struct {
	mu      sync.Mutex
	rooms   map[string][]chat.Message
	seq     int
	deleted []string
}

func newFakeMsgStore() *fakeMsgStore { return &fakeMsgStore{rooms: make(map[string][]chat.Message)} }

func (f *fakeMsgStore) Append(_ context.Context, roomID string, m chat.Message) (chat.Message, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.seq++
	m.ID = strconv.Itoa(f.seq)
	f.rooms[roomID] = append(f.rooms[roomID], m)
	return m, nil
}

func (f *fakeMsgStore) History(_ context.Context, roomID, before string, limit int) ([]chat.Message, string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
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

func (f *fakeMsgStore) DeleteRoom(_ context.Context, roomID string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.deleted = append(f.deleted, roomID)
	delete(f.rooms, roomID)
	return nil
}

type fakePinger struct{ err error }

func (p fakePinger) Ping(context.Context) error { return p.err }

type server struct {
	h        http.Handler
	streams  *fakeStreamStore
	messages *fakeMsgStore
}

func newServer(t *testing.T) server {
	t.Helper()
	ss := newFakeStreamStore()
	ms := newFakeMsgStore()
	log := slog.New(slog.NewTextHandler(io.Discard, nil))
	streamSvc := stream.NewService(ss)
	chatSvc := chat.NewService(ms, 500, 200, nil)
	h := httpapi.NewHandler(streamSvc, chatSvc, hub.New(log), fakePinger{}, log)
	return server{h: h, streams: ss, messages: ms}
}

func do(t *testing.T, h http.Handler, method, path, body string) *httptest.ResponseRecorder {
	t.Helper()
	return doAuth(t, h, method, path, body, "")
}

func doAuth(t *testing.T, h http.Handler, method, path, body, bearer string) *httptest.ResponseRecorder {
	t.Helper()
	var r *http.Request
	if body == "" {
		r = httptest.NewRequest(method, path, nil)
	} else {
		r = httptest.NewRequest(method, path, strings.NewReader(body))
	}
	if bearer != "" {
		r.Header.Set("Authorization", "Bearer "+bearer)
	}
	w := httptest.NewRecorder()
	h.ServeHTTP(w, r)
	return w
}

func decodeError(t *testing.T, w *httptest.ResponseRecorder) {
	t.Helper()
	if ct := w.Header().Get("Content-Type"); !strings.HasPrefix(ct, "application/json") {
		t.Fatalf("error Content-Type = %q, want application/json", ct)
	}
	var body struct {
		Error string `json:"error"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil || body.Error == "" {
		t.Fatalf("bad error body: %q (%v)", w.Body.String(), err)
	}
}

func TestCreateReturnsCreatorKeyAndListHidesIt(t *testing.T) {
	srv := newServer(t)

	w := do(t, srv.h, http.MethodPost, "/streams", `{"username":"  alice  ","title":"t","description":"d"}`)
	if w.Code != http.StatusCreated {
		t.Fatalf("status = %d, want 201; body=%s", w.Code, w.Body.String())
	}
	var created stream.Created
	if err := json.Unmarshal(w.Body.Bytes(), &created); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if created.Username != "alice" || created.Title != "t" || created.Description != "d" {
		t.Fatalf("created = %+v, want trimmed username/title/desc", created)
	}
	if created.CreatorKey == "" || created.ID == "" {
		t.Fatalf("created must have id and creatorKey: %+v", created)
	}

	// GET includes username but never creatorKey.
	w = do(t, srv.h, http.MethodGet, "/streams", "")
	if strings.Contains(w.Body.String(), "creatorKey") {
		t.Fatalf("GET /streams leaked creatorKey: %s", w.Body.String())
	}
	var list []map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &list); err != nil {
		t.Fatalf("decode list: %v", err)
	}
	if len(list) != 1 || list[0]["username"] != "alice" {
		t.Fatalf("list = %+v, want one stream with username alice", list)
	}
}

func TestCreateValidation(t *testing.T) {
	cases := map[string]string{
		"missing username": `{"title":"t"}`,
		"empty username":   `{"username":"  ","title":"t"}`,
		"missing title":    `{"username":"u"}`,
		"description over": `{"username":"u","title":"t","description":"` + strings.Repeat("a", 101) + `"}`,
		"malformed":        `{"username":`,
		"body over 8KiB":   `{"username":"u","title":"` + strings.Repeat("a", 9000) + `"}`,
	}
	for name, body := range cases {
		t.Run(name, func(t *testing.T) {
			srv := newServer(t)
			w := do(t, srv.h, http.MethodPost, "/streams", body)
			if w.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want 400; body=%s", w.Code, w.Body.String())
			}
			decodeError(t, w)
			if len(srv.streams.streams) != 0 {
				t.Fatalf("stream created despite validation failure")
			}
		})
	}
}

func TestDeleteRequiresCreatorKey(t *testing.T) {
	srv := newServer(t)
	w := do(t, srv.h, http.MethodPost, "/streams", `{"username":"u","title":"t"}`)
	var created stream.Created
	_ = json.Unmarshal(w.Body.Bytes(), &created)

	// No key → 403, nothing deleted.
	w = do(t, srv.h, http.MethodDelete, "/streams/"+created.ID, "")
	if w.Code != http.StatusForbidden {
		t.Fatalf("delete without key status = %d, want 403", w.Code)
	}
	decodeError(t, w)
	if len(srv.messages.deleted) != 0 {
		t.Fatalf("delete without key still cascaded to messages: %v", srv.messages.deleted)
	}
	if ok, _ := srv.streams.Exists(context.Background(), created.ID); !ok {
		t.Fatalf("stream was removed despite missing key")
	}

	// Wrong key → 403, nothing deleted.
	w = doAuth(t, srv.h, http.MethodDelete, "/streams/"+created.ID, "", "not-the-key")
	if w.Code != http.StatusForbidden {
		t.Fatalf("delete with wrong key status = %d, want 403", w.Code)
	}
	if len(srv.messages.deleted) != 0 {
		t.Fatalf("delete with wrong key still cascaded: %v", srv.messages.deleted)
	}

	// Nonexistent stream (with any key) → 404.
	w = doAuth(t, srv.h, http.MethodDelete, "/streams/nope", "", created.CreatorKey)
	if w.Code != http.StatusNotFound {
		t.Fatalf("delete nonexistent status = %d, want 404", w.Code)
	}

	// Correct key → 204 and cascade.
	w = doAuth(t, srv.h, http.MethodDelete, "/streams/"+created.ID, "", created.CreatorKey)
	if w.Code != http.StatusNoContent {
		t.Fatalf("delete with key status = %d, want 204", w.Code)
	}
	if len(srv.messages.deleted) == 0 || srv.messages.deleted[len(srv.messages.deleted)-1] != created.ID {
		t.Fatalf("authorized delete did not cascade to messages: %v", srv.messages.deleted)
	}
	if ok, _ := srv.streams.Exists(context.Background(), created.ID); ok {
		t.Fatalf("stream still live after authorized delete")
	}

	// Deleting again (now gone) → 404.
	w = doAuth(t, srv.h, http.MethodDelete, "/streams/"+created.ID, "", created.CreatorKey)
	if w.Code != http.StatusNotFound {
		t.Fatalf("second delete status = %d, want 404", w.Code)
	}
	decodeError(t, w)
}

func TestMessagesEndpoint(t *testing.T) {
	srv := newServer(t)
	w := do(t, srv.h, http.MethodPost, "/streams", `{"username":"u","title":"t"}`)
	var created stream.Created
	_ = json.Unmarshal(w.Body.Bytes(), &created)

	// Missing room → 404.
	if w := do(t, srv.h, http.MethodGet, "/streams/nope/messages", ""); w.Code != http.StatusNotFound {
		t.Fatalf("messages missing room status = %d, want 404", w.Code)
	}

	// Seed a few messages directly in the store, then read history.
	for i := 0; i < 3; i++ {
		_, _ = srv.messages.Append(context.Background(), created.ID, chat.Message{Sender: "u", Role: chat.RoleViewer, Text: "m" + strconv.Itoa(i), Ts: "t"})
	}
	w = do(t, srv.h, http.MethodGet, "/streams/"+created.ID+"/messages", "")
	if w.Code != http.StatusOK {
		t.Fatalf("messages status = %d, want 200", w.Code)
	}
	var resp struct {
		Messages   []chat.Message `json:"messages"`
		NextCursor *string        `json:"nextCursor"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if len(resp.Messages) != 3 || resp.Messages[0].Text != "m0" || resp.Messages[2].Text != "m2" {
		t.Fatalf("messages = %+v, want m0..m2 oldest→newest", resp.Messages)
	}
	if resp.NextCursor != nil {
		t.Fatalf("nextCursor = %v, want null when history fits in one page", *resp.NextCursor)
	}
}

func TestMethodNotAllowed(t *testing.T) {
	srv := newServer(t)
	for _, tc := range []struct{ method, path string }{
		{http.MethodPut, "/streams"},
		{http.MethodPost, "/streams/x/messages"},
	} {
		w := do(t, srv.h, tc.method, tc.path, "")
		if w.Code != http.StatusMethodNotAllowed {
			t.Fatalf("%s %s status = %d, want 405", tc.method, tc.path, w.Code)
		}
		decodeError(t, w)
	}
}

func TestHealthAndReady(t *testing.T) {
	srv := newServer(t)
	if w := do(t, srv.h, http.MethodGet, "/healthz", ""); w.Code != http.StatusOK {
		t.Fatalf("healthz = %d, want 200", w.Code)
	}
	if w := do(t, srv.h, http.MethodGet, "/readyz", ""); w.Code != http.StatusOK {
		t.Fatalf("readyz = %d, want 200", w.Code)
	}
}
