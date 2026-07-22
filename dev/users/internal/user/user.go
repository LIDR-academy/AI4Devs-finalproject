// Package user is the QuickChat users domain: it defines what a user is and
// owns the idempotent get-or-create logic that turns a verified email into a
// stable identity (id + username). It knows nothing about HTTP or MongoDB —
// persistence is reached through the Repository interface defined here.
package user

import "time"

// User is a QuickChat user record. ID is the users-service identifier used
// platform-wide as the ownership/userId claim; Username is a random,
// unique, immutable (v0) display name.
type User struct {
	ID        string    `json:"id" bson:"_id"`
	Email     string    `json:"email" bson:"email"`
	Username  string    `json:"username" bson:"username"`
	CreatedAt time.Time `json:"-" bson:"createdAt"`
}
