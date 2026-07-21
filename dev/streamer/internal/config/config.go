// Package config loads the streamer service configuration from the environment.
//
// Configuration comes only from environment variables (Constitution §10). Loading
// fails fast when a required variable is missing or malformed so the process never
// starts half-configured.
package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Config holds the runtime configuration for the streamer service.
type Config struct {
	// ValkeyAddr is the Valkey host:port to connect to (required).
	ValkeyAddr string
	// ValkeyPassword is the Valkey password (empty when Valkey runs without auth).
	ValkeyPassword string
	// ValkeyDB is the Valkey logical database index.
	ValkeyDB int
	// HTTPAddr is the address the HTTP server listens on (e.g. ":8080").
	HTTPAddr string
	// ChatMaxMessages is the per-room ring-buffer cap (drop-oldest).
	ChatMaxMessages int
	// ChatPageSize is the history page size and the cap on a requested limit.
	ChatPageSize int
	// ChatMaxLength is the maximum message length in Unicode code points.
	ChatMaxLength int
	// LiveKitAPIKey is the LiveKit API key.
	LiveKitAPIKey string
	// LiveKitAPISecret is the LiveKit API secret (used to sign tokens and verify
	// webhooks; never logged or returned).
	LiveKitAPISecret string
	// LiveKitURL is the server-to-server LiveKit API URL (e.g. http://livekit:7880).
	LiveKitURL string
	// LiveKitPublicURL is the browser-facing LiveKit URL returned in media tokens.
	LiveKitPublicURL string
}

// Load reads the configuration from the environment, applying defaults for the
// optional values. It returns an error when VALKEY_ADDR is missing or when
// VALKEY_DB is set but not a valid integer.
func Load() (Config, error) {
	addr := strings.TrimSpace(os.Getenv("VALKEY_ADDR"))
	if addr == "" {
		return Config{}, fmt.Errorf("VALKEY_ADDR is required")
	}

	db := 0
	if raw := strings.TrimSpace(os.Getenv("VALKEY_DB")); raw != "" {
		parsed, err := strconv.Atoi(raw)
		if err != nil {
			return Config{}, fmt.Errorf("VALKEY_DB %q is not a valid integer: %w", raw, err)
		}
		if parsed < 0 {
			return Config{}, fmt.Errorf("VALKEY_DB %d must not be negative", parsed)
		}
		db = parsed
	}

	httpAddr := strings.TrimSpace(os.Getenv("STREAMER_ADDR"))
	if httpAddr == "" {
		httpAddr = ":8080"
	}

	chatMaxMessages, err := positiveInt("CHAT_MAX_MESSAGES", 1000000)
	if err != nil {
		return Config{}, err
	}
	chatPageSize, err := positiveInt("CHAT_PAGE_SIZE", 200)
	if err != nil {
		return Config{}, err
	}
	chatMaxLength, err := positiveInt("CHAT_MAX_LENGTH", 500)
	if err != nil {
		return Config{}, err
	}

	livekitAPIKey, err := required("LIVEKIT_API_KEY")
	if err != nil {
		return Config{}, err
	}
	livekitAPISecret, err := required("LIVEKIT_API_SECRET")
	if err != nil {
		return Config{}, err
	}
	livekitURL, err := required("LIVEKIT_URL")
	if err != nil {
		return Config{}, err
	}
	livekitPublicURL, err := required("LIVEKIT_PUBLIC_URL")
	if err != nil {
		return Config{}, err
	}

	return Config{
		ValkeyAddr:       addr,
		ValkeyPassword:   os.Getenv("VALKEY_PASSWORD"),
		ValkeyDB:         db,
		HTTPAddr:         httpAddr,
		ChatMaxMessages:  chatMaxMessages,
		ChatPageSize:     chatPageSize,
		ChatMaxLength:    chatMaxLength,
		LiveKitAPIKey:    livekitAPIKey,
		LiveKitAPISecret: livekitAPISecret,
		LiveKitURL:       livekitURL,
		LiveKitPublicURL: livekitPublicURL,
	}, nil
}

// required reads a mandatory environment variable, returning an error naming it
// when unset or blank.
func required(name string) (string, error) {
	v := strings.TrimSpace(os.Getenv(name))
	if v == "" {
		return "", fmt.Errorf("%s is required", name)
	}
	return v, nil
}

// positiveInt reads name from the environment as a positive integer, returning
// def when it is unset and an error when it is not a valid positive integer.
func positiveInt(name string, def int) (int, error) {
	raw := strings.TrimSpace(os.Getenv(name))
	if raw == "" {
		return def, nil
	}
	parsed, err := strconv.Atoi(raw)
	if err != nil {
		return 0, fmt.Errorf("%s %q is not a valid integer: %w", name, raw, err)
	}
	if parsed <= 0 {
		return 0, fmt.Errorf("%s %d must be positive", name, parsed)
	}
	return parsed, nil
}
