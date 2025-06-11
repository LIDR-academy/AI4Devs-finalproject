import { useEffect, useState } from "react";
import { faqApi } from "../../api/faqApi";
import { CreateFAQDto, UpdateFAQDto } from "../../types/faq";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface FAQFormProps {
  faqId?: string;
  isNew?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function FAQForm({
  faqId,
  isNew = false,
  onSave,
  onCancel,
}: FAQFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState<CreateFAQDto>({
    question: "",
    answer: ""
  });

  // Load FAQ data if editing an existing FAQ
  useEffect(() => {
    async function loadFAQ() {
      if (!isNew && faqId) {
        setIsLoading(true);
        try {
          const faq = await faqApi.getFAQById(faqId);
          setForm({
            question: faq.question,
            answer: faq.answer
          });
        } catch (err) {
          setError("Failed to load FAQ data");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadFAQ();
  }, [faqId, isNew]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (form.answer.length < 10) {
      errors.answer = "Answer must be at least 10 characters";
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
        await faqApi.createFAQ(form);
      } else if (faqId) {
        await faqApi.updateFAQ(faqId, form as UpdateFAQDto);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save FAQ");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading FAQ data...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label 
          htmlFor="question" 
          className="block text-sm font-medium"
        >
          Question
        </label>
        <Input
          type="text"
          id="question"
          name="question"
          value={form.question}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <label 
          htmlFor="answer" 
          className="block text-sm font-medium"
        >
          Answer
        </label>
        <Textarea
          id="answer"
          name="answer"
          rows={6}
          value={form.answer}
          onChange={handleChange}
          className={validationErrors.answer ? "border-red-500" : ""}
          required
        />
        {validationErrors.answer && (
          <p className="text-sm text-destructive">{validationErrors.answer}</p>
        )}
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
        >
          {isSaving ? "Saving..." : (isNew ? "Create FAQ" : "Update FAQ")}
        </Button>
      </div>
    </form>
  );
} 