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
	"github.com/quickchat/streamer/internal/livekit"
	"github.com/quickchat/streamer/internal/media"
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

// --- fake LiveKit collaborators ---

type fakeRoomController struct {
	mu           sync.Mutex
	hasPublisher bool
	hasErr       error
	deleted      []string
}

func (f *fakeRoomController) HasActivePublisher(context.Context, string) (bool, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	return f.hasPublisher, f.hasErr
}

func (f *fakeRoomController) DeleteRoom(_ context.Context, room string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.deleted = append(f.deleted, room)
	return nil
}

type fakeTokener struct{}

func (fakeTokener) Sign(identity, room string, canPublish bool) (string, error) {
	return "tok:" + identity + ":" + room + ":" + strconv.FormatBool(canPublish), nil
}

type fakeWebhookReceiver struct {
	event livekit.WebhookEvent
	err   error
}

func (f *fakeWebhookReceiver) ReceiveWebhook(*http.Request) (livekit.WebhookEvent, error) {
	return f.event, f.err
}

type fakeEvents struct {
	mu    sync.Mutex
	calls []string
}

func (f *fakeEvents) HandleEvent(_ context.Context, eventType, room, identity string) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.calls = append(f.calls, eventType+":"+room+":"+identity)
}

type fakePinger struct{ err error }

func (p fakePinger) Ping(context.Context) error { return p.err }

// --- test server ---

type server struct {
	h        http.Handler
	streams  *fakeStreamStore
	messages *fakeMsgStore
	lk       *fakeRoomController
	webhook  *fakeWebhookReceiver
	events   *fakeEvents
}

func newServer(t *testing.T) *server {
	t.Helper()
	ss := newFakeStreamStore()
	ms := newFakeMsgStore()
	lk := &fakeRoomController{hasPublisher: true} // default: live room, key required
	wh := &fakeWebhookReceiver{}
	ev := &fakeEvents{}
	log := slog.New(slog.NewTextHandler(io.Discard, nil))

	streamSvc := stream.NewService(ss)
	chatSvc := chat.NewService(ms, 500, 200, nil)
	h := hub.New(log)
	ender := media.NewRoomEnder(chatSvc, streamSvc, h, lk, log)
	tokenSvc := media.NewTokenService(streamSvc, fakeTokener{}, "ws://public:7880")

	handler := httpapi.NewHandler(httpapi.Deps{
		Streams:    streamSvc,
		Chat:       chatSvc,
		Hub:        h,
		Ready:      fakePinger{},
		Minter:     tokenSvc,
		Publishers: lk,
		Ender:      ender,
		Webhooks:   wh,
		Events:     ev,
		Log:        log,
	})
	return &server{h: handler, streams: ss, messages: ms, lk: lk, webhook: wh, events: ev}
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

func create(t *testing.T, srv *server, body string) stream.Created {
	t.Helper()
	w := do(t, srv.h, http.MethodPost, "/streams", body)
	if w.Code != http.StatusCreated {
		t.Fatalf("create status = %d, want 201; body=%s", w.Code, w.Body.String())
	}
	var c stream.Created
	if err := json.Unmarshal(w.Body.Bytes(), &c); err != nil {
		t.Fatalf("decode created: %v", err)
	}
	return c
}

func TestCreateReturnsCreatorKeyAndListHidesIt(t *testing.T) {
	srv := newServer(t)
	created := create(t, srv, `{"username":"  alice  ","title":"t","description":"d"}`)
	if created.Username != "alice" || created.CreatorKey == "" || created.ID == "" {
		t.Fatalf("created = %+v, want trimmed username + id + creatorKey", created)
	}

	w := do(t, srv.h, http.MethodGet, "/streams", "")
	if strings.Contains(w.Body.String(), "creatorKey") {
		t.Fatalf("GET /streams leaked creatorKey: %s", w.Body.String())
	}
}

func TestCreateValidation(t *testing.T) {
	cases := map[string]string{
		"missing username": `{"title":"t"}`,
		"empty username":   `{"username":"  ","title":"t"}`,
		"missing title":    `{"username":"u"}`,
		"description over": `{"username":"u","title":"t","description":"` + strings.Repeat("a", 101) + `"}`,
		"malformed":        `{"username":`,
	}
	for name, body := range cases {
		t.Run(name, func(t *testing.T) {
			srv := newServer(t)
			w := do(t, srv.h, http.MethodPost, "/streams", body)
			if w.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want 400; body=%s", w.Code, w.Body.String())
			}
			decodeError(t, w)
		})
	}
}

