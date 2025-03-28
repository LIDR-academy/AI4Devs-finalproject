'use client';

import React, { useState } from 'react';
import { FaCamera, FaTrash } from 'react-icons/fa';
import Image from 'next/image';
import Alert from './Alert';

interface AlertState {
  message: string;
  type: 'success' | 'error';
}

interface ReportFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function ReportForm({ onSubmit, isSubmitting }: ReportFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    raza: '',
    edad: '',
    tamaño: '',
    sexo: '',
    color: '',
    ubicacion: '',
    descripcion: '',
    email: '',
    telefono: ''
  });
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validación específica para el campo de edad
    if (name === 'edad') {
      // Solo permite números y el punto decimal
      const numericValue = value.replace(/[^\d]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    // Validación de imágenes
    if (imagenes.length === 0) {
      setAlert({ message: 'Debe incluir al menos una imagen', type: 'error' });
      return false;
    }
    if (imagenes.length > 3) {
      setAlert({ message: 'No puede incluir más de 3 imágenes', type: 'error' });
      return false;
    }

    // Validación del nombre
    if (!formData.nombre.trim()) {
      setAlert({ message: 'El nombre es requerido', type: 'error' });
      return false;
    }
    if (formData.nombre.trim().length < 2) {
      setAlert({ message: 'El nombre debe tener al menos 2 caracteres', type: 'error' });
      return false;
    }

    // Validación del tipo
    if (!formData.tipo) {
      setAlert({ message: 'Debe seleccionar un tipo de animal', type: 'error' });
      return false;
    }

    // Validación de la raza
    if (!formData.raza.trim()) {
      setAlert({ message: 'La raza es requerida', type: 'error' });
      return false;
    }
    if (formData.raza.trim().length < 2) {
      setAlert({ message: 'La raza debe tener al menos 2 caracteres', type: 'error' });
      return false;
    }

    // Validación de la edad
    if (!formData.edad.trim()) {
      setAlert({ message: 'La edad es requerida', type: 'error' });
      return false;
    }
    const edadNum = Number(formData.edad);
    if (isNaN(edadNum) || edadNum < 0 || edadNum > 30) {
      setAlert({ message: 'La edad debe ser un número entre 0 y 30', type: 'error' });
      return false;
    }

    // Validación del tamaño
    if (!formData.tamaño) {
      setAlert({ message: 'Debe seleccionar un tamaño', type: 'error' });
      return false;
    }

    // Validación del sexo
    if (!formData.sexo) {
      setAlert({ message: 'Debe seleccionar el sexo', type: 'error' });
      return false;
    }

    // Validación de la ubicación
    if (!formData.ubicacion.trim()) {
      setAlert({ message: 'La ubicación es requerida', type: 'error' });
      return false;
    }
    if (formData.ubicacion.trim().length < 5) {
      setAlert({ message: 'La ubicación debe tener al menos 5 caracteres', type: 'error' });
      return false;
    }

    // Validación de la descripción
    if (!formData.descripcion.trim()) {
      setAlert({ message: 'La descripción es requerida', type: 'error' });
      return false;
    }
    if (formData.descripcion.trim().length < 10) {
      setAlert({ message: 'La descripción debe tener al menos 10 caracteres', type: 'error' });
      return false;
    }
    if (formData.descripcion.trim().length > 500) {
      setAlert({ message: 'La descripción no puede exceder los 500 caracteres', type: 'error' });
      return false;
    }

    // Validación del color
    if (!formData.color.trim()) {
      setAlert({ message: 'El color es requerido', type: 'error' });
      return false;
    }
    if (formData.color.trim().length < 3) {
      setAlert({ message: 'El color debe tener al menos 3 caracteres', type: 'error' });
      return false;
    }

    // Validación del email
    if (!formData.email.trim()) {
      setAlert({ message: 'El email es requerido', type: 'error' });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setAlert({ message: 'El email no es válido', type: 'error' });
      return false;
    }

    // Validación del teléfono
    if (!formData.telefono.trim()) {
      setAlert({ message: 'El teléfono es requerido', type: 'error' });
      return false;
    }
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (!phoneRegex.test(formData.telefono.trim())) {
      setAlert({ message: 'El teléfono no es válido', type: 'error' });
      return false;
    }

    return true;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const totalImages = imagenes.length + newFiles.length;
      
      if (totalImages > 3) {
        setAlert({ message: 'No puede incluir más de 3 imágenes', type: 'error' });
        return;
      }

      setImagenes(prev => [...prev, ...newFiles]);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    // Limpiar el input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      // Crear el objeto mascota solo con los datos de la mascota
      const mascota = {
        nombre: formData.nombre.trim(),
        tipo: formData.tipo,
        raza: formData.raza.trim(),
        edad: parseInt(formData.edad),
        tamanio: formData.tamaño,
        sexo: formData.sexo,
        color: formData.color.trim(),
      };

      // Agregar el objeto mascota como una cadena JSON
      formDataToSend.append('mascota', JSON.stringify(mascota));
      
      // Agregar usuarioId (notar el cambio de nombre del campo)
      formDataToSend.append('usuarioId', '2265b4de-1ea5-4c97-8a5e-93b24959fede');
      
      // Agregar ubicación y descripción como campos separados
      formDataToSend.append('ubicacion', formData.ubicacion.trim());
      formDataToSend.append('descripcion', formData.descripcion.trim());
      formDataToSend.append('email', formData.email.trim());
      formDataToSend.append('telefono', formData.telefono.trim());
      
      // Agregar las imágenes
      imagenes.forEach((imagen) => {
        formDataToSend.append('imagenes', imagen);
      });

      await onSubmit(formDataToSend);
      setAlert({ message: 'Reporte creado exitosamente', type: 'success' });
      
      // Limpiar el formulario después de un envío exitoso
      setFormData({
        nombre: '',
        tipo: '',
        raza: '',
        edad: '',
        tamaño: '',
        sexo: '',
        color: '',
        ubicacion: '',
        descripcion: '',
        email: '',
        telefono: ''
      });
      setImagenes([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error al enviar el formulario:', error);
      setAlert({ message: 'Error al crear el reporte. Por favor, intente nuevamente.', type: 'error' });
    }
  };

  return (
    <>
      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-[#1a1a1a] rounded-xl text-white">
        <h1 className="text-2xl font-bold mb-6">Reportar Animal Perdido</h1>
        
        <div className="space-y-4">
          {/* Imagen estática */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Image
              src="/images/hands-help.jpg"
              alt="Manos ayudando"
              width={96}
              height={96}
              className="rounded-full object-cover"
            />
          </div>

          <p className="text-center text-sm text-gray-400 mb-6">Proporciona los detalles del animal</p>

          <input
            type="text"
            name="nombre"
            placeholder="Nombre del animal"
            value={formData.nombre}
            onChange={handleInputChange}
            className="w-full bg-[#2a2a2a] border-none rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            required
          />

          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleInputChange}
            className="w-full bg-[#2a2a2a] border-none rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecciona un tipo</option>
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="otro">Otro</option>
          </select>

          <input
            type="text"
            name="raza"
            placeholder="Raza"
            value={formData.raza}
            onChange={handleInputChange}
            className="w-full bg-[#2a2a2a] border-none rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="text"
            name="color"
            placeholder="Color del animal"
            value={formData.color}
            onChange={handleInputChange}
            className="w-full bg-[#2a2a2a] border-none rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="text"
            name="edad"
            placeholder="Edad"
            value={formData.edad}
            onChange={handleInputChange}
            className="w-full bg-[#2a2a2a] border-none rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            required
          />

          <select
            name="tamaño"
            value={formData.tamaño}
            onChange={handleInputChange}
            className="w-full bg-[#2a2a2a] border-none rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecciona un tamaño</option>
            <option value="pequeño">Pequeño</option>
            <option value="mediano">Mediano</option>
            <option value="grande">Grande</option>
          </select>

          <select
            name="sexo"
            value={formData.sexo}
            onChange={handleInputChange}
            className="w-full bg-[#2a2a2a] border-none rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecciona el sexo</option>
            <option value="macho">Macho</option>
            <option value="hembra">Hembra</option>
            <option value="desconocido">Desconocido</option>
          </select>

          <input
            type="text"
            name="ubicacion"
            placeholder="Última ubicación conocida"
            value={formData.ubicacion}
            onChange={handleInputChange}
            className="w-full bg-[#2a2a2a] border-none rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            required
          />

          <textarea
            name="descripcion"
            placeholder="Descripción adicional"
            value={formData.descripcion}
            onChange={handleInputChange}
            rows={4}
            className="w-full bg-[#2a2a2a] border-none rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email de contacto"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full bg-[#2a2a2a] border-none rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="tel"
            name="telefono"
            placeholder="Teléfono de contacto"
            value={formData.telefono}
            onChange={handleInputChange}
            className="w-full bg-[#2a2a2a] border-none rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            required
          />

          {/* Sección de imágenes con preview */}
          <div className="space-y-4">
            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {previews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {previews.length < 3 && (
              <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:border-blue-500">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  multiple
                />
                <div className="text-center">
                  <FaCamera className="w-6 h-6 mx-auto text-gray-500 mb-2" />
                  <span className="text-sm text-gray-500">
                    {previews.length === 0
                      ? "Agregar fotos del animal (máximo 3)"
                      : `Agregar más fotos (${3 - previews.length} restantes)`}
                  </span>
                </div>
              </label>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Enviando...' : 'Crear Reporte'}
          </button>
        </div>
      </form>
    </>
  );
} 