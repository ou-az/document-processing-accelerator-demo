import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { createDocument } from '../../services/documentService';
import { CreateDocumentRequest, DocumentMetadata } from '../../models/Document';

/**
 * Create a new document
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
    
    const requestData: CreateDocumentRequest = JSON.parse(event.body);
    
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
    
    const metadata: DocumentMetadata = {
      fileName: requestData.fileName,
      fileType: requestData.fileType,
      fileSize: requestData.fileSize || 0,
      uploadDate: new Date().toISOString()
    };
    
    const document = await createDocument(userId, metadata);
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(document)
    };
  } catch (error) {
    console.error('Error creating document:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Error creating document',
        error: (error as Error).message
      })
    };
  }
};
