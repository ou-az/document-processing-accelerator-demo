import { APIGatewayProxyEvent, APIGatewayProxyResult, S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getDocumentById, updateDocumentStatus, updateDocumentExtractionResult } from '../../services/documentService';
import { extractDocumentInfo } from '../../services/openaiService';
import { DocumentStatus, DocumentType } from '../../models/Document';

const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const DOCUMENTS_BUCKET = process.env.DOCUMENTS_BUCKET || '';

/**
 * Process a document to extract information using OpenAI
 * This handler can be triggered by either:
 * 1. An HTTP POST request
 * 2. An S3 event when a document is uploaded
 */
export const handler = async (
  event: APIGatewayProxyEvent | S3Event
): Promise<APIGatewayProxyResult | void> => {
  try {
    // Handle both HTTP API Gateway events and S3 events
    if ('pathParameters' in event) {
      // API Gateway event
      return await handleApiGatewayEvent(event);
    } else {
      // S3 event
      await handleS3Event(event);
    }
  } catch (error) {
    console.error('Error processing document:', error);
    
    if ('pathParameters' in event) {
      // Only return a response for API Gateway events
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          message: 'Error processing document',
          error: (error as Error).message
        })
      };
    }
  }
};

/**
 * Handle API Gateway event for document processing
 */
const handleApiGatewayEvent = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
  
  // Update document status to PROCESSING
  await updateDocumentStatus(documentId, DocumentStatus.PROCESSING);
  
  // Process the document (in a real application, this would be done asynchronously)
  try {
    // Get the document content from S3
    const text = await getDocumentTextFromS3(DOCUMENTS_BUCKET, document.s3Key);
    
    // Determine document type (could be passed from request or detected)
    const documentType = document.metadata.documentType || DocumentType.OTHER;
    
    // Extract information using OpenAI
    const extractionResult = await extractDocumentInfo(text, documentType);
    
    // Update document with extraction results
    const updatedDocument = await updateDocumentExtractionResult(documentId, extractionResult);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        documentId,
        status: updatedDocument.status,
        extractionResult: updatedDocument.extractionResult
      })
    };
  } catch (error) {
    // Update document status to FAILED
    await updateDocumentStatus(documentId, DocumentStatus.FAILED);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        message: 'Error processing document',
        error: (error as Error).message
      })
    };
  }
};

/**
 * Handle S3 event for document processing
 */
const handleS3Event = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    
    // Extract the document ID from the S3 key
    // Assuming key format is: userId/documentId/fileName
    const parts = key.split('/');
    if (parts.length < 2) {
      console.error('Invalid S3 key format:', key);
      continue;
    }
    
    const documentId = parts[1];
    console.log(`Processing document ${documentId} from S3 event`);
    
    const document = await getDocumentById(documentId);
    
    if (!document) {
      console.error(`Document ${documentId} not found in database`);
      continue;
    }
    
    // Update document status to PROCESSING
    await updateDocumentStatus(documentId, DocumentStatus.PROCESSING);
    
    try {
      // Get the document content from S3
      const text = await getDocumentTextFromS3(bucket, key);
      
      // Determine document type
      const documentType = document.metadata.documentType || DocumentType.OTHER;
      
      // Extract information using OpenAI
      const extractionResult = await extractDocumentInfo(text, documentType);
      
      // Update document with extraction results
      await updateDocumentExtractionResult(documentId, extractionResult);
      
      console.log(`Document ${documentId} processed successfully`);
    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error);
      
      // Update document status to FAILED
      await updateDocumentStatus(documentId, DocumentStatus.FAILED);
    }
  }
};

/**
 * Get document text from S3
 * Note: In a real application, you would use OCR for image-based documents
 * and PDF parsing for PDF documents. This is a simplified implementation.
 */
const getDocumentTextFromS3 = async (bucket: string, key: string): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error('Empty file');
    }
    
    // Convert stream to text
    return await streamToString(response.Body);
  } catch (error) {
    console.error('Error getting document from S3:', error);
    throw new Error('Failed to retrieve document from S3');
  }
};

/**
 * Convert a stream to a string
 */
const streamToString = async (stream: any): Promise<string> => {
  const chunks: Buffer[] = [];
  
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
  });
};
