// Package livekit is the LiveKit adapter: it confines the LiveKit Go server SDK
// and implements token signing, server-to-server room control, and webhook
// signature verification. It is the only package that imports the LiveKit SDK.
package livekit

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/livekit/protocol/auth"
	"github.com/livekit/protocol/livekit"
	"github.com/livekit/protocol/webhook"
	lksdk "github.com/livekit/server-sdk-go/v2"
	"github.com/twitchtv/twirp"
)

// Client talks to a LiveKit server: signs access tokens, controls rooms, and
// verifies webhooks.
type Client struct {
	apiKey    string
	apiSecret string
	tokenTTL  time.Duration
	room      *lksdk.RoomServiceClient
	keys      auth.KeyProvider
}

// New returns a Client. url is the server-to-server LiveKit API URL (e.g.
// http://livekit:7880). tokenTTL bounds minted tokens.
func New(url, apiKey, apiSecret string, tokenTTL time.Duration) *Client {
	return &Client{
		apiKey:    apiKey,
		apiSecret: apiSecret,
		tokenTTL:  tokenTTL,
		room:      lksdk.NewRoomServiceClient(url, apiKey, apiSecret),
		keys:      auth.NewSimpleKeyProvider(apiKey, apiSecret),
	}
}

// Sign mints a room-scoped access token for identity, granting subscribe always
// and publish per canPublish. CanPublish is set explicitly (a nil grant would let
// LiveKit default to all permissions).
func (c *Client) Sign(identity, room string, canPublish bool) (string, error) {
	subscribe := true
	token, err := auth.NewAccessToken(c.apiKey, c.apiSecret).
		SetIdentity(identity).
		SetValidFor(c.tokenTTL).
		SetVideoGrant(&auth.VideoGrant{
			RoomJoin:     true,
			Room:         room,
			CanPublish:   &canPublish,
			CanSubscribe: &subscribe,
		}).
		ToJWT()
	if err != nil {
		return "", fmt.Errorf("signing access token: %w", err)
	}
	return token, nil
}

// DeleteRoom deletes the LiveKit room, disconnecting all participants.
func (c *Client) DeleteRoom(ctx context.Context, room string) error {
	if _, err := c.room.DeleteRoom(ctx, &livekit.DeleteRoomRequest{Room: room}); err != nil {
		if isNotFound(err) {
			return nil // already gone
		}
		return fmt.Errorf("deleting livekit room %s: %w", room, err)
	}
	return nil
}

// WebhookEvent is a minimal, SDK-free view of a LiveKit webhook.
type WebhookEvent struct {
	Type     string
	Room     string
	Identity string
}

// ReceiveWebhook verifies the request signature against the API key/secret and
// returns the decoded event. An unsigned or tampered request yields an error and
// no event.
func (c *Client) ReceiveWebhook(r *http.Request) (WebhookEvent, error) {
	ev, err := webhook.ReceiveWebhookEvent(r, c.keys)
	if err != nil {
		return WebhookEvent{}, fmt.Errorf("verifying webhook: %w", err)
	}
	out := WebhookEvent{Type: ev.GetEvent()}
	if room := ev.GetRoom(); room != nil {
		out.Room = room.GetName()
	}
	if p := ev.GetParticipant(); p != nil {
		out.Identity = p.GetIdentity()
	}
	return out, nil
}

// isNotFound reports whether err is a Twirp not-found error (room absent), as
// opposed to a transport failure.
func isNotFound(err error) bool {
	var terr twirp.Error
	return errors.As(err, &terr) && terr.Code() == twirp.NotFound
}
