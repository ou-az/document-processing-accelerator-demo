output "api_gateway_id" {
  description = "ID of the API Gateway REST API"
  value       = aws_api_gateway_rest_api.documents_api.id
}

output "api_gateway_root_resource_id" {
  description = "ID of the API Gateway REST API root resource"
  value       = aws_api_gateway_rest_api.documents_api.root_resource_id
}

output "api_url" {
  description = "URL of the API Gateway"
  value       = "${aws_api_gateway_deployment.api_deployment.invoke_url}"
}

output "stage_name" {
  description = "Name of the API Gateway stage"
  value       = var.stage_name
}
