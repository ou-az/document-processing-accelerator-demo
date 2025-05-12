provider "aws" {
  region = var.aws_region
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
  
  # Uncomment this block to use Terraform Cloud for remote state management
  # backend "remote" {
  #   organization = "your-org-name"
  #   workspaces {
  #     name = "document-processor-dev"
  #   }
  # }
}

resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

###################################
# Frontend Infrastructure
###################################
module "frontend_s3" {
  source = "../../modules/s3"

  bucket_name = "document-processing-accelerator-${var.environment}-${random_string.bucket_suffix.result}"
  environment = var.environment
}

module "frontend_cloudfront" {
  source = "../../modules/cloudfront"

  s3_bucket_name                 = module.frontend_s3.bucket_id
  s3_bucket_regional_domain_name = module.frontend_s3.bucket_regional_domain_name
  environment                    = var.environment
}

# Create S3 bucket policy after CloudFront distribution to avoid circular dependency
resource "aws_s3_bucket_policy" "allow_public_read" {
  bucket = module.frontend_s3.bucket_id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${module.frontend_s3.bucket_arn}/*"
        Condition = {
          StringEquals = {
            "aws:SourceArn" = module.frontend_cloudfront.distribution_arn
          }
        }
      }
    ]
  })

  # Ensure this resource is created after both the S3 bucket and CloudFront distribution
  depends_on = [module.frontend_s3, module.frontend_cloudfront]
}

# Authentication module
module "cognito" {
  source = "../../modules/cognito"
  
  environment          = "dev"
  frontend_url         = var.frontend_url
  documents_bucket_arn = module.documents_s3.bucket_arn
  api_gateway_arn      = var.api_gateway_arn # This will be populated after API Gateway deployment
}

###################################
# Backend Infrastructure
###################################

# DynamoDB table for document metadata
module "documents_dynamodb" {
  source = "../../modules/dynamodb"

  table_name  = "doc-processor-${var.environment}-documents"
  environment = var.environment
}

# S3 bucket for document storage
module "documents_s3" {
  source = "../../modules/s3-documents"

  bucket_name     = "doc-processor-${var.environment}-documents-${random_string.bucket_suffix.result}"
  environment     = var.environment
}

# For now, we're commenting out the Lambda and API Gateway modules
# and will deploy them using Serverless Framework instead

/*
# Lambda functions for document processing
module "document_lambda" {
  source = "../../modules/lambda"

  prefix            = "doc-processor-${var.environment}"
  environment       = var.environment
  source_dir        = "${path.module}/../../../backend"
  
  dynamodb_table_name = module.documents_dynamodb.table_name
  dynamodb_table_arn  = module.documents_dynamodb.table_arn
  
  s3_bucket_name    = module.documents_s3.bucket_id
  s3_bucket_arn     = module.documents_s3.bucket_arn
  
  openai_api_key    = var.openai_api_key

  depends_on = [module.documents_dynamodb, module.documents_s3]
}

# API Gateway for document processing API
module "documents_api" {
  source = "../../modules/api-gateway"

  prefix  = "doc-processor-${var.environment}"
  stage_name = var.environment

  get_documents_function_name        = module.document_lambda.get_documents_function_name
  get_documents_function_invoke_arn  = module.document_lambda.get_documents_function_invoke_arn
  
  get_document_by_id_function_name        = module.document_lambda.get_document_by_id_function_name
  get_document_by_id_function_invoke_arn  = module.document_lambda.get_document_by_id_function_invoke_arn
  
  create_document_function_name        = module.document_lambda.create_document_function_name
  create_document_function_invoke_arn  = module.document_lambda.create_document_function_invoke_arn
  
  generate_upload_url_function_name        = module.document_lambda.generate_upload_url_function_name
  generate_upload_url_function_invoke_arn  = module.document_lambda.generate_upload_url_function_invoke_arn
  
  process_document_function_name        = module.document_lambda.process_document_function_name
  process_document_function_invoke_arn  = module.document_lambda.process_document_function_invoke_arn

  depends_on = [module.document_lambda]
}
*/

# Create IAM role for Lambda functions to be deployed with Serverless Framework
resource "aws_iam_role" "lambda_execution_role" {
  name = "document-processor-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# Create IAM policy for Lambda functions to access DynamoDB and S3
resource "aws_iam_policy" "lambda_policy" {
  name        = "document-processor-lambda-policy"
  description = "Policy for document processing Lambda functions"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          module.documents_dynamodb.table_arn,
          "${module.documents_dynamodb.table_arn}/index/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          module.documents_s3.bucket_arn,
          "${module.documents_s3.bucket_arn}/*"
        ]
      }
    ]
  })
}

# Attach policy to role
resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

###################################
# Outputs
###################################

# Frontend outputs
output "frontend_url" {
  description = "The URL of the CloudFront distribution"
  value       = "https://${module.frontend_cloudfront.domain_name}"
}

output "frontend_s3_bucket" {
  description = "The name of the S3 bucket where the React application is hosted"
  value       = module.frontend_s3.bucket_id
}

# Backend outputs
output "documents_dynamodb_table" {
  description = "The name of the DynamoDB table for document metadata"
  value       = module.documents_dynamodb.table_name
}

output "documents_dynamodb_table_arn" {
  description = "The ARN of the DynamoDB table for document metadata"
  value       = module.documents_dynamodb.table_arn
}

output "documents_s3_bucket" {
  description = "The name of the S3 bucket for documents storage"
  value       = module.documents_s3.bucket_id
}

output "documents_s3_bucket_arn" {
  description = "The ARN of the S3 bucket for documents storage"
  value       = module.documents_s3.bucket_arn
}

output "lambda_execution_role_arn" {
  description = "The ARN of the IAM role for Lambda execution"
  value       = aws_iam_role.lambda_execution_role.arn
}
