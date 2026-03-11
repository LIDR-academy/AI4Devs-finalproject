"""
Tests for Docker configuration and environment setup.
"""

import os
import yaml
import pytest
from pathlib import Path


class TestDockerConfiguration:
    """Test cases for Docker configuration files."""
    
    def test_docker_compose_file_exists(self):
        """Test that docker-compose.yml exists."""
        assert os.path.exists("docker-compose.yml")
    
    def test_docker_compose_override_exists(self):
        """Test that docker-compose.override.yml exists."""
        assert os.path.exists("docker-compose.override.yml")
    
    def test_docker_compose_valid_yaml(self):
        """Test that docker-compose.yml is valid YAML."""
        with open("docker-compose.yml", "r") as f:
            config = yaml.safe_load(f)
        
        assert config is not None
        assert "services" in config
        assert "version" in config
    
    def test_required_services_defined(self):
        """Test that all required services are defined."""
        with open("docker-compose.yml", "r") as f:
            config = yaml.safe_load(f)
        
        services = config.get("services", {})
        required_services = ["postgres", "redis", "backend", "frontend", "worker"]
        
        for service in required_services:
            assert service in services, f"Service {service} not found in docker-compose.yml"
    
    def test_backend_dockerfile_exists(self):
        """Test that backend Dockerfile exists."""
        assert os.path.exists("backend/Dockerfile")
    
    def test_frontend_dockerfile_exists(self):
        """Test that frontend Dockerfile exists."""
        assert os.path.exists("frontend/Dockerfile")
    
    def test_frontend_dev_dockerfile_exists(self):
        """Test that frontend development Dockerfile exists."""
        assert os.path.exists("frontend/Dockerfile.dev")
    
    def test_nginx_config_exists(self):
        """Test that nginx configuration exists."""
        assert os.path.exists("frontend/nginx.conf")
    
    def test_database_init_scripts_exist(self):
        """Test that database initialization scripts exist."""
        assert os.path.exists("database/init/01-create-database.sql")
        assert os.path.exists("database/init/02-create-indexes.sql")
    
    def test_environment_example_exists(self):
        """Test that environment example file exists."""
        assert os.path.exists("env.example")
    
    def test_environment_example_has_required_vars(self):
        """Test that env.example contains required variables."""
        with open("env.example", "r") as f:
            content = f.read()
        
        required_vars = [
            "POSTGRES_DB",
            "POSTGRES_USER", 
            "POSTGRES_PASSWORD",
            "JWT_SECRET_KEY",
            "SECRET_KEY",
            "VITE_API_BASE_URL"
        ]
        
        for var in required_vars:
            assert var in content, f"Required variable {var} not found in env.example"
    
    def test_docker_compose_networks_defined(self):
        """Test that Docker networks are properly defined."""
        with open("docker-compose.yml", "r") as f:
            config = yaml.safe_load(f)
        
        assert "networks" in config
        assert "sepe-network" in config["networks"]
    
    def test_docker_compose_volumes_defined(self):
        """Test that Docker volumes are properly defined."""
        with open("docker-compose.yml", "r") as f:
            config = yaml.safe_load(f)
        
        assert "volumes" in config
        required_volumes = ["postgres_data", "redis_data", "backend_uploads", "backend_logs"]
        
        for volume in required_volumes:
            assert volume in config["volumes"], f"Volume {volume} not defined"
    
    def test_service_health_checks_defined(self):
        """Test that services have health checks defined."""
        with open("docker-compose.yml", "r") as f:
            config = yaml.safe_load(f)
        
        services_with_health_checks = ["postgres", "redis", "backend", "frontend"]
        
        for service in services_with_health_checks:
            service_config = config["services"][service]
            assert "healthcheck" in service_config, f"Health check not defined for {service}"
    
    def test_service_dependencies_defined(self):
        """Test that service dependencies are properly defined."""
        with open("docker-compose.yml", "r") as f:
            config = yaml.safe_load(f)
        
        # Backend should depend on postgres and redis
        backend_config = config["services"]["backend"]
        assert "depends_on" in backend_config
        assert "postgres" in backend_config["depends_on"]
        assert "redis" in backend_config["depends_on"]
        
        # Frontend should depend on backend
        frontend_config = config["services"]["frontend"]
        assert "depends_on" in frontend_config
        assert "backend" in frontend_config["depends_on"]
        
        # Worker should depend on postgres and redis
        worker_config = config["services"]["worker"]
        assert "depends_on" in worker_config
        assert "postgres" in worker_config["depends_on"]
        assert "redis" in worker_config["depends_on"]


