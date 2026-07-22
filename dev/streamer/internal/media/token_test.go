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

// fakeOwner returns a fixed owner id, or ErrNotFound for a missing room.
type fakeOwner struct {
	owner   string
	missing bool
}

func (f fakeOwner) Owner(context.Context, string) (string, error) {
	if f.missing {
		return "", stream.ErrNotFound
	}
	return f.owner, nil
}

func TestMintOwnerGetsPublishGrant(t *testing.T) {
	tok := &captureTokener{}
	svc := media.NewTokenService(fakeOwner{owner: "user-1"}, tok, "ws://pub:7880")

	out, err := svc.Mint(context.Background(), "room1", "user-1", "alice", true)
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

func TestMintNonOwnerGetsSubscribeOnly(t *testing.T) {
	tok := &captureTokener{}
	svc := media.NewTokenService(fakeOwner{owner: "user-1"}, tok, "ws://pub:7880")

	// Authenticated non-owner.
	out, err := svc.Mint(context.Background(), "room1", "user-2", "bob", true)
	if err != nil {
		t.Fatalf("Mint: %v", err)
	}
	if out.Role != "viewer" || out.Identity != "bob" {
		t.Fatalf("non-owner token = %+v, want viewer/bob", out)
	}
	if tok.canPublish {
		t.Fatalf("non-owner grant has publish=true, want false")
	}
}

func TestMintAnonymousGetsSubscribeOnlyGeneratedID(t *testing.T) {
	tok := &captureTokener{}
	svc := media.NewTokenService(fakeOwner{owner: "user-1"}, tok, "ws://pub:7880")

	out, err := svc.Mint(context.Background(), "room1", "", "", false)
	if err != nil {
		t.Fatalf("Mint: %v", err)
	}
	if out.Role != "viewer" {
		t.Fatalf("role = %q, want viewer", out.Role)
	}
	if !regexp.MustCompile(`^[a-z]+-[a-z0-9]+$`).MatchString(out.Identity) {
		t.Fatalf("anon identity = %q, want generated word-alphanumeric", out.Identity)
	}
	if tok.canPublish {
		t.Fatalf("anon grant has publish=true, want false")
	}
}

func TestMintNonexistentRoom(t *testing.T) {
	tok := &captureTokener{}
	svc := media.NewTokenService(fakeOwner{missing: true}, tok, "ws://pub:7880")

	if _, err := svc.Mint(context.Background(), "nope", "user-1", "alice", true); !errors.Is(err, stream.ErrNotFound) {
		t.Fatalf("Mint err = %v, want ErrNotFound", err)
	}
	if tok.called {
		t.Fatalf("token signed for a nonexistent room")
	}
}
