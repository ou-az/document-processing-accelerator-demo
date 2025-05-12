resource "aws_api_gateway_rest_api" "documents_api" {
  name        = "${var.prefix}-documents-api"
  description = "API Gateway for Document Processing Accelerator"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

# Enable CORS
resource "aws_api_gateway_gateway_response" "cors" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  response_type = "DEFAULT_4XX"

  response_parameters = {
    "gatewayresponse.header.Access-Control-Allow-Origin"  = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Headers" = "'*'"
    "gatewayresponse.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
  }
}

# API Gateway Resources
resource "aws_api_gateway_resource" "documents" {
  rest_api_id = aws_api_gateway_rest_api.documents_api.id
  parent_id   = aws_api_gateway_rest_api.documents_api.root_resource_id
  path_part   = "documents"
}

resource "aws_api_gateway_resource" "document_id" {
  rest_api_id = aws_api_gateway_rest_api.documents_api.id
  parent_id   = aws_api_gateway_resource.documents.id
  path_part   = "{id}"
}

resource "aws_api_gateway_resource" "document_process" {
  rest_api_id = aws_api_gateway_rest_api.documents_api.id
  parent_id   = aws_api_gateway_resource.document_id.id
  path_part   = "process"
}

resource "aws_api_gateway_resource" "upload_url" {
  rest_api_id = aws_api_gateway_rest_api.documents_api.id
  parent_id   = aws_api_gateway_resource.documents.id
  path_part   = "upload-url"
}

# Swagger Documentation Resources
resource "aws_api_gateway_resource" "swagger" {
  rest_api_id = aws_api_gateway_rest_api.documents_api.id
  parent_id   = aws_api_gateway_rest_api.documents_api.root_resource_id
  path_part   = "swagger"
}

resource "aws_api_gateway_resource" "swagger_ui" {
  rest_api_id = aws_api_gateway_rest_api.documents_api.id
  parent_id   = aws_api_gateway_resource.swagger.id
  path_part   = "ui"
}

# GET /documents
resource "aws_api_gateway_method" "get_documents" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.documents.id
  http_method   = "GET"
  authorization = "NONE" # For demo - in prod use Cognito or API keys
}

resource "aws_api_gateway_integration" "get_documents_integration" {
  rest_api_id             = aws_api_gateway_rest_api.documents_api.id
  resource_id             = aws_api_gateway_resource.documents.id
  http_method             = aws_api_gateway_method.get_documents.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.get_documents_function_invoke_arn
}

# GET /documents/{id}
resource "aws_api_gateway_method" "get_document_by_id" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.document_id.id
  http_method   = "GET"
  authorization = "NONE"
  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "get_document_by_id_integration" {
  rest_api_id             = aws_api_gateway_rest_api.documents_api.id
  resource_id             = aws_api_gateway_resource.document_id.id
  http_method             = aws_api_gateway_method.get_document_by_id.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.get_document_by_id_function_invoke_arn
}

# DELETE /documents/{id}
resource "aws_api_gateway_method" "delete_document" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.document_id.id
  http_method   = "DELETE"
  authorization = "NONE"
  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "delete_document_integration" {
  rest_api_id             = aws_api_gateway_rest_api.documents_api.id
  resource_id             = aws_api_gateway_resource.document_id.id
  http_method             = aws_api_gateway_method.delete_document.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.delete_document_function_invoke_arn
}

# POST /documents
resource "aws_api_gateway_method" "create_document" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.documents.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "create_document_integration" {
  rest_api_id             = aws_api_gateway_rest_api.documents_api.id
  resource_id             = aws_api_gateway_resource.documents.id
  http_method             = aws_api_gateway_method.create_document.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.create_document_function_invoke_arn
}

# POST /documents/upload-url
resource "aws_api_gateway_method" "generate_upload_url" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.upload_url.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "generate_upload_url_integration" {
  rest_api_id             = aws_api_gateway_rest_api.documents_api.id
  resource_id             = aws_api_gateway_resource.upload_url.id
  http_method             = aws_api_gateway_method.generate_upload_url.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.generate_upload_url_function_invoke_arn
}

# POST /documents/{id}/process
resource "aws_api_gateway_method" "process_document" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.document_process.id
  http_method   = "POST"
  authorization = "NONE"
  request_parameters = {
    "method.request.path.id" = true
  }
}

resource "aws_api_gateway_integration" "process_document_integration" {
  rest_api_id             = aws_api_gateway_rest_api.documents_api.id
  resource_id             = aws_api_gateway_resource.document_process.id
  http_method             = aws_api_gateway_method.process_document.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.process_document_function_invoke_arn
}

# CORS OPTIONS methods
resource "aws_api_gateway_method" "documents_options" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.documents.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "documents_options_response" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.documents.id
  http_method   = aws_api_gateway_method.documents_options.http_method
  status_code   = "200"
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration" "documents_options_integration" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.documents.id
  http_method   = aws_api_gateway_method.documents_options.http_method
  type          = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_integration_response" "documents_options_integration_response" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.documents.id
  http_method   = aws_api_gateway_method.documents_options.http_method
  status_code   = aws_api_gateway_method_response.documents_options_response.status_code
  
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-User-Id'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,PUT,DELETE,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

