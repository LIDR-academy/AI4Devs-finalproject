package media_test

import (
	"context"
	"errors"
	"regexp"
	"testing"

	"github.com/quickchat/streamer/internal/media"
	"github.com/quickchat/streamer/internal/stream"
)

// captureTokener records the grant it was asked to sign.
type captureTokener struct {
	identity   string
	room       string
	canPublish bool
	called     bool
}

func (c *captureTokener) Sign(identity, room string, canPublish bool) (string, error) {
	c.identity, c.room, c.canPublish, c.called = identity, room, canPublish, true
	return "signed-token", nil
}

type fakeVerifier struct {
	isCreator bool
	username  string
	err       error
}

func (f fakeVerifier) VerifyCreator(context.Context, string, string) (bool, string, error) {
	return f.isCreator, f.username, f.err
}

func TestMintCreatorGetsPublishGrant(t *testing.T) {
	tok := &captureTokener{}
	svc := media.NewTokenService(fakeVerifier{isCreator: true, username: "alice"}, tok, "ws://pub:7880")

	out, err := svc.Mint(context.Background(), "room1", "goodkey")
	if err != nil {
		t.Fatalf("Mint: %v", err)
	}
	if out.Role != "streamer" || out.Identity != "alice" || out.URL != "ws://pub:7880" || out.Token == "" {
		t.Fatalf("token = %+v, want streamer/alice/pub-url", out)
	}
	if !tok.canPublish || tok.room != "room1" || tok.identity != "alice" {
		t.Fatalf("grant = %+v, want publish for alice room1", tok)
	}
}

func TestMintViewerGetsSubscribeOnlyGrant(t *testing.T) {
	tok := &captureTokener{}
	// Non-matching key: isCreator false, but the room's username is still returned.
	svc := media.NewTokenService(fakeVerifier{isCreator: false, username: "alice"}, tok, "ws://pub:7880")

	out, err := svc.Mint(context.Background(), "room1", "wrongkey")
	if err != nil {
		t.Fatalf("Mint: %v", err)
	}
	if out.Role != "viewer" {
		t.Fatalf("role = %q, want viewer", out.Role)
	}
	if out.Identity == "alice" || !regexp.MustCompile(`^[a-z]+-[a-z0-9]+$`).MatchString(out.Identity) {
		t.Fatalf("identity = %q, want a generated word-alphanumeric id (not the username)", out.Identity)
	}
	if tok.canPublish {
		t.Fatalf("viewer grant has publish=true, want false")
	}
	if tok.room != "room1" {
		t.Fatalf("grant room = %q, want room1 (room-scoped)", tok.room)
	}
}

func TestMintNonexistentRoomPropagatesNotFound(t *testing.T) {
	tok := &captureTokener{}
	svc := media.NewTokenService(fakeVerifier{err: stream.ErrNotFound}, tok, "ws://pub:7880")

	_, err := svc.Mint(context.Background(), "nope", "")
	if !errors.Is(err, stream.ErrNotFound) {
		t.Fatalf("Mint err = %v, want ErrNotFound", err)
	}
	if tok.called {
		t.Fatalf("token was signed for a nonexistent room")
	}
}
