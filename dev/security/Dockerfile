# Multi-stage build: compile a static binary, then run it on a minimal image.
# Configuration comes entirely from the environment at runtime — no secrets are
# ever baked into the image.

# --- build stage ---
FROM golang:1.26 AS build
WORKDIR /src

# Cache dependencies first.
COPY go.mod go.sum ./
RUN go mod download

# Build a static binary (no cgo) so it runs on a scratch/minimal base.
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/security ./cmd/security

# --- run stage ---
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
COPY --from=build /out/security /security

# Documented default; the actual port is read from PORT at runtime.
EXPOSE 8080
USER nonroot:nonroot
ENTRYPOINT ["/security"]
