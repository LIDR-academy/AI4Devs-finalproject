// Package hub is the streamer realtime core: an in-process broadcast hub plus the
// per-connection WebSocket lifecycle. A single streamer replica fans messages out
// in memory (no Valkey pub/sub). It is the only package that imports the
// WebSocket library.
//
// Concurrency contract (Constitution §5): every connection is served by exactly
// two goroutines — a read pump and a write pump. The write pump is the sole
// closer of the socket; the read pump only reads and requests a stop. Stopping is
// a single idempotent signal (the client's stop channel), so a room-ended error
// is written before the close rather than racing it. ServeWS blocks until both
// pumps stop, so a returned ServeWS proves the connection left no goroutine
// behind.
package hub

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"sync"
	"time"

	"github.com/coder/websocket"

	"github.com/quickchat/streamer/internal/chat"
)

const (
	// sendBuffer bounds a client's outbound queue; a client that can't keep up is
	// disconnected rather than allowed to stall the room.
	sendBuffer = 32
	// readLimit caps an inbound WebSocket frame (transport safety; app-level length
	// is enforced by the chat service).
	readLimit = 8 << 10
	// joinTimeout bounds how long we wait for the initial join frame.
	joinTimeout = 10 * time.Second
	// writeTimeout bounds a single outbound frame write.
	writeTimeout = 10 * time.Second
)

// Error reason strings are a stable micro-contract with the portal. A TERMINAL
// error is always immediately followed by the server closing the connection; the
// portal keys off these exact reasons (and/or the error-then-close invariant) to
// stop reconnecting. A NON-TERMINAL error leaves the connection open and is never
// followed by a close, so the portal keeps the socket and may retry.
const (
	// Terminal reasons (error frame is followed by a connection close).
	ReasonRoomEnded    = "room ended"     // stream deleted while connected (design D3)
	ReasonRoomNotFound = "room not found" // join to a room that is not live
	ReasonExpectedJoin = "expected join"  // malformed/absent initial join frame

	// Non-terminal reasons (connection stays open; not followed by a close).
	ReasonInvalidFrame = "invalid frame"          // unparseable or non-message frame
	ReasonSendFailed   = "could not send message" // transient storage failure
)

// Authenticator resolves a room's creator identity for a presented key.
type Authenticator interface {
	// VerifyCreator reports whether key matches the room's creatorKey and returns
	// the room's username. It returns a non-nil error when the room is not live.
	VerifyCreator(ctx context.Context, roomID, key string) (isCreator bool, username string, err error)
}

// Poster validates and stores an inbound chat message, returning it with its
// server-authoritative id.
type Poster interface {
	Post(ctx context.Context, roomID, sender, role, text string) (chat.Message, error)
}

// client is one live WebSocket connection in a room.
type client struct {
	sender string
	role   string
	send   chan []byte

	stopOnce sync.Once
	stop     chan struct{}
}

// requestStop signals the write pump to flush and close (idempotent).
func (c *client) requestStop() {
	c.stopOnce.Do(func() { close(c.stop) })
}

// Hub tracks live connections per room and fans out broadcasts.
type Hub struct {
	log *slog.Logger

	mu    sync.Mutex
	rooms map[string]map[*client]struct{}
}

// New returns an empty Hub.
func New(log *slog.Logger) *Hub {
	return &Hub{log: log, rooms: make(map[string]map[*client]struct{})}
}

func (h *Hub) register(roomID string, c *client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	room := h.rooms[roomID]
	if room == nil {
		room = make(map[*client]struct{})
		h.rooms[roomID] = room
	}
	room[c] = struct{}{}
}

func (h *Hub) unregister(roomID string, c *client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	room := h.rooms[roomID]
	if room == nil {
		return
	}
	delete(room, c)
	if len(room) == 0 {
		delete(h.rooms, roomID)
	}
}

// Broadcast delivers payload to every connection in the room. Delivery is
// non-blocking: a connection whose buffer is full is stopped (disconnected) so
// one slow consumer never stalls the room.
func (h *Hub) Broadcast(roomID string, payload []byte) {
	h.mu.Lock()
	defer h.mu.Unlock()
	for c := range h.rooms[roomID] {
		select {
		case c.send <- payload:
		default:
			c.requestStop()
		}
	}
}

