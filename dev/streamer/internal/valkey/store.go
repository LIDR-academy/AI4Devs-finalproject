// Package valkey implements the stream.Store and chat.MessageStore interfaces on
// top of Valkey (Redis-protocol compatible), keeping the client dependency
// confined here.
//
// Storage model:
//   - streams (SET)                — every live stream id.
//   - stream:{id} (HASH)           — {username, title, description, creatorKey};
//     creatorKey is private and never returned in a listing.
//   - room:{id}:messages (STREAM)  — the room's capped message log; each entry's
//     id is the server-authoritative message id and pagination cursor.
package valkey

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/quickchat/streamer/internal/chat"
	"github.com/quickchat/streamer/internal/stream"
)

const (
	streamsKey      = "streams"
	streamKeyPrefix = "stream:"
	opTimeout       = 3 * time.Second
)

// Store persists streams and per-room chat messages in Valkey.
type Store struct {
	client  *redis.Client
	chatCap int64
}

// New returns a Store connected to Valkey at addr. chatMaxMessages is the
// per-room ring-buffer cap. The connection is lazy; use Ping to verify.
func New(addr, password string, db int, chatMaxMessages int) *Store {
	return &Store{
		client: redis.NewClient(&redis.Options{
			Addr:         addr,
			Password:     password,
			DB:           db,
			DialTimeout:  opTimeout,
			ReadTimeout:  opTimeout,
			WriteTimeout: opTimeout,
		}),
		chatCap: int64(chatMaxMessages),
	}
}

// Close releases the underlying client and its connections.
func (s *Store) Close() error { return s.client.Close() }

// Ping reports whether Valkey is reachable, for readiness checks.
func (s *Store) Ping(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, opTimeout)
	defer cancel()
	if err := s.client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("pinging valkey: %w", err)
	}
	return nil
}

// --- stream.Store ---

// Add stores a new live stream and its private creatorKey in one transaction.
func (s *Store) Add(ctx context.Context, st stream.Stream, creatorKey string) error {
	ctx, cancel := context.WithTimeout(ctx, opTimeout)
	defer cancel()

	_, err := s.client.TxPipelined(ctx, func(p redis.Pipeliner) error {
		p.SAdd(ctx, streamsKey, st.ID)
		p.HSet(ctx, streamKey(st.ID),
			"username", st.Username,
			"title", st.Title,
			"description", st.Description,
			"creatorKey", creatorKey,
		)
		return nil
	})
	if err != nil {
		return fmt.Errorf("adding stream %s: %w", st.ID, err)
	}
	return nil
}

// Remove deletes the stream, returning stream.ErrNotFound when its id was not a
// live member. It does not delete the room's messages — the caller does that via
// DeleteRoom so message storage has one owner.
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

// List returns all live streams, never including creatorKey.
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
			continue // deleted between SMEMBERS and HGETALL
		}
		out = append(out, stream.Stream{
			ID:          id,
			Username:    fields["username"],
			Title:       fields["title"],
			Description: fields["description"],
		})
	}
	return out, nil
}

// Creator returns the stream's username and private creatorKey, or
// stream.ErrNotFound when the stream is not live.
func (s *Store) Creator(ctx context.Context, id string) (string, string, error) {
	ctx, cancel := context.WithTimeout(ctx, opTimeout)
	defer cancel()

	fields, err := s.client.HGetAll(ctx, streamKey(id)).Result()
	if err != nil {
		return "", "", fmt.Errorf("reading stream %s: %w", id, err)
	}
	if len(fields) == 0 {
		return "", "", stream.ErrNotFound
	}
	return fields["username"], fields["creatorKey"], nil
}

// Exists reports whether a stream with the id is live.
func (s *Store) Exists(ctx context.Context, id string) (bool, error) {
	ctx, cancel := context.WithTimeout(ctx, opTimeout)
	defer cancel()

	ok, err := s.client.SIsMember(ctx, streamsKey, id).Result()
	if err != nil {
		return false, fmt.Errorf("checking stream %s: %w", id, err)
	}
	return ok, nil
}

// --- chat.MessageStore ---

// Append stores a message on the room's capped stream and returns it with the
// server-authoritative entry id. The exact MAXLEN keeps stored history at or
// below the cap (never above), dropping oldest.
func (s *Store) Append(ctx context.Context, roomID string, m chat.Message) (chat.Message, error) {
	ctx, cancel := context.WithTimeout(ctx, opTimeout)
	defer cancel()

	id, err := s.client.XAdd(ctx, &redis.XAddArgs{
		Stream: messagesKey(roomID),
		MaxLen: s.chatCap,
		Approx: false,
		Values: map[string]any{
			"sender": m.Sender,
			"role":   m.Role,
			"text":   m.Text,
			"ts":     m.Ts,
		},
	}).Result()
	if err != nil {
		return chat.Message{}, fmt.Errorf("appending message to room %s: %w", roomID, err)
	}
	m.ID = id
	return m, nil
}

// History returns up to limit messages ordered oldest→newest. With an empty
// before it returns the latest page; otherwise messages strictly older than the
// before cursor. nextCursor is the oldest id of a full page, or "" when older
// history is exhausted.
func (s *Store) History(ctx context.Context, roomID, before string, limit int) ([]chat.Message, string, error) {
	ctx, cancel := context.WithTimeout(ctx, opTimeout)
	defer cancel()

	// XREVRANGE returns newest→oldest; start is the high end.
	start := "+"
	if before != "" {
		start = "(" + before // exclusive of the cursor
	}
	entries, err := s.client.XRevRangeN(ctx, messagesKey(roomID), start, "-", int64(limit)).Result()
	if err != nil {
		return nil, "", fmt.Errorf("reading history for room %s: %w", roomID, err)
	}

	// Reverse to oldest→newest.
	msgs := make([]chat.Message, len(entries))
	for i, e := range entries {
		msgs[len(entries)-1-i] = chat.Message{
			ID:     e.ID,
			Sender: strField(e.Values, "sender"),
			Role:   strField(e.Values, "role"),
			Text:   strField(e.Values, "text"),
			Ts:     strField(e.Values, "ts"),
		}
	}

	next := ""
	if len(msgs) == limit && len(msgs) > 0 {
		next = msgs[0].ID // oldest in this page; older history may remain
	}
	return msgs, next, nil
}

// DeleteRoom removes a room's message log.
func (s *Store) DeleteRoom(ctx context.Context, roomID string) error {
	ctx, cancel := context.WithTimeout(ctx, opTimeout)
	defer cancel()
	if err := s.client.Del(ctx, messagesKey(roomID)).Err(); err != nil {
		return fmt.Errorf("deleting messages for room %s: %w", roomID, err)
	}
	return nil
}

func streamKey(id string) string   { return streamKeyPrefix + id }
func messagesKey(id string) string { return "room:" + id + ":messages" }

// strField reads a string field from a stream entry's values, tolerating a
// missing or non-string value.
func strField(values map[string]any, key string) string {
	if v, ok := values[key].(string); ok {
		return v
	}
	return ""
}
