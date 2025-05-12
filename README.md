# Document Processing Accelerator

[![AWS](https://img.shields.io/badge/AWS-Serverless-orange)](https://aws.amazon.com/serverless/)
[![React](https://img.shields.io/badge/React-TypeScript-blue)](https://reactjs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-API-green)](https://openai.com/)
[![Swagger](https://img.shields.io/badge/API-Swagger-85ea2d)](https://swagger.io/)

A serverless intelligent document processing system built on AWS that leverages OpenAI to extract, analyze, and process information from various document types.

## Project Overview

The Document Processing Accelerator is an intelligent document processing system built using a serverless architecture on AWS. It consists of a React TypeScript frontend and an AWS backend with Lambda functions and API Gateway.

### Key Features

- Document upload and processing
- AI-powered information extraction using OpenAI API integration
- Document classification and intelligent data extraction from structured and unstructured documents
- Easily customizable AI processing pipeline with configurable prompt engineering
- Secure authentication and authorization
- Role-based access control
- Serverless architecture for scalability and cost-efficiency

## Architecture

### Frontend
- **React** with TypeScript for type safety
- **AWS Amplify** integration for AWS services connectivity
- **Context API** for state management

### Backend
- **AWS Lambda** functions for serverless processing
- **API Gateway** for RESTful API endpoints with Swagger documentation
- **S3** for document storage
- **DynamoDB** for document metadata storage
- **OpenAI API** for document content analysis with GPT-4 integration

## API Documentation

The API is fully documented using Swagger/OpenAPI:


- **Interactive Documentation**: Available at `/swagger/ui` endpoint
- **OpenAPI Specification**: Available at `/swagger` endpoint
- **Authentication**: API documentation includes authentication requirements
- **Request/Response Examples**: Comprehensive examples for all endpoints


## OpenAI Integration

The solution leverages OpenAI's powerful GPT-4 model to process documents:


- **Document Analysis**: Extract key information from unstructured documents
- **Classification**: Automatically categorize documents by type and content
- **Data Extraction**: Pull structured data from invoices, receipts, and other documents
- **Custom Prompts**: Configurable prompt engineering for different document types
- **Confidence Scoring**: AI provides confidence level for extracted information


## Security Implementation

The application has a comprehensive security implementation focusing on authentication, authorization, and data protection:

### Authentication

1. **AWS Cognito Integration**
   - User Pool and Identity Pool defined in Terraform for user management
   - Configured for secure user registration, login, and account management
   - Identity Pool provides temporary AWS credentials for authenticated users

2. **Frontend Authentication**
   - Custom `authService` implementation for authentication operations
   - Local storage-based token management for development
   - Ready for AWS Cognito integration in production
   - Configurable authentication settings in `auth-config.ts`

3. **User Interface Components**
   - Login and registration forms with validation
   - Protected routes to secure application access
   - User session management with automatic redirects

4. **API Security**
   - Authentication token included in API requests
   - Conditional credentials handling based on authentication state

### Authorization

1. **IAM Role Configuration**
   - Least privilege access for Lambda functions
   - Limited S3 access for document uploads and retrieval
   - Restricted DynamoDB operations

2. **API Gateway Security**
   - Cognito User Pool as authorizer for API endpoints
   - Properly configured CORS settings
   - API key management for enhanced security

### Data Protection

1. **S3 Document Security**
   - Bucket policies restricting access to authenticated users
   - Server-side encryption for stored documents
   - Signed URLs for secure document access

2. **Application Security Features**
   - Secure session management
   - Protected API endpoints
   - Input validation and sanitization

## Deployment

The infrastructure is managed and deployed using Terraform and the Serverless Framework:

1. **Terraform**
   - Manages AWS resources including Cognito, IAM roles, and S3 buckets
   - Environment-specific configurations (dev, staging, prod)
   - Modular design for resource management

2. **Serverless Framework**
   - Configures and deploys Lambda functions and API Gateway
   - Integrates with Cognito for secure API endpoints
   - Handles environment variables and service dependencies

## Development and Getting Started

### Prerequisites
- Node.js (>= 14.x)
- AWS CLI configured with appropriate credentials
- Terraform (>= 1.0)
- Serverless Framework CLI

### Environment Setup
1. Clone the repository
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

### Configuration
Create a `.env` file in the frontend directory with the following content:

```env
REACT_APP_API_URL=http://localhost:3000/dev
REACT_APP_AWS_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=your-user-pool-id
REACT_APP_COGNITO_CLIENT_ID=your-client-id
REACT_APP_COGNITO_IDENTITY_POOL_ID=your-identity-pool-id
```

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your-openai-api-key
LAMBDA_ROLE_ARN=your-lambda-execution-role-arn
BUCKET_SUFFIX=unique-bucket-suffix
FRONTEND_URL=your-frontend-url
```

### Local Development

1. Start the frontend:

   ```bash
   cd frontend
   npm start
   ```

2. Run the backend locally:

   ```bash
   cd backend
   npx serverless offline
   ```

3. Access the Swagger documentation at: 

   ```text
   http://localhost:3000/dev/swagger/ui
   ```

## Deployment Instructions

### Infrastructure Deployment

1. Initialize Terraform:

   ```bash
   cd terraform/environments/dev
   terraform init
   ```

2. Apply Terraform configuration:

   ```bash
   terraform apply
   ```

### Backend Deployment

Deploy the serverless backend:

```bash
cd backend
npx serverless deploy --stage dev
```

### Frontend Deployment

Build and deploy the frontend:

```bash
cd frontend
npm run build
# Deploy to your chosen hosting service (S3, Amplify, etc.)
```

## Security Best Practices

1. **Keep dependencies updated** to mitigate vulnerabilities
2. **Use environment variables** for sensitive configuration
3. **Implement proper error handling** to avoid leaking sensitive information
4. **Follow least privilege principle** for IAM roles and policies
5. **Enable Multi-Factor Authentication (MFA)** for Cognito users in production
6. **Regularly review CloudTrail logs** for suspicious activities
7. **Set up CloudWatch alarms** for security events

## Testing

### Unit Tests

```bash
cd backend
npm test
```

### Integration Tests

```bash
cd backend
npm run test:integration
```

## Future Enhancements

1. **Enhanced authentication**
   - Multi-factor authentication
   - Social identity providers integration
   - Advanced password policies

2. **Improved security monitoring**
   - AWS GuardDuty integration
   - Security event alerts
   - Automated security audits

3. **Fine-grained authorization**
   - Role-based access control
   - Attribute-based access control
   - Document-level permissions

## Troubleshooting

### Authentication Issues
- Verify Cognito User Pool and Identity Pool configuration
- Check environment variables are correctly set
- Ensure API Gateway Cognito authorizer is properly configured

### API Access Problems
- Verify token inclusion in API requests
- Check CORS configuration in API Gateway
- Validate IAM permissions for accessing resources

### Document Processing Errors
- Ensure OpenAI API key is valid
- Check Lambda function permissions for S3 and DynamoDB access
- Verify document format is supported by the processing pipeline
