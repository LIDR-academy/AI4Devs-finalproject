# ===================================
# SHOPMEFY MINIMAL INFRASTRUCTURE
# Only EC2 + RDS - Nothing else!
# ===================================

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project = "ShopMefy"
      Owner   = "Andrea"
    }
  }
}

# ===================================
# DATA SOURCES
# ===================================

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-*-amd64-server-*"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ===================================
# RANDOM RESOURCES
# ===================================

resource "random_password" "db_password" {
  length  = 16
  special = true
  # Exclude characters that are not allowed in RDS passwords
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# ===================================
# VPC AND SUBNETS (Use existing ones!)
# ===================================

data "aws_vpc" "default" {
  default = true
}

# Use existing subnets instead of creating new ones
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_subnet" "public_1" {
  id = data.aws_subnets.default.ids[0]
}

# Create a second subnet in a different AZ if only one exists
resource "aws_subnet" "public_2" {
  count = length(data.aws_subnets.default.ids) < 2 ? 1 : 0
  
  vpc_id            = data.aws_vpc.default.id
  cidr_block        = "172.31.101.0/24"  # Different CIDR from existing subnet
  availability_zone = data.aws_availability_zones.available.names[1]  # Different AZ
  
  map_public_ip_on_launch = true
  
  tags = {
    Name = "shopmefy-public-subnet-2"
  }
}

# Use existing second subnet or the created one
locals {
  public_subnet_2_id = length(data.aws_subnets.default.ids) > 1 ? data.aws_subnets.default.ids[1] : aws_subnet.public_2[0].id
}

# ===================================
# SECURITY GROUPS
# ===================================

resource "aws_security_group" "web" {
  name_prefix = "shopmefy-web-"
  vpc_id      = data.aws_vpc.default.id
  description = "Security group for EC2"
  
  # SSH
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Node.js Backend
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # React Frontend
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "shopmefy-web-sg"
  }
}

resource "aws_security_group" "database" {
  name_prefix = "shopmefy-db-"
  vpc_id      = data.aws_vpc.default.id
  description = "Security group for RDS"
  
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.web.id]
  }
  
  tags = {
    Name = "shopmefy-db-sg"
  }
}

# ===================================
# SSH KEY PAIR
# ===================================

# Auto-generate SSH key pair
resource "tls_private_key" "main" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "main" {
  key_name   = "shopmefy-key-${random_id.bucket_suffix.hex}"
  public_key = tls_private_key.main.public_key_openssh
  
  tags = {
    Name = "shopmefy-keypair"
  }
}

# ===================================
# S3 BUCKET FOR DEPLOYMENTS (Essential!)
# ===================================

resource "aws_s3_bucket" "deployments" {
  bucket        = "shopmefy-deployments-${random_id.bucket_suffix.hex}"
  force_destroy = true  # Allows deletion even if bucket contains objects
  
  tags = {
    Name = "shopmefy-deployments"
  }
}

resource "aws_s3_bucket_versioning" "deployments" {
  bucket = aws_s3_bucket.deployments.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "deployments" {
  bucket = aws_s3_bucket.deployments.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "deployments" {
  bucket = aws_s3_bucket.deployments.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ===================================
# RDS SUBNET GROUP (Required for RDS)
# ===================================

resource "aws_db_subnet_group" "main" {
  name       = "shopmefy-db-subnet-group-${random_id.bucket_suffix.hex}"
  subnet_ids = [data.aws_subnet.public_1.id, local.public_subnet_2_id]
  
  tags = {
    Name = "shopmefy-db-subnet-group"
  }
}

# ===================================
# RDS POSTGRESQL DATABASE
# ===================================

resource "aws_db_instance" "postgres" {
  identifier = "shopmefy-db-${random_id.bucket_suffix.hex}"
  
  # Engine
  engine         = "postgres"
  engine_version = "15.7"
  instance_class = "db.t3.micro"
  
  # Storage
  allocated_storage = 20
  storage_type      = "gp2"
  
  # Database
  db_name  = "shopmefy"
  username = "shopmefy"
  password = var.db_password != "" ? var.db_password : random_password.db_password.result
  
  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.database.id]
  publicly_accessible    = false
  
  # Backup (minimal)
  backup_retention_period = 1
  skip_final_snapshot     = true
  deletion_protection     = false
  
  tags = {
    Name = "shopmefy-database"
  }
}

# ===================================
# EC2 INSTANCE (The star of the show!)
# ===================================

resource "aws_instance" "web" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.small"
  key_name               = aws_key_pair.main.key_name
  vpc_security_group_ids = [aws_security_group.web.id]
  subnet_id              = data.aws_subnet.public_1.id
  
  # Enable hibernation for cost savings (requires EBS-backed AMI)
  # hibernation = true  # Temporarily disabled for debugging
  
  # Basic setup
  user_data = base64encode(<<-EOF
    #!/bin/bash
    apt-get update
    apt-get install -y nginx curl
    
    # Install Node.js 20.x
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    apt-get install -y nodejs
    
    # Install PM2 globally
    npm install -g pm2
    
    # Configure nginx with file upload support
    systemctl start nginx
    systemctl enable nginx
    
    # Create nginx configuration for ShopMefy with 20MB upload limit
    cat > /etc/nginx/sites-available/default << 'NGINX_CONFIG'
server {
    listen 80;
    server_name _;
    client_max_body_size 20M;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Authorization $http_authorization;
        client_max_body_size 20M;
    }
}
NGINX_CONFIG
    
    # Test and reload nginx
    nginx -t && systemctl reload nginx
    echo "<h1>ShopMefy Server Ready</h1>" > /var/www/html/index.html
    
    # Create app directory
    mkdir -p /home/ubuntu/shopmefy
    chown ubuntu:ubuntu /home/ubuntu/shopmefy
  EOF
  )
  
  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted   = true
  }
  
  tags = {
    Name = "shopmefy-web-server"
  }
}

# ===================================
# ELASTIC IP (Fixed IP)
# ===================================

resource "aws_eip" "web" {
  domain = "vpc"
  
  tags = {
    Name = "shopmefy-eip"
  }
}

# Associate EIP to instance (separate resource for flexibility)
resource "aws_eip_association" "web" {
  instance_id   = aws_instance.web.id
  allocation_id = aws_eip.web.id
} 