"""
Setup configuration for SEPE Templates Comparator backend.

This module provides package configuration for development and deployment.
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="sepe-templates-comparator",
    version="1.0.0",
    author="Product Architecture Team",
    author_email="architecture@company.com",
    description="API for comparing SEPE PDF templates and managing template catalogs",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/company/sepe-templates-comparator",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Framework :: FastAPI",
    ],
    python_requires=">=3.10",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.4.3",
            "pytest-asyncio>=0.21.1", 
            "pytest-cov>=4.1.0",
            "black>=23.11.0",
            "isort>=5.12.0",
            "flake8>=6.1.0",
            "mypy>=1.7.1",
            "pre-commit>=3.5.0",
        ]
    },
    entry_points={
        "console_scripts": [
            "sepe-comparator=app.main:main",
        ],
    },
)
