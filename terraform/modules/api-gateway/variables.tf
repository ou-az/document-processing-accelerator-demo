variable "prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "stage_name" {
  description = "Stage name for API Gateway deployment"
  type        = string
}

variable "get_documents_function_name" {
  description = "Name of the get documents Lambda function"
  type        = string
}

variable "get_documents_function_invoke_arn" {
  description = "Invoke ARN of the get documents Lambda function"
  type        = string
}

variable "get_document_by_id_function_name" {
  description = "Name of the get document by ID Lambda function"
  type        = string
}

variable "get_document_by_id_function_invoke_arn" {
  description = "Invoke ARN of the get document by ID Lambda function"
  type        = string
}

variable "create_document_function_name" {
  description = "Name of the create document Lambda function"
  type        = string
}

variable "create_document_function_invoke_arn" {
  description = "Invoke ARN of the create document Lambda function"
  type        = string
}

variable "generate_upload_url_function_name" {
  description = "Name of the generate upload URL Lambda function"
  type        = string
}

variable "generate_upload_url_function_invoke_arn" {
  description = "Invoke ARN of the generate upload URL Lambda function"
  type        = string
}

variable "process_document_function_name" {
  description = "Name of the process document Lambda function"
  type        = string
}

variable "process_document_function_invoke_arn" {
  description = "Invoke ARN of the process document Lambda function"
  type        = string
}

variable "delete_document_function_name" {
  description = "Name of the delete document Lambda function"
  type        = string
}

variable "delete_document_function_invoke_arn" {
  description = "Invoke ARN of the delete document Lambda function"
  type        = string
}
