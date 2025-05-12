output "bucket_id" {
  description = "The name of the bucket"
  value       = aws_s3_bucket.frontend.id
}

output "bucket_arn" {
  description = "The ARN of the bucket"
  value       = aws_s3_bucket.frontend.arn
}

output "bucket_regional_domain_name" {
  description = "The regional domain name of the bucket"
  value       = aws_s3_bucket.frontend.bucket_regional_domain_name
}

output "website_endpoint" {
  description = "The website endpoint of the bucket"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}
