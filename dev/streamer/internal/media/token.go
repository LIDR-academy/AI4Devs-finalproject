// Package media is the streamer server side of LiveKit media: minting access
// tokens with server-enforced publish grants, the shared room-end cascade, and
// the webhook-driven reaper. The LiveKit SDK is confined to internal/livekit,
// behind the Tokener and RoomController interfaces defined here.
package media

import (
	"context"
	"fmt"

	"github.com/quickchat/streamer/internal/chat"
)

// OwnerLookup returns a room's owner userId (satisfied by stream.Service). It
// returns an error (ErrNotFound) when the room is not live.
type OwnerLookup interface {
	Owner(ctx context.Context, roomID string) (ownerID string, err error)
}

// Tokener signs a room-scoped LiveKit access token for an identity, granting
// subscribe always and publish per canPublish.
type Tokener interface {
	Sign(identity, room string, canPublish bool) (string, error)
}

// Token is the media-token response.
type Token struct {
	Token    string `json:"token"`
	URL      string `json:"url"`
	Identity string `json:"identity"`
	Role     string `json:"role"`
}

// TokenService mints media tokens. Publish permission is decided here from
// ownership and encoded into the token grant — never left to the client.
type TokenService struct {
	owners    OwnerLookup
	tokener   Tokener
	publicURL string
}

// NewTokenService returns a TokenService. publicURL is the browser-facing LiveKit
// URL returned to clients (never the server-to-server URL or the secret).
func NewTokenService(owners OwnerLookup, tokener Tokener, publicURL string) *TokenService {
	return &TokenService{owners: owners, tokener: tokener, publicURL: publicURL}
}

// Mint returns a media token for the room. The room must be live (else the
// OwnerLookup error — ErrNotFound — is returned for a 404). An authenticated
// owner grants publish+subscribe as their account username (role streamer); an
// authenticated non-owner grants subscribe-only as their username (role viewer);
// an anonymous caller grants subscribe-only under a generated viewer identity.
func (s *TokenService) Mint(ctx context.Context, roomID, userID, username string, authed bool) (Token, error) {
	ownerID, err := s.owners.Owner(ctx, roomID)
	if err != nil {
		return Token{}, err
	}

	var identity, role string
	var canPublish bool
	switch {
	case authed && userID == ownerID:
		identity, role, canPublish = username, chat.RoleStreamer, true
	case authed:
		identity, role, canPublish = username, chat.RoleViewer, false
	default:
		identity, err = chat.NewViewerID()
		if err != nil {
			return Token{}, fmt.Errorf("generating viewer identity: %w", err)
		}
		role, canPublish = chat.RoleViewer, false
	}

	token, err := s.tokener.Sign(identity, roomID, canPublish)
	if err != nil {
		return Token{}, fmt.Errorf("signing media token for room %s: %w", roomID, err)
	}
	return Token{Token: token, URL: s.publicURL, Identity: identity, Role: role}, nil
}
