# Multi-stage build: compile a static binary, then run it on a minimal image.

# --- build stage ---
FROM golang:1.26 AS build

WORKDIR /src

# Cache module downloads.
COPY go.mod go.sum ./
RUN go mod download

# Build.
COPY . .
# CGO disabled → a static binary that runs on a scratch/distroless base.
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /streamer ./cmd/streamer

# --- runtime stage ---
# distroless static: no shell, no package manager, minimal attack surface.
FROM gcr.io/distroless/static-debian12:nonroot

# The service reads all configuration from the environment (see .env.example).
ENV STREAMER_ADDR=:8080
EXPOSE 8080

COPY --from=build /streamer /streamer

# Container healthcheck uses the binary's own healthcheck subcommand, which probes
# /readyz — no shell or wget needed in this shell-less image.
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD ["/streamer", "healthcheck"]

USER nonroot:nonroot
ENTRYPOINT ["/streamer"]
