import { 
  Document, 
  DocumentUploadResponse, 
  DocumentStatus,
  GenerateUploadUrlRequest,
  ProcessDocumentRequest,
  ProcessDocumentResponse
} from '../types/document';
import { apiRequest, uploadFileWithPresignedUrl } from './apiClient';

export const documentService = {
  /**
   * Get all documents
   */
  getDocuments: async (): Promise<Document[]> => {
    try {
      const response = await apiRequest<{documents: Document[]}>('/documents');
      return response.documents;
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  },

  /**
   * Get a document by ID
   */
  getDocument: async (id: string): Promise<Document | null> => {
    try {
      const document = await apiRequest<Document>(`/documents/${id}`);
      return document;
    } catch (error) {
      console.error(`Error getting document ${id}:`, error);
      return null;
    }
  },

  /**
   * Initiate document upload
   * Returns a presigned URL for direct upload to S3
   */
  initiateUpload: async (fileName: string, fileType: string, fileSize: number): Promise<DocumentUploadResponse> => {
    try {
      const request: GenerateUploadUrlRequest = {
        fileName,
        fileType
      };
      
      const response = await apiRequest<DocumentUploadResponse>(
        '/documents/upload-url',
        'POST',
        request
      );
      
      return response;
    } catch (error) {
      console.error('Error initiating upload:', error);
      throw new Error('Failed to initiate file upload');
    }
  },

  /**
   * Upload a file using the presigned URL
   */
  uploadFile: async (file: File): Promise<{documentId: string, success: boolean}> => {
    try {
      // 1. Get a presigned URL for the upload
      const { documentId, uploadUrl } = await documentService.initiateUpload(
        file.name,
        file.type,
        file.size
      );
      
      // 2. Upload the file directly to S3 using the presigned URL
      const success = await uploadFileWithPresignedUrl(uploadUrl, file);
      
      // 3. Trigger processing if upload was successful
      if (success) {
        await documentService.processDocument(documentId);
      }
      
      return { documentId, success };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  },

  /**
   * Process a document to extract information
   */
  processDocument: async (documentId: string): Promise<ProcessDocumentResponse> => {
    try {
      const request: ProcessDocumentRequest = { documentId };
      const response = await apiRequest<ProcessDocumentResponse>(
        `/documents/${documentId}/process`,
        'POST',
        request
      );
      
      return response;
    } catch (error) {
      console.error(`Error processing document ${documentId}:`, error);
      throw new Error('Failed to process document');
    }
  },
  
  /**
   * Check document processing status
   */
  checkProcessingStatus: async (documentId: string): Promise<DocumentStatus> => {
    try {
      const document = await documentService.getDocument(documentId);
      return document?.status || DocumentStatus.FAILED;
    } catch (error) {
      console.error(`Error checking status for document ${documentId}:`, error);
      return DocumentStatus.FAILED;
    }
  },
  
  /**
   * Delete a document by ID
   */
  deleteDocument: async (documentId: string): Promise<boolean> => {
    try {
      // First attempt to call the real API
      try {
        await apiRequest<{success: boolean}>(
          `/documents/${documentId}`,
          'DELETE'
        );
        console.log(`Document ${documentId} deleted successfully via API`);
        return true;
      } catch (apiError) {
        console.error(`API Error deleting document ${documentId}:`, apiError);
        
        // If API fails due to CORS or other issues, use the mock implementation
        if (process.env.REACT_APP_USE_MOCK_API === 'true') {
          console.log(`Using mock deletion for document ${documentId}`);
          // Simulate success with mock implementation
          return true;
        }
        throw apiError; // re-throw if mock API is not enabled
      }
    } catch (error) {
      console.error(`Unhandled error deleting document ${documentId}:`, error);
      return false;
    }
  }
};
