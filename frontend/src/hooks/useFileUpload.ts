import { useState } from 'react';
import { documentService } from '../services/documentService';
import { DocumentStatus } from '../types/document';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  documentId: string | null;
  status: DocumentStatus | null;
}

export const useFileUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    success: false,
    documentId: null,
    status: null
  });

  /**
   * Uploads a file to S3 and tracks progress
   * @param file The file to upload
   * @returns The document ID if successful, null otherwise
   */
  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      // Set initial state for file upload
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
        success: false,
        documentId: null,
        status: DocumentStatus.PENDING
      });

      // Start progress updates (25% for initiating)
      setUploadState(prev => ({
        ...prev,
        progress: 25
      }));

      // 1. Upload the file using the document service (which handles getting presigned URL)
      const { documentId, success } = await documentService.uploadFile(file);

      if (!success) {
        throw new Error('File upload failed');
      }

      // 2. Show upload completed (75%)
      setUploadState(prev => ({
        ...prev,
        progress: 75,
        documentId
      }));

      // 3. Start polling for document processing status
      const pollInterval = setInterval(async () => {
        try {
          const status = await documentService.checkProcessingStatus(documentId);
          
          // Update progress based on processing status
          let progress = 75;
          if (status === DocumentStatus.PROCESSING) {
            progress = 90;
          } else if (status === DocumentStatus.COMPLETED) {
            progress = 100;
            clearInterval(pollInterval);
            
            // Update state to reflect success
            setUploadState({
              isUploading: false,
              progress,
              error: null,
              success: true,
              documentId,
              status
            });
          } else if (status === DocumentStatus.FAILED) {
            clearInterval(pollInterval);
            throw new Error('Document processing failed');
          }
          
          setUploadState(prev => ({
            ...prev,
            progress,
            status
          }));
          
        } catch (error) {
          clearInterval(pollInterval);
          throw error;
        }
      }, 2000); // Check every 2 seconds

      return documentId;
    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        success: false,
        documentId: null,
        status: DocumentStatus.FAILED
      });
      return null;
    }
  };

  return {
    uploadState,
    uploadFile
  };
};
