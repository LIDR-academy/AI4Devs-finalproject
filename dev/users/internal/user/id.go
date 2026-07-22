package user

import (
	"crypto/rand"
	"encoding/hex"
)

// newObjectID returns a random 24-character hex string used as a user's id and
// MongoDB _id. It is generated in the domain so the package stays free of the
// Mongo driver; a hex string is a valid _id and travels cleanly as the userId
// claim. It panics only if the system randomness source fails, which is an
// unrecoverable condition.
func newObjectID() string {
	var b [12]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic("user: reading random bytes for id: " + err.Error())
	}
	return hex.EncodeToString(b[:])
}
