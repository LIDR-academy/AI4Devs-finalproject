# Multi-stage build: compile a static binary, then run it on a minimal image.
# Configuration comes only from the environment at runtime — no secrets baked in.

FROM golang:1.26.2-alpine AS build
WORKDIR /src

# Cache dependencies first for faster rebuilds.
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -o /out/users ./cmd/users

FROM gcr.io/distroless/static-debian12:nonroot
# Internal-only service; the port is reachable only on the compose network.
EXPOSE 8080
USER nonroot:nonroot
COPY --from=build /out/users /users
ENTRYPOINT ["/users"]