// CloseRoom ends a room: it best-effort queues a "room ended" error to each
// connection then signals each to stop. The write pump flushes queued frames
// before closing, so connections receive the error then a clean close.
func (h *Hub) CloseRoom(roomID string) {
	payload := mustMarshal(errorFrame{Type: "error", Reason: ReasonRoomEnded})

	h.mu.Lock()
	room := h.rooms[roomID]
	delete(h.rooms, roomID)
	h.mu.Unlock()

	for c := range room {
		select {
		case c.send <- payload:
		default:
		}
		c.requestStop()
	}
}

// CloseAll stops every live connection in every room. Used at shutdown, when
// hijacked WebSocket connections outlive graceful HTTP shutdown.
func (h *Hub) CloseAll() {
	h.mu.Lock()
	rooms := h.rooms
	h.rooms = make(map[string]map[*client]struct{})
	h.mu.Unlock()

	for _, room := range rooms {
		for c := range room {
			c.requestStop()
		}
	}
}

// RoomSize returns the number of live connections in a room (for tests/metrics).
func (h *Hub) RoomSize(roomID string) int {
	h.mu.Lock()
	defer h.mu.Unlock()
	return len(h.rooms[roomID])
}

// ServeWS upgrades the request, runs the join handshake, and serves the
// connection until it drops or the room closes. It returns only after both pumps
// have stopped and the connection is unregistered.
func (h *Hub) ServeWS(w http.ResponseWriter, r *http.Request, roomID string, auth Authenticator, poster Poster) {
	// InsecureSkipVerify: streamer is not browser-facing — it sits behind the
	// single-origin reverse proxy (design D4), so origin enforcement is the proxy's
	// job, not ours. There is no CORS surface here.
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{InsecureSkipVerify: true})
	if err != nil {
		return // Accept already wrote the HTTP error
	}
	conn.SetReadLimit(readLimit)

	// The connection context comes from the request; it is cancelled only if the
	// HTTP server tears the request down. Graceful stops go through the client's
	// stop channel so the read is never cancelled out from under a pending write.
	ctx := r.Context()

	sender, role, ok := h.handshake(ctx, conn, roomID, auth)
	if !ok {
		return
	}

	c := &client{sender: sender, role: role, send: make(chan []byte, sendBuffer), stop: make(chan struct{})}
	h.register(roomID, c)
	defer h.unregister(roomID, c)

	var wg sync.WaitGroup
	wg.Add(2)
	go func() { defer wg.Done(); h.readPump(ctx, conn, roomID, c, poster) }()
	go func() { defer wg.Done(); h.writePump(conn, c) }()
	wg.Wait()
}

// handshake reads the join frame, resolves identity, and sends welcome. It
// returns ok=false (after closing) when the join is invalid or the room is gone.
func (h *Hub) handshake(ctx context.Context, conn *websocket.Conn, roomID string, auth Authenticator) (sender, role string, ok bool) {
	joinCtx, cancel := context.WithTimeout(ctx, joinTimeout)
	defer cancel()

	_, data, err := conn.Read(joinCtx)
	if err != nil {
		_ = conn.Close(websocket.StatusPolicyViolation, "join expected")
		return "", "", false
	}

	var f inFrame
	if err := json.Unmarshal(data, &f); err != nil || f.Type != "join" {
		h.sendError(conn, ReasonExpectedJoin)
		_ = conn.Close(websocket.StatusPolicyViolation, "join expected")
		return "", "", false
	}

	isCreator, username, err := auth.VerifyCreator(ctx, roomID, f.CreatorKey)
	if err != nil {
		// Room not live (or unreachable): not joinable.
		h.sendError(conn, ReasonRoomNotFound)
		_ = conn.Close(websocket.StatusPolicyViolation, "room not found")
		return "", "", false
	}

	if isCreator {
		role, sender = chat.RoleStreamer, username
	} else {
		role = chat.RoleViewer
		sender, err = chat.NewViewerID()
		if err != nil {
			h.log.Error("generating viewer id", "error", err)
			_ = conn.Close(websocket.StatusInternalError, "internal error")
			return "", "", false
		}
	}

	if err := h.write(conn, mustMarshal(welcomeFrame{Type: "welcome", Sender: sender, Role: role})); err != nil {
		_ = conn.Close(websocket.StatusNormalClosure, "")
		return "", "", false
	}
	return sender, role, true
}

