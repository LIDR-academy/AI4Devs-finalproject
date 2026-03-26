import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExpense, uploadReceiptImage } from '@/services/expense.service';
import type { CreateExpenseFormData } from '@/schemas/expense.schema';
import type { CreateExpenseRequest } from '@/types/expense.types';

function isErrorWithMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as { message?: unknown }).message === 'string'
  );
}

interface UseExpenseFormOptions {
  tripId: string;
  onSuccess?: () => void;
  onSuccessMessage?: (message: string) => void;
}

/**
 * Hook for expense form management
 * Handles image upload, expense creation, errors and loading states
 */
export function useExpenseForm({ tripId, onSuccess, onSuccessMessage }: UseExpenseFormOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const submitExpense = async (data: CreateExpenseFormData & { receiptFile?: File | null }) => {
    setIsLoading(true);
    setError(null);

    try {
      let receiptUrl: string | undefined;

      // Upload image first if provided
      if (data.receiptFile) {
        try {
          const uploadResult = await uploadReceiptImage(data.receiptFile);
          receiptUrl = uploadResult.url;
        } catch (uploadError) {
          // If upload fails, continue without image
          const message = isErrorWithMessage(uploadError)
            ? uploadError.message
            : 'Unknown upload error';
          console.warn('Failed to upload image:', message);
          // Don't block expense creation if image upload fails
        }
      }

      // Ensure expense_date is present (should be required by schema, but double-check)
      const expense_date = data.expense_date || new Date().toISOString().split('T')[0];

      // Transform beneficiary_ids to beneficiaries format expected by backend
      const beneficiaries = data.beneficiary_ids.map(user_id => ({
        user_id,
        // amount_owed is optional - if not provided, backend will calculate fair share
      }));

      // Create expense request (trip_id goes in URL, payer_id comes from token)
      const expenseData: CreateExpenseRequest = {
        title: data.title,
        amount: data.amount,
        category_id: data.category_id,
        expense_date,
        receipt_url: receiptUrl,
        beneficiaries,
      };

      await createExpense(tripId, expenseData);

      // Success - show feedback
      const successMessage = 'Gasto creado exitosamente';
      if (onSuccessMessage) {
        onSuccessMessage(successMessage);
      }

      // Delay to ensure user sees the success state and can read the toast
      // Toast duration is 3500ms, so we wait a bit longer to allow reading
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          // Default: navigate back to trip detail
          navigate(`/trips/${tripId}`);
        }
      }, 1000);
    } catch (err) {
      const errorMessage = isErrorWithMessage(err) ? err.message : 'Error al crear el gasto';
      setError(errorMessage);
      throw err; // Re-throw to let form handle it
    } finally {
      setIsLoading(false);
    }
  };

  return {
    submitExpense,
    isLoading,
    error,
  };
}
