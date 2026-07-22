// Package config loads the users service configuration from the environment
// and fails fast when a required value is missing, so a misconfigured service
// never starts in a broken state.
package config

import (
	"fmt"
	"os"
)

// Config holds the runtime configuration. Values come only from the
// environment; nothing is baked into the binary or image.
type Config struct {
	// MongoURI is the full MongoDB connection string, including credentials.
	MongoURI string
	// MongoDB is the database name to use.
	MongoDB string
	// HTTPAddr is the address the internal HTTP API listens on (e.g. ":8080").
	HTTPAddr string
}

// Load reads configuration from the environment. It returns an error naming
// every missing required variable, rather than starting with defaults that
// would hide a deployment mistake.
func Load() (Config, error) {
	cfg := Config{
		MongoURI: os.Getenv("MONGO_URI"),
		MongoDB:  os.Getenv("MONGO_DB"),
		HTTPAddr: os.Getenv("USERS_HTTP_ADDR"),
	}

	var missing []string
	if cfg.MongoURI == "" {
		missing = append(missing, "MONGO_URI")
	}
	if cfg.MongoDB == "" {
		missing = append(missing, "MONGO_DB")
	}
	if cfg.HTTPAddr == "" {
		missing = append(missing, "USERS_HTTP_ADDR")
	}
	if len(missing) > 0 {
		return Config{}, fmt.Errorf("missing required environment variables: %v", missing)
	}
	return cfg, nil
}
