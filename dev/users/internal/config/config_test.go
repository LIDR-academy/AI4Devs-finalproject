package config

import (
	"strings"
	"testing"
)

func TestLoad_AllPresent(t *testing.T) {
	t.Setenv("MONGO_URI", "mongodb://mongo:27017")
	t.Setenv("MONGO_DB", "quickchat")
	t.Setenv("USERS_HTTP_ADDR", ":8080")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if cfg.MongoURI != "mongodb://mongo:27017" || cfg.MongoDB != "quickchat" || cfg.HTTPAddr != ":8080" {
		t.Fatalf("unexpected config: %+v", cfg)
	}
}

func TestLoad_MissingReported(t *testing.T) {
	// Only MONGO_URI set; the other two are reported missing.
	t.Setenv("MONGO_URI", "mongodb://mongo:27017")
	t.Setenv("MONGO_DB", "")
	t.Setenv("USERS_HTTP_ADDR", "")

	_, err := Load()
	if err == nil {
		t.Fatalf("expected error when required vars are missing")
	}
	if !strings.Contains(err.Error(), "MONGO_DB") || !strings.Contains(err.Error(), "USERS_HTTP_ADDR") {
		t.Fatalf("error should name the missing vars, got: %v", err)
	}
	if strings.Contains(err.Error(), "MONGO_URI") {
		t.Fatalf("error should not name the present var MONGO_URI, got: %v", err)
	}
}
