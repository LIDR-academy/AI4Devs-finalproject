// Package api exposes the users service over an internal HTTP API. Handlers are
// thin: they decode and validate input at the boundary, delegate to the user
// service, and encode the response. The API is internal-only (compose network)
// and never logs personal data.
package api

import (
	"context"
	"encoding/json"
	"log/slog"
	"net/http"
	"net/mail"
	"strings"

	"quickchat/users/internal/user"
)

// UserService is the behavior the handler depends on. It is defined here, where
// it is consumed, so the concrete service in package user can satisfy it
// without the packages coupling further.
type UserService interface {
	GetOrCreate(ctx context.Context, email string) (user.User, bool, error)
}

// Handler serves the internal users endpoints.
type Handler struct {
	svc UserService
	log *slog.Logger
}

// NewHandler wires the routes and returns an http.Handler ready to serve.
func NewHandler(svc UserService, log *slog.Logger) http.Handler {
	h := &Handler{svc: svc, log: log}
	mux := http.NewServeMux()
	mux.HandleFunc("POST /internal/users/get-or-create", h.getOrCreate)
	return mux
}

// getOrCreateRequest is the request body for the get-or-create endpoint.
type getOrCreateRequest struct {
	Email string `json:"email"`
}

// getOrCreateResponse is the success body. A 200 always carries a non-empty id
// and username; security relies on this invariant to mint identity claims.
type getOrCreateResponse struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	Created  bool   `json:"created"`
}

// errorResponse is the consistent JSON error shape. Messages never contain PII.
type errorResponse struct {
	Error string `json:"error"`
}

func (h *Handler) getOrCreate(w http.ResponseWriter, r *http.Request) {
	var req getOrCreateRequest
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	email, ok := normalizeEmail(req.Email)
	if !ok {
		h.writeError(w, http.StatusBadRequest, "email is required and must be a valid address")
		return
	}

	u, created, err := h.svc.GetOrCreate(r.Context(), email)
	if err != nil {
		// Do not log the email (PII); the error text carries no PII.
		h.log.Error("get-or-create failed", "err", err)
		h.writeError(w, http.StatusInternalServerError, "could not process user")
		return
	}

	h.writeJSON(w, http.StatusOK, getOrCreateResponse{
		ID:       u.ID,
		Email:    u.Email,
		Username: u.Username,
		Created:  created,
	})
}

// normalizeEmail validates and normalizes an email at the boundary. It returns
// false for an empty value or one that fails basic RFC 5322 address parsing.
func normalizeEmail(raw string) (string, bool) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "", false
	}
	addr, err := mail.ParseAddress(trimmed)
	if err != nil {
		return "", false
	}
	// Reject display-name forms like "Name <a@b.com>": require a bare address.
	if addr.Name != "" || addr.Address != trimmed {
		return "", false
	}
	return addr.Address, true
}

func (h *Handler) writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(body); err != nil {
		// The status/headers are already sent; log and move on.
		h.log.Error("encoding response failed", "err", err)
	}
}

func (h *Handler) writeError(w http.ResponseWriter, status int, msg string) {
	h.writeJSON(w, status, errorResponse{Error: msg})
}
