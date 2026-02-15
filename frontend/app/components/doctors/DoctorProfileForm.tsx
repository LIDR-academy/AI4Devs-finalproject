'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { DoctorProfile, UpdateDoctorProfilePayload } from '@/lib/api/doctors';

interface DoctorProfileFormProps {
  profile: DoctorProfile;
  isSaving: boolean;
  onSubmit: (payload: UpdateDoctorProfilePayload) => Promise<void>;
}

export default function DoctorProfileForm({
  profile,
  isSaving,
  onSubmit,
}: DoctorProfileFormProps) {
  const t = useTranslations('doctorProfile');
  const schema = useMemo(
    () =>
      z
        .object({
          firstName: z.string().min(1, t('validation.firstNameRequired')),
          lastName: z.string().min(1, t('validation.lastNameRequired')),
          phone: z
            .string()
            .optional()
            .or(z.literal(''))
            .transform((val) => (val && val.trim() ? val.trim() : undefined))
            .refine(
              (val) => !val || /^\+[1-9]\d{1,14}$/.test(val),
              t('validation.phoneE164')
            ),
          bio: z
            .string()
            .max(1000, t('validation.bioMax'))
            .optional()
            .or(z.literal('')),
          address: z.string().min(1, t('validation.addressRequired')),
          postalCode: z.string().min(1, t('validation.postalCodeRequired')),
        })
        .superRefine((values, ctx) => {
          if (!values.address.trim() || !values.postalCode.trim()) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: t('validation.addressPostalTogether'),
              path: ['address'],
            });
          }
        }),
    [t]
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone ?? '',
      bio: profile.bio ?? '',
      address: profile.address,
      postalCode: profile.postalCode,
    },
  });

  const bio = watch('bio');

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          phone: values.phone,
          bio: values.bio?.trim() || undefined,
          address: values.address.trim(),
          postalCode: values.postalCode.trim(),
        });
      })}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="firstName">
            {t('firstName')}
          </label>
          <input
            id="firstName"
            {...register('firstName')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="lastName">
            {t('lastName')}
          </label>
          <input
            id="lastName"
            {...register('lastName')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="phone">
          {t('phone')}
        </label>
        <input
          id="phone"
          {...register('phone')}
          placeholder="+521234567890"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="bio">
          {t('bio')}
        </label>
        <textarea
          id="bio"
          {...register('bio')}
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500">
          {(bio?.length ?? 0)}/1000
        </p>
        {errors.bio && (
          <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="address">
            {t('address')}
          </label>
          <input
            id="address"
            {...register('address')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="postalCode">
            {t('postalCode')}
          </label>
          <input
            id="postalCode"
            {...register('postalCode')}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
          {errors.postalCode && (
            <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
      >
        {isSaving ? t('saving') : t('save')}
      </button>
    </form>
  );
}
