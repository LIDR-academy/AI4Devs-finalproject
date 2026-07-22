package user

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"strings"
)

// words is the pool of human-friendly stems for generated usernames. Kept
// short and neutral; the alphanumeric suffix supplies the uniqueness.
var words = []string{
	"amber", "brave", "cedar", "delta", "ember", "frost", "grove", "hazel",
	"indigo", "jade", "koala", "lotus", "maple", "nova", "onyx", "pixel",
	"quartz", "raven", "sage", "tiger", "umber", "violet", "willow", "zephyr",
}

// suffixAlphabet is the alphabet for the random suffix: lowercase letters and
// digits (word+alphanumeric style, matching the ephemeral chat ids).
const suffixAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789"

// suffixLen is the length of the random suffix. Four base-36 characters give
// ~1.7M combinations per word, so collisions are vanishingly rare and the
// unique index plus regeneration handles the remainder.
const suffixLen = 4

// GenerateUsername returns a random word+alphanumeric username such as
// "maple7k2q". It uses crypto/rand; an error is returned only if the system
// randomness source fails, which callers must treat as fatal for the request.
func GenerateUsername() (string, error) {
	word, err := pick(words)
	if err != nil {
		return "", fmt.Errorf("picking username word: %w", err)
	}

	var b strings.Builder
	b.WriteString(word)
	for i := 0; i < suffixLen; i++ {
		c, err := pickByte(suffixAlphabet)
		if err != nil {
			return "", fmt.Errorf("generating username suffix: %w", err)
		}
		b.WriteByte(c)
	}
	return b.String(), nil
}

// pick returns a uniformly random element of s.
func pick(s []string) (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(int64(len(s))))
	if err != nil {
		return "", err
	}
	return s[n.Int64()], nil
}

// pickByte returns a uniformly random byte from the alphabet.
func pickByte(alphabet string) (byte, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
	if err != nil {
		return 0, err
	}
	return alphabet[n.Int64()], nil
}
