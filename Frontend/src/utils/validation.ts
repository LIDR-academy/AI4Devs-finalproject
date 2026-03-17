import { useTranslation } from 'react-i18next';

export const useValidation = () => {
  const { t } = useTranslation('validation');

  return {
    required: (field: string) => t('required', { field }),
    email: () => t('email.invalid'),
    minLength: (min: number) => t('minLength', { min }),
    maxLength: (max: number) => t('maxLength', { max }),
    range: (min: number, max: number) => t('range', { min, max }),
    numeric: () => t('numeric'),
    phone: () => t('phone.invalid'),
    date: {
      invalid: () => t('date.invalid'),
      required: () => t('date.required'),
      future: () => t('date.future'),
    },
    time: () => t('time.invalid'),
    seats: {
      min: () => t('seats.min'),
      max: () => t('seats.max'),
      required: () => t('seats.required'),
    },
    coordinates: {
      latitude: {
        required: () => t('coordinates.latitude.required'),
        range: () => t('coordinates.latitude.range'),
      },
      longitude: {
        required: () => t('coordinates.longitude.required'),
        range: () => t('coordinates.longitude.range'),
      },
    },
    destination: {
      required: () => t('destination.required'),
    },
    direction: {
      required: () => t('direction.required'),
    },
  };
};

