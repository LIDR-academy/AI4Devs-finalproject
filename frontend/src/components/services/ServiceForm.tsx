import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { serviceApi } from "../../api/serviceApi";
import { CreateServiceDto } from "../../types/service";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

interface ServiceFormProps {
  serviceId?: string;
  isNew?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function ServiceForm({
  serviceId,
  isNew = false,
  onSave,
  onCancel,
}: ServiceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  
  const [form, setForm] = useState<CreateServiceDto>({
    name: "",
    description: "",
    price: 0,
    isActive: true
  });

  // Load Service data if editing an existing Service
  useEffect(() => {
    async function loadService() {
      if (!isNew && serviceId) {
        setIsLoading(true);
        try {
          const service = await serviceApi.getServiceById(serviceId);
          setForm({
            name: service.name,
            description: service.description,
            price: service.price,
            isActive: service.isActive !== undefined ? service.isActive : true
          });
        } catch (err) {
          setError("Failed to load service data");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadService();
  }, [serviceId, isNew]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle price separately to ensure it's a number
    if (name === 'price') {
      const numValue = parseFloat(value);
      setForm((prev) => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setForm(prev => ({
      ...prev,
      isActive: checked
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!form.name.trim()) {
      errors.name = "Name is required";
    }
    
    if (!form.description.trim()) {
      errors.description = "Description is required";
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
    setIsSaving(true);
    setError(null);
    setValidationErrors({});

    try {
      // Validate form
      const errors: Record<string, string> = {};
      
      if (!form.name.trim()) {
        errors.name = "Name is required";
      }
      
      if (!form.description.trim()) {
        errors.description = "Description is required";
      }
      
      if (!form.price || form.price < 0) {
        errors.price = "Price cannot be negative";
      }

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      const serviceData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price,
        isActive: form.isActive,
      };

      if (isNew) {
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(serviceData),
        });

        if (!response.ok) {
          throw new Error('Failed to create service');
        }

        toast({
          title: "Success",
          description: "Service created successfully!",
          variant: "default",
        });
      } else {
        const response = await fetch(`/api/services/${serviceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(serviceData),
        });

        if (!response.ok) {
          throw new Error('Failed to update service');
        }

        toast({
          title: "Success",
          description: "Service updated successfully!",
          variant: "default",
        });
      }

      onSave();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
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
    return <div className="p-4">Loading service data...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium">
          Service Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
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
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
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
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 border-gray-300"
          step="0.01"
          min="0"
          required
        />
        {validationErrors.price && (
          <p className="text-sm text-destructive">{validationErrors.price}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Status</label>
        <div className="flex items-center space-x-2">
          <Switch 
            checked={form.isActive} 
            onCheckedChange={handleSwitchChange}
            id="isActive"
            className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200 focus:ring-green-500"
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
          className="border-green-500 text-green-700 font-medium py-3 px-6 rounded-lg h-12 min-h-[48px]"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSaving}
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 h-12 min-h-[48px]"
        >
          {isSaving ? "Saving..." : "Update"}
        </Button>
      </div>
    </form>
  );
} 