'use client';

import React, { useState } from 'react';
import ReportForm from '@/components/ReportForm';
import { reporteService } from '@/services/reporte.service';

export default function ReportarPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await reporteService.crearReporte(formData);
      return response;
    } catch (error) {
      console.error('Error al crear el reporte:', error);
      throw error;
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