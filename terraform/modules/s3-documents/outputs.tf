output "bucket_id" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.documents_bucket.id
}

output "bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.documents_bucket.arn
}

output "bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  value       = aws_s3_bucket.documents_bucket.bucket_regional_domain_name
}
