export enum DocumentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum DocumentType {
  INVOICE = 'INVOICE',
  RECEIPT = 'RECEIPT',
  CONTRACT = 'CONTRACT',
  FORM = 'FORM',
  ID = 'ID',
  OTHER = 'OTHER'
}

export interface DocumentMetadata {
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  lastModified?: string;
  documentType?: DocumentType;
  pageCount?: number;
}

export interface DocumentExtractionResult {
  fields?: Record<string, any>;
  entities?: {
    name: string;
    value: string;
    confidence: number;
  }[];
  summary?: string;
  rawText?: string;
  keyValuePairs?: Record<string, string>;
}

export interface Document {
  id: string;
  userId: string;
  status: DocumentStatus;
  metadata: DocumentMetadata;
  extractionResult?: DocumentExtractionResult;
  s3Key: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export interface GenerateUploadUrlRequest {
  fileName: string;
  fileType: string;
}

export interface GenerateUploadUrlResponse {
  uploadUrl: string;
  documentId: string;
}

export interface ProcessDocumentRequest {
  documentId: string;
}

export interface ProcessDocumentResponse {
  documentId: string;
  status: DocumentStatus;
  extractionResult?: DocumentExtractionResult;
}
