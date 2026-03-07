import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createExpenseSchema, type CreateExpenseFormData } from '@/schemas/expense.schema';
import { Input } from '../atoms/Input';
import { AmountInput } from '../atoms/AmountInput';
import { CategorySelector } from './CategorySelector';
import { PayerSelector } from './PayerSelector';
import { BeneficiariesSelector } from './BeneficiariesSelector';
import { ImageUpload } from '../atoms/ImageUpload';
import { Button } from '../atoms/Button';
import type { ExpenseCategory } from '@/types/expense.types';
import type { TripParticipant, TripCurrency } from '@/types/trip.types';

interface ExpenseFormProps {
  tripId: string;
  categories: ExpenseCategory[];
  participants: TripParticipant[];
  currentUserId: string;
  currency?: TripCurrency; // Optional: Currency of the trip (COP or USD). Defaults to COP for backward compatibility
  onSubmit: (data: CreateExpenseFormData & { receiptFile?: File | null }) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

/**
 * ExpenseForm molecule component
 * Complete expense form integrating all selectors
 * Uses react-hook-form + zod for validation
 */
export const ExpenseForm = ({
  categories,
  participants,
  currentUserId,
  currency = 'COP',
  onSubmit,
  isLoading = false,
  error,
}: ExpenseFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateExpenseFormData>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: {
      payer_id: currentUserId,
      beneficiary_ids: participants.map(p => p.user_id),
      amount: 0,
      expense_date: new Date().toISOString().split('T')[0], // Default to today
    },
  });

  const selectedCategoryId = watch('category_id');
  const selectedPayerId = watch('payer_id');
  const selectedBeneficiaryIds = watch('beneficiary_ids') || [];
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // Set default payer to current user if available
  useEffect(() => {
    if (currentUserId && !selectedPayerId) {
      setValue('payer_id', currentUserId);
    }
  }, [currentUserId, selectedPayerId, setValue]);

  // Set default beneficiaries to all participants except payer
  useEffect(() => {
    if (participants.length > 0 && selectedBeneficiaryIds.length === 0) {
      const availableParticipants = selectedPayerId
        ? participants.filter(p => p.user_id !== selectedPayerId)
        : participants;
      if (availableParticipants.length > 0) {
        setValue(
          'beneficiary_ids',
          availableParticipants.map(p => p.user_id),
        );
      }
    }
  }, [participants, selectedBeneficiaryIds.length, selectedPayerId, setValue]);

  const onFormSubmit = async (data: CreateExpenseFormData) => {
    await onSubmit({ ...data, receiptFile });
  };

  const handleCategorySelect = (categoryId: number) => {
    setValue('category_id', categoryId, { shouldValidate: true });
  };

  const handlePayerSelect = (payerId: string) => {
    setValue('payer_id', payerId, { shouldValidate: true });
    // Remove payer from beneficiaries if they were selected
    const currentBeneficiaries = selectedBeneficiaryIds.filter(id => id !== payerId);
    setValue('beneficiary_ids', currentBeneficiaries, { shouldValidate: true });
  };

  const handleBeneficiaryToggle = (userId: string) => {
    const current = selectedBeneficiaryIds;
    const newSelection = current.includes(userId)
      ? current.filter(id => id !== userId)
      : [...current, userId];
    setValue('beneficiary_ids', newSelection, { shouldValidate: true });
  };

  const handleSelectAll = () => {
    // Filter out payer from beneficiaries
    const availableParticipants = selectedPayerId
      ? participants.filter(p => p.user_id !== selectedPayerId)
      : participants;
    setValue(
      'beneficiary_ids',
      availableParticipants.map(p => p.user_id),
      { shouldValidate: true },
    );
  };

  const handleDeselectAll = () => {
    setValue('beneficiary_ids', [], { shouldValidate: true });
  };

  const handleImageChange = (file: File | null) => {
    setReceiptFile(file);
  };

  const handleAddBeneficiaryByEmail = (userId: string) => {
    // Add user to beneficiaries if not already selected
    if (!selectedBeneficiaryIds.includes(userId)) {
      setValue('beneficiary_ids', [...selectedBeneficiaryIds, userId], {
        shouldValidate: true,
      });
    }
  };

  const handleInviteByEmail = async (email: string) => {
    // TODO: Implement invitation logic
    // For now, show a message that invitation would be sent
    console.log('Invitation would be sent to:', email);
    // In a real implementation, this would call an API to send the invitation
    alert(`Se enviaría una invitación a ${email} para unirse al viaje.`);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <Input
        label="Título del gasto"
        {...register('title')}
        error={errors.title?.message}
        placeholder="Ej: Cena en restaurante"
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="amount">
          Monto ({currency})
        </label>
        <AmountInput
          id="amount"
          value={watch('amount')}
          onChange={value => setValue('amount', value, { shouldValidate: true })}
          error={errors.amount?.message}
          currency={currency}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="expense_date">
          Fecha del gasto
        </label>
        <Input
          id="expense_date"
          type="date"
          {...register('expense_date')}
          error={errors.expense_date?.message}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
        <CategorySelector
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelect={handleCategorySelect}
          error={errors.category_id?.message}
        />
      </div>

      <PayerSelector
        participants={participants}
        selectedPayerId={selectedPayerId}
        onSelect={handlePayerSelect}
        error={errors.payer_id?.message}
      />

      <BeneficiariesSelector
        participants={participants}
        selectedBeneficiaryIds={selectedBeneficiaryIds}
        selectedPayerId={selectedPayerId}
        onToggle={handleBeneficiaryToggle}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onAddByEmail={handleAddBeneficiaryByEmail}
        onInviteByEmail={handleInviteByEmail}
        error={errors.beneficiary_ids?.message}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Foto del recibo (Opcional)
        </label>
        <ImageUpload onChange={handleImageChange} value={receiptFile || undefined} />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? 'Guardando...' : 'Guardar Gasto'}
      </Button>
    </form>
  );
};
