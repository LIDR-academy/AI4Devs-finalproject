package users_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/quickchat/security/internal/users"
)

func TestGetOrCreate(t *testing.T) {
	tests := []struct {
		name         string
		status       int
		body         string
		wantErr      bool
		wantUserID   string
		wantUsername string
		wantCreated  bool
	}{
		{
			name:       "new user",
			status:     http.StatusOK,
			body:       `{"id":"u_1","email":"a@b.com","username":"blue-otter-7","created":true}`,
			wantUserID: "u_1", wantUsername: "blue-otter-7", wantCreated: true,
		},
		{
			name:       "returning user",
			status:     http.StatusOK,
			body:       `{"id":"u_1","email":"a@b.com","username":"blue-otter-7","created":false}`,
			wantUserID: "u_1", wantUsername: "blue-otter-7", wantCreated: false,
		},
		{
			name:    "incomplete body missing id",
			status:  http.StatusOK,
			body:    `{"id":"","email":"a@b.com","username":"blue-otter-7","created":true}`,
			wantErr: true,
		},
		{
			name:    "incomplete body missing username",
			status:  http.StatusOK,
			body:    `{"id":"u_1","email":"a@b.com","username":"","created":true}`,
			wantErr: true,
		},
		{
			name:    "persistence failure 500",
			status:  http.StatusInternalServerError,
			body:    `{"error":"db unavailable"}`,
			wantErr: true,
		},
		{
			name:    "bad request 400",
			status:  http.StatusBadRequest,
			body:    `{"error":"invalid email"}`,
			wantErr: true,
		},
		{
			name:    "malformed json body",
			status:  http.StatusOK,
			body:    `{not json`,
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				if r.Method != http.MethodPost {
					t.Errorf("method = %s, want POST", r.Method)
				}
				var req struct {
					Email string `json:"email"`
				}
				if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
					t.Errorf("server could not decode request: %v", err)
				}
				if req.Email == "" {
					t.Errorf("server received empty email")
				}
				w.WriteHeader(tt.status)
				_, _ = w.Write([]byte(tt.body))
			}))
			defer srv.Close()

			c := users.NewClient(srv.URL, 2*time.Second)
			id, err := c.GetOrCreate(context.Background(), "a@b.com")

			if tt.wantErr {
				if err == nil {
					t.Fatalf("expected error, got identity %+v", id)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if id.UserID != tt.wantUserID || id.Username != tt.wantUsername || id.Created != tt.wantCreated {
				t.Errorf("identity = %+v, want {UserID:%s Username:%s Created:%v}", id, tt.wantUserID, tt.wantUsername, tt.wantCreated)
			}
		})
	}
}

func TestGetOrCreateEmptyEmail(t *testing.T) {
	c := users.NewClient("http://unused.example", time.Second)
	if _, err := c.GetOrCreate(context.Background(), "   "); err == nil {
		t.Fatal("expected error for empty email, got nil")
	}
}

func TestGetOrCreateTransportError(t *testing.T) {
	// A server that is immediately closed forces a connection error.
	srv := httptest.NewServer(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {}))
	url := srv.URL
	srv.Close()

	c := users.NewClient(url, 500*time.Millisecond)
	_, err := c.GetOrCreate(context.Background(), "a@b.com")
	if err == nil {
		t.Fatal("expected transport error, got nil")
	}
	if !strings.Contains(err.Error(), "get-or-create") {
		t.Errorf("error not wrapped with context: %v", err)
	}
}

func TestGetOrCreateContextCancelled(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		<-r.Context().Done()
	}))
	defer srv.Close()

	ctx, cancel := context.WithCancel(context.Background())
	cancel()

	c := users.NewClient(srv.URL, 5*time.Second)
	if _, err := c.GetOrCreate(ctx, "a@b.com"); err == nil {
		t.Fatal("expected error from cancelled context, got nil")
	}
}
