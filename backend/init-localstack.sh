#!/bin/bash
# LocalStack initialization script
# This script runs automatically when LocalStack starts

echo "Waiting for LocalStack to be ready..."
while ! curl -s http://localhost:4566/_localstack/health | grep -q "\"s3\": \"available\""; do
  sleep 1
done

echo "LocalStack is ready. Creating S3 bucket..."

# Create the meditation-media bucket
awslocal s3 mb s3://meditation-media

# Set bucket policy for public read (optional, for testing)
# awslocal s3api put-bucket-acl --bucket meditation-media --acl public-read

echo "S3 bucket 'meditation-media' created successfully"

# List all buckets to verify
echo "Current S3 buckets:"
awslocal s3 ls
