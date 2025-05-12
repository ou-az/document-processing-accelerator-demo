############################
# Lambda IAM Role and Policy
############################

resource "aws_iam_role" "lambda_role" {
  name = "${var.prefix}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "lambda_policy" {
  name        = "${var.prefix}-lambda-policy"
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
          var.dynamodb_table_arn,
          "${var.dynamodb_table_arn}/index/*"
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
          var.s3_bucket_arn,
          "${var.s3_bucket_arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_policy_attachment" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.lambda_policy.arn
}

############################
# Lambda Function Creation
############################

# Create a zip file of the Lambda code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = var.source_dir
  output_path = "${path.module}/lambda_function.zip"
  
  # Exclude node_modules and other unnecessary files
  excludes = [
    "node_modules",
    ".git",
    ".github",
    "terraform",
    "README.md"
  ]
}

# Lambda function for getting documents
resource "aws_lambda_function" "get_documents" {
  function_name = "${var.prefix}-get-documents"
  handler       = "src/functions/documents/get.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  memory_size = 256
  timeout     = 30

  environment {
    variables = {
      DOCUMENTS_TABLE = var.dynamodb_table_name
      DOCUMENTS_BUCKET = var.s3_bucket_name
      OPENAI_API_KEY = var.openai_api_key
    }
  }
}

# Lambda function for getting a document by ID
resource "aws_lambda_function" "get_document_by_id" {
  function_name = "${var.prefix}-get-document-by-id"
  handler       = "src/functions/documents/getById.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  memory_size = 256
  timeout     = 30

  environment {
    variables = {
      DOCUMENTS_TABLE = var.dynamodb_table_name
      DOCUMENTS_BUCKET = var.s3_bucket_name
      OPENAI_API_KEY = var.openai_api_key
    }
  }
}

# Lambda function for creating a document
resource "aws_lambda_function" "create_document" {
  function_name = "${var.prefix}-create-document"
  handler       = "src/functions/documents/create.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  memory_size = 256
  timeout     = 30

  environment {
    variables = {
      DOCUMENTS_TABLE = var.dynamodb_table_name
      DOCUMENTS_BUCKET = var.s3_bucket_name
      OPENAI_API_KEY = var.openai_api_key
    }
  }
}

# Lambda function for generating upload URL
resource "aws_lambda_function" "generate_upload_url" {
  function_name = "${var.prefix}-generate-upload-url"
  handler       = "src/functions/documents/generateUploadUrl.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  memory_size = 256
  timeout     = 30

  environment {
    variables = {
      DOCUMENTS_TABLE = var.dynamodb_table_name
      DOCUMENTS_BUCKET = var.s3_bucket_name
      OPENAI_API_KEY = var.openai_api_key
    }
  }
}

# Lambda function for processing document
resource "aws_lambda_function" "process_document" {
  function_name = "${var.prefix}-process-document"
  handler       = "src/functions/documents/process.handler"
  runtime       = "nodejs18.x"
  role          = aws_iam_role.lambda_role.arn

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  memory_size = 1024  # More memory for document processing
  timeout     = 300   # Longer timeout for OpenAI processing

  environment {
    variables = {
      DOCUMENTS_TABLE = var.dynamodb_table_name
      DOCUMENTS_BUCKET = var.s3_bucket_name
      OPENAI_API_KEY = var.openai_api_key
    }
  }
}

# S3 event trigger for the process function
resource "aws_lambda_permission" "allow_s3" {
  statement_id  = "AllowExecutionFromS3"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.process_document.function_name
  principal     = "s3.amazonaws.com"
  source_arn    = var.s3_bucket_arn
}

resource "aws_s3_bucket_notification" "bucket_notification" {
  bucket = var.s3_bucket_name

  lambda_function {
    lambda_function_arn = aws_lambda_function.process_document.arn
    events              = ["s3:ObjectCreated:*"]
  }
}
