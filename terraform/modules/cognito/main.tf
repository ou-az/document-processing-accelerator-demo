resource "aws_cognito_user_pool" "document_processor_pool" {
  name = "doc-processor-${var.environment}-users"
  
  # Use email as the username
  username_attributes = ["email"]
  
  # MFA Configuration
  mfa_configuration = "OFF"
  
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }
  
  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "email"
    required                 = true
    
    string_attribute_constraints {
      min_length = 7
      max_length = 320
    }
  }
  
  admin_create_user_config {
    allow_admin_create_user_only = false
  }
  
  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject = "Document Processor - Verify your email"
    email_message = "Your verification code is {####}"
  }
  
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }
  
  tags = {
    Environment = var.environment
    Application = "document-processor"
  }
}

resource "aws_cognito_user_pool_client" "document_processor_client" {
  name = "doc-processor-${var.environment}-client"
  
  user_pool_id    = aws_cognito_user_pool.document_processor_pool.id
  generate_secret = false
  
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH"
  ]
  
  supported_identity_providers = ["COGNITO"]
  
  callback_urls = [
    var.frontend_url,
    "http://localhost:3000"
  ]
  
  logout_urls = [
    var.frontend_url,
    "http://localhost:3000"
  ]
  
  allowed_oauth_flows = ["code", "implicit"]
  allowed_oauth_scopes = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]
  allowed_oauth_flows_user_pool_client = true
}

resource "aws_cognito_identity_pool" "document_processor_identity_pool" {
  identity_pool_name               = "doc-processor-${var.environment}-identity-pool"
  allow_unauthenticated_identities = false
  allow_classic_flow               = false
  
  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.document_processor_client.id
    provider_name           = aws_cognito_user_pool.document_processor_pool.endpoint
    server_side_token_check = false
  }
}

resource "aws_iam_role" "authenticated_user_role" {
  name = "doc-processor-${var.environment}-authenticated-user-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.document_processor_identity_pool.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "authenticated"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "authenticated_user_policy" {
  name = "doc-processor-${var.environment}-authenticated-user-policy"
  role = aws_iam_role.authenticated_user_role.id
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject"
        ]
        Resource = [
          "${var.documents_bucket_arn}/*"
        ]
        Condition = {
          StringEquals = {
            "s3:prefix": ["$${cognito-identity.amazonaws.com:sub}/*"]
          }
        }
      },
      {
        Effect = "Allow"
        Action = [
          "execute-api:Invoke"
        ]
        Resource = [
          "${var.api_gateway_arn}/*"
        ]
      }
    ]
  })
}

resource "aws_cognito_identity_pool_roles_attachment" "document_processor_identity_pool_roles" {
  identity_pool_id = aws_cognito_identity_pool.document_processor_identity_pool.id
  
  roles = {
    "authenticated" = aws_iam_role.authenticated_user_role.arn
  }
}
