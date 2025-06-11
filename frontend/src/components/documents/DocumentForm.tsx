import { useState } from "react";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

interface DocumentFormProps {
  title?: string;
  description?: string;
  filename?: string;
  isActive?: boolean;
  onCancel: () => void;
  onSave: () => void;
}

function DocumentForm({ title, description, filename, isActive, onCancel, onSave }: DocumentFormProps) {
  const [form, setForm] = useState({
    title: title || "",
    description: description || "",
    filename: filename || "",
    isActive: isActive !== undefined ? isActive : true
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSaving(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSave();
    } catch (err) {
      console.error("Failed to update document", err);
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
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Document title"
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Document description"
          rows={8}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Filename
        </label>
        <input
          type="text"
          value={form.filename}
          onChange={(e) => setForm(prev => ({ ...prev, filename: e.target.value }))}
          placeholder="Document filename"
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
        />
      </div>

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
          className="border-red-500 text-red-700 font-medium py-3 px-6 rounded-lg h-12 min-h-[48px]"
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSaving}
          className="bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 h-12 min-h-[48px]"
        >
          {isSaving ? "Saving..." : "Update"}
        </Button>
      </div>
    </form>
  );
}

export default DocumentForm; 