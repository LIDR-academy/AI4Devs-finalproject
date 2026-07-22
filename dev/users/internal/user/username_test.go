package user

import (
	"regexp"
	"testing"
)

// usernamePattern matches a word stem followed by the fixed-length lowercase
// alphanumeric suffix.
var usernamePattern = regexp.MustCompile(`^[a-z]+[a-z0-9]{4}$`)

func TestGenerateUsername_Shape(t *testing.T) {
	t.Parallel()
	for i := 0; i < 100; i++ {
		got, err := GenerateUsername()
		if err != nil {
			t.Fatalf("GenerateUsername: %v", err)
		}
		if !usernamePattern.MatchString(got) {
			t.Fatalf("username %q does not match expected word+alphanumeric shape", got)
		}
	}
}

func TestGenerateUsername_Varies(t *testing.T) {
	t.Parallel()
	const n = 500
	seen := make(map[string]struct{}, n)
	for i := 0; i < n; i++ {
		got, err := GenerateUsername()
		if err != nil {
			t.Fatalf("GenerateUsername: %v", err)
		}
		seen[got] = struct{}{}
	}
	// With ~1.7M combinations per word, 500 draws should be overwhelmingly
	// distinct; allow a tiny margin without making the test flaky.
	if len(seen) < n-2 {
		t.Fatalf("only %d/%d usernames were distinct, generator not varying enough", len(seen), n)
	}
}
