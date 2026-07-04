output "ec2_instance_id" {
  description = "EC2 instance ID (used for SSH-over-SSM and for temporary instance-type resizes during builds)"
  value       = aws_instance.app.id
}

output "ec2_public_ip" {
  description = "Elastic IP of the app instance (use for SSH)"
  value       = aws_eip.app.public_ip
}

output "ec2_public_dns" {
  description = "Stable public DNS of the app instance (used as the CloudFront origin domain)"
  value       = aws_eip.app.public_dns
}

output "rds_endpoint" {
  description = "RDS connection endpoint (host:port)"
  value       = aws_db_instance.prod.endpoint
}

output "cloudfront_domain" {
  description = "Public HTTPS URL for the app (frontend + /api/* backend)"
  value       = "https://${aws_cloudfront_distribution.app.domain_name}"
}

output "s3_receipts_bucket" {
  description = "S3 bucket name for receipt uploads"
  value       = aws_s3_bucket.receipts.bucket
}

output "sns_topic_arn" {
  description = "SNS topic ARN for expiration alerts"
  value       = aws_sns_topic.expiration_alerts.arn
}
