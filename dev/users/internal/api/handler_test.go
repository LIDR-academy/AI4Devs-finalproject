package api_test

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"quickchat/users/internal/api"
	"quickchat/users/internal/user"
)

// fakeService is a hand-written UserService for handler tests.
type fakeService struct {
	user    user.User
	created bool
	err     error

	gotEmail string
	called   bool
}

func (f *fakeService) GetOrCreate(_ context.Context, email string) (user.User, bool, error) {
	f.called = true
	f.gotEmail = email
	if f.err != nil {
		return user.User{}, false, f.err
	}
	return f.user, f.created, nil
}

func newTestHandler(svc api.UserService) http.Handler {
	// Discard logs so test output stays clean.
	return api.NewHandler(svc, slog.New(slog.NewTextHandler(io.Discard, nil)))
}

func post(t *testing.T, h http.Handler, body string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodPost, "/internal/users/get-or-create", strings.NewReader(body))
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func TestGetOrCreate_HappyPath(t *testing.T) {
	t.Parallel()
	svc := &fakeService{
		user:    user.User{ID: "id-1", Email: "a@example.com", Username: "maple7k2q"},
		created: true,
	}
	rec := post(t, newTestHandler(svc), `{"email":"a@example.com"}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200; body=%s", rec.Code, rec.Body.String())
	}
	var got map[string]any
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatalf("decoding response: %v", err)
	}
	if got["id"] != "id-1" || got["email"] != "a@example.com" || got["username"] != "maple7k2q" || got["created"] != true {
		t.Fatalf("unexpected body: %v", got)
	}
	if svc.gotEmail != "a@example.com" {
		t.Fatalf("service got email %q, want a@example.com", svc.gotEmail)
	}
}

func TestGetOrCreate_ReturningUser(t *testing.T) {
	t.Parallel()
	svc := &fakeService{
		user:    user.User{ID: "id-1", Email: "a@example.com", Username: "maple7k2q"},
		created: false,
	}
	rec := post(t, newTestHandler(svc), `{"email":"a@example.com"}`)

	if rec.Code != http.StatusOK {
		t.Fatalf("status = %d, want 200", rec.Code)
	}
	var got map[string]any
	_ = json.Unmarshal(rec.Body.Bytes(), &got)
	if got["created"] != false {
		t.Fatalf("created = %v, want false", got["created"])
	}
}

func TestGetOrCreate_MalformedJSON(t *testing.T) {
	t.Parallel()
	svc := &fakeService{}
	rec := post(t, newTestHandler(svc), `{not json`)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400", rec.Code)
	}
	if svc.called {
		t.Fatalf("service should not be called on malformed JSON")
	}
	assertErrorBody(t, rec.Body.Bytes())
}

func TestGetOrCreate_UnknownField(t *testing.T) {
	t.Parallel()
	svc := &fakeService{}
	rec := post(t, newTestHandler(svc), `{"email":"a@example.com","admin":true}`)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status = %d, want 400 for unknown field", rec.Code)
	}
	if svc.called {
		t.Fatalf("service should not be called when body has unknown fields")
	}
}

func TestGetOrCreate_InvalidEmails(t *testing.T) {
	t.Parallel()
	cases := map[string]string{
		"missing":      `{}`,
		"empty":        `{"email":""}`,
		"whitespace":   `{"email":"   "}`,
		"no-at":        `{"email":"notanemail"}`,
		"display-name": `{"email":"Name <a@example.com>"}`,
	}
	for name, body := range cases {
		body := body
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			svc := &fakeService{}
			rec := post(t, newTestHandler(svc), body)
			if rec.Code != http.StatusBadRequest {
				t.Fatalf("status = %d, want 400; body=%s", rec.Code, rec.Body.String())
			}
			if svc.called {
				t.Fatalf("service should not be called for invalid email")
			}
		})
	}
}

func TestGetOrCreate_ServiceErrorIs500(t *testing.T) {
	t.Parallel()
	svc := &fakeService{err: errors.New("mongo down")}
	rec := post(t, newTestHandler(svc), `{"email":"a@example.com"}`)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want 500", rec.Code)
	}
	// The error body must not leak the email or internal error text.
	body := rec.Body.String()
	if strings.Contains(body, "a@example.com") || strings.Contains(body, "mongo down") {
		t.Fatalf("error body leaked sensitive/internal detail: %s", body)
	}
	assertErrorBody(t, rec.Body.Bytes())
}

func assertErrorBody(t *testing.T, b []byte) {
	t.Helper()
	var got map[string]any
	if err := json.Unmarshal(b, &got); err != nil {
		t.Fatalf("error body is not JSON: %v", err)
	}
	if _, ok := got["error"].(string); !ok {
		t.Fatalf("error body missing string 'error' field: %s", string(b))
	}
}
