// Package valkey implements the stream.Store interface on top of Valkey
// (Redis-protocol compatible), keeping the client dependency confined here.
//
// Storage model: a SET "streams" holds every live id, and a HASH "stream:{id}"
// holds that stream's fields. A stream is live if and only if its id is in the
// set. Writes touch both keys in a single transaction so they never diverge.
package valkey

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/quickchat/streamer/internal/stream"
)

const (
	// streamsKey is the SET of live stream ids.
	streamsKey = "streams"
	// streamKeyPrefix prefixes each per-stream HASH: "stream:{id}".
	streamKeyPrefix = "stream:"
	// opTimeout bounds every individual Valkey operation.
	opTimeout = 3 * time.Second
)

// Store persists live streams in Valkey.
type Store struct {
	client *redis.Client
}

// New returns a Store connected to Valkey at addr. The connection is lazy; use
// Ping to verify reachability.
func New(addr, password string, db int) *Store {
	return &Store{client: redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     password,
		DB:           db,
		DialTimeout:  opTimeout,
		ReadTimeout:  opTimeout,
		WriteTimeout: opTimeout,
	})}
}

// Close releases the underlying client and its connections.
func (s *Store) Close() error {
	return s.client.Close()
}

// Ping reports whether Valkey is reachable, for readiness checks.
func (s *Store) Ping(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, opTimeout)
	defer cancel()
	if err := s.client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("pinging valkey: %w", err)
	}
	return nil
}

// Add stores a new live stream, writing the set membership and the hash in one
// transaction.
func (s *Store) Add(ctx context.Context, st stream.Stream) error {
	ctx, cancel := context.WithTimeout(ctx, opTimeout)
	defer cancel()

	_, err := s.client.TxPipelined(ctx, func(p redis.Pipeliner) error {
		p.SAdd(ctx, streamsKey, st.ID)
		p.HSet(ctx, streamKey(st.ID), "title", st.Title, "description", st.Description)
		return nil
	})
	if err != nil {
		return fmt.Errorf("adding stream %s: %w", st.ID, err)
	}
	return nil
}

// Remove deletes the stream, returning stream.ErrNotFound when its id was not a
// live member. The set removal and hash deletion happen in one transaction.
func (s *Store) Remove(ctx context.Context, id string) error {
	ctx, cancel := context.WithTimeout(ctx, opTimeout)
	defer cancel()

	var removed *redis.IntCmd
	_, err := s.client.TxPipelined(ctx, func(p redis.Pipeliner) error {
		removed = p.SRem(ctx, streamsKey, id)
		p.Del(ctx, streamKey(id))
		return nil
	})
	if err != nil {
		return fmt.Errorf("removing stream %s: %w", id, err)
	}
	if removed.Val() == 0 {
		return stream.ErrNotFound
	}
	return nil
}

// List returns all live streams. It reads the id set, then fetches each hash in a
// pipeline; a hash that vanished between the two steps is treated as not live and
// omitted. Order is unspecified.
func (s *Store) List(ctx context.Context) ([]stream.Stream, error) {
	ctx, cancel := context.WithTimeout(ctx, opTimeout)
	defer cancel()

	ids, err := s.client.SMembers(ctx, streamsKey).Result()
	if err != nil {
		return nil, fmt.Errorf("listing stream ids: %w", err)
	}
	if len(ids) == 0 {
		return []stream.Stream{}, nil
	}

	cmds := make([]*redis.MapStringStringCmd, len(ids))
	pipe := s.client.Pipeline()
	for i, id := range ids {
		cmds[i] = pipe.HGetAll(ctx, streamKey(id))
	}
	if _, err := pipe.Exec(ctx); err != nil {
		return nil, fmt.Errorf("fetching stream hashes: %w", err)
	}

	out := make([]stream.Stream, 0, len(ids))
	for i, id := range ids {
		fields, err := cmds[i].Result()
		if err != nil {
			return nil, fmt.Errorf("reading stream %s: %w", id, err)
		}
		if len(fields) == 0 {
			// Deleted between SMEMBERS and HGETALL — not live.
			continue
		}
		out = append(out, stream.Stream{
			ID:          id,
			Title:       fields["title"],
			Description: fields["description"],
		})
	}
	return out, nil
}

func streamKey(id string) string {
	return streamKeyPrefix + id
}
