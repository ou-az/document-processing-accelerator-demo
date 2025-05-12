# Document Processing Accelerator - AWS Deployment Guide

This guide provides instructions on how to deploy the Document Processing Accelerator to AWS using Terraform.

## Prerequisites

- AWS CLI installed and configured with appropriate credentials
- Terraform CLI installed (v1.0.0 or newer)
- Node.js and npm installed
- AWS account with necessary permissions to create:
  - S3 buckets
  - CloudFront distributions
  - IAM roles and policies

## Deployment Steps

### Option 1: Using the Deployment Script

For a streamlined deployment process, you can use the provided PowerShell script:

```powershell
./deploy.ps1
```

This script will:
1. Build the React application
2. Initialize Terraform
3. Apply the Terraform configuration to create AWS resources
4. Upload the built React application to the created S3 bucket
5. Output the CloudFront URL where your application is available

### Option 2: Manual Deployment

If you prefer to deploy manually, follow these steps:

#### 1. Configure AWS Credentials

You can set up AWS credentials in several ways:

```bash
# Option A: AWS CLI configuration
aws configure
# Enter your AWS Access Key ID, Secret Access Key, region, and output format

# Option B: Environment variables
$env:AWS_ACCESS_KEY_ID="your-access-key"
$env:AWS_SECRET_ACCESS_KEY="your-secret-key"
$env:AWS_REGION="us-east-1"
```

#### 2. Build the React Application

```bash
cd frontend
npm run build
cd ..
```

#### 3. Initialize Terraform

```bash
cd terraform/environments/dev
terraform init
```

#### 4. Apply Terraform Configuration

```bash
terraform apply
```

Review the planned changes and type `yes` when prompted to confirm.

#### 5. Upload the React Build to S3

Once Terraform has created the AWS resources, upload the React build files to the S3 bucket:

```bash
$bucketName = terraform output -raw s3_bucket_name
aws s3 sync ../../../frontend/build s3://$bucketName --delete
```

#### 6. Access Your Application

The application will be available at the CloudFront URL:

```bash
terraform output -raw frontend_url
```

## AWS Infrastructure

This deployment creates the following AWS resources:

1. **S3 Bucket**: Hosts the static files for the React application
   - Configured with appropriate CORS settings
   - Secured with bucket policy
   - Public access controlled through CloudFront

2. **CloudFront Distribution**: Serves the application globally
   - HTTPS enabled by default
   - Configured for SPA routing (redirects 404s to index.html)
   - Optimized caching settings

## Extending the Deployment

### Adding Custom Domain

To use a custom domain:

1. Register a domain in Route 53 or configure an existing domain
2. Create an ACM certificate for your domain
3. Update the CloudFront module to use your certificate
4. Create a Route 53 DNS record pointing to the CloudFront distribution

### Setting Up CI/CD

For continuous deployment:

1. Store the Terraform state in a remote backend (S3 + DynamoDB)
2. Set up GitHub Actions or AWS CodePipeline
3. Configure workflows to build, test, and deploy automatically

## Backend Services

To complete the functionality of the Document Processing Accelerator, you'll need to deploy the backend services:

1. API Gateway for handling requests
2. Lambda functions for document processing
3. DynamoDB for storing metadata
4. S3 for document storage
5. Step Functions for orchestration
6. Cognito for authentication

These services can be deployed using the same Terraform approach with additional modules.

## Cleanup

To avoid incurring charges for unused resources, clean up when no longer needed:

```bash
cd terraform/environments/dev
terraform destroy
```

Type `yes` when prompted to confirm resource deletion.

## Troubleshooting

### CloudFront Distribution Not Updating

CloudFront distributions can take time to propagate changes. You can force an invalidation:

```bash
$distributionId = terraform output -raw cloudfront_distribution_id
aws cloudfront create-invalidation --distribution-id $distributionId --paths "/*"
```

### S3 Access Issues

If you encounter S3 access issues, check:
- Bucket policy permissions
- CloudFront origin access control settings
- AWS credentials permissions

### Terraform Apply Errors

If Terraform fails to apply:
- Check AWS credentials and permissions
- Ensure no resource name conflicts exist
- Check for service limits or quotas
- Verify that you're using a supported Terraform version
