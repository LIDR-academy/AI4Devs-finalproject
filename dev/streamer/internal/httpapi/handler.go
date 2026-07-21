// Package httpapi exposes the streamer HTTP + WebSocket API: the §6 /streams
// contract, chat history, the room WebSocket, and the operational /healthz and
// /readyz endpoints. Handlers are thin — decode/validate, call a service, encode.
package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"strconv"
	"strings"

	"github.com/quickchat/streamer/internal/chat"
	"github.com/quickchat/streamer/internal/hub"
	"github.com/quickchat/streamer/internal/livekit"
	"github.com/quickchat/streamer/internal/media"
	"github.com/quickchat/streamer/internal/stream"
)

// maxBodyBytes caps the request body for POST /streams.
const maxBodyBytes = 8 << 10 // 8 KiB

// Pinger reports whether the backing store is reachable, for readiness checks.
type Pinger interface {
	Ping(ctx context.Context) error
}

// Minter mints a media token for a room (satisfied by media.TokenService).
type Minter interface {
	Mint(ctx context.Context, roomID, creatorKey string) (media.Token, error)
}

// PublisherChecker reports whether a room has an active LiveKit publisher.
type PublisherChecker interface {
	HasActivePublisher(ctx context.Context, room string) (bool, error)
}

// RoomEnder runs the room-teardown cascade (satisfied by media.RoomEnder).
type RoomEnder interface {
	EndRoom(ctx context.Context, id string) error
}

// WebhookReceiver verifies and decodes a LiveKit webhook (satisfied by livekit.Client).
type WebhookReceiver interface {
	ReceiveWebhook(r *http.Request) (livekit.WebhookEvent, error)
}

// EventDispatcher consumes a verified webhook event (satisfied by media.Reaper).
type EventDispatcher interface {
	HandleEvent(ctx context.Context, eventType, room, identity string)
}

// Deps are the handler's collaborators.
type Deps struct {
	Streams    *stream.Service
	Chat       *chat.Service
	Hub        *hub.Hub
	Ready      Pinger
	Minter     Minter
	Publishers PublisherChecker
	Ender      RoomEnder
	Webhooks   WebhookReceiver
	Events     EventDispatcher
	Log        *slog.Logger
}

type errorBody struct {
	Error string `json:"error"`
}

// createRequest is the accepted body for POST /streams. Unknown fields are
// ignored; an absent description decodes to "".
type createRequest struct {
	Username    string `json:"username"`
	Title       string `json:"title"`
	Description string `json:"description"`
}

// historyResponse is the GET /streams/{id}/messages body. NextCursor is null
// (nil pointer) when older history is exhausted.
type historyResponse struct {
	Messages   []chat.Message `json:"messages"`
	NextCursor *string        `json:"nextCursor"`
}

type api struct {
	streams    *stream.Service
	chat       *chat.Service
	hub        *hub.Hub
	ready      Pinger
	minter     Minter
	publishers PublisherChecker
	ender      RoomEnder
	webhooks   WebhookReceiver
	events     EventDispatcher
	log        *slog.Logger
}

