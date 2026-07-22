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

	"github.com/quickchat/streamer/internal/auth"
	"github.com/quickchat/streamer/internal/chat"
	"github.com/quickchat/streamer/internal/httpapi"
	"github.com/quickchat/streamer/internal/hub"
	"github.com/quickchat/streamer/internal/livekit"
	"github.com/quickchat/streamer/internal/media"
	"github.com/quickchat/streamer/internal/stream"
)

// --- fake stream.Store (owner + one-per-user) ---

type storedStream struct {
	s     stream.Stream
	owner string
}

type fakeStreamStore struct {
	mu      sync.Mutex
	streams map[string]storedStream
	byUser  map[string]string
}

func newFakeStreamStore() *fakeStreamStore {
	return &fakeStreamStore{streams: make(map[string]storedStream), byUser: make(map[string]string)}
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

func (f *fakeStreamStore) Add(_ context.Context, s stream.Stream, ownerID string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	if _, ok := f.byUser[ownerID]; ok {
		return stream.ErrAlreadyStreaming
	}
	f.byUser[ownerID] = s.ID
	f.streams[s.ID] = storedStream{s: s, owner: ownerID}
	return nil
}

func (f *fakeStreamStore) Remove(_ context.Context, id string) error {
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

func (f *fakeStreamStore) Get(_ context.Context, id string) (stream.Stream, string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	v, ok := f.streams[id]
	if !ok {
		return stream.Stream{}, "", stream.ErrNotFound
	}
	return v.s, v.owner, nil
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
	start := end - limit
	if start < 0 {
		start = 0
	}
	page := append([]chat.Message(nil), msgs[start:end]...)
	return page, "", nil
}

func (f *fakeMsgStore) DeleteRoom(_ context.Context, roomID string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.deleted = append(f.deleted, roomID)
	delete(f.rooms, roomID)
	return nil
}

// --- other fakes ---

type fakeRoomController struct {
	mu      sync.Mutex
	deleted []string
}

func (f *fakeRoomController) DeleteRoom(_ context.Context, room string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.deleted = append(f.deleted, room)
	return nil
}

type fakeTokener struct{}

func (fakeTokener) Sign(identity, room string, canPublish bool) (string, error) {
	return "tok:" + identity + ":" + strconv.FormatBool(canPublish), nil
}

// fakeVerifier maps known tokens to claims; anything else is unauthenticated.
type fakeVerifier struct{}

func (fakeVerifier) Verify(_ context.Context, token string) (auth.Claims, error) {
	switch token {
	case "u1":
		return auth.Claims{UserID: "user-1", Username: "alice"}, nil
	case "u2":
		return auth.Claims{UserID: "user-2", Username: "bob"}, nil
	default:
		return auth.Claims{}, auth.ErrUnauthenticated
	}
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

// --- server ---

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
	lk := &fakeRoomController{}
	wh := &fakeWebhookReceiver{}
	ev := &fakeEvents{}
	log := slog.New(slog.NewTextHandler(io.Discard, nil))

	streamSvc := stream.NewService(ss)
	chatSvc := chat.NewService(ms, 500, 200, nil)
	h := hub.New(log)
	ender := media.NewRoomEnder(chatSvc, streamSvc, h, lk, log)
	tokenSvc := media.NewTokenService(streamSvc, fakeTokener{}, "ws://public:7880")

	handler := httpapi.NewHandler(httpapi.Deps{
		Streams:  streamSvc,
		Chat:     chatSvc,
		Hub:      h,
		Ready:    fakePinger{},
		Verifier: fakeVerifier{},
		Minter:   tokenSvc,
		Ender:    ender,
		Webhooks: wh,
		Events:   ev,
		Log:      log,
	})
	return &server{h: handler, streams: ss, messages: ms, lk: lk, webhook: wh, events: ev}
}

func do(t *testing.T, h http.Handler, method, path, body, bearer string) *httptest.ResponseRecorder {
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
	var body struct {
		Error string `json:"error"`
	}
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil || body.Error == "" {
		t.Fatalf("bad error body: %q (%v)", w.Body.String(), err)
	}
}

func createAs(t *testing.T, srv *server, bearer, body string) stream.Stream {
	t.Helper()
	w := do(t, srv.h, http.MethodPost, "/streams", body, bearer)
	if w.Code != http.StatusCreated {
		t.Fatalf("create status = %d, want 201; body=%s", w.Code, w.Body.String())
	}
	var s stream.Stream
	if err := json.Unmarshal(w.Body.Bytes(), &s); err != nil {
		t.Fatalf("decode: %v", err)
	}
	return s
}

func TestCreateRequiresAuth(t *testing.T) {
	srv := newServer(t)
	// No token → 401.
	if w := do(t, srv.h, http.MethodPost, "/streams", `{"title":"t"}`, ""); w.Code != http.StatusUnauthorized {
		t.Fatalf("no-token create = %d, want 401", w.Code)
	}
	// Invalid token → 401.
	if w := do(t, srv.h, http.MethodPost, "/streams", `{"title":"t"}`, "garbage"); w.Code != http.StatusUnauthorized {
		t.Fatalf("bad-token create = %d, want 401", w.Code)
	}
}

func TestCreateUsesClaimUsernameNoCreatorKey(t *testing.T) {
	srv := newServer(t)
	s := createAs(t, srv, "u1", `{"title":"  live  ","description":"d"}`)
	if s.Username != "alice" || s.Title != "live" || s.Description != "d" || s.ID == "" {
		t.Fatalf("created = %+v, want username alice (from claim) + trimmed title", s)
	}
	// GET is public and never leaks creatorKey (retired).
	w := do(t, srv.h, http.MethodGet, "/streams", "", "")
	if w.Code != http.StatusOK || strings.Contains(w.Body.String(), "creatorKey") {
		t.Fatalf("GET /streams = %d body=%s", w.Code, w.Body.String())
	}
}

func TestCreateOneStreamPerUser(t *testing.T) {
	srv := newServer(t)
	createAs(t, srv, "u1", `{"title":"first"}`)
	if w := do(t, srv.h, http.MethodPost, "/streams", `{"title":"second"}`, "u1"); w.Code != http.StatusConflict {
		t.Fatalf("second create = %d, want 409", w.Code)
	}
	// A different user can still create.
	createAs(t, srv, "u2", `{"title":"other"}`)
}

func TestCreateValidation(t *testing.T) {
	srv := newServer(t)
	if w := do(t, srv.h, http.MethodPost, "/streams", `{"title":"  "}`, "u1"); w.Code != http.StatusBadRequest {
		t.Fatalf("empty title = %d, want 400", w.Code)
	}
}

func TestDeleteOwnerOnly(t *testing.T) {
	srv := newServer(t)
	s := createAs(t, srv, "u1", `{"title":"t"}`)

	// No token → 401.
	if w := do(t, srv.h, http.MethodDelete, "/streams/"+s.ID, "", ""); w.Code != http.StatusUnauthorized {
		t.Fatalf("no-token delete = %d, want 401", w.Code)
	}
	// Non-owner → 403, nothing deleted.
	if w := do(t, srv.h, http.MethodDelete, "/streams/"+s.ID, "", "u2"); w.Code != http.StatusForbidden {
		t.Fatalf("non-owner delete = %d, want 403", w.Code)
	}
	if ok, _ := srv.streams.Exists(context.Background(), s.ID); !ok {
		t.Fatalf("stream removed by a non-owner")
	}
	// Missing stream → 404.
	if w := do(t, srv.h, http.MethodDelete, "/streams/nope", "", "u1"); w.Code != http.StatusNotFound {
		t.Fatalf("delete missing = %d, want 404", w.Code)
	}
	// Owner → 204 + cascade (LiveKit room deleted).
	if w := do(t, srv.h, http.MethodDelete, "/streams/"+s.ID, "", "u1"); w.Code != http.StatusNoContent {
		t.Fatalf("owner delete = %d, want 204", w.Code)
	}
	if ok, _ := srv.streams.Exists(context.Background(), s.ID); ok {
		t.Fatalf("stream still live after owner delete")
	}
	if len(srv.lk.deleted) == 0 {
		t.Fatalf("LiveKit room not deleted on cascade")
	}
}

func TestMediaTokenByOwnership(t *testing.T) {
	srv := newServer(t)
	s := createAs(t, srv, "u1", `{"title":"t"}`)
	path := "/streams/" + s.ID + "/media-token"

	// Owner → streamer, identity = username.
	var tok media.Token
	w := do(t, srv.h, http.MethodPost, path, "", "u1")
	_ = json.Unmarshal(w.Body.Bytes(), &tok)
	if w.Code != http.StatusOK || tok.Role != "streamer" || tok.Identity != "alice" {
		t.Fatalf("owner token = %+v (code %d), want streamer/alice", tok, w.Code)
	}

	// Signed-in non-owner → viewer, identity = their username.
	w = do(t, srv.h, http.MethodPost, path, "", "u2")
	_ = json.Unmarshal(w.Body.Bytes(), &tok)
	if tok.Role != "viewer" || tok.Identity != "bob" {
		t.Fatalf("non-owner token = %+v, want viewer/bob", tok)
	}

	// Anonymous → viewer, generated identity.
	w = do(t, srv.h, http.MethodPost, path, "", "")
	_ = json.Unmarshal(w.Body.Bytes(), &tok)
	if tok.Role != "viewer" || tok.Identity == "bob" || tok.Identity == "alice" || tok.Identity == "" {
		t.Fatalf("anon token = %+v, want viewer + generated id", tok)
	}

	// Nonexistent room → 404.
	if w := do(t, srv.h, http.MethodPost, "/streams/nope/media-token", "", "u1"); w.Code != http.StatusNotFound {
		t.Fatalf("media-token nonexistent = %d, want 404", w.Code)
	}
}

func TestMessagesArePublic(t *testing.T) {
	srv := newServer(t)
	s := createAs(t, srv, "u1", `{"title":"t"}`)
	_, _ = srv.messages.Append(context.Background(), s.ID, chat.Message{Sender: "x", Role: chat.RoleViewer, Text: "m", Ts: "t"})

	// No auth needed.
	if w := do(t, srv.h, http.MethodGet, "/streams/"+s.ID+"/messages", "", ""); w.Code != http.StatusOK {
		t.Fatalf("messages = %d, want 200 (public)", w.Code)
	}
	if w := do(t, srv.h, http.MethodGet, "/streams/nope/messages", "", ""); w.Code != http.StatusNotFound {
		t.Fatalf("messages missing = %d, want 404", w.Code)
	}
}

func TestWebhookVerifiedAndSpoofed(t *testing.T) {
	srv := newServer(t)
	srv.webhook.event = livekit.WebhookEvent{Type: "participant_left", Room: "r1", Identity: "alice"}
	if w := do(t, srv.h, http.MethodPost, "/livekit/webhook", `{}`, ""); w.Code != http.StatusOK {
		t.Fatalf("webhook = %d, want 200", w.Code)
	}
	if len(srv.events.calls) != 1 {
		t.Fatalf("events = %v, want 1", srv.events.calls)
	}

	srv2 := newServer(t)
	srv2.webhook.err = context.Canceled
	if w := do(t, srv2.h, http.MethodPost, "/livekit/webhook", `{}`, ""); w.Code != http.StatusUnauthorized {
		t.Fatalf("spoofed webhook = %d, want 401", w.Code)
	}
	if len(srv2.events.calls) != 0 {
		t.Fatalf("spoofed webhook dispatched: %v", srv2.events.calls)
	}
}

func TestHealthReady(t *testing.T) {
	srv := newServer(t)
	if w := do(t, srv.h, http.MethodGet, "/healthz", "", ""); w.Code != http.StatusOK {
		t.Fatalf("healthz = %d", w.Code)
	}
	if w := do(t, srv.h, http.MethodGet, "/readyz", "", ""); w.Code != http.StatusOK {
		t.Fatalf("readyz = %d", w.Code)
	}
}

var _ = decodeError // used by focused error-body checks when needed
