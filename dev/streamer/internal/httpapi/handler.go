// Package httpapi exposes the streamer HTTP API: the §6 /streams contract plus
// the operational /healthz and /readyz endpoints. Handlers are thin — they
// decode and validate input, call the stream service, and encode the response.
package httpapi

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/quickchat/streamer/internal/stream"
)

// maxBodyBytes caps the request body for POST /streams (Constitution §10 —
// validate/limit external input at the boundary).
const maxBodyBytes = 8 << 10 // 8 KiB

// Pinger reports whether the backing store is reachable, for readiness checks.
type Pinger interface {
	Ping(ctx context.Context) error
}

// errorBody is the stable error response shape, used for every error status.
type errorBody struct {
	Error string `json:"error"`
}

// createRequest is the accepted body for POST /streams. Unknown fields are
// ignored; an absent description decodes to "".
type createRequest struct {
	Title       string `json:"title"`
	Description string `json:"description"`
}

type api struct {
	svc   *stream.Service
	ready Pinger
	log   *slog.Logger
}

// NewHandler wires the routes and returns the HTTP handler for the service.
func NewHandler(svc *stream.Service, ready Pinger, log *slog.Logger) http.Handler {
	a := &api{svc: svc, ready: ready, log: log}

	mux := http.NewServeMux()
	// Register paths without methods so the handlers own method dispatch and can
	// return the standard JSON error body on 405 (the default mux 405 is plain text).
	mux.HandleFunc("/streams", a.streams)
	mux.HandleFunc("/streams/{id}", a.streamByID)
	mux.HandleFunc("/healthz", a.healthz)
	mux.HandleFunc("/readyz", a.readyz)
	mux.HandleFunc("/", a.notFound)
	return mux
}

// streams handles GET (list) and POST (create) on /streams.
func (a *api) streams(w http.ResponseWriter, r *http.Request) {
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
	streams, err := a.svc.List(r.Context())
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
		// Malformed JSON or a body over the cap — a client error either way.
		a.writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	s, err := a.svc.Create(r.Context(), req.Title, req.Description)
	if err != nil {
		var ve stream.ValidationError
		if errors.As(err, &ve) {
			a.writeError(w, http.StatusBadRequest, ve.Message)
			return
		}
		a.internalError(w, "creating stream", err)
		return
	}
	a.writeJSON(w, http.StatusCreated, s)
}

// streamByID handles DELETE on /streams/{id}.
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

	if err := a.svc.End(r.Context(), id); err != nil {
		if errors.Is(err, stream.ErrNotFound) {
			a.writeError(w, http.StatusNotFound, "stream not found")
			return
		}
		a.internalError(w, "ending stream", err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// healthz is a liveness probe: 200 whenever the process is serving.
func (a *api) healthz(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		a.writeError(w, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	a.writeText(w, http.StatusOK, "ok")
}

// readyz is a readiness probe: 200 when the store is reachable, else 503.
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
	// Log the real cause with context; never leak it (or storage detail) to the client.
	a.log.Error(context, "error", err)
	a.writeError(w, http.StatusInternalServerError, "internal error")
}

func (a *api) writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		// The header is already written; nothing to do but log.
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
