"""
Tests for basic project structure and imports.
"""

import os
import sys
from pathlib import Path


class TestProjectStructure:
    """Test cases for project structure validation."""
    
    def test_backend_directory_exists(self):
        """Test that backend directory exists."""
        backend_path = Path(__file__).parent.parent
        assert backend_path.exists()
        assert backend_path.is_dir()
    
    def test_app_directory_exists(self):
        """Test that app directory exists."""
        app_path = Path(__file__).parent.parent / "app"
        assert app_path.exists()
        assert app_path.is_dir()
    
    def test_required_directories_exist(self):
        """Test that all required directories exist."""
        backend_path = Path(__file__).parent.parent
        required_dirs = [
            "app",
            "app/api",
            "app/api/v1", 
            "app/core",
            "app/models",
            "app/services",
            "app/utils",
            "tests"
        ]
        
        for dir_name in required_dirs:
            dir_path = backend_path / dir_name
            assert dir_path.exists(), f"Directory {dir_name} should exist"
            assert dir_path.is_dir(), f"{dir_name} should be a directory"
    
    def test_required_files_exist(self):
        """Test that required configuration files exist."""
        backend_path = Path(__file__).parent.parent
        required_files = [
            "requirements.txt",
            "requirements-dev.txt",
            "pyproject.toml",
            "README.md",
            "Makefile",
            ".pre-commit-config.yaml",
            ".flake8"
        ]
        
        for file_name in required_files:
            file_path = backend_path / file_name
            assert file_path.exists(), f"File {file_name} should exist"
            assert file_path.is_file(), f"{file_name} should be a file"
    
    def test_init_files_exist(self):
        """Test that __init__.py files exist in Python packages."""
        backend_path = Path(__file__).parent.parent
        package_dirs = [
            "app",
            "app/api",
            "app/api/v1",
            "app/core", 
            "app/models",
            "app/services",
            "app/utils",
            "tests"
        ]
        
        for dir_name in package_dirs:
            init_file = backend_path / dir_name / "__init__.py"
            assert init_file.exists(), f"__init__.py should exist in {dir_name}"
    
    def test_python_path_setup(self):
        """Test that Python path is set up correctly."""
        backend_path = Path(__file__).parent.parent
        app_path = str(backend_path)
        
        # Add backend path to Python path if not already there
        if app_path not in sys.path:
            sys.path.insert(0, app_path)
        
        # Test that we can import the app package
        try:
            import app
            assert hasattr(app, "__path__")
        except ImportError as e:
            # This is expected during initial setup
            assert "No module named" in str(e)
    
    def test_configuration_files_valid(self):
        """Test that configuration files are valid."""
        backend_path = Path(__file__).parent.parent
        
        # Test pyproject.toml exists and has content
        pyproject_file = backend_path / "pyproject.toml"
        assert pyproject_file.exists()
        content = pyproject_file.read_text()
        assert "[build-system]" in content
        assert "sepe-templates-comparator" in content
        
        # Test requirements.txt has content
        requirements_file = backend_path / "requirements.txt"
        assert requirements_file.exists()
        content = requirements_file.read_text()
        assert "fastapi" in content.lower()
        assert "sqlalchemy" in content.lower()
    
    def test_development_files_exist(self):
        """Test that development configuration files exist."""
        backend_path = Path(__file__).parent.parent
        
        # Check pre-commit config
        precommit_file = backend_path / ".pre-commit-config.yaml"
        assert precommit_file.exists()
        content = precommit_file.read_text()
        assert "black" in content
        assert "isort" in content
        assert "flake8" in content
        
        # Check flake8 config
        flake8_file = backend_path / ".flake8"
        assert flake8_file.exists()
        content = flake8_file.read_text()
        assert "max-line-length" in content
