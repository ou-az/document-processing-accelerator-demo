import { DynamoDB, S3 } from 'aws-sdk';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { Document, DocumentStatus, DocumentMetadata } from '../models/Document';

const dynamoDb = new DynamoDB.DocumentClient();
const s3Client = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });
const DOCUMENTS_TABLE = process.env.DOCUMENTS_TABLE || '';
const DOCUMENTS_BUCKET = process.env.DOCUMENTS_BUCKET || '';

/**
 * Get all documents for a user
 */
export const getDocumentsByUserId = async (userId: string): Promise<Document[]> => {
  const params = {
    TableName: DOCUMENTS_TABLE,
    IndexName: 'UserIdIndex',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };

  const result = await dynamoDb.query(params).promise();
  return result.Items as Document[];
};

/**
 * Get a document by ID
 */
export const getDocumentById = async (documentId: string): Promise<Document | null> => {
  const params = {
    TableName: DOCUMENTS_TABLE,
    Key: {
      id: documentId
    }
  };

  const result = await dynamoDb.get(params).promise();
  return result.Item as Document || null;
};

/**
 * Create a new document record (before upload)
 */
export const createDocument = async (
  userId: string,
  metadata: DocumentMetadata
): Promise<Document> => {
  const timestamp = new Date().toISOString();
  const documentId = uuidv4();
  const s3Key = `${userId}/${documentId}/${metadata.fileName}`;

  const document: Document = {
    id: documentId,
    userId,
    status: DocumentStatus.PENDING,
    metadata,
    s3Key,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const params = {
    TableName: DOCUMENTS_TABLE,
    Item: document
  };

  await dynamoDb.put(params).promise();
  return document;
};

/**
 * Generate a pre-signed URL for uploading a document to S3
 */
export const generateUploadUrl = async (
  documentId: string,
  fileName: string,
  fileType: string
): Promise<string> => {
  const document = await getDocumentById(documentId);
  
  if (!document) {
    throw new Error('Document not found');
  }

  const command = new PutObjectCommand({
    Bucket: DOCUMENTS_BUCKET,
    Key: document.s3Key,
    ContentType: fileType
  });

  // URL expires in 15 minutes
  return getSignedUrl(s3Client, command, { expiresIn: 900 });
};

/**
 * Update document status
 */
export const updateDocumentStatus = async (
  documentId: string,
  status: DocumentStatus
): Promise<Document> => {
  const timestamp = new Date().toISOString();

  const params = {
    TableName: DOCUMENTS_TABLE,
    Key: {
      id: documentId
    },
    UpdateExpression: 'set #status = :status, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': status,
      ':updatedAt': timestamp
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await dynamoDb.update(params).promise();
  return result.Attributes as Document;
};

/**
 * Update document extraction results
 */
export const updateDocumentExtractionResult = async (
  documentId: string,
  extractionResult: any
): Promise<Document> => {
  const timestamp = new Date().toISOString();

  const params = {
    TableName: DOCUMENTS_TABLE,
    Key: {
      id: documentId
    },
    UpdateExpression: 'set extractionResult = :extractionResult, #status = :status, updatedAt = :updatedAt',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':extractionResult': extractionResult,
      ':status': DocumentStatus.COMPLETED,
      ':updatedAt': timestamp
    },
    ReturnValues: 'ALL_NEW'
  };

  const result = await dynamoDb.update(params).promise();
  return result.Attributes as Document;
};

/**
 * Delete a document by ID
 */
export const deleteDocument = async (documentId: string): Promise<boolean> => {
  // First get the document to get the S3 key
  const document = await getDocumentById(documentId);
  
  if (!document) {
    throw new Error('Document not found');
  }
  
  // Delete from DynamoDB
  const params = {
    TableName: DOCUMENTS_TABLE,
    Key: {
      id: documentId
    }
  };
  
  await dynamoDb.delete(params).promise();
  
  // Also delete from S3 if we have the key
  if (document.s3Key) {
    try {
      const s3 = new S3();
      await s3.deleteObject({
        Bucket: DOCUMENTS_BUCKET,
        Key: document.s3Key
      }).promise();
    } catch (error) {
      console.error(`Error deleting S3 object ${document.s3Key}:`, error);
      // We don't rethrow here, as we already deleted from DynamoDB
    }
  }
  
  return true;
};
