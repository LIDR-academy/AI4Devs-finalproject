'use client';

import React, { useState } from 'react';
import ReportForm from '@/components/ReportForm';
import { reporteService } from '@/services/reporte.service';

export default function ReportarPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    try {
      setIsSubmitting(true);
      await reporteService.crearReporte(formData);
      // Aquí podrías agregar una notificación de éxito o redirección
      console.log('Reporte creado exitosamente');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ReportForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
} 