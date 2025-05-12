output "lambda_role_arn" {
  description = "ARN of the Lambda execution role"
  value       = aws_iam_role.lambda_role.arn
}

output "get_documents_function_name" {
  description = "Name of the get documents Lambda function"
  value       = aws_lambda_function.get_documents.function_name
}

output "get_documents_function_arn" {
  description = "ARN of the get documents Lambda function"
  value       = aws_lambda_function.get_documents.arn
}

output "get_documents_function_invoke_arn" {
  description = "Invoke ARN of the get documents Lambda function"
  value       = aws_lambda_function.get_documents.invoke_arn
}

output "get_document_by_id_function_name" {
  description = "Name of the get document by ID Lambda function"
  value       = aws_lambda_function.get_document_by_id.function_name
}

output "get_document_by_id_function_arn" {
  description = "ARN of the get document by ID Lambda function"
  value       = aws_lambda_function.get_document_by_id.arn
}

output "get_document_by_id_function_invoke_arn" {
  description = "Invoke ARN of the get document by ID Lambda function"
  value       = aws_lambda_function.get_document_by_id.invoke_arn
}

output "create_document_function_name" {
  description = "Name of the create document Lambda function"
  value       = aws_lambda_function.create_document.function_name
}

output "create_document_function_arn" {
  description = "ARN of the create document Lambda function"
  value       = aws_lambda_function.create_document.arn
}

output "create_document_function_invoke_arn" {
  description = "Invoke ARN of the create document Lambda function"
  value       = aws_lambda_function.create_document.invoke_arn
}

output "generate_upload_url_function_name" {
  description = "Name of the generate upload URL Lambda function"
  value       = aws_lambda_function.generate_upload_url.function_name
}

output "generate_upload_url_function_arn" {
  description = "ARN of the generate upload URL Lambda function"
  value       = aws_lambda_function.generate_upload_url.arn
}

output "generate_upload_url_function_invoke_arn" {
  description = "Invoke ARN of the generate upload URL Lambda function"
  value       = aws_lambda_function.generate_upload_url.invoke_arn
}

output "process_document_function_name" {
  description = "Name of the process document Lambda function"
  value       = aws_lambda_function.process_document.function_name
}

output "process_document_function_arn" {
  description = "ARN of the process document Lambda function"
  value       = aws_lambda_function.process_document.arn
}

output "process_document_function_invoke_arn" {
  description = "Invoke ARN of the process document Lambda function"
  value       = aws_lambda_function.process_document.invoke_arn
}
