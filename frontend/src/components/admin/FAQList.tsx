import { Edit, HelpCircle, Plus, Search, Trash2, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { faqApi } from "../../api/faqApi";
import { FAQ, FAQFilters } from "../../types/faq";
import { Button } from "../ui/button";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { SlidePanel } from "../ui/SlidePanel";
import { toast } from "../ui/use-toast";
import { FAQForm } from "./FAQForm";

export function FAQList() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FAQFilters>({});
  const [selectedFaqId, setSelectedFaqId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [generatingEmbeddings, setGeneratingEmbeddings] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Add function to generate embeddings for all FAQs
  const handleGenerateEmbeddings = async () => {
    try {
      setGeneratingEmbeddings(true);
      await faqApi.generateEmbeddingsForAllFAQs();
      toast({
        title: "Embeddings generated",
        description: "Embeddings for all FAQs have been generated successfully.",
      });
    } catch (err) {
      console.error("Failed to generate embeddings", err);
      toast({
        title: "Error",
        description: "Failed to generate embeddings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingEmbeddings(false);
    }
  };

  // Load FAQs with filters
  const loadFaqs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await faqApi.getFAQs(filters, currentPage, 10);
      setFaqs(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error("Failed to load FAQs", err);
      setError("Failed to load FAQs. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    loadFaqs();
  }, [loadFaqs]);

  // Apply filters
  const applyFilters = () => {
    setFilters({
      search: searchTerm,
    });
    setCurrentPage(1);
  };

  // Reset filters
  const _resetFilters = () => {
    setSearchTerm("");
    setFilters({});
    setCurrentPage(1);
  };

  // Handle edit
  const handleEditFaq = (faqId: string) => {
    setSelectedFaqId(faqId);
    setIsEditing(true);
  };

  // Handle create
  const handleCreateFaq = () => {
    setIsCreating(true);
  };

  // Handle delete
  const handleDeleteFaq = async (faqId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete FAQ",
      message: "Are you sure you want to delete this FAQ? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await faqApi.deleteFAQ(faqId);
          toast({
            title: "Success",
            description: "FAQ deleted successfully.",
          });
          loadFaqs();
        } catch (err) {
          console.error("Failed to delete FAQ", err);
          toast({
            title: "Error",
            description: "Failed to delete FAQ. Please try again.",
            variant: "destructive",
          });
        }
      },
    });
  };

  // Handle save (create or edit)
  const handleSave = () => {
    setIsEditing(false);
    setIsCreating(false);
    setSelectedFaqId(null);
    loadFaqs();
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl p-6 border border-purple-100 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">FAQs</h1>
              <p className="text-gray-600">Manage frequently asked questions and AI embeddings</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateEmbeddings}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 h-10 text-sm"
              disabled={generatingEmbeddings}
            >
              <Zap className="w-4 h-4" />
              {generatingEmbeddings ? "Generating..." : "Generate Embeddings"}
            </Button>
            <Button
              onClick={handleCreateFaq}
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 h-10 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add FAQ
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="animate-scale-in">
        <div className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
          </div>
          
          <div className="flex gap-3">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-20 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-shopmefy-500 focus:border-shopmefy-500 transition-colors"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg animate-slide-up">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* FAQs Content */}
      <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shopmefy-600"></div>
            </div>
          ) : faqs.length === 0 ? (
            <div className="p-12 text-center">
              <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first FAQ</p>
              <Button onClick={handleCreateFaq} className="bg-shopmefy-500 hover:bg-shopmefy-600">
                <Plus className="w-4 h-4 mr-2" />
                Add FAQ
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Question
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {faqs.map((faq, index) => (
                    <tr 
                      key={faq.id} 
                      className="hover:bg-gray-50 transition-colors duration-200 animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <HelpCircle className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-900 leading-relaxed">
                              {faq.question}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          faq.isActive ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {faq.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => handleEditFaq(faq.id)}
                            variant="ghost"
                            size="sm"
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteFaq(faq.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {/* Edit FAQ Slide Panel */}
      <SlidePanel
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit FAQ"
      >
        {selectedFaqId && (
          <FAQForm
            faqId={selectedFaqId}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </SlidePanel>

      {/* Create FAQ Slide Panel */}
      <SlidePanel
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="Create FAQ"
      >
        <FAQForm
          isNew
          onSave={handleSave}
          onCancel={() => setIsCreating(false)}
        />
      </SlidePanel>

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
    </div>
  );
} 