#!/bin/bash
# Development setup script for SEPE Templates Comparator

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Check if required files exist
check_files() {
    local files=(
        "docker-compose.yml"
        "backend/Dockerfile"
        "frontend/Dockerfile"
        "env.example"
    )
    
    for file in "${files[@]}"; do
        if [[ ! -f "$file" ]]; then
            print_error "Required file $file not found"
            exit 1
        fi
    done
    
    print_success "All required files found"
}

# Create .env file if it doesn't exist
setup_env() {
    if [[ ! -f ".env" ]]; then
        print_status "Creating .env file from env.example..."
        cp env.example .env
        print_warning "Please review and update the .env file with your specific configuration"
    else
        print_status ".env file already exists"
    fi
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    local dirs=(
        "backend/uploads"
        "backend/logs"
        "database/backups"
        "logs"
    )
    
    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
        print_status "Created directory: $dir"
    done
    
    print_success "Directories created"
}

# Build and start services
start_services() {
    print_status "Building and starting services..."
    
    # Build images
    docker-compose build --no-cache
    
    # Start services
    docker-compose up -d
    
    print_success "Services started"
}

# Wait for services to be ready
wait_for_services() {
    print_status "Waiting for services to be ready..."
    
    # Wait for database
    print_status "Waiting for PostgreSQL..."
    until docker-compose exec postgres pg_isready -U sepe_user -d sepe_comparator; do
        sleep 2
    done
    
    # Wait for Redis
    print_status "Waiting for Redis..."
    until docker-compose exec redis redis-cli ping; do
        sleep 2
    done
    
    # Wait for backend
    print_status "Waiting for backend API..."
    until curl -f http://localhost:8000/api/v1/health &>/dev/null; do
        sleep 5
    done
    
    print_success "All services are ready"
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    docker-compose exec backend alembic upgrade head
    
    print_success "Database migrations completed"
}

# Create initial superuser (optional)
create_superuser() {
    read -p "Do you want to create an initial superuser? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Creating superuser..."
        docker-compose exec backend python -c "
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models.user import User
import os

db = next(get_db())
email = input('Email: ')
password = input('Password: ')
full_name = input('Full name: ')

user = User(
    email=email,
    hashed_password=get_password_hash(password),
    full_name=full_name,
    is_active=True,
    is_superuser=True
)

db.add(user)
db.commit()
print('Superuser created successfully!')
"
    fi
}

# Display status and URLs
show_status() {
    print_success "Development environment setup complete!"
    echo
    echo "🚀 Services are running:"
    echo "  - Frontend:  http://localhost:3000"
    echo "  - Backend:   http://localhost:8000"
    echo "  - API Docs:  http://localhost:8000/docs"
    echo "  - PostgreSQL: localhost:5432"
    echo "  - Redis:     localhost:6379"
    echo
    echo "📝 Useful commands:"
    echo "  - View logs:     docker-compose logs -f"
    echo "  - Stop services: docker-compose down"
    echo "  - Restart:       docker-compose restart"
    echo "  - Shell access:  docker-compose exec backend bash"
    echo
    print_status "Happy coding! 🎉"
}

# Main execution
main() {
    print_status "Setting up SEPE Templates Comparator development environment..."
    
    check_docker
    check_files
    setup_env
    create_directories
    start_services
    wait_for_services
    run_migrations
    create_superuser
    show_status
}

# Run main function
main "$@"
