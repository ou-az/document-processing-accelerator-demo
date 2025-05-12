variable "bucket_name" {
  description = "Name of the S3 bucket for document storage"
  type        = string
}

variable "environment" {
  description = "Environment (e.g., dev, prod)"
  type        = string
}
