import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDocumentsByUserId } from '../../services/documentService';

/**
 * Get all documents for a user
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // In a real application, you would get the userId from the authenticated user
    // For demo purposes, we'll use a fixed userId or extract it from request headers/query
    const userId = event.headers['x-user-id'] || 'demo-user-123';
    
    const documents = await getDocumentsByUserId(userId);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        documents,
        count: documents.length
      })
    };
  } catch (error) {
    console.error('Error getting documents:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Error retrieving documents',
        error: (error as Error).message
      })
    };
  }
};
