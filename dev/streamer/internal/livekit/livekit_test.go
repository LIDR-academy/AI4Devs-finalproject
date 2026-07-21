package livekit_test

import (
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	lkauth "github.com/livekit/protocol/auth"

	"github.com/quickchat/streamer/internal/livekit"
)

const (
	testKey    = "devkey"
	testSecret = "devsecret-at-least-32-bytes-long!!"
)

func TestSignGrantsPublishOnlyWhenAsked(t *testing.T) {
	c := livekit.New("http://lk:7880", testKey, testSecret, time.Hour)

	tests := []struct {
		name       string
		canPublish bool
	}{
		{name: "streamer", canPublish: true},
		{name: "viewer", canPublish: false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, err := c.Sign("alice", "room1", tt.canPublish)
			if err != nil {
				t.Fatalf("Sign: %v", err)
			}

			v, err := lkauth.ParseAPIToken(token)
			if err != nil {
				t.Fatalf("ParseAPIToken: %v", err)
			}
			_, grants, err := v.Verify(testSecret)
			if err != nil {
				t.Fatalf("Verify: %v", err)
			}
			if grants.Video == nil {
				t.Fatal("no video grant")
			}
			if grants.Video.Room != "room1" || !grants.Video.RoomJoin {
				t.Fatalf("grant not room-scoped: %+v", grants.Video)
			}
			if grants.Video.CanPublish == nil || *grants.Video.CanPublish != tt.canPublish {
				t.Fatalf("CanPublish = %v, want %v", grants.Video.CanPublish, tt.canPublish)
			}
			if grants.Video.CanSubscribe == nil || !*grants.Video.CanSubscribe {
				t.Fatalf("CanSubscribe = %v, want true", grants.Video.CanSubscribe)
			}
			if v.Identity() != "alice" {
				t.Fatalf("identity = %q, want alice", v.Identity())
			}
		})
	}
}

// signedWebhookRequest builds a request LiveKit-style: an Authorization JWT whose
// sha256 claim matches the body.
func signedWebhookRequest(t *testing.T, key, secret string, body []byte) *http.Request {
	t.Helper()
	sum := sha256.Sum256(body)
	token, err := lkauth.NewAccessToken(key, secret).
		SetValidFor(time.Hour).
		SetSha256(base64.StdEncoding.EncodeToString(sum[:])).
		ToJWT()
	if err != nil {
		t.Fatalf("building webhook token: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, "/livekit/webhook", bytes.NewReader(body))
	req.Header.Set("Authorization", token)
	req.Header.Set("Content-Type", "application/webhook+json")
	return req
}

func TestReceiveWebhookAcceptsValid(t *testing.T) {
	c := livekit.New("http://lk:7880", testKey, testSecret, time.Hour)
	body := []byte(`{"event":"participant_left","room":{"name":"r1"},"participant":{"identity":"alice"}}`)

	ev, err := c.ReceiveWebhook(signedWebhookRequest(t, testKey, testSecret, body))
	if err != nil {
		t.Fatalf("ReceiveWebhook: %v", err)
	}
	if ev.Type != "participant_left" || ev.Room != "r1" || ev.Identity != "alice" {
		t.Fatalf("event = %+v, want participant_left/r1/alice", ev)
	}
}

func TestReceiveWebhookRejectsUnsigned(t *testing.T) {
	c := livekit.New("http://lk:7880", testKey, testSecret, time.Hour)
	req := httptest.NewRequest(http.MethodPost, "/livekit/webhook", bytes.NewReader([]byte(`{"event":"x"}`)))

	if _, err := c.ReceiveWebhook(req); err == nil {
		t.Fatal("expected an error for an unsigned webhook")
	}
}

func TestReceiveWebhookRejectsTampered(t *testing.T) {
	c := livekit.New("http://lk:7880", testKey, testSecret, time.Hour)
	// Sign for one body, deliver a different body → sha256 mismatch.
	req := signedWebhookRequest(t, testKey, testSecret, []byte(`{"event":"room_started","room":{"name":"r1"}}`))
	req.Body = http.NoBody
	req = httptest.NewRequest(http.MethodPost, "/livekit/webhook", bytes.NewReader([]byte(`{"event":"room_finished","room":{"name":"HACKED"}}`)))
	req.Header = signedWebhookRequest(t, testKey, testSecret, []byte(`{"event":"room_started","room":{"name":"r1"}}`)).Header

	if _, err := c.ReceiveWebhook(req); err == nil {
		t.Fatal("expected an error for a tampered webhook body")
	}
}
