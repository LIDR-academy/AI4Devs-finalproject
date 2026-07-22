package auth

import (
	"context"
	"errors"
	"testing"

	"github.com/quickchat/security/internal/users"
)

// fakeProvider is a hand-written IdentityProvider fake (no mocking framework).
type fakeProvider struct {
	identity users.Identity
	err      error
	gotEmail string
}

func (f *fakeProvider) GetOrCreate(_ context.Context, email string) (users.Identity, error) {
	f.gotEmail = email
	return f.identity, f.err
}

func TestBuildIdentityClaims(t *testing.T) {
	tests := []struct {
		name     string
		identity users.Identity
		err      error
		wantErr  bool
	}{
		{
			name:     "new user stamps claims",
			identity: users.Identity{UserID: "u_1", Username: "blue-otter-7", Created: true},
		},
		{
			name:     "returning user stamps same claims",
			identity: users.Identity{UserID: "u_1", Username: "blue-otter-7", Created: false},
		},
		{
			name:    "provider error fails closed",
			err:     errors.New("users unreachable"),
			wantErr: true,
		},
		{
			name:     "incomplete record missing id fails closed",
			identity: users.Identity{UserID: "", Username: "blue-otter-7"},
			wantErr:  true,
		},
		{
			name:     "incomplete record missing username fails closed",
			identity: users.Identity{UserID: "u_1", Username: ""},
			wantErr:  true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p := &fakeProvider{identity: tt.identity, err: tt.err}
			claims, err := buildIdentityClaims(context.Background(), p, "a@b.com")

			if tt.wantErr {
				if err == nil {
					t.Fatalf("expected error, got claims %v", claims)
				}
				if claims != nil {
					t.Errorf("expected no claims on failure, got %v", claims)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if claims[ClaimUserID] != tt.identity.UserID {
				t.Errorf("%s = %v, want %v", ClaimUserID, claims[ClaimUserID], tt.identity.UserID)
			}
			if claims[ClaimUsername] != tt.identity.Username {
				t.Errorf("%s = %v, want %v", ClaimUsername, claims[ClaimUsername], tt.identity.Username)
			}
			if p.gotEmail != "a@b.com" {
				t.Errorf("provider received email %q, want a@b.com", p.gotEmail)
			}
		})
	}
}

func TestMergeClaims(t *testing.T) {
	t.Run("nil payload gets a fresh map", func(t *testing.T) {
		out := mergeClaims(nil, map[string]interface{}{ClaimUserID: "u_1"})
		if out[ClaimUserID] != "u_1" {
			t.Errorf("merged claim missing: %v", out)
		}
	})

	t.Run("existing payload is preserved and extended", func(t *testing.T) {
		payload := map[string]interface{}{"existing": "keep"}
		out := mergeClaims(payload, map[string]interface{}{ClaimUsername: "blue-otter-7"})
		if out["existing"] != "keep" {
			t.Errorf("existing payload key dropped: %v", out)
		}
		if out[ClaimUsername] != "blue-otter-7" {
			t.Errorf("identity claim not added: %v", out)
		}
	})
}
