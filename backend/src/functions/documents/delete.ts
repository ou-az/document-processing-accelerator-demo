import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { deleteDocument } from '../../services/documentService';

/**
 * Delete a document by ID
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const documentId = event.pathParameters?.id;
    
    if (!documentId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          message: 'Document ID is required'
        })
      };
    }
    
    await deleteDocument(documentId);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        message: 'Document deleted successfully',
        id: documentId
      })
    };
  } catch (error) {
    console.error('Error deleting document:', error);
    
    // If document not found
    if ((error as Error).message === 'Document not found') {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          message: 'Document not found'
        })
      };
    }
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        message: 'Error deleting document',
        error: (error as Error).message
      })
    };
  }
};
