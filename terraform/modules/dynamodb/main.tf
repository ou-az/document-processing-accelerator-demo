resource "aws_dynamodb_table" "documents_table" {
  name           = var.table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"
  
  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name               = "UserIdIndex"
    hash_key           = "userId"
    projection_type    = "ALL"
  }

  tags = {
    Name        = var.table_name
    Environment = var.environment
    Project     = "document-processing-accelerator"
  }
}