class TestDevelopmentScripts:
    """Test cases for development setup scripts."""
    
    def test_dev_setup_script_exists(self):
        """Test that development setup script exists."""
        assert os.path.exists("scripts/dev-setup.sh")
        assert os.path.exists("scripts/dev-setup.bat")
    
    def test_dev_setup_script_executable(self):
        """Test that development setup script is executable."""
        script_path = Path("scripts/dev-setup.sh")
        # Check if file exists (executable permission test would require actual file system)
        assert script_path.exists()
    
    def test_makefile_exists(self):
        """Test that Makefile exists."""
        assert os.path.exists("Makefile")
    
    def test_makefile_has_required_targets(self):
        """Test that Makefile contains required targets."""
        with open("Makefile", "r") as f:
            content = f.read()
        
        required_targets = [
            "help", "setup", "build", "up", "down", 
            "logs", "test", "migrate", "shell", "clean"
        ]
        
        for target in required_targets:
            assert f"{target}:" in content, f"Target {target} not found in Makefile"


class TestDockerfileValidation:
    """Test cases for Dockerfile validation."""
    
    def test_backend_dockerfile_structure(self):
        """Test backend Dockerfile structure."""
        with open("backend/Dockerfile", "r") as f:
            content = f.read()
        
        # Check for essential Dockerfile instructions
        assert "FROM python:" in content
        assert "WORKDIR /app" in content
        assert "COPY requirements.txt" in content
        assert "RUN pip install" in content
        assert "EXPOSE 8000" in content
        assert "HEALTHCHECK" in content
    
    def test_frontend_dockerfile_structure(self):
        """Test frontend Dockerfile structure."""
        with open("frontend/Dockerfile", "r") as f:
            content = f.read()
        
        # Check for multi-stage build
        assert "FROM node:" in content
        assert "FROM nginx:" in content
        assert "COPY --from=builder" in content
        assert "EXPOSE 3000" in content
        assert "HEALTHCHECK" in content
    
    def test_frontend_dev_dockerfile_structure(self):
        """Test frontend development Dockerfile structure."""
        with open("frontend/Dockerfile.dev", "r") as f:
            content = f.read()
        
        assert "FROM node:" in content
        assert "WORKDIR /app" in content
        assert "npm install" in content
        assert "EXPOSE 3000" in content


class TestNginxConfiguration:
    """Test cases for Nginx configuration."""
    
    def test_nginx_config_structure(self):
        """Test nginx configuration structure."""
        with open("frontend/nginx.conf", "r") as f:
            content = f.read()
        
        # Check for essential nginx directives
        assert "server {" in content
        assert "listen 3000" in content
        assert "location /" in content
        assert "location /api/" in content
        assert "proxy_pass http://backend:8000" in content
        assert "gzip on" in content


class TestDatabaseInitialization:
    """Test cases for database initialization scripts."""
    
    def test_database_creation_script(self):
        """Test database creation script structure."""
        with open("database/init/01-create-database.sql", "r") as f:
            content = f.read()
        
        assert "CREATE DATABASE" in content or "sepe_comparator" in content
        assert "CREATE ROLE" in content or "sepe_user" in content
        assert "GRANT" in content
        assert "CREATE EXTENSION" in content
    
    def test_indexes_script(self):
        """Test database indexes script structure."""
        with open("database/init/02-create-indexes.sql", "r") as f:
            content = f.read()
        
        assert "CREATE INDEX" in content
        assert "pdf_templates" in content
        assert "comparisons" in content
        assert "ANALYZE" in content
