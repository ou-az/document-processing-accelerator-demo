output "user_pool_id" {
  description = "The ID of the Cognito User Pool"
  value       = aws_cognito_user_pool.document_processor_pool.id
}

output "user_pool_arn" {
  description = "The ARN of the Cognito User Pool"
  value       = aws_cognito_user_pool.document_processor_pool.arn
}

output "user_pool_endpoint" {
  description = "The endpoint of the Cognito User Pool"
  value       = aws_cognito_user_pool.document_processor_pool.endpoint
}

output "app_client_id" {
  description = "The ID of the Cognito User Pool Client"
  value       = aws_cognito_user_pool_client.document_processor_client.id
}

output "identity_pool_id" {
  description = "The ID of the Cognito Identity Pool"
  value       = aws_cognito_identity_pool.document_processor_identity_pool.id
}

output "authenticated_role_arn" {
  description = "The ARN of the IAM role for authenticated users"
  value       = aws_iam_role.authenticated_user_role.arn
}
