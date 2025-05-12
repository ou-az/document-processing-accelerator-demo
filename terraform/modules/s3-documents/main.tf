resource "aws_s3_bucket" "documents_bucket" {
  bucket        = var.bucket_name
  force_destroy = true

  tags = {
    Name        = var.bucket_name
    Environment = var.environment
    Project     = "document-processing-accelerator"
  }
}

resource "aws_s3_bucket_cors_configuration" "documents_bucket_cors" {
  bucket = aws_s3_bucket.documents_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "HEAD"]
    allowed_origins = ["*"] # In production, restrict this to your domain
    expose_headers  = ["ETag", "Content-Length", "Content-Type"]
    max_age_seconds = 3000
  }
}
