// Command streamer runs the QuickChat streamer HTTP service: the /streams API
// backed by Valkey, plus /healthz and /readyz. Invoked with the "healthcheck"
// subcommand it probes its own /readyz and exits 0/1, so a shell-less container
// image can still have a HEALTHCHECK.
package main

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/quickchat/streamer/internal/chat"
	"github.com/quickchat/streamer/internal/config"
	"github.com/quickchat/streamer/internal/httpapi"
	"github.com/quickchat/streamer/internal/hub"
	"github.com/quickchat/streamer/internal/livekit"
	"github.com/quickchat/streamer/internal/media"
	"github.com/quickchat/streamer/internal/stream"
	"github.com/quickchat/streamer/internal/valkey"
)

// Server timeouts — no zero-value (unbounded) timeouts (Constitution Go §6).
const (
	readHeaderTimeout = 5 * time.Second
	readTimeout       = 10 * time.Second
	writeTimeout      = 10 * time.Second
	idleTimeout       = 60 * time.Second
	shutdownTimeout   = 10 * time.Second

	// Media (LiveKit) tuning. Documented in the README.
	mediaTokenTTL  = 1 * time.Hour    // minted token lifetime
	departureGrace = 30 * time.Second // publisher gone → reap after
	creationGrace  = 2 * time.Minute  // room never gets a publisher → reap after
)

func main() {
	if len(os.Args) > 1 && os.Args[1] == "healthcheck" {
		if err := healthcheck(); err != nil {
			fmt.Fprintln(os.Stderr, "healthcheck:", err)
			os.Exit(1)
		}
		return
	}

	if err := run(); err != nil {
		slog.Error("streamer exited with error", "error", err)
		os.Exit(1)
	}
}

// run loads config, wires the service, and serves until a termination signal.
func run() error {
	log := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("loading config: %w", err)
	}

	store := valkey.New(cfg.ValkeyAddr, cfg.ValkeyPassword, cfg.ValkeyDB, cfg.ChatMaxMessages)
	defer func() { _ = store.Close() }()

	streamSvc := stream.NewService(store)
	chatSvc := chat.NewService(store, cfg.ChatMaxLength, cfg.ChatPageSize, nil)
	realtime := hub.New(log)

	// WebSocket connections are hijacked and outlive graceful HTTP shutdown, so
	// close them explicitly once the server stops.
	defer realtime.CloseAll()

	// Media: LiveKit token authority, room control, and the abandoned-room reaper.
	lkClient := livekit.New(cfg.LiveKitURL, cfg.LiveKitAPIKey, cfg.LiveKitAPISecret, mediaTokenTTL)
	tokenSvc := media.NewTokenService(streamSvc, lkClient, cfg.LiveKitPublicURL)
	ender := media.NewRoomEnder(chatSvc, streamSvc, realtime, lkClient, log)
	reaper := media.NewReaper(ender, streamSvc, departureGrace, creationGrace, log)
	defer reaper.Shutdown()

	srv := &http.Server{
		Handler: httpapi.NewHandler(httpapi.Deps{
			Streams:    streamSvc,
			Chat:       chatSvc,
			Hub:        realtime,
			Ready:      store,
			Minter:     tokenSvc,
			Publishers: lkClient,
			Ender:      ender,
			Webhooks:   lkClient,
			Events:     reaper,
			Log:        log,
		}),
		ReadHeaderTimeout: readHeaderTimeout,
		ReadTimeout:       readTimeout,
		WriteTimeout:      writeTimeout,
		IdleTimeout:       idleTimeout,
	}

	ln, err := net.Listen("tcp", cfg.HTTPAddr)
	if err != nil {
		return fmt.Errorf("listening on %s: %w", cfg.HTTPAddr, err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	log.Info("streamer listening", "addr", ln.Addr().String())
	return serve(ctx, srv, ln, log)
}

// serve runs srv on ln until ctx is cancelled, then shuts down gracefully. The
// server goroutine is owned here and always stops: either it errors out, or
// Shutdown closes it. It returns the first fatal error, or nil on clean stop.
func serve(ctx context.Context, srv *http.Server, ln net.Listener, log *slog.Logger) error {
	serveErr := make(chan error, 1)
	go func() {
		err := srv.Serve(ln)
		if errors.Is(err, http.ErrServerClosed) {
			err = nil
		}
		serveErr <- err
	}()

	select {
	case err := <-serveErr:
		return err
	case <-ctx.Done():
		log.Info("shutdown signal received")
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		return fmt.Errorf("graceful shutdown: %w", err)
	}
	log.Info("streamer stopped cleanly")
	return nil
}

// healthcheck probes the local /readyz and returns an error unless it is 200.
func healthcheck() error {
	addr := strings.TrimSpace(os.Getenv("STREAMER_ADDR"))
	if addr == "" {
		addr = ":8080"
	}
	host, port, err := net.SplitHostPort(addr)
	if err != nil {
		return fmt.Errorf("parsing STREAMER_ADDR %q: %w", addr, err)
	}
	if host == "" {
		host = "127.0.0.1"
	}

	url := "http://" + net.JoinHostPort(host, port) + "/readyz"
	client := &http.Client{Timeout: 3 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return fmt.Errorf("requesting %s: %w", url, err)
	}
	defer func() { _ = resp.Body.Close() }()
	_, _ = io.Copy(io.Discard, resp.Body)

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("readyz returned status %d", resp.StatusCode)
	}
	return nil
}
