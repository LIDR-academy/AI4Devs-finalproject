package config_test

import (
	"strings"
	"testing"

	"github.com/quickchat/security/internal/config"
)

// requiredEnv is the minimal set of variables that make Load succeed.
func requiredEnv() map[string]string {
	return map[string]string{
		"SUPERTOKENS_CONNECTION_URI": "https://core.example.com",
		"SUPERTOKENS_API_KEY":        "super-secret-key",
		"SECURITY_API_DOMAIN":        "http://localhost:8080",
		"SECURITY_WEBSITE_DOMAIN":    "http://localhost:5173",
		"USERS_GET_OR_CREATE_URL":    "http://users:8081/internal/users/get-or-create",
	}
}

func TestLoad(t *testing.T) {
	tests := []struct {
		name        string
		env         map[string]string
		wantErr     bool
		wantMissing []string
	}{
		{
			name: "all required present, defaults applied",
			env:  requiredEnv(),
		},
		{
			name:    "missing connection uri",
			env:     without(requiredEnv(), "SUPERTOKENS_CONNECTION_URI"),
			wantErr: true, wantMissing: []string{"SUPERTOKENS_CONNECTION_URI"},
		},
		{
			name:    "blank api key is treated as missing",
			env:     with(requiredEnv(), "SUPERTOKENS_API_KEY", "   "),
			wantErr: true, wantMissing: []string{"SUPERTOKENS_API_KEY"},
		},
		{
			name:    "multiple missing reported together",
			env:     without(without(requiredEnv(), "SECURITY_API_DOMAIN"), "USERS_GET_OR_CREATE_URL"),
			wantErr: true, wantMissing: []string{"SECURITY_API_DOMAIN", "USERS_GET_OR_CREATE_URL"},
		},
	}

	requiredNames := []string{
		"SUPERTOKENS_CONNECTION_URI", "SUPERTOKENS_API_KEY",
		"SECURITY_API_DOMAIN", "SECURITY_WEBSITE_DOMAIN", "USERS_GET_OR_CREATE_URL",
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Blank every required var first so a value in the host environment
			// cannot leak into a "missing" case, then apply the case's values.
			for _, name := range requiredNames {
				t.Setenv(name, "")
			}
			for k, v := range tt.env {
				t.Setenv(k, v)
			}

			cfg, err := config.Load()
			if tt.wantErr {
				if err == nil {
					t.Fatalf("expected error, got nil")
				}
				for _, name := range tt.wantMissing {
					if !strings.Contains(err.Error(), name) {
						t.Errorf("error %q does not mention missing var %q", err, name)
					}
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if cfg.APIBasePath != "/auth" {
				t.Errorf("APIBasePath = %q, want default /auth", cfg.APIBasePath)
			}
			if cfg.AppName != "QuickChat" {
				t.Errorf("AppName = %q, want default QuickChat", cfg.AppName)
			}
			if cfg.Port != "8080" {
				t.Errorf("Port = %q, want default 8080", cfg.Port)
			}
		})
	}
}

func TestLoadOverridesDefaults(t *testing.T) {
	for k, v := range requiredEnv() {
		t.Setenv(k, v)
	}
	t.Setenv("SECURITY_API_BASE_PATH", "/api/auth")
	t.Setenv("PORT", "9000")

	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cfg.APIBasePath != "/api/auth" {
		t.Errorf("APIBasePath = %q, want /api/auth", cfg.APIBasePath)
	}
	if cfg.Port != "9000" {
		t.Errorf("Port = %q, want 9000", cfg.Port)
	}
}

// TestStringRedactsAPIKey is the AC7 guard at the config boundary: if a Config is
// ever formatted into a log line, the API key must not appear.
func TestStringRedactsAPIKey(t *testing.T) {
	for k, v := range requiredEnv() {
		t.Setenv(k, v)
	}
	cfg, err := config.Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	out := cfg.String()
	if strings.Contains(out, "super-secret-key") {
		t.Fatalf("Config.String() leaked the API key: %q", out)
	}
	if !strings.Contains(out, "[REDACTED]") {
		t.Errorf("Config.String() should mark the API key as redacted: %q", out)
	}
}

func with(m map[string]string, k, v string) map[string]string {
	m[k] = v
	return m
}

func without(m map[string]string, k string) map[string]string {
	delete(m, k)
	return m
}
