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

	return Config{
		ValkeyAddr:     addr,
		ValkeyPassword: os.Getenv("VALKEY_PASSWORD"),
		ValkeyDB:       db,
		HTTPAddr:       httpAddr,
	}, nil
}
