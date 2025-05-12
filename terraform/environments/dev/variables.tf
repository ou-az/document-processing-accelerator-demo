variable "aws_region" {
  description = "The AWS region to deploy resources to"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "openai_api_key" {
  description = "OpenAI API key for document processing"
  type        = string
  sensitive   = true
}

variable "api_gateway_arn" {
  description = "ARN of the API Gateway"
  type        = string
  default     = "" # This will be updated after API Gateway deployment
}

variable "frontend_url" {
  description = "URL of the frontend application"
  type        = string
  default     = "*" # Default to allow all origins for development
}
