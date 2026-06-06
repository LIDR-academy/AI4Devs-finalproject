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

resource "aws_s3_bucket" "receipts" {
  bucket = "${var.project_name}-receipts-dev"
}

resource "aws_sns_topic" "expiration_alerts" {
  name = "${var.project_name}-expiration-alerts-dev"
}
