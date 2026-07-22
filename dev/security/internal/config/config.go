// Package config loads and validates the security service configuration from
// the environment. Configuration never comes from files or flags: secrets (the
// SuperTokens API key) must be injected by the runtime, never baked in.
package config

import (
	"fmt"
	"os"
	"strings"
)

// Config holds every setting the security service needs to run. All values are
// read from the environment at startup; missing required values are fatal.
type Config struct {
	// SuperTokensConnectionURI is the managed-cloud core URI.
	SuperTokensConnectionURI string
	// SuperTokensAPIKey authenticates to the SuperTokens core. Secret: it must
	// never be logged, returned in a response, or written to a committed file.
	SuperTokensAPIKey string
	// APIDomain is the domain SuperTokens serves the /auth API under.
	APIDomain string
	// WebsiteDomain is the portal origin (used for magic-link building / CORS).
	WebsiteDomain string
	// APIBasePath is the base path for the SuperTokens API. The JWKS endpoint is
	// served at APIBasePath + "/jwt/jwks.json".
	APIBasePath string
	// AppName is the SuperTokens application name.
	AppName string
	// UsersGetOrCreateURL is the full URL of the users service get-or-create
	// endpoint, reachable only inside the compose network.
	UsersGetOrCreateURL string
	// Port is the TCP port the HTTP server listens on.
	Port string
}

// requiredVar names an environment variable that must be present and non-empty.
type requiredVar struct {
	name string
	dest *string
}

// Load reads the configuration from the environment and validates it. It returns
// an error listing every missing required variable so a misconfiguration is
// fixed in one pass rather than one variable at a time.
func Load() (Config, error) {
	cfg := Config{
		APIBasePath: getEnvOr("SECURITY_API_BASE_PATH", "/auth"),
		AppName:     getEnvOr("SECURITY_APP_NAME", "QuickChat"),
		Port:        getEnvOr("PORT", "8080"),
	}

	required := []requiredVar{
		{"SUPERTOKENS_CONNECTION_URI", &cfg.SuperTokensConnectionURI},
		{"SUPERTOKENS_API_KEY", &cfg.SuperTokensAPIKey},
		{"SECURITY_API_DOMAIN", &cfg.APIDomain},
		{"SECURITY_WEBSITE_DOMAIN", &cfg.WebsiteDomain},
		{"USERS_GET_OR_CREATE_URL", &cfg.UsersGetOrCreateURL},
	}

	var missing []string
	for _, v := range required {
		value := strings.TrimSpace(os.Getenv(v.name))
		if value == "" {
			missing = append(missing, v.name)
			continue
		}
		*v.dest = value
	}

	if len(missing) > 0 {
		return Config{}, fmt.Errorf("missing required environment variables: %s", strings.Join(missing, ", "))
	}

	return cfg, nil
}

// String renders the configuration with the API key redacted, so a Config that
// is accidentally logged never leaks the secret (Constitution §10).
func (c Config) String() string {
	return fmt.Sprintf(
		"Config{ConnectionURI:%s, APIKey:[REDACTED], APIDomain:%s, WebsiteDomain:%s, APIBasePath:%s, AppName:%s, UsersGetOrCreateURL:%s, Port:%s}",
		c.SuperTokensConnectionURI, c.APIDomain, c.WebsiteDomain, c.APIBasePath, c.AppName, c.UsersGetOrCreateURL, c.Port,
	)
}

// getEnvOr returns the trimmed value of the named variable, or fallback if it is
// unset or blank.
func getEnvOr(name, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(name)); v != "" {
		return v
	}
	return fallback
}
