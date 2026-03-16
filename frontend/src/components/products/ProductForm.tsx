import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { productApi } from "../../api/productApi";
import { CreateProductDto, UpdateProductDto } from "../../types/product";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

interface ProductFormProps {
  productId?: string;
  isNew?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function ProductForm({
  productId,
  isNew = false,
  onSave,
  onCancel,
}: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, _setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState<string>("");
  const { toast } = useToast();
  
  const [form, setForm] = useState<CreateProductDto>({
    name: "",
    description: "",
    price: 0,
    category: "",
    tags: [],
    isActive: true,
  });

  // Load product data if editing an existing product
  useEffect(() => {
    async function loadProduct() {
      if (!isNew && productId) {
        setIsLoading(true);
        try {
          const product = await productApi.getProductById(productId);
          setForm({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            tags: product.tags || [],
            isActive: product.isActive,
          });
        } catch (err) {
          setError("Failed to load product data");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    }

    async function loadCategories() {
      try {
        const categories = await productApi.getCategories();
        setCategories(categories);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }

    loadProduct();
    loadCategories();
  }, [productId, isNew]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newValue = name === "price" ? parseFloat(value) || 0 : value;
    
    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !form.tags?.includes(newTag.trim())) {
      setForm((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setForm((prev) => ({
      ...prev,
      isActive: checked,
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!form.name.trim()) {
      errors.name = "Product name is required";
    } else if (form.name.trim().length < 3) {
      errors.name = "Name must be at least 3 characters";
    }
    
    if (!form.category.trim()) {
      errors.category = "Category is required";
    } else if (form.category.trim().length < 2) {
      errors.category = "Category must be at least 2 characters";
    }
    
    if (form.description.length < 10) {
      errors.description = "Description must be at least 10 characters";
    }
    
    if (form.price < 0) {
      errors.price = "Price cannot be negative";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);

    try {
      if (isNew) {
        await productApi.createProduct(form);
        toast({
          title: "Success",
          description: "Product created successfully!",
          variant: "default",
        });
      } else if (productId) {
        await productApi.updateProduct(productId, form as UpdateProductDto);
        toast({
          title: "Success",
          description: "Product updated successfully!",
          variant: "default",
        });
      }
      
      onSave();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to save product";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading product data...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 p-4 rounded-md text-green-700 mb-4">
          {successMessage}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Product Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          required
        />
        {validationErrors.name && (
          <p className="text-sm text-destructive">{validationErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={8}
          value={form.description}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          required
        />
        {validationErrors.description && (
          <p className="text-sm text-destructive">{validationErrors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="price" className="block text-sm font-medium">
          Price (€)
        </label>
        <input
          type="number"
          id="price"
          name="price"
          value={form.price}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          step="0.01"
          min="0"
          required
        />
        {validationErrors.price && (
          <p className="text-sm text-destructive">{validationErrors.price}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="category" className="block text-sm font-medium">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          required
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
          <option value="other">Other</option>
        </select>
        {validationErrors.category && (
          <p className="text-sm text-destructive">{validationErrors.category}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Tags</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            className="flex-1 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          />
          <Button 
            type="button"
            onClick={handleAddTag}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Add
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {form.tags?.map((tag) => (
            <Badge key={tag} className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-sm py-1 px-2 gap-1">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Status</label>
        <div className="flex items-center space-x-2">
          <Switch 
            checked={form.isActive} 
            onCheckedChange={handleSwitchChange}
            id="isActive"
            className="data-[state=checked]:bg-blue-500 data-[state=unchecked]:bg-gray-200 focus:ring-blue-500"
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
          className="border-blue-500 text-blue-700 font-medium py-3 px-6 rounded-lg h-12 min-h-[48px]"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSaving}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 h-12 min-h-[48px]"
        >
          {isSaving ? "Saving..." : "Update"}
        </Button>
      </div>
    </form>
  );
} 