func TestDeleteLiveRoomRequiresKey(t *testing.T) {
	srv := newServer(t)
	srv.lk.hasPublisher = true // live room
	created := create(t, srv, `{"username":"u","title":"t"}`)

	// No key → 403, nothing deleted.
	w := do(t, srv.h, http.MethodDelete, "/streams/"+created.ID, "")
	if w.Code != http.StatusForbidden {
		t.Fatalf("no-key delete = %d, want 403", w.Code)
	}
	decodeError(t, w)
	if ok, _ := srv.streams.Exists(context.Background(), created.ID); !ok {
		t.Fatalf("stream removed despite missing key")
	}

	// Wrong key → 403.
	if w := doAuth(t, srv.h, http.MethodDelete, "/streams/"+created.ID, "", "nope"); w.Code != http.StatusForbidden {
		t.Fatalf("wrong-key delete = %d, want 403", w.Code)
	}

	// Correct key → 204 + cascade (LiveKit room deleted too).
	w = doAuth(t, srv.h, http.MethodDelete, "/streams/"+created.ID, "", created.CreatorKey)
	if w.Code != http.StatusNoContent {
		t.Fatalf("key delete = %d, want 204", w.Code)
	}
	if ok, _ := srv.streams.Exists(context.Background(), created.ID); ok {
		t.Fatalf("stream still live after authorized delete")
	}
	if len(srv.lk.deleted) == 0 || srv.lk.deleted[len(srv.lk.deleted)-1] != created.ID {
		t.Fatalf("LiveKit room not deleted on cascade: %v", srv.lk.deleted)
	}
}

func TestDeleteAbandonedRoomEscapeHatch(t *testing.T) {
	srv := newServer(t)
	created := create(t, srv, `{"username":"u","title":"t"}`)
	srv.lk.hasPublisher = false // abandoned: no active publisher

	// No key → 204 (escape hatch).
	w := do(t, srv.h, http.MethodDelete, "/streams/"+created.ID, "")
	if w.Code != http.StatusNoContent {
		t.Fatalf("abandoned-room delete without key = %d, want 204", w.Code)
	}
	if ok, _ := srv.streams.Exists(context.Background(), created.ID); ok {
		t.Fatalf("abandoned stream not removed")
	}
}

func TestDeleteFailsClosedOnLiveKitError(t *testing.T) {
	srv := newServer(t)
	created := create(t, srv, `{"username":"u","title":"t"}`)
	srv.lk.hasErr = context.DeadlineExceeded // can't determine publisher state

	// No key → 403 (fail closed).
	if w := do(t, srv.h, http.MethodDelete, "/streams/"+created.ID, ""); w.Code != http.StatusForbidden {
		t.Fatalf("fail-closed delete without key = %d, want 403", w.Code)
	}
	// Valid key → 204 even when publisher state is unknown.
	if w := doAuth(t, srv.h, http.MethodDelete, "/streams/"+created.ID, "", created.CreatorKey); w.Code != http.StatusNoContent {
		t.Fatalf("fail-closed delete with key = %d, want 204", w.Code)
	}
}

func TestDeleteNonexistent(t *testing.T) {
	srv := newServer(t)
	if w := doAuth(t, srv.h, http.MethodDelete, "/streams/nope", "", "anykey"); w.Code != http.StatusNotFound {
		t.Fatalf("delete nonexistent = %d, want 404", w.Code)
	}
}

