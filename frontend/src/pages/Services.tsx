import { Edit, Plus, Server, Trash2, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { serviceApi } from "../api/serviceApi";
import { ServiceForm } from "../components/services/ServiceForm";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { SlidePanel } from "../components/ui/SlidePanel";
import { toast } from "../components/ui/use-toast";
import { Service, ServiceFilters } from "../types/dto/service.dto";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ServiceFilters>({});
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState<string | null>(null);
  const [generatingEmbeddings, setGeneratingEmbeddings] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Add function to generate embeddings for all active services
  const handleGenerateEmbeddings = async () => {
    try {
      setGeneratingEmbeddings(true);
      await serviceApi.generateEmbeddingsForAllServices();
      toast({
        title: "Embeddings generated",
        description: "Embeddings for all active services have been generated successfully.",
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

  // Load services when page loads or filters change
  useEffect(() => {
    async function loadServices() {
      setLoading(true);
      try {
        const result = await serviceApi.getServices(filters, currentPage, 10);
        setServices(result.data);
        setTotalPages(result.pagination.totalPages);
      } catch (err) {
        console.error("Failed to load services", err);
        setError("Failed to load services. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadServices();
  }, [filters, currentPage]);

  // Reset filters
  const resetFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Handle service edit
  const handleEditService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setIsEditing(true);
  };

  // Handle service create
  const handleCreateService = () => {
    setIsCreating(true);
  };

  // Handle service delete
  const handleDeleteService = async (serviceId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Service",
      message: "Are you sure you want to delete this service? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await serviceApi.deleteService(serviceId);
          toast({
            title: "Success",
            description: "Service deleted successfully.",
          });
          // Refresh service list
          const result = await serviceApi.getServices(filters, currentPage, 10);
          setServices(result.data);
          setTotalPages(result.pagination.totalPages);
        } catch (err) {
          console.error("Failed to delete service", err);
          toast({
            title: "Error",
            description: "Failed to delete service. Please try again later.",
            variant: "destructive",
          });
        }
      },
    });
  };

  // Toggle description expansion
  const toggleDescription = (serviceId: string) => {
    if (expandedDescription === serviceId) {
      setExpandedDescription(null);
    } else {
      setExpandedDescription(serviceId);
    }
  };

  // Handle save (create or edit)
  const handleSave = () => {
    // Close edit/create panel
    setIsEditing(false);
    setIsCreating(false);
    setSelectedServiceId(null);

    // Reload services
    serviceApi.getServices(filters, currentPage, 10).then((result) => {
      setServices(result.data);
      setTotalPages(result.pagination.totalPages);
    });
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Services</h1>
              <p className="text-gray-600">Manage your service offerings</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerateEmbeddings}
              disabled={generatingEmbeddings || services.length === 0}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-10 text-sm"
            >
              {generatingEmbeddings ? (
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
            </button>
            <button
              onClick={handleCreateService}
              className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 h-10 text-sm"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg animate-slide-up">
          <p className="text-red-700 font-medium">{error}</p>
          <button
            onClick={() => {
              setError(null);
              // Reload services
              serviceApi.getServices(filters, currentPage, 10).then((result) => {
                setServices(result.data);
                setTotalPages(result.pagination.totalPages);
              }).catch((err) => {
                console.error("Failed to load services", err);
                setError("Failed to load services. Please try again later.");
              });
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Services Content */}
      <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shopmefy-600"></div>
            </div>
          ) : services.length === 0 ? (
            <div className="p-12 text-center">
              <Server className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No services found</p>
              <p className="text-gray-400 text-sm mt-2">Create a new service to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Service
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Price
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
                <tbody className="bg-white divide-y divide-gray-50">
                  {services.map((service, index) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150" style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Server className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {service.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {service.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800">
                          {formatPrice(service.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          service.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditService(service.id)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all duration-200"
                            title="Edit service"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete service"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      {/* Create/Edit Service Slide Panel */}
      <SlidePanel
        title={isCreating ? "Create Service" : "Edit Service"}
        isOpen={isCreating || isEditing}
        onClose={() => {
          setIsCreating(false);
          setIsEditing(false);
          setSelectedServiceId(null);
        }}
      >
        <ServiceForm
          serviceId={selectedServiceId || undefined}
          isNew={isCreating}
          onSave={handleSave}
          onCancel={() => {
            setIsCreating(false);
            setIsEditing(false);
            setSelectedServiceId(null);
          }}
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