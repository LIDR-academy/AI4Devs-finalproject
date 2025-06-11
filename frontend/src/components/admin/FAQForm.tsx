import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { faqApi } from "../../api/faqApi";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";

interface FAQFormProps {
  faqId?: string;
  isNew?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export function FAQForm({ faqId, isNew = false, onSave, onCancel }: FAQFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const { toast } = useToast();
  
  const formSchema = z.object({
    question: z.string().min(5, "Question must be at least 5 characters"),
    answer: z.string().min(10, "Answer must be at least 10 characters"),
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      answer: "",
    }
  });
  
  // Load FAQ data if editing an existing FAQ
  useEffect(() => {
    async function loadFAQ() {
      if (!isNew && faqId) {
        setIsLoading(true);
        try {
          const faq = await faqApi.getFAQById(faqId);
          reset({
            question: faq.question,
            answer: faq.answer,
          });
          setIsActive(faq.isActive);
        } catch (err) {
          setError("Failed to load FAQ data");
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    loadFAQ();
  }, [faqId, isNew, reset]);
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setIsSaving(true);
    
    try {
      const faqData = {
        question: data.question,
        answer: data.answer,
        isActive: isActive,
      };

      if (isNew) {
        await faqApi.createFAQ(faqData);
        toast({
          title: "Success",
          description: "FAQ created successfully!",
          variant: "default",
        });
      } else if (faqId) {
        await faqApi.updateFAQ(faqId, faqData);
        toast({
          title: "Success",
          description: "FAQ updated successfully!",
          variant: "default",
        });
      }

      onSave();
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save FAQ';
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
    return <div className="p-4">Loading FAQ data...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="question" className="block text-sm font-medium">
          Question <span className="text-red-600">*</span>
        </label>
        <input
          id="question"
          {...register("question")}
          placeholder="Enter the question"
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 border-gray-300"
        />
        {errors.question && (
          <p className="text-sm text-red-600">{errors.question.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="answer" className="block text-sm font-medium">
          Answer <span className="text-red-600">*</span>
        </label>
        <textarea
          id="answer"
          {...register("answer")}
          placeholder="Enter the answer"
          rows={8}
          className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 border-gray-300"
        />
        {errors.answer && (
          <p className="text-sm text-red-600">{errors.answer.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Status
        </label>
        <div className="flex items-center space-x-2">
          <Switch 
            checked={isActive} 
            onCheckedChange={setIsActive}
            id="isActive"
            className="data-[state=checked]:bg-purple-500 data-[state=unchecked]:bg-gray-200 focus:ring-purple-500"
          />
          <label htmlFor="isActive" className="text-sm">
            {isActive ? "Active" : "Inactive"}
          </label>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button" 
          onClick={onCancel}
          variant="outline"
          className="border-purple-500 text-purple-700 font-medium py-3 px-6 rounded-lg h-12 min-h-[48px]"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSaving}
          className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 h-12 min-h-[48px]"
        >
          {isSaving ? "Saving..." : "Update"}
        </Button>
      </div>
    </form>
  );
} 