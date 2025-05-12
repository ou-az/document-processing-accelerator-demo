variable "prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment (e.g., dev, prod)"
  type        = string
}

variable "source_dir" {
  description = "Directory containing the Lambda function source code"
  type        = string
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table"
  type        = string
}

variable "dynamodb_table_arn" {
  description = "ARN of the DynamoDB table"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for documents"
  type        = string
}

variable "s3_bucket_arn" {
  description = "ARN of the S3 bucket for documents"
  type        = string
}

variable "openai_api_key" {
  description = "OpenAI API key for document processing"
  type        = string
  sensitive   = true
}
