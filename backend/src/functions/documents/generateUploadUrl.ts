import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createDocument, generateUploadUrl } from '../../services/documentService';
import { GenerateUploadUrlRequest, DocumentMetadata } from '../../models/Document';

/**
 * Generate a pre-signed URL for uploading a document to S3
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // In a real application, you would get the userId from the authenticated user
    const userId = event.headers['x-user-id'] || 'demo-user-123';
    
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          message: 'Request body is required'
        })
      };
    }
    
    const requestData: GenerateUploadUrlRequest = JSON.parse(event.body);
    
    if (!requestData.fileName || !requestData.fileType) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          message: 'fileName and fileType are required'
        })
      };
    }
    
    // Create a document record in DynamoDB
    const metadata: DocumentMetadata = {
      fileName: requestData.fileName,
      fileType: requestData.fileType,
      fileSize: 0, // This will be updated after upload
      uploadDate: new Date().toISOString()
    };
    
    const document = await createDocument(userId, metadata);
    
    // Generate a pre-signed URL for uploading to S3
    const uploadUrl = await generateUploadUrl(
      document.id,
      requestData.fileName,
      requestData.fileType
    );
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadUrl,
        documentId: document.id
      })
    };
  } catch (error) {
    console.error('Error generating upload URL:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Error generating upload URL',
        error: (error as Error).message
      })
    };
  }
};