// readPump reads frames until the connection fails or is closed by the write
// pump. It never closes the socket; on exit it requests a stop so the write pump
// finishes too.
func (h *Hub) readPump(ctx context.Context, conn *websocket.Conn, roomID string, c *client, poster Poster) {
	defer c.requestStop()
	for {
		_, data, err := conn.Read(ctx)
		if err != nil {
			return
		}

		var f inFrame
		if err := json.Unmarshal(data, &f); err != nil || f.Type != "message" {
			h.queue(c, mustMarshal(errorFrame{Type: "error", Reason: ReasonInvalidFrame}))
			continue
		}

		m, err := poster.Post(ctx, roomID, c.sender, c.role, f.Text)
		if err != nil {
			var ve chat.ValidationError
			if errors.As(err, &ve) {
				h.queue(c, mustMarshal(errorFrame{Type: "error", Reason: ve.Message}))
				continue
			}
			h.log.Error("posting message", "room", roomID, "error", err)
			h.queue(c, mustMarshal(errorFrame{Type: "error", Reason: ReasonSendFailed}))
			continue
		}
		h.Broadcast(roomID, mustMarshal(messageFrame{Type: "message", Message: m}))
	}
}

// writePump is the sole writer and sole closer of the socket. It writes queued
// frames until stop is requested, then flushes any remaining frames (e.g. a
// room-ended error) and closes.
func (h *Hub) writePump(conn *websocket.Conn, c *client) {
	for {
		select {
		case <-c.stop:
			h.flushAndClose(conn, c)
			return
		case payload := <-c.send:
			if err := h.write(conn, payload); err != nil {
				c.requestStop()
				h.flushAndClose(conn, c)
				return
			}
		}
	}
}

func (h *Hub) flushAndClose(conn *websocket.Conn, c *client) {
	for {
		select {
		case payload := <-c.send:
			_ = h.write(conn, payload)
		default:
			// CloseNow (no close handshake) unblocks the concurrent read pump
			// immediately; queued frames were already written to the socket above.
			_ = conn.CloseNow()
			return
		}
	}
}

// queue enqueues a frame for a single connection (non-blocking; stops the
// connection if its buffer is full).
func (h *Hub) queue(c *client, payload []byte) {
	select {
	case c.send <- payload:
	default:
		c.requestStop()
	}
}

func (h *Hub) write(conn *websocket.Conn, payload []byte) error {
	// A frame write gets its own bounded deadline, independent of the connection's
	// stop signal, so a queued frame (e.g. a room-ended error) is still delivered
	// while the connection is closing.
	ctx, cancel := context.WithTimeout(context.Background(), writeTimeout)
	defer cancel()
	return conn.Write(ctx, websocket.MessageText, payload)
}

func (h *Hub) sendError(conn *websocket.Conn, reason string) {
	_ = h.write(conn, mustMarshal(errorFrame{Type: "error", Reason: reason}))
}

// --- frames ---

type inFrame struct {
	Type       string `json:"type"`
	CreatorKey string `json:"creatorKey"`
	Text       string `json:"text"`
}

type welcomeFrame struct {
	Type   string `json:"type"`
	Sender string `json:"sender"`
	Role   string `json:"role"`
}

type errorFrame struct {
	Type   string `json:"type"`
	Reason string `json:"reason"`
}

type messageFrame struct {
	Type    string       `json:"type"`
	Message chat.Message `json:"message"`
}

// mustMarshal marshals a frame whose shape is fixed and known to encode; a
// failure would be a programming error.
func mustMarshal(v any) []byte {
	b, err := json.Marshal(v)
	if err != nil {
		panic("hub: marshaling frame: " + err.Error())
	}
	return b
}
