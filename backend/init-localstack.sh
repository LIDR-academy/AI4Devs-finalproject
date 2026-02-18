#!/bin/bash
# LocalStack initialization script for Meditation Builder
# This script runs automatically when LocalStack starts

echo "Waiting for S3 to be ready..."
until awslocal s3api list-buckets >/dev/null 2>&1; do
  sleep 1
done

echo "Creating meditation-media bucket..."
awslocal s3 mb s3://meditation-media || true

echo "Applying CORS configuration..."
cat <<EOF > /tmp/cors.json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": []
    }
  ]
}
EOF
awslocal s3api put-bucket-cors --bucket meditation-media --cors-configuration file:///tmp/cors.json

echo "Applying Public Access Policy..."
cat <<EOF > /tmp/policy.json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::meditation-media/*"]
    }
  ]
}
EOF
awslocal s3api put-bucket-policy --bucket meditation-media --policy file:///tmp/policy.json

echo "Disabling Public Access Block..."
awslocal s3api put-public-access-block \
    --bucket meditation-media \
    --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

echo "S3 bucket configured correctly."