func TestMediaToken(t *testing.T) {
	srv := newServer(t)
	created := create(t, srv, `{"username":"alice","title":"t"}`)

	// Creator (valid key) → streamer role, identity = username.
	w := doAuth(t, srv.h, http.MethodPost, "/streams/"+created.ID+"/media-token", "", created.CreatorKey)
	if w.Code != http.StatusOK {
		t.Fatalf("media-token status = %d, want 200; body=%s", w.Code, w.Body.String())
	}
	var tok media.Token
	if err := json.Unmarshal(w.Body.Bytes(), &tok); err != nil {
		t.Fatalf("decode token: %v", err)
	}
	if tok.Role != "streamer" || tok.Identity != "alice" || tok.URL != "ws://public:7880" || tok.Token == "" {
		t.Fatalf("creator token = %+v, want streamer/alice/public-url", tok)
	}

	// Viewer (no key) → viewer role, generated identity.
	w = do(t, srv.h, http.MethodPost, "/streams/"+created.ID+"/media-token", "")
	_ = json.Unmarshal(w.Body.Bytes(), &tok)
	if w.Code != http.StatusOK || tok.Role != "viewer" || tok.Identity == "alice" || tok.Identity == "" {
		t.Fatalf("viewer token = %+v (code %d), want viewer + generated id", tok, w.Code)
	}

	// Nonexistent room → 404.
	if w := do(t, srv.h, http.MethodPost, "/streams/nope/media-token", ""); w.Code != http.StatusNotFound {
		t.Fatalf("media-token nonexistent = %d, want 404", w.Code)
	}
}

func TestWebhookVerifiedThenDispatched(t *testing.T) {
	srv := newServer(t)
	srv.webhook.event = livekit.WebhookEvent{Type: "participant_left", Room: "r1", Identity: "alice"}

	w := do(t, srv.h, http.MethodPost, "/livekit/webhook", `{}`)
	if w.Code != http.StatusOK {
		t.Fatalf("webhook status = %d, want 200", w.Code)
	}
	if len(srv.events.calls) != 1 || srv.events.calls[0] != "participant_left:r1:alice" {
		t.Fatalf("dispatched events = %v, want the participant_left event", srv.events.calls)
	}
}

func TestWebhookSpoofedRejected(t *testing.T) {
	srv := newServer(t)
	srv.webhook.err = context.Canceled // signature verification failed

	w := do(t, srv.h, http.MethodPost, "/livekit/webhook", `{}`)
	if w.Code != http.StatusUnauthorized {
		t.Fatalf("spoofed webhook status = %d, want 401", w.Code)
	}
	if len(srv.events.calls) != 0 {
		t.Fatalf("spoofed webhook still dispatched: %v", srv.events.calls)
	}
}

func TestMessagesEndpoint(t *testing.T) {
	srv := newServer(t)
	created := create(t, srv, `{"username":"u","title":"t"}`)

	if w := do(t, srv.h, http.MethodGet, "/streams/nope/messages", ""); w.Code != http.StatusNotFound {
		t.Fatalf("messages missing room = %d, want 404", w.Code)
	}
	for i := 0; i < 3; i++ {
		_, _ = srv.messages.Append(context.Background(), created.ID, chat.Message{Sender: "u", Role: chat.RoleViewer, Text: "m" + strconv.Itoa(i), Ts: "t"})
	}
	w := do(t, srv.h, http.MethodGet, "/streams/"+created.ID+"/messages", "")
	if w.Code != http.StatusOK {
		t.Fatalf("messages = %d, want 200", w.Code)
	}
	var resp struct {
		Messages   []chat.Message `json:"messages"`
		NextCursor *string        `json:"nextCursor"`
	}
	_ = json.Unmarshal(w.Body.Bytes(), &resp)
	if len(resp.Messages) != 3 || resp.NextCursor != nil {
		t.Fatalf("messages = %+v cursor %v, want 3 msgs and null cursor", resp.Messages, resp.NextCursor)
	}
}

func TestMethodNotAllowed(t *testing.T) {
	srv := newServer(t)
	for _, tc := range []struct{ method, path string }{
		{http.MethodPut, "/streams"},
		{http.MethodGet, "/streams/x/media-token"},
		{http.MethodGet, "/livekit/webhook"},
	} {
		w := do(t, srv.h, tc.method, tc.path, "")
		if w.Code != http.StatusMethodNotAllowed {
			t.Fatalf("%s %s = %d, want 405", tc.method, tc.path, w.Code)
		}
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
