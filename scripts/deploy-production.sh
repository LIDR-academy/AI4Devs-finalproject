#!/bin/bash

# Production Deployment Script for bonÀreaGo
# This script handles the complete deployment process for production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENV_FILE=".env.production"
BACKUP_DIR="/backups/bonareago"
LOG_FILE="/var/log/bonareago/deploy.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -eq 0 ]]; then
        warning "Running as root. Consider using a dedicated user for deployment."
    fi
}

# Verify critical environment variables
verify_env_vars() {
    log "Verifying critical environment variables..."
    
    if [[ ! -f "$ENV_FILE" ]]; then
        error "Production environment file $ENV_FILE not found!"
    fi
    
    source "$ENV_FILE"
    
    # Critical security checks
    if [[ "$AUTH_DISABLED" == "true" ]]; then
        error "CRITICAL: AUTH_DISABLED is set to true in production! This is a security risk."
    fi
    
    if [[ "$REQUIRE_ROLE_EMPLOYEE" != "true" ]]; then
        error "CRITICAL: REQUIRE_ROLE_EMPLOYEE is not set to true in production!"
    fi
    
    if [[ -z "$DATABASE_URL" ]]; then
        error "DATABASE_URL is not configured!"
    fi
    
    if [[ -z "$OIDC_ISSUER_URI" ]]; then
        error "OIDC_ISSUER_URI is not configured!"
    fi
    
    success "Environment variables verified"
}

# Create backup of current deployment
create_backup() {
    log "Creating backup of current deployment..."
    
    mkdir -p "$BACKUP_DIR"
    BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
    
    # Backup database
    if command -v pg_dump &> /dev/null; then
        log "Backing up database..."
        pg_dump "$DATABASE_URL" > "$BACKUP_DIR/database-$BACKUP_NAME.sql"
        success "Database backup created: $BACKUP_DIR/database-$BACKUP_NAME.sql"
    else
        warning "pg_dump not found, skipping database backup"
    fi
    
    # Backup configuration files
    log "Backing up configuration files..."
    tar -czf "$BACKUP_DIR/config-$BACKUP_NAME.tar.gz" \
        docker-compose.yml \
        .env.production \
        Backend/gateway/nginx.conf \
        scripts/
    
    success "Configuration backup created: $BACKUP_DIR/config-$BACKUP_NAME.tar.gz"
}

# Pull latest Docker images
pull_images() {
    log "Pulling latest Docker images..."
    
    # Pull all service images
    docker pull ghcr.io/bonareago/auth-service:latest
    docker pull ghcr.io/bonareago/users-service:latest
    docker pull ghcr.io/bonareago/trips-service:latest
    docker pull ghcr.io/bonareago/booking-service:latest
    docker pull ghcr.io/bonareago/matching-service:latest
    docker pull ghcr.io/bonareago/notification-service:latest
    docker pull ghcr.io/bonareago/frontend:latest
    
    success "Docker images pulled successfully"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Start database if not running
    docker-compose up -d postgres
    
    # Wait for database to be ready
    log "Waiting for database to be ready..."
    sleep 10
    
    # Run Flyway migrations for each service
    services=("auth-service" "users-service" "trips-service" "booking-service" "matching-service" "notification-service")
    
    for service in "${services[@]}"; do
        log "Running migrations for $service..."
        docker run --rm \
            --network host \
            -v "$(pwd)/Backend/$service/src/main/resources/db/migration:/flyway/sql" \
            flyway/flyway:latest \
            -url="$DATABASE_URL" \
            -user="$POSTGRES_USER" \
            -password="$POSTGRES_PASSWORD" \
            migrate
    done
    
    success "Database migrations completed"
}

# Deploy services with rolling update
deploy_services() {
    log "Deploying services with rolling update..."
    
    # Services to deploy
    services=("auth-service" "users-service" "trips-service" "booking-service" "matching-service" "notification-service" "frontend")
    
    for service in "${services[@]}"; do
        log "Deploying $service..."
        
        # Stop old container
        docker-compose stop "$service" || true
        
        # Remove old container
        docker-compose rm -f "$service" || true
        
        # Start new container
        docker-compose up -d "$service"
        
        # Wait for service to be healthy
        log "Waiting for $service to be healthy..."
        sleep 30
        
        # Health check
        if [[ "$service" == "frontend" ]]; then
            HEALTH_URL="http://localhost:3000"
        else
            HEALTH_URL="http://localhost:8080/api/health"
        fi
        
        if curl -f "$HEALTH_URL" > /dev/null 2>&1; then
            success "$service deployed successfully"
        else
            error "$service health check failed"
        fi
    done
}

# Run post-deployment tests
post_deployment_tests() {
    log "Running post-deployment tests..."
    
    # Test API endpoints
    endpoints=(
        "http://localhost:8080/api/health"
        "http://localhost:8080/api/auth/health"
        "http://localhost:8080/api/users/health"
        "http://localhost:8080/api/trips/health"
        "http://localhost:8080/api/bookings/health"
        "http://localhost:8080/api/matches/health"
        "http://localhost:8080/api/notifications/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log "Testing $endpoint..."
        if curl -f "$endpoint" > /dev/null 2>&1; then
            success "$endpoint is healthy"
        else
            error "$endpoint health check failed"
        fi
    done
    
    # Test frontend
    if curl -f "http://localhost:3000" > /dev/null 2>&1; then
        success "Frontend is accessible"
    else
        error "Frontend health check failed"
    fi
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove unused images older than 7 days
    docker images --filter "dangling=true" --filter "until=168h" -q | xargs -r docker rmi
    
    success "Cleanup completed"
}

# Main deployment function
main() {
    log "Starting production deployment..."
    
    check_permissions
    verify_env_vars
    create_backup
    pull_images
    run_migrations
    deploy_services
    post_deployment_tests
    cleanup
    
    success "Production deployment completed successfully!"
    log "Deployment log saved to: $LOG_FILE"
}

# Handle script arguments
case "${1:-}" in
    --dry-run)
        log "DRY RUN MODE - No actual deployment will be performed"
        verify_env_vars
        success "Dry run completed - environment is ready for deployment"
        ;;
    --rollback)
        log "Rolling back to previous deployment..."
        # Implementation for rollback would go here
        error "Rollback functionality not implemented yet"
        ;;
    --help)
        echo "Usage: $0 [--dry-run|--rollback|--help]"
        echo "  --dry-run    Verify environment without deploying"
        echo "  --rollback   Rollback to previous deployment"
        echo "  --help       Show this help message"
        ;;
    *)
        main
        ;;
esac
