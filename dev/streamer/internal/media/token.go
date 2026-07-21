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

// CreatorVerifier verifies a room's creatorKey (satisfied by stream.Service). It
// returns the room's username and whether the presented key matches, or an error
// (ErrNotFound) when the room is not live.
type CreatorVerifier interface {
	VerifyCreator(ctx context.Context, roomID, key string) (isCreator bool, username string, err error)
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
// creatorKey validity and encoded into the token grant — never left to the client.
type TokenService struct {
	verifier  CreatorVerifier
	tokener   Tokener
	publicURL string
}

// NewTokenService returns a TokenService. publicURL is the browser-facing LiveKit
// URL returned to clients (never the server-to-server URL or the secret).
func NewTokenService(verifier CreatorVerifier, tokener Tokener, publicURL string) *TokenService {
	return &TokenService{verifier: verifier, tokener: tokener, publicURL: publicURL}
}

// Mint returns a media token for the room. A valid creatorKey grants
// publish+subscribe as the stream username (role streamer); an absent or
// non-matching key grants subscribe-only under a generated viewer identity (role
// viewer) — a silent downgrade, not an error. It returns the verifier's error
// (ErrNotFound) when the room is not live.
func (s *TokenService) Mint(ctx context.Context, roomID, creatorKey string) (Token, error) {
	isCreator, username, err := s.verifier.VerifyCreator(ctx, roomID, creatorKey)
	if err != nil {
		return Token{}, err
	}

	identity := username
	role := chat.RoleStreamer
	canPublish := true
	if !isCreator {
		identity, err = chat.NewViewerID()
		if err != nil {
			return Token{}, fmt.Errorf("generating viewer identity: %w", err)
		}
		role = chat.RoleViewer
		canPublish = false
	}

	token, err := s.tokener.Sign(identity, roomID, canPublish)
	if err != nil {
		return Token{}, fmt.Errorf("signing media token for room %s: %w", roomID, err)
	}

	return Token{Token: token, URL: s.publicURL, Identity: identity, Role: role}, nil
}
