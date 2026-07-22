// Command security is the QuickChat authentication and token authority. It
// fronts SuperTokens (email magic link), exposes the /auth/* and JWKS endpoints,
// and stamps the account identity (userId + username) into every access token.
package main

import (
	"context"
	"log"
	"net"
	"os/signal"
	"syscall"
	"time"

	"github.com/quickchat/security/internal/auth"
	"github.com/quickchat/security/internal/config"
	"github.com/quickchat/security/internal/server"
	"github.com/quickchat/security/internal/users"
)

// usersCallTimeout bounds each get-or-create call to the users service.
const usersCallTimeout = 5 * time.Second

func main() {
	cfg, err := config.Load()
	if err != nil {
		// Fail fast and loudly on configuration problems (Constitution §9).
		log.Fatalf("security: configuration error: %v", err)
	}

	usersClient := users.NewClient(cfg.UsersGetOrCreateURL, usersCallTimeout)

	if err := auth.Init(cfg, usersClient); err != nil {
		log.Fatalf("security: %v", err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	srv := server.New(net.JoinHostPort("", cfg.Port), auth.Middleware)

	log.Printf("security: listening on :%s (auth base path %s)", cfg.Port, cfg.APIBasePath)
	if err := server.Run(ctx, srv); err != nil {
		log.Fatalf("security: server error: %v", err)
	}
	log.Print("security: shut down cleanly")
}
