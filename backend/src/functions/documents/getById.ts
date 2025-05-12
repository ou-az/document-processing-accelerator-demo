import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDocumentById } from '../../services/documentService';

/**
 * Get a document by ID
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const documentId = event.pathParameters?.id;
    
    if (!documentId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          message: 'Document ID is required'
        })
      };
    }
    
    const document = await getDocumentById(documentId);
    
    if (!document) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          message: 'Document not found'
        })
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(document)
    };
  } catch (error) {
    console.error('Error getting document by ID:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Error retrieving document',
        error: (error as Error).message
      })
    };
  }
};
