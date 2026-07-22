// Package mongostore is the MongoDB-backed implementation of the users
// Repository. It owns the collection wiring and the unique indexes that make
// get-or-create idempotent, and it translates driver errors into the domain's
// sentinel errors.
package mongostore

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"

	"quickchat/users/internal/user"
)

const collectionName = "users"

// Repo persists users in a MongoDB collection.
type Repo struct {
	coll *mongo.Collection
}

// Connect dials MongoDB, verifies the connection, ensures the unique indexes,
// and returns the repository together with a disconnect function the caller
// must defer. It fails fast if the database is unreachable or the indexes
// cannot be created.
func Connect(ctx context.Context, uri, dbName string) (*Repo, func(context.Context) error, error) {
	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, nil, fmt.Errorf("connecting to mongodb: %w", err)
	}
	if err := client.Ping(ctx, nil); err != nil {
		_ = client.Disconnect(ctx)
		return nil, nil, fmt.Errorf("pinging mongodb: %w", err)
	}

	coll := client.Database(dbName).Collection(collectionName)
	if err := ensureIndexes(ctx, coll); err != nil {
		_ = client.Disconnect(ctx)
		return nil, nil, fmt.Errorf("ensuring indexes: %w", err)
	}

	return &Repo{coll: coll}, client.Disconnect, nil
}

// ensureIndexes creates the unique indexes on email and username. Uniqueness is
// enforced by the database, which is what makes concurrent get-or-create safe.
func ensureIndexes(ctx context.Context, coll *mongo.Collection) error {
	_, err := coll.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("uniq_email"),
		},
		{
			Keys:    bson.D{{Key: "username", Value: 1}},
			Options: options.Index().SetUnique(true).SetName("uniq_username"),
		},
	})
	return err
}

// FindByEmail returns the user for email, or user.ErrNotFound if none exists.
func (r *Repo) FindByEmail(ctx context.Context, email string) (user.User, error) {
	var u user.User
	err := r.coll.FindOne(ctx, bson.M{"email": email}).Decode(&u)
	if errors.Is(err, mongo.ErrNoDocuments) {
		return user.User{}, user.ErrNotFound
	}
	if err != nil {
		return user.User{}, fmt.Errorf("finding user by email: %w", err)
	}
	return u, nil
}

// Insert persists u, mapping unique-index violations to the domain sentinels.
// On the rare duplicate-key path it distinguishes an email collision from a
// username collision by checking whether the email already exists, avoiding
// fragile error-string parsing.
func (r *Repo) Insert(ctx context.Context, u user.User) error {
	_, err := r.coll.InsertOne(ctx, u)
	if err == nil {
		return nil
	}
	if mongo.IsDuplicateKeyError(err) {
		if _, ferr := r.FindByEmail(ctx, u.Email); ferr == nil {
			return user.ErrDuplicateEmail
		}
		return user.ErrDuplicateUsername
	}
	return fmt.Errorf("inserting user: %w", err)
}

// ConnectTimeout is a sensible default context timeout for the initial connect.
const ConnectTimeout = 10 * time.Second
