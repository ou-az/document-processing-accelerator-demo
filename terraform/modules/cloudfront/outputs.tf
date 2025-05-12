output "distribution_id" {
  description = "The identifier for the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.id
}

output "distribution_arn" {
  description = "The ARN for the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.arn
}

output "domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.domain_name
}
