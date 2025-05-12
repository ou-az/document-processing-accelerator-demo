variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "frontend_url" {
  description = "URL of the frontend application"
  type        = string
}

variable "documents_bucket_arn" {
  description = "ARN of the S3 bucket for document storage"
  type        = string
}

variable "api_gateway_arn" {
  description = "ARN of the API Gateway for the backend API"
  type        = string
  default     = "*" # Default to all API Gateways if not specified
}
