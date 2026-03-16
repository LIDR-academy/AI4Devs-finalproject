import { Plus, ShoppingBag } from 'lucide-react';
import React, { useEffect } from 'react';
import { productApi } from '../api/productApi';
import { ActionButton } from '../components/ui/action-button';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { DataTable, TableColumn } from '../components/ui/data-table';
import { ErrorAlert } from '../components/ui/error-alert';
import { PageHeader } from '../components/ui/page-header';
import { SearchFilter } from '../components/ui/search-filter';
import { SimplePagination } from '../components/ui/simple-pagination';
import { useCRUD } from '../hooks/useCRUD';
import { CreateProductDto, Product, ProductFilters, UpdateProductDto } from '../types/product';

// Adapt productApi to match CRUD interface
const productCRUDApi = {
  getAll: productApi.getProducts,
  create: productApi.createProduct,
  update: productApi.updateProduct,
  delete: productApi.deleteProduct,
};

const ProductsRefactored: React.FC = () => {
  const {
    // Data state
    items: products,
    loading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    
    // Filters & Search
    searchTerm,
    
    // CRUD operations
    loadItems,
    deleteItem,
    
    // UI state
    isEditing,
    isCreating,
    
    // UI actions
    setPage,
    setSearchTerm,
    startEdit,
    startCreate,
    cancelEdit,
    
    // Confirm dialog
    confirmDialog,
    setConfirmDialog,
    
    // Utilities
    clearError,
  } = useCRUD<Product, CreateProductDto, UpdateProductDto, ProductFilters>(
    productCRUDApi,
    {
      entityName: "Product",
      pageSize: 10,
      enableToasts: true,
    }
  );

  // Load products on mount
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is automatically handled by setSearchTerm
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  // Table columns configuration
  const columns: TableColumn<Product>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
    },
    {
      key: 'price',
      label: 'Price',
      render: (product) => formatPrice(product.price),
      className: 'text-right',
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (product) => product.stock?.toString() || 'N/A',
      className: 'text-center',
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (product) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          product.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Products"
        description="Manage your products catalog"
        icon={ShoppingBag}
        iconColor="blue"
        actions={
          <ActionButton
            icon={Plus}
            onClick={startCreate}
            variant="primary"
          >
            Add Product
          </ActionButton>
        }
      />

      {/* Error Display */}
      {error && (
        <ErrorAlert error={error} onClose={clearError} />
      )}

      {/* Search & Filters */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
        placeholder="Search products..."
        filters={
          <select
            className="w-full md:w-64 h-12 border border-gray-200 rounded-lg px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            onChange={(e) => {
              // Handle category filter
              // This would be implemented with the filters system
            }}
          >
            <option value="">All Categories</option>
            {/* Categories would be loaded dynamically */}
          </select>
        }
      />

      {/* Products Table */}
      <DataTable
        data={products}
        columns={columns}
        loading={loading}
        error={error}
        emptyMessage="No products found"
        onEdit={(product) => startEdit(product.id)}
        onDelete={(product) => deleteItem(product.id)}
      />

      {/* Pagination */}
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        variant="danger"
      />

      {/* Product Form Modal (would be implemented) */}
      {(isEditing || isCreating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? 'Edit Product' : 'Create Product'}
            </h2>
            {/* ProductForm component would go here */}
            <div className="flex justify-end gap-3 mt-6">
              <ActionButton variant="secondary" onClick={cancelEdit}>
                Cancel
              </ActionButton>
              <ActionButton variant="primary">
                {isEditing ? 'Update' : 'Create'}
              </ActionButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsRefactored; 