# Document Processing Accelerator Deployment Script
# This script builds the React application and deploys it to AWS using Terraform

# Build the React application
Write-Host "Building React application..." -ForegroundColor Cyan
Set-Location -Path ".\frontend"
npm run build
if (-not $?) {
    Write-Host "Failed to build React application" -ForegroundColor Red
    exit 1
}
Set-Location -Path ".."
Write-Host "React application built successfully" -ForegroundColor Green

# Initialize and apply Terraform configuration
Write-Host "Initializing Terraform..." -ForegroundColor Cyan
Set-Location -Path ".\terraform\environments\dev"
terraform init
if (-not $?) {
    Write-Host "Failed to initialize Terraform" -ForegroundColor Red
    exit 1
}

# Apply Terraform configuration
Write-Host "Applying Terraform configuration..." -ForegroundColor Cyan
terraform apply -auto-approve
if (-not $?) {
    Write-Host "Failed to apply Terraform configuration" -ForegroundColor Red
    exit 1
}

# Get the CloudFront URL
$frontendUrl = terraform output -raw frontend_url
Write-Host "Application deployed successfully!" -ForegroundColor Green
Write-Host "Frontend URL: $frontendUrl" -ForegroundColor Yellow

# Upload the React build to S3
Write-Host "Uploading React build to S3..." -ForegroundColor Cyan
$bucketName = terraform output -raw s3_bucket_name
aws s3 sync ..\..\..\frontend\build s3://$bucketName --delete
if (-not $?) {
    Write-Host "Failed to upload React build to S3" -ForegroundColor Red
    exit 1
}

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Your application is now available at: $frontendUrl" -ForegroundColor Cyan
Set-Location -Path "..\..\..\"
