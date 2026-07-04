terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# --- Networking: reuse the account's default VPC (fine for a single-instance demo) ---

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# --- S3 bucket for receipts (prod), mirrors infra/terraform/envs/dev's -dev bucket ---

resource "aws_s3_bucket" "receipts" {
  bucket = "${lower(var.project_name)}-receipts-prod"
  # Lets `terraform destroy` delete the bucket even if demo receipts were uploaded to it —
  # without this, S3 refuses to delete a non-empty bucket and destroy would fail partway through.
  force_destroy = true
}

resource "aws_sns_topic" "expiration_alerts" {
  name = "${var.project_name}-expiration-alerts-prod"
}

# --- Security groups ---

resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-ec2-prod"
  description = "EC2 instance running the backend and frontend containers"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH from admin IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.admin_cidr]
  }

  ingress {
    description = "Backend API (origin for CloudFront)"
    from_port   = var.backend_port
    to_port     = var.backend_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Frontend SSR (origin for CloudFront)"
    from_port   = var.frontend_port
    to_port     = var.frontend_port
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
    Project = var.project_name
    Env     = "prod"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project_name}-rds-prod"
  description = "RDS Postgres, reachable only from the app EC2 instance"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "Postgres from the app EC2 security group"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Project = var.project_name
    Env     = "prod"
  }
}

# --- IAM: EC2 instance role (S3 receipts, Textract, SES, SNS) ---

resource "aws_iam_role" "ec2" {
  name = "${var.project_name}-ec2-role-prod"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "ec2_app_access" {
  name = "${var.project_name}-ec2-app-access-prod"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ReceiptsBucketAccess"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetObject"]
        Resource = "${aws_s3_bucket.receipts.arn}/*"
      },
      {
        Sid      = "ReceiptOcr"
        Effect   = "Allow"
        Action   = ["textract:AnalyzeExpense"]
        Resource = "*"
      },
      {
        Sid      = "EmailNotifications"
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
      },
      {
        Sid      = "PushNotifications"
        Effect   = "Allow"
        Action   = ["sns:Publish"]
        Resource = aws_sns_topic.expiration_alerts.arn
      }
    ]
  })
}

resource "aws_iam_role_policy" "ec2_ssm" {
  # Grants the instance the permissions it needs to register with SSM Session Manager, so SSH can
  # be tunneled over HTTPS (SSM) instead of raw TCP port 22 — needed because the deploy machine's
  # network blocks outbound port 22 (corporate proxy). Written as scoped inline actions (not the
  # AmazonSSMManagedInstanceCore attachment) because these specific actions require Resource "*"
  # regardless, and this only needs iam:PutRolePolicy, which the deploy user already has, instead
  # of iam:AttachRolePolicy, which it deliberately doesn't.
  name = "${var.project_name}-ec2-ssm-prod"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid    = "SsmSessionManager"
      Effect = "Allow"
      Action = [
        "ssm:UpdateInstanceInformation",
        "ssmmessages:CreateControlChannel",
        "ssmmessages:CreateDataChannel",
        "ssmmessages:OpenControlChannel",
        "ssmmessages:OpenDataChannel",
        "ec2messages:AcknowledgeMessage",
        "ec2messages:DeleteMessage",
        "ec2messages:FailMessage",
        "ec2messages:GetEndpoint",
        "ec2messages:GetMessages",
        "ec2messages:SendReply"
      ]
      Resource = "*"
    }]
  })
}

resource "aws_iam_instance_profile" "ec2" {
  name = "${var.project_name}-ec2-profile-prod"
  role = aws_iam_role.ec2.name
}

# --- EC2 instance running both app containers via Docker ---

resource "aws_instance" "app" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.ec2_key_name
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  # Installs Docker + the Compose plugin so the box is ready for `docker compose up -d`
  # (see infra/docker/docker-compose.prod.yml) as soon as it boots.
  user_data = <<-EOF
    #!/bin/bash
    set -euo pipefail
    apt-get update -y
    curl -fsSL https://get.docker.com | sh
    usermod -aG docker ubuntu
  EOF

  tags = {
    Name    = "${var.project_name}-app-prod"
    Project = var.project_name
    Env     = "prod"
  }
}

resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = {
    Project = var.project_name
    Env     = "prod"
  }
}

# --- RDS PostgreSQL (private) ---

resource "aws_db_subnet_group" "prod" {
  name       = "${lower(var.project_name)}-prod"
  subnet_ids = data.aws_subnets.default.ids

  tags = {
    Project = var.project_name
    Env     = "prod"
  }
}

resource "aws_db_instance" "prod" {
  identifier              = "${lower(var.project_name)}-prod"
  engine                  = "postgres"
  engine_version          = var.rds_engine_version
  instance_class          = var.rds_instance_class
  allocated_storage       = var.rds_allocated_storage
  storage_type            = "gp3"
  db_name                 = var.db_name
  username                = var.db_username
  password                = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.prod.name
  vpc_security_group_ids  = [aws_security_group.rds.id]
  publicly_accessible     = false
  multi_az                = false
  skip_final_snapshot     = true
  backup_retention_period = 1
  apply_immediately       = true

  tags = {
    Project = var.project_name
    Env     = "prod"
  }
}

# --- CloudFront: single HTTPS entrypoint, path-based routing to the two containers ---

resource "aws_cloudfront_distribution" "app" {
  enabled = true
  comment = "${var.project_name} prod"

  origin {
    origin_id   = "backend"
    domain_name = aws_eip.app.public_dns

    custom_origin_config {
      http_port              = var.backend_port
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  origin {
    origin_id   = "frontend"
    domain_name = aws_eip.app.public_dns

    custom_origin_config {
      http_port              = var.frontend_port
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 60
    max_ttl     = 300
  }

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "backend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]

    # Responses are per-user JWT-authenticated — caching must stay off, and the Authorization
    # header must be forwarded to the origin.
    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type", "Origin"]
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Project = var.project_name
    Env     = "prod"
  }
}
