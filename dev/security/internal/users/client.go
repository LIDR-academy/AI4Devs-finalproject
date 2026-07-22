// Package users is the HTTP client for the users service's internal
// get-or-create endpoint. security calls it once per new session to resolve the
// account identity (userId + username) that is stamped into the access token.
package users

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// Identity is the account identity returned by the users service. userID is the
// users-service (Mongo) id used downstream for ownership; it is never the
// SuperTokens internal id.
type Identity struct {
	UserID   string
	Username string
	Created  bool
}

// Client calls the users get-or-create endpoint. Trust is the compose network:
// no shared secret is sent in v0.
type Client struct {
	url  string
	http *http.Client
}

// getOrCreateRequest is the request body: only the verified email.
type getOrCreateRequest struct {
	Email string `json:"email"`
}

// getOrCreateResponse mirrors the frozen contract:
// 200 { "id", "email", "username", "created" }.
type getOrCreateResponse struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	Username string `json:"username"`
	Created  bool   `json:"created"`
}

// errorResponse is the users error body: { "error": string }.
type errorResponse struct {
	Error string `json:"error"`
}

// NewClient builds a users client for the given endpoint URL with a bounded
// request timeout. A zero timeout would let a hung users service block logins
// indefinitely, so the timeout is always set (Go Constitution §6).
func NewClient(url string, timeout time.Duration) *Client {
	return &Client{
		url:  url,
		http: &http.Client{Timeout: timeout},
	}
}

// GetOrCreate resolves the account identity for a verified email. It is
// fail-closed: any transport error, non-200 status, or a 200 body missing the id
// or username returns an error so the caller never issues an identity-less token.
func (c *Client) GetOrCreate(ctx context.Context, email string) (Identity, error) {
	email = strings.TrimSpace(email)
	if email == "" {
		return Identity{}, fmt.Errorf("get-or-create: empty email")
	}

	body, err := json.Marshal(getOrCreateRequest{Email: email})
	if err != nil {
		return Identity{}, fmt.Errorf("get-or-create: marshaling request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.url, bytes.NewReader(body))
	if err != nil {
		return Identity{}, fmt.Errorf("get-or-create: building request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return Identity{}, fmt.Errorf("get-or-create: calling users: %w", err)
	}
	defer func() { _ = resp.Body.Close() }()

	if resp.StatusCode != http.StatusOK {
		return Identity{}, fmt.Errorf("get-or-create: users returned status %d: %s", resp.StatusCode, decodeError(resp))
	}

	var out getOrCreateResponse
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return Identity{}, fmt.Errorf("get-or-create: decoding response: %w", err)
	}

	if strings.TrimSpace(out.ID) == "" || strings.TrimSpace(out.Username) == "" {
		return Identity{}, fmt.Errorf("get-or-create: incomplete user record (id or username empty)")
	}

	return Identity{UserID: out.ID, Username: out.Username, Created: out.Created}, nil
}

// decodeError extracts the users { "error" } message for context, falling back
// to a placeholder when the body is absent or unparseable. It never surfaces
// sensitive data — the users error contract carries only a message string.
func decodeError(resp *http.Response) string {
	var e errorResponse
	if err := json.NewDecoder(resp.Body).Decode(&e); err != nil || e.Error == "" {
		return "no error body"
	}
	return e.Error
}
