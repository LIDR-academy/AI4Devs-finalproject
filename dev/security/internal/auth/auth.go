// Package auth wires the SuperTokens Passwordless (email magic link) and Session
// recipes for the security service. It configures header-transfer auth, exposes
// the standard /auth/* endpoints and the JWKS endpoint via the SuperTokens
// middleware, and stamps the account identity (userId + username) into every
// new access token so downstream services derive ownership from it.
package auth

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/quickchat/security/internal/config"
	"github.com/quickchat/security/internal/users"

	"github.com/supertokens/supertokens-golang/recipe/passwordless"
	"github.com/supertokens/supertokens-golang/recipe/passwordless/plessmodels"
	"github.com/supertokens/supertokens-golang/recipe/session"
	"github.com/supertokens/supertokens-golang/recipe/session/sessmodels"
	"github.com/supertokens/supertokens-golang/supertokens"
)

const (
	// ClaimUserID is the access-token claim holding the users-service id. It is
	// the ownership identity for downstream services — never the SuperTokens id.
	ClaimUserID = "userId"
	// ClaimUsername is the access-token claim holding the account username.
	ClaimUsername = "username"

	// magicLinkFlow selects the SuperTokens Passwordless magic-link flow.
	magicLinkFlow = "MAGIC_LINK"

	// provisionTimeout bounds the users get-or-create call made while a session
	// is being created. The override has no request context of its own.
	provisionTimeout = 5 * time.Second
)

// IdentityProvider resolves the account identity for a verified email. It is
// defined here, where it is consumed, and satisfied by *users.Client.
type IdentityProvider interface {
	GetOrCreate(ctx context.Context, email string) (users.Identity, error)
}

// Init initializes the SuperTokens SDK with the Passwordless and Session recipes.
// It configures header-transfer mode and installs the claim-stamping override.
// It returns an error if the SDK cannot be initialized (fatal at startup).
func Init(cfg config.Config, provider IdentityProvider) error {
	basePath := cfg.APIBasePath
	err := supertokens.Init(supertokens.TypeInput{
		Supertokens: &supertokens.ConnectionInfo{
			ConnectionURI: cfg.SuperTokensConnectionURI,
			APIKey:        cfg.SuperTokensAPIKey,
		},
		AppInfo: supertokens.AppInfo{
			AppName:       cfg.AppName,
			APIDomain:     cfg.APIDomain,
			WebsiteDomain: cfg.WebsiteDomain,
			APIBasePath:   &basePath,
		},
		RecipeList: []supertokens.Recipe{
			passwordless.Init(plessmodels.TypeInput{
				FlowType: magicLinkFlow,
				ContactMethodEmail: plessmodels.ContactMethodEmailConfig{
					Enabled: true,
				},
			}),
			session.Init(sessionConfig(provider)),
		},
	})
	if err != nil {
		return fmt.Errorf("initializing supertokens: %w", err)
	}
	return nil
}

// sessionConfig builds the Session recipe input: header transfer mode plus the
// CreateNewSession override that stamps identity claims.
func sessionConfig(provider IdentityProvider) *sessmodels.TypeInput {
	return &sessmodels.TypeInput{
		GetTokenTransferMethod: func(*http.Request, bool, supertokens.UserContext) sessmodels.TokenTransferMethod {
			return sessmodels.HeaderTransferMethod
		},
		Override: &sessmodels.OverrideStruct{
			Functions: func(original sessmodels.RecipeInterface) sessmodels.RecipeInterface {
				originalCreateNewSession := *original.CreateNewSession
				stamped := func(userID string, accessTokenPayload map[string]interface{}, sessionDataInDatabase map[string]interface{}, disableAntiCsrf *bool, tenantId string, userContext supertokens.UserContext) (sessmodels.SessionContainer, error) {
					email, err := emailForUser(userID)
					if err != nil {
						return nil, err
					}
					ctx, cancel := context.WithTimeout(context.Background(), provisionTimeout)
					defer cancel()

					claims, err := buildIdentityClaims(ctx, provider, email)
					if err != nil {
						// Fail closed: no session, no identity-less token.
						return nil, err
					}
					accessTokenPayload = mergeClaims(accessTokenPayload, claims)
					return originalCreateNewSession(userID, accessTokenPayload, sessionDataInDatabase, disableAntiCsrf, tenantId, userContext)
				}
				original.CreateNewSession = &stamped
				return original
			},
		},
	}
}

// buildIdentityClaims resolves the account identity for a verified email and
// returns the claim map to stamp. It is fail-closed: a provisioning error or an
// incomplete record yields an error and no claims, so no identity-less token is
// ever issued.
func buildIdentityClaims(ctx context.Context, provider IdentityProvider, email string) (map[string]interface{}, error) {
	identity, err := provider.GetOrCreate(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("provisioning identity: %w", err)
	}
	if identity.UserID == "" || identity.Username == "" {
		return nil, fmt.Errorf("provisioning identity: incomplete record (id or username empty)")
	}
	return map[string]interface{}{
		ClaimUserID:   identity.UserID,
		ClaimUsername: identity.Username,
	}, nil
}

// mergeClaims returns payload with the identity claims added, allocating a map
// if the SDK passed a nil payload.
func mergeClaims(payload, claims map[string]interface{}) map[string]interface{} {
	if payload == nil {
		payload = map[string]interface{}{}
	}
	for k, v := range claims {
		payload[k] = v
	}
	return payload
}

// emailForUser looks up the verified email for a SuperTokens user id. It errors
// if the user is missing or has no email, so a session is never created without
// an email to provision identity from.
func emailForUser(userID string) (string, error) {
	user, err := passwordless.GetUserByID(userID)
	if err != nil {
		return "", fmt.Errorf("resolving user %s: %w", userID, err)
	}
	if user == nil || user.Email == nil || *user.Email == "" {
		return "", fmt.Errorf("resolving user %s: account has no email", userID)
	}
	return *user.Email, nil
}

// Middleware wraps a handler with the SuperTokens middleware, which serves the
// /auth/* endpoints and the JWKS endpoint and verifies sessions.
func Middleware(next http.Handler) http.Handler {
	return supertokens.Middleware(next)
}

// CORSHeaders returns the headers SuperTokens requires the caller to allow via
// CORS, for the portal to complete the header-transfer auth flow.
func CORSHeaders() []string {
	return supertokens.GetAllCORSHeaders()
}