# Swagger JSON endpoint
resource "aws_api_gateway_method" "get_swagger_json" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.swagger.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_swagger_json_integration" {
  rest_api_id             = aws_api_gateway_rest_api.documents_api.id
  resource_id             = aws_api_gateway_resource.swagger.id
  http_method             = aws_api_gateway_method.get_swagger_json.http_method
  type                    = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "get_swagger_json_response" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.swagger.id
  http_method   = aws_api_gateway_method.get_swagger_json.http_method
  status_code   = "200"
  response_parameters = {
    "method.response.header.Content-Type" = true
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "get_swagger_json_integration_response" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.swagger.id
  http_method   = aws_api_gateway_method.get_swagger_json.http_method
  status_code   = aws_api_gateway_method_response.get_swagger_json_response.status_code
  response_parameters = {
    "method.response.header.Content-Type" = "'application/json'"
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
  response_templates = {
    "application/json" = file("${path.module}/../../backend/swagger.json")
  }
}

# Swagger UI endpoint
resource "aws_api_gateway_method" "get_swagger_ui" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.swagger_ui.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_swagger_ui_integration" {
  rest_api_id             = aws_api_gateway_rest_api.documents_api.id
  resource_id             = aws_api_gateway_resource.swagger_ui.id
  http_method             = aws_api_gateway_method.get_swagger_ui.http_method
  type                    = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_method_response" "get_swagger_ui_response" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.swagger_ui.id
  http_method   = aws_api_gateway_method.get_swagger_ui.http_method
  status_code   = "200"
  response_parameters = {
    "method.response.header.Content-Type" = true
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration_response" "get_swagger_ui_integration_response" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.swagger_ui.id
  http_method   = aws_api_gateway_method.get_swagger_ui.http_method
  status_code   = aws_api_gateway_method_response.get_swagger_ui_response.status_code
  response_parameters = {
    "method.response.header.Content-Type" = "'text/html'"
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
  response_templates = {
    "application/json" = file("${path.module}/../../backend/swagger-ui.html")
  }
}

# CORS for Swagger endpoints
resource "aws_api_gateway_method" "swagger_options" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.swagger.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_method_response" "swagger_options_response" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.swagger.id
  http_method   = aws_api_gateway_method.swagger_options.http_method
  status_code   = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin" = true
  }
}

resource "aws_api_gateway_integration" "swagger_options_integration" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.swagger.id
  http_method   = aws_api_gateway_method.swagger_options.http_method
  type          = "MOCK"
  request_templates = {
    "application/json" = jsonencode({
      statusCode = 200
    })
  }
}

resource "aws_api_gateway_integration_response" "swagger_options_integration_response" {
  rest_api_id   = aws_api_gateway_rest_api.documents_api.id
  resource_id   = aws_api_gateway_resource.swagger.id
  http_method   = aws_api_gateway_method.swagger_options.http_method
  status_code   = aws_api_gateway_method_response.swagger_options_response.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin" = "'*'"
  }
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "api_deployment" {
  depends_on = [
    aws_api_gateway_integration.get_documents_integration,
    aws_api_gateway_integration.get_document_by_id_integration,
    aws_api_gateway_integration.create_document_integration,
    aws_api_gateway_integration.generate_upload_url_integration,
    aws_api_gateway_integration.process_document_integration,
    aws_api_gateway_integration.delete_document_integration,
    aws_api_gateway_integration.documents_options_integration,
    aws_api_gateway_integration.get_swagger_json_integration,
    aws_api_gateway_integration.get_swagger_ui_integration,
    aws_api_gateway_integration.swagger_options_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.documents_api.id
  stage_name  = var.stage_name

  lifecycle {
    create_before_destroy = true
  }
}

# Lambda permissions for API Gateway
resource "aws_lambda_permission" "get_documents_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.get_documents_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.documents_api.execution_arn}/*/${aws_api_gateway_method.get_documents.http_method}${aws_api_gateway_resource.documents.path}"
}

resource "aws_lambda_permission" "get_document_by_id_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.get_document_by_id_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.documents_api.execution_arn}/*/${aws_api_gateway_method.get_document_by_id.http_method}${aws_api_gateway_resource.document_id.path}"
}

resource "aws_lambda_permission" "create_document_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.create_document_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.documents_api.execution_arn}/*/${aws_api_gateway_method.create_document.http_method}${aws_api_gateway_resource.documents.path}"
}

resource "aws_lambda_permission" "generate_upload_url_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.generate_upload_url_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.documents_api.execution_arn}/*/${aws_api_gateway_method.generate_upload_url.http_method}${aws_api_gateway_resource.upload_url.path}"
}

resource "aws_lambda_permission" "process_document_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.process_document_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.documents_api.execution_arn}/*/${aws_api_gateway_method.process_document.http_method}${aws_api_gateway_resource.document_process.path}"
}

resource "aws_lambda_permission" "delete_document_permission" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.delete_document_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.documents_api.execution_arn}/*/${aws_api_gateway_method.delete_document.http_method}${aws_api_gateway_resource.document_id.path}"
}
