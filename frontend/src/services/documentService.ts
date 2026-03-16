import {
    Document,
    DocumentListResponse,
    DocumentSearchResponse,
    UpdateDocumentRequest,
    UpdateDocumentResponse,
    UploadDocumentRequest,
    UploadDocumentResponse
} from '@/types/dto';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';
const DOCUMENTS_ENDPOINT = API_URL ? `${API_URL}/api/documents` : '/api/documents';
const EMBEDDINGS_ENDPOINT = API_URL ? `${API_URL}/api/embeddings` : '/api/embeddings';

// Get authentication token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export interface DocumentStats {
  totalDocuments: number;
  totalSize: number;
  statusBreakdown: Record<string, number>;
}

export const documentService = {
  // Get all documents with pagination
  async getDocuments(limit = 10, offset = 0): Promise<DocumentListResponse> {
    try {
      const response = await axios.get(
        `${DOCUMENTS_ENDPOINT}?limit=${limit}&offset=${offset}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  // Search documents
  async searchDocuments(query: string, limit = 10, offset = 0): Promise<DocumentSearchResponse> {
    try {
      const response = await axios.get(
        `${DOCUMENTS_ENDPOINT}/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw error;
    }
  },

  // Upload a document
  async uploadDocument(request: UploadDocumentRequest): Promise<UploadDocumentResponse> {
    try {
      const formData = new FormData();
      formData.append('document', request.document);
      if (request.title) {
        formData.append('title', request.title);
      }

      const response = await axios.post(`${DOCUMENTS_ENDPOINT}/upload`, formData, {
        ...getAuthHeader(),
        headers: {
          ...getAuthHeader().headers,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Update a document
  async updateDocument(id: string, request: UpdateDocumentRequest): Promise<UpdateDocumentResponse> {
    try {
      const response = await axios.put(
        `${DOCUMENTS_ENDPOINT}/${id}`,
        request,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Delete a document
  async deleteDocument(id: string): Promise<{ message: string }> {
    try {
      const response = await axios.delete(
        `${DOCUMENTS_ENDPOINT}/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Get a single document
  async getDocument(id: string): Promise<Document> {
    try {
      const response = await axios.get(
        `${DOCUMENTS_ENDPOINT}/${id}`,
        getAuthHeader()
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  /**
   * Get document statistics
   */
  async getDocumentStats(): Promise<DocumentStats> {
    const response = await axios.get(`${DOCUMENTS_ENDPOINT}/stats`, getAuthHeader());
    return response.data;
  },

  /**
   * Generate embeddings for a specific document
   */
  async generateEmbeddingsForDocument(documentId: string): Promise<{ message: string; documentId: string }> {
    const response = await axios.post(`${EMBEDDINGS_ENDPOINT}/documents/${documentId}/generate`, {}, getAuthHeader());
    return response.data;
  },

  /**
   * Generate embeddings for all documents
   */
  async generateEmbeddingsForAllDocuments(): Promise<{ message: string; count: number }> {
    const response = await axios.post(`${EMBEDDINGS_ENDPOINT}/documents/generate-all`, {}, getAuthHeader());
    return response.data;
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Get status color for UI
   */
  getStatusColor(status: Document['status']): string {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600';
      case 'PROCESSING':
        return 'text-blue-600';
      case 'UPLOADING':
        return 'text-yellow-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  },

  /**
   * Get status badge color for UI
   */
  getStatusBadgeColor(status: Document['status']): string {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'UPLOADING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },
}; 