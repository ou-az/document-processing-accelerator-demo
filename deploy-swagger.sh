#!/bin/bash

# Deploy Swagger documentation for Document Processing Accelerator
echo "Starting Swagger documentation deployment..."

# 1. Make sure the backend directory exists
if [ ! -d "./backend" ]; then
  echo "Error: backend directory not found. Please run this script from the project root."
  exit 1
fi

# 2. Make sure swagger.json and swagger-ui.html files exist
if [ ! -f "./backend/swagger.json" ] || [ ! -f "./backend/swagger-ui.html" ]; then
  echo "Error: swagger.json or swagger-ui.html not found in the backend directory."
  exit 1
fi

# 3. Apply Terraform changes to add Swagger documentation endpoints
echo "Applying Terraform changes..."
cd terraform
terraform init
terraform apply -auto-approve

# 4. Get API Gateway URL from Terraform output
API_URL=$(terraform output -raw api_gateway_url)
STAGE=$(terraform output -raw stage_name)

if [ -z "$API_URL" ]; then
  echo "Error: Could not get API Gateway URL from Terraform output."
  exit 1
fi

# 5. Display documentation URLs
echo ""
echo "Swagger documentation deployment complete!"
echo ""
echo "Documentation URLs:"
echo "  - Swagger UI: ${API_URL}/${STAGE}/swagger/ui"
echo "  - Swagger JSON: ${API_URL}/${STAGE}/swagger"
echo ""
echo "You can access these URLs in your browser to view and test the API documentation."