// NewHandler wires the routes and returns the HTTP handler for the service.
func NewHandler(d Deps) http.Handler {
	a := &api{
		streams:    d.Streams,
		chat:       d.Chat,
		hub:        d.Hub,
		ready:      d.Ready,
		minter:     d.Minter,
		publishers: d.Publishers,
		ender:      d.Ender,
		webhooks:   d.Webhooks,
		events:     d.Events,
		log:        d.Log,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/streams", a.streamsRoute)
	mux.HandleFunc("/streams/{id}", a.streamByID)
	mux.HandleFunc("/streams/{id}/messages", a.messages)
	mux.HandleFunc("/streams/{id}/media-token", a.mediaToken)
	mux.HandleFunc("/streams/{id}/ws", a.ws)
	mux.HandleFunc("/livekit/webhook", a.livekitWebhook)
	mux.HandleFunc("/healthz", a.healthz)
	mux.HandleFunc("/readyz", a.readyz)
	mux.HandleFunc("/", a.notFound)
	return mux
}

func (a *api) streamsRoute(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		a.listStreams(w, r)
	case http.MethodPost:
		a.createStream(w, r)
	default:
		a.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (a *api) listStreams(w http.ResponseWriter, r *http.Request) {
	streams, err := a.streams.List(r.Context())
	if err != nil {
		a.internalError(w, "listing streams", err)
		return
	}
	a.writeJSON(w, http.StatusOK, streams)
}

func (a *api) createStream(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)

	var req createRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		a.writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := a.streams.Create(r.Context(), req.Username, req.Title, req.Description)
	if err != nil {
		var ve stream.ValidationError
		if errors.As(err, &ve) {
			a.writeError(w, http.StatusBadRequest, ve.Message)
			return
		}
		a.internalError(w, "creating stream", err)
		return
	}
	a.writeJSON(w, http.StatusCreated, created)
}

// streamByID handles DELETE on /streams/{id}. Authorization is publisher-aware
// (design D4): a room with an active LiveKit publisher requires the creatorKey as
// `Authorization: Bearer`, while an abandoned room (no publisher) may be ended
// without a key. It fails closed when publisher state can't be determined.
func (a *api) streamByID(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		a.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	id := r.PathValue("id")
	if id == "" {
		a.writeError(w, http.StatusNotFound, "stream not found")
		return
	}

	exists, err := a.streams.Exists(r.Context(), id)
	if err != nil {
		a.internalError(w, "checking stream", err)
		return
	}
	if !exists {
		a.writeError(w, http.StatusNotFound, "stream not found")
		return
	}

	// Determine whether the room has an active publisher. On a LiveKit error, fail
	// closed: require the key.
	hasPublisher := true
	if ok, perr := a.publishers.HasActivePublisher(r.Context(), id); perr != nil {
		a.log.Warn("publisher check failed; requiring key", "room", id, "error", perr)
	} else {
		hasPublisher = ok
	}

	if hasPublisher {
		isCreator, _, verr := a.streams.VerifyCreator(r.Context(), id, bearerToken(r))
		if verr != nil {
			if errors.Is(verr, stream.ErrNotFound) {
				a.writeError(w, http.StatusNotFound, "stream not found")
				return
			}
			a.internalError(w, "verifying stream owner", verr)
			return
		}
		if !isCreator {
			a.writeError(w, http.StatusForbidden, "invalid or missing creator key")
			return
		}
	}

	// Authorized (valid key, or abandoned room). Run the shared cascade.
	if err := a.ender.EndRoom(r.Context(), id); err != nil {
		a.internalError(w, "ending stream", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// mediaToken handles POST /streams/{id}/media-token, minting a LiveKit token
// scoped to the room. A valid creatorKey (Authorization: Bearer) grants publish.
func (a *api) mediaToken(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		a.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	id := r.PathValue("id")
	token, err := a.minter.Mint(r.Context(), id, bearerToken(r))
	if err != nil {
		if errors.Is(err, stream.ErrNotFound) {
			a.writeError(w, http.StatusNotFound, "stream not found")
			return
		}
		a.internalError(w, "minting media token", err)
		return
	}
	a.writeJSON(w, http.StatusOK, token)
}

// livekitWebhook handles POST /livekit/webhook: it verifies the LiveKit signature
// and dispatches the event to the reaper. A missing/invalid signature is rejected
// and changes no state.
func (a *api) livekitWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		a.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	event, err := a.webhooks.ReceiveWebhook(r)
	if err != nil {
		// Unsigned/tampered request: reject, no state change. Not an internal error.
		a.log.Warn("rejected livekit webhook", "error", err)
		a.writeError(w, http.StatusUnauthorized, "invalid webhook signature")
		return
	}

	a.events.HandleEvent(r.Context(), event.Type, event.Room, event.Identity)
	w.WriteHeader(http.StatusOK)
}

// bearerToken extracts the token from an `Authorization: Bearer <token>` header,
// or "" when absent or malformed.
func bearerToken(r *http.Request) string {
	const prefix = "Bearer "
	h := r.Header.Get("Authorization")
	if len(h) >= len(prefix) && strings.EqualFold(h[:len(prefix)], prefix) {
		return strings.TrimSpace(h[len(prefix):])
	}
	return ""
}

// messages handles GET /streams/{id}/messages?before=&limit=.
func (a *api) messages(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		a.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}

	id := r.PathValue("id")
	exists, err := a.streams.Exists(r.Context(), id)
	if err != nil {
		a.internalError(w, "checking room", err)
		return
	}
	if !exists {
		a.writeError(w, http.StatusNotFound, "room not found")
		return
	}

	before := r.URL.Query().Get("before")
	limit := 0
	if raw := r.URL.Query().Get("limit"); raw != "" {
		// A bad limit is ignored (falls back to the default/cap), not an error.
		if n, convErr := strconv.Atoi(raw); convErr == nil {
			limit = n
		}
	}

	msgs, next, err := a.chat.History(r.Context(), id, before, limit)
	if err != nil {
		a.internalError(w, "reading history", err)
		return
	}

	resp := historyResponse{Messages: msgs}
	if next != "" {
		resp.NextCursor = &next
	}
	a.writeJSON(w, http.StatusOK, resp)
}

// ws upgrades GET /streams/{id}/ws to a room WebSocket. The hub owns the
// connection lifecycle from here.
func (a *api) ws(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		a.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	id := r.PathValue("id")
	a.hub.ServeWS(w, r, id, a.streams, a.chat)
}

func (a *api) healthz(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		a.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	a.writeText(w, http.StatusOK, "ok")
}

func (a *api) readyz(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		a.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	if err := a.ready.Ping(r.Context()); err != nil {
		a.log.Warn("readiness check failed", "error", err)
		a.writeError(w, http.StatusServiceUnavailable, "not ready")
		return
	}
	a.writeText(w, http.StatusOK, "ok")
}

func (a *api) notFound(w http.ResponseWriter, _ *http.Request) {
	a.writeError(w, http.StatusNotFound, "not found")
}

func (a *api) internalError(w http.ResponseWriter, context string, err error) {
	a.log.Error(context, "error", err)
	a.writeError(w, http.StatusInternalServerError, "internal error")
}

func (a *api) writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		a.log.Error("encoding response", "error", err)
	}
}

func (a *api) writeError(w http.ResponseWriter, status int, msg string) {
	a.writeJSON(w, status, errorBody{Error: msg})
}

func (a *api) writeText(w http.ResponseWriter, status int, msg string) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(status)
	if _, err := w.Write([]byte(msg)); err != nil {
		a.log.Error("writing response", "error", err)
	}
}
