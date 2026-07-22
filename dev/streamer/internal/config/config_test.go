package config_test

import (
	"strings"
	"testing"

	"github.com/quickchat/streamer/internal/config"
)

func TestLoad(t *testing.T) {
	tests := []struct {
		name    string
		env     map[string]string
		want    config.Config
		wantErr bool
	}{
		{
			name:    "missing VALKEY_ADDR",
			env:     map[string]string{},
			wantErr: true,
		},
		{
			name:    "blank VALKEY_ADDR",
			env:     map[string]string{"VALKEY_ADDR": "   "},
			wantErr: true,
		},
		{
			name: "defaults applied with required vars",
			env: map[string]string{
				"VALKEY_ADDR":        "valkey:6379",
				"LIVEKIT_API_KEY":    "devkey",
				"LIVEKIT_API_SECRET": "devsecret",
				"LIVEKIT_URL":        "http://livekit:7880",
				"LIVEKIT_PUBLIC_URL": "ws://localhost:7880",
				"SECURITY_JWKS_URL":  "http://security:4000/auth/jwt/jwks.json",
			},
			want: config.Config{
				ValkeyAddr:       "valkey:6379",
				ValkeyPassword:   "",
				ValkeyDB:         0,
				HTTPAddr:         ":8080",
				ChatMaxMessages:  1000000,
				ChatPageSize:     200,
				ChatMaxLength:    500,
				LiveKitAPIKey:    "devkey",
				LiveKitAPISecret: "devsecret",
				LiveKitURL:       "http://livekit:7880",
				LiveKitPublicURL: "ws://localhost:7880",
				SecurityJWKSURL:  "http://security:4000/auth/jwt/jwks.json",
			},
		},
		{
			name: "all values set",
			env: map[string]string{
				"VALKEY_ADDR":        "10.0.0.5:6379",
				"VALKEY_PASSWORD":    "secret",
				"VALKEY_DB":          "3",
				"STREAMER_ADDR":      ":9090",
				"CHAT_MAX_MESSAGES":  "50",
				"CHAT_PAGE_SIZE":     "10",
				"CHAT_MAX_LENGTH":    "140",
				"LIVEKIT_API_KEY":    "k",
				"LIVEKIT_API_SECRET": "s",
				"LIVEKIT_URL":        "http://lk:7880",
				"LIVEKIT_PUBLIC_URL": "ws://pub:7880",
				"SECURITY_JWKS_URL":  "http://sec/jwks",
			},
			want: config.Config{
				ValkeyAddr:       "10.0.0.5:6379",
				ValkeyPassword:   "secret",
				ValkeyDB:         3,
				HTTPAddr:         ":9090",
				ChatMaxMessages:  50,
				ChatPageSize:     10,
				ChatMaxLength:    140,
				LiveKitAPIKey:    "k",
				LiveKitAPISecret: "s",
				LiveKitURL:       "http://lk:7880",
				LiveKitPublicURL: "ws://pub:7880",
				SecurityJWKSURL:  "http://sec/jwks",
			},
		},
		{
			name: "missing SECURITY_JWKS_URL",
			env: map[string]string{
				"VALKEY_ADDR": "valkey:6379", "LIVEKIT_API_KEY": "k", "LIVEKIT_API_SECRET": "s",
				"LIVEKIT_URL": "http://lk:7880", "LIVEKIT_PUBLIC_URL": "ws://p:7880",
			},
			wantErr: true,
		},
		{
			name: "missing LIVEKIT_API_KEY",
			env: map[string]string{
				"VALKEY_ADDR":        "valkey:6379",
				"LIVEKIT_API_SECRET": "s", "LIVEKIT_URL": "http://lk:7880", "LIVEKIT_PUBLIC_URL": "ws://p:7880",
			},
			wantErr: true,
		},
		{
			name: "missing LIVEKIT_PUBLIC_URL",
			env: map[string]string{
				"VALKEY_ADDR":     "valkey:6379",
				"LIVEKIT_API_KEY": "k", "LIVEKIT_API_SECRET": "s", "LIVEKIT_URL": "http://lk:7880",
			},
			wantErr: true,
		},
		{
			name:    "non-integer VALKEY_DB",
			env:     map[string]string{"VALKEY_ADDR": "valkey:6379", "VALKEY_DB": "abc"},
			wantErr: true,
		},
		{
			name:    "negative VALKEY_DB",
			env:     map[string]string{"VALKEY_ADDR": "valkey:6379", "VALKEY_DB": "-1"},
			wantErr: true,
		},
		{
			name:    "non-integer CHAT_MAX_MESSAGES",
			env:     map[string]string{"VALKEY_ADDR": "valkey:6379", "CHAT_MAX_MESSAGES": "lots"},
			wantErr: true,
		},
		{
			name:    "non-positive CHAT_PAGE_SIZE",
			env:     map[string]string{"VALKEY_ADDR": "valkey:6379", "CHAT_PAGE_SIZE": "0"},
			wantErr: true,
		},
		{
			name:    "negative CHAT_MAX_LENGTH",
			env:     map[string]string{"VALKEY_ADDR": "valkey:6379", "CHAT_MAX_LENGTH": "-5"},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Clear the variables this test cares about, then set the case's values.
			for _, k := range []string{
				"VALKEY_ADDR", "VALKEY_PASSWORD", "VALKEY_DB", "STREAMER_ADDR",
				"CHAT_MAX_MESSAGES", "CHAT_PAGE_SIZE", "CHAT_MAX_LENGTH",
				"LIVEKIT_API_KEY", "LIVEKIT_API_SECRET", "LIVEKIT_URL", "LIVEKIT_PUBLIC_URL",
				"SECURITY_JWKS_URL",
			} {
				t.Setenv(k, "")
			}
			for k, v := range tt.env {
				t.Setenv(k, v)
			}

			got, err := config.Load()
			if tt.wantErr {
				if err == nil {
					t.Fatalf("Load() expected error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("Load() unexpected error: %v", err)
			}
			if got != tt.want {
				t.Fatalf("Load() = %+v, want %+v", got, tt.want)
			}
		})
	}
}

func TestLoadNeverLeaksSecretInError(t *testing.T) {
	// A different failure (bad VALKEY_DB) while the secret is set must not put the
	// secret into the error message.
	for _, k := range []string{"VALKEY_PASSWORD", "STREAMER_ADDR", "CHAT_MAX_MESSAGES", "CHAT_PAGE_SIZE", "CHAT_MAX_LENGTH"} {
		t.Setenv(k, "")
	}
	t.Setenv("VALKEY_ADDR", "valkey:6379")
	t.Setenv("VALKEY_DB", "not-an-int")
	t.Setenv("LIVEKIT_API_KEY", "k")
	t.Setenv("LIVEKIT_API_SECRET", "SUPER-SECRET-VALUE")
	t.Setenv("LIVEKIT_URL", "http://lk:7880")
	t.Setenv("LIVEKIT_PUBLIC_URL", "ws://p:7880")

	_, err := config.Load()
	if err == nil {
		t.Fatal("expected an error")
	}
	if strings.Contains(err.Error(), "SUPER-SECRET-VALUE") {
		t.Fatalf("error leaked the secret: %v", err)
	}
}
