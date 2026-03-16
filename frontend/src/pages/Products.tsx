import { AlertTriangle, Edit, Filter, Package, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { productApi } from "../api/productApi";
import { ProductForm } from "../components/products/ProductForm";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { SlidePanel } from "../components/ui/SlidePanel";
import { toast } from "../components/ui/use-toast";
import { Product, ProductFilters } from "../types/product";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Load products when page loads or filters change
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const result = await productApi.getProducts(filters, currentPage, 10);
        setProducts(result.data);
        setTotalPages(result.pagination.totalPages);
      } catch (err) {
        console.error("Failed to load products", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [filters, currentPage]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchTerm }));
    setCurrentPage(1);
  };

  // Handle category filter
  const handleCategoryFilter = (category: string | null) => {
    setFilters((prev) => ({
      ...prev,
      category: category || undefined,
    }));
    setCurrentPage(1);
  };

  // Handle product edit
  const handleEditProduct = (productId: string) => {
    setSelectedProductId(productId);
    setIsEditing(true);
  };

  // Handle product create
  const handleCreateProduct = () => {
    setIsCreating(true);
  };

  // Handle product delete
  const handleDeleteProduct = async (productId: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Product",
      message: "Are you sure you want to delete this product? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await productApi.deleteProduct(productId);
          // Refresh product list
          const result = await productApi.getProducts(filters, currentPage, 10);
          setProducts(result.data);
          setTotalPages(result.pagination.totalPages);
          toast({
            title: "Success",
            description: "Product deleted successfully",
          });
        } catch (err) {
          console.error("Failed to delete product", err);
          toast({
            title: "Error",
            description: "Failed to delete product. Please try again later.",
            variant: "destructive",
          });
        }
      },
    });
  };

  // Handle save (create or edit)
  const handleSave = () => {
    // Close edit/create panel
    setIsEditing(false);
    setIsCreating(false);
    setSelectedProductId(null);

    // Reload products
    productApi.getProducts(filters, currentPage, 10).then((result) => {
      setProducts(result.data);
      setTotalPages(result.pagination.totalPages);
    });

    toast({
      title: "Success",
      description: "Product saved successfully.",
    });
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // Get unique categories from products for the filter
  const categories = Array.from(
    new Set(products.map((product) => product.category))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-6 border border-blue-100 animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600">Manage your products catalog</p>
            </div>
          </div>
          <button
            onClick={handleCreateProduct}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 h-10 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="animate-scale-in">
        <div className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-20 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </form>

            <div className="flex gap-3 items-stretch">
              <div className="w-full md:w-64">
                <select
                  value={filters.category || ""}
                  onChange={(e) =>
                    handleCategoryFilter(
                      e.target.value === "" ? null : e.target.value
                    )
                  }
                  className="w-full h-12 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Content */}
      <div className="animate-scale-in" style={{ animationDelay: '0.1s' }}>
        <div className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shopmefy-600"></div>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <div className="text-red-500 mb-4">
                <AlertTriangle className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load products</h3>
              <p className="text-gray-600 mb-6">
                There was a problem connecting to the server. Please try refreshing the page.
              </p>
              <button
                onClick={() => {
                  setError(null);
                  // Reload products
                  productApi.getProducts(filters, currentPage, 10).then((result) => {
                    setProducts(result.data);
                    setTotalPages(result.pagination.totalPages);
                  }).catch((err) => {
                    console.error("Failed to load products", err);
                    setError("Failed to load products. Please try again later.");
                  });
                }}
                className="bg-shopmefy-500 hover:bg-shopmefy-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filters.category ? "No products match your search criteria." : "Get started by adding your first product."}
              </p>
              <button
                onClick={handleCreateProduct}
                className="bg-shopmefy-500 hover:bg-shopmefy-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 mx-auto transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
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
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      Category
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
                  {products.map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150" style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-800">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-800">
                          {formatPrice(product.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                          product.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditProduct(product.id)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="Edit product"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                            title="Delete product"
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

      {/* Product edit slide panel */}
      {isEditing && selectedProductId && (
        <SlidePanel
          title="Edit Product"
          isOpen={isEditing}
          onClose={() => {
            setIsEditing(false);
            setSelectedProductId(null);
          }}
        >
          <ProductForm
            productId={selectedProductId}
            onSave={handleSave}
            onCancel={() => {
              setIsEditing(false);
              setSelectedProductId(null);
            }}
          />
        </SlidePanel>
      )}

      {/* Product create slide panel */}
      {isCreating && (
        <SlidePanel
          title="Add New Product"
          isOpen={isCreating}
          onClose={() => setIsCreating(false)}
        >
          <ProductForm
            isNew={true}
            onSave={handleSave}
            onCancel={() => setIsCreating(false)}
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
    </div>
  );
}
