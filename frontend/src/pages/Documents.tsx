import { Edit, Eye, FileText, Plus, Search, Trash2, Upload, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Input } from "../components/ui/input";
import { PDFPreviewModal } from "../components/ui/PDFPreviewModal";
import { SlidePanel } from "../components/ui/SlidePanel";
import { Switch } from "../components/ui/switch";
import { toast } from "../components/ui/use-toast";
import { Document, documentService, UpdateDocumentRequest, UploadDocumentRequest } from "../services/documentService";

// Document Form Component
interface DocumentFormProps {
  document?: Document;
  isNew?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

function DocumentForm({ document, isNew = false, onSave, onCancel }: DocumentFormProps) {
  const [form, setForm] = useState({
    title: document?.title || "",
    filename: document?.filename || "",
    isActive: document?.isActive !== undefined ? document.isActive : true
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!document && !isNew) return;

    setIsSaving(true);
    try {
      const updateRequest: UpdateDocumentRequest = {
        title: form.title.trim() || undefined,
        filename: form.filename.trim() || undefined,
        isActive: form.isActive
      };

      await documentService.updateDocument(document!.id, updateRequest);
      
      toast({
        title: "Success",
        description: "Document updated successfully.",
      });

      onSave();
    } catch (err) {
      console.error("Failed to update document", err);
      toast({
        title: "Error",
        description: "Failed to update document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Title
        </label>
        <Input
          type="text"
          value={form.title}
          onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Document title"
        />
      </div>

      {document && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Filename
          </label>
          <Input
            type="text"
            value={form.filename}
            onChange={(e) => setForm(prev => ({ ...prev, filename: e.target.value }))}
            placeholder="Document filename"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Status
        </label>
        <div className="flex items-center space-x-2">
          <Switch 
            checked={form.isActive} 
            onCheckedChange={(checked) => setForm(prev => ({ ...prev, isActive: checked }))}
            id="isActive"
            className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-gray-200 focus:ring-red-500"
          />
          <label htmlFor="isActive" className="text-sm">
            {form.isActive ? "Active" : "Inactive"}
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          onClick={onCancel}
          variant="outline"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSaving}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          {isSaving ? "Saving..." : "Update"}
        </Button>
      </div>
    </form>
  );
}

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false,
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    file: null as File | null,
  });
  
  // Edit document state
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    filename: "",
  });

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // PDF preview state
  const [pdfPreview, setPdfPreview] = useState({
    isOpen: false,
    url: "",
    title: "",
  });

  // Load documents when page loads
  useEffect(() => {
    loadDocuments(1);
  }, []);

  const loadDocuments = async (page = 1) => {
    setLoading(true);
    try {
      const offset = (page - 1) * 10;
      const result = await documentService.getDocuments(10, offset);
      setDocuments(result.documents);
      setCurrentPage(page);
      setPagination({
        total: Math.ceil(result.pagination.total / 10),
        limit: 10,
        offset: result.pagination.offset,
        hasMore: result.pagination.hasMore,
      });
    } catch (err) {
      console.error("Failed to load documents", err);
      setError("Failed to load documents. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadDocuments(1);
      return;
    }

    setLoading(true);
    try {
      const result = await documentService.searchDocuments(searchTerm.trim());
      setDocuments(result.documents);
      setCurrentPage(1);
      setPagination({
        total: Math.ceil(result.pagination.total / 10),
        limit: 10,
        offset: result.pagination.offset,
        hasMore: result.pagination.hasMore,
      });
    } catch (err) {
      console.error("Failed to search documents", err);
      setError("Failed to search documents. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast({
        title: "Error",
        description: "Please select a PDF file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadRequest: UploadDocumentRequest = {
        document: uploadForm.file,
        title: uploadForm.title || undefined
      };

      await documentService.uploadDocument(uploadRequest);
      
      toast({
        title: "Success",
        description: "Document uploaded successfully and is being processed.",
      });

      // Reset form and close modal
      setUploadForm({ title: "", file: null });
      setShowUploadModal(false);
      
      // Reload documents
      loadDocuments(currentPage);

    } catch (err) {
      console.error("Failed to upload document", err);
      toast({
        title: "Error",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle document delete
  const handleDeleteDocument = async (documentId: string, documentName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Document",
      message: `Are you sure you want to delete "${documentName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await documentService.deleteDocument(documentId);
          toast({
            title: "Success",
            description: "Document deleted successfully.",
          });
          
          // Reload documents
          loadDocuments(currentPage);
        } catch (err) {
          console.error("Failed to delete document", err);
          toast({
            title: "Error",
            description: "Failed to delete document. Please try again.",
            variant: "destructive",
          });
        }
      },
    });
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Error",
          description: "Only PDF files are allowed.",
          variant: "destructive",
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast({
          title: "Error",
          description: "File size must be less than 10MB.",
          variant: "destructive",
        });
        return;
      }

      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle embedding generation for all documents
  const handleGenerateEmbeddings = async () => {
    setLoading(true);
    try {
      const result = await documentService.generateEmbeddingsForAllDocuments();
      
      toast({
        title: "Success",
        description: `Embeddings generated for ${result.count} documents. Documents are now searchable by AI.`,
      });

    } catch (err) {
      console.error("Failed to generate embeddings", err);
      toast({
        title: "Error",
        description: "Failed to generate embeddings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle embedding generation for individual document
  const handleGenerateDocumentEmbeddings = async (documentId: string, documentName: string) => {
    try {
      await documentService.generateEmbeddingsForDocument(documentId);
      
      toast({
        title: "Success",
        description: `Embeddings generated for "${documentName}". Document is now searchable by AI.`,
      });

    } catch (err) {
      console.error("Failed to generate embeddings for document", err);
      toast({
        title: "Error",
        description: "Failed to generate embeddings. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle document edit
  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setShowEditPanel(true);
  };

  // Handle save (edit)
  const handleSave = () => {
    // Close edit panel
    setShowEditPanel(false);
    setEditingDocument(null);

    // Reload documents
    loadDocuments(currentPage);
  };

  // Handle PDF preview
  const handlePreviewDocument = (document: Document) => {
    // Get the authentication token
    const token = localStorage.getItem('token');
    
    // Construct the PDF URL using the preview endpoint with authentication
    const pdfUrl = `/api/documents/${document.id}/preview?token=${token}`;
    setPdfPreview({
      isOpen: true,
      url: pdfUrl,
      title: document.title || document.originalName,
    });
  };

  if (loading && documents.length === 0) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
              <p className="text-gray-600">Upload and manage your PDF documents for AI processing</p>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shopmefy-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-100 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
              <p className="text-gray-600">Upload and manage your PDF documents for AI processing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleGenerateEmbeddings}
              disabled={loading || documents.length === 0}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-10 text-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate Embeddings
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 h-10 text-sm"
            >
              <Plus className="w-4 h-4" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="animate-scale-in">
        <div className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Search Documents</h2>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search documents by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-20 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-shopmefy-500 focus:border-shopmefy-500 transition-colors"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </form>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg animate-slide-up">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Documents Content */}
      <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shopmefy-600"></div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load documents</h3>
              <p className="text-gray-600 mb-6">
                There was a problem connecting to the server. Please try refreshing the page.
              </p>
              <Button
                onClick={() => {
                  setError(null);
                  loadDocuments(1);
                }}
                className="bg-shopmefy-500 hover:bg-shopmefy-600 text-white"
              >
                Try Again
              </Button>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? "No documents match your search criteria." : "Upload your first PDF document to get started."}
              </p>
              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-shopmefy-500 hover:bg-shopmefy-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Document
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Active
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((document, index) => (
                    <tr 
                      key={document.id} 
                      className="hover:bg-gray-50 transition-colors duration-200 animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {document.title || document.originalName}
                            </div>
                            {document.title && document.title !== document.originalName && (
                              <div className="text-sm text-gray-500">
                                {document.originalName}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          document.isActive ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {document.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {documentService.formatFileSize(document.size)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(document.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handlePreviewDocument(document)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Preview PDF"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleEditDocument(document)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Edit document"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteDocument(document.id, document.title || document.originalName)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
              <Button
                onClick={() => setShowUploadModal(false)}
                variant="outline"
                size="sm"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF File *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-sm text-gray-600 hover:text-gray-800"
                  >
                    {uploadForm.file ? (
                      <span className="text-green-600 font-medium">
                        {uploadForm.file.name}
                      </span>
                    ) : (
                      <>
                        Click to select a PDF file
                        <br />
                        <span className="text-xs text-gray-400">Max size: 10MB</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (optional)
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  disabled={!uploadForm.file || isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditPanel && editingDocument && (
        <SlidePanel
          title="Edit Document"
          isOpen={showEditPanel}
          onClose={() => setShowEditPanel(false)}
        >
          <DocumentForm
            document={editingDocument}
            onSave={handleSave}
            onCancel={() => setShowEditPanel(false)}
          />
        </SlidePanel>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={pdfPreview.isOpen}
        onClose={() => setPdfPreview(prev => ({ ...prev, isOpen: false }))}
        pdfUrl={pdfPreview.url}
        title={pdfPreview.title}
      />
    </div>
  );
} 