'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createAppointment } from '@/app/actions/appointment';
import { Service } from '@/domain/service/Service';
import { Professional } from '@/domain/professional/Professional';

// Define the steps in the booking process
type BookingStep = 'service' | 'professional' | 'datetime' | 'confirmation';

// Define the booking data structure
interface BookingData {
  serviceId: number | null;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  professionalId: number | null;
  professionalName: string;
  professionalSpecialty: string | null;
  dateTime: Date | null;
}

export default function BookingForm() {
  // State for tracking the current step
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  
  // State for storing available services and professionals
  const [services, setServices] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  
  // State for storing the booking data
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: null,
    serviceName: '',
    servicePrice: 0,
    serviceDuration: 0,
    professionalId: null,
    professionalName: '',
    professionalSpecialty: null,
    dateTime: null
  });
  
  // State for tracking loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create Supabase client
  const supabase = createClient();
  
  // Fetch services when component mounts
  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Failed to load services. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchServices();
  }, []);
  
  // Fetch professionals when a service is selected
  useEffect(() => {
    if (bookingData.serviceId && currentStep === 'professional') {
      async function fetchProfessionals() {
        setLoading(true);
        setError(null);
        
        try {
          const { data, error } = await supabase
            .from('professionals')
            .select('*')
            .order('name');
          
          if (error) {
            throw error;
          }
          
          setProfessionals(data || []);
        } catch (error) {
          console.error('Error fetching professionals:', error);
          setError('Failed to load professionals. Please try again.');
        } finally {
          setLoading(false);
        }
      }
      
      fetchProfessionals();
    }
  }, [bookingData.serviceId, currentStep]);
  
  // Handle service selection
  const handleServiceSelect = (service: any) => {
    setBookingData({
      ...bookingData,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration_minutes
    });
    
    setCurrentStep('professional');
  };
  
  // Handle professional selection
  const handleProfessionalSelect = (professional: any) => {
    setBookingData({
      ...bookingData,
      professionalId: professional.id,
      professionalName: professional.name,
      professionalSpecialty: professional.specialty
    });
    
    setCurrentStep('datetime');
  };
  
  // Handle date and time selection
  const handleDateTimeSelect = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    const dateStr = formData.get('date') as string;
    const timeStr = formData.get('time') as string;
    
    if (!dateStr || !timeStr) {
      setError('Please select both date and time');
      return;
    }
    
    // Combine date and time strings into a Date object
    const dateTime = new Date(`${dateStr}T${timeStr}`);
    
    if (isNaN(dateTime.getTime())) {
      setError('Invalid date or time selected');
      return;
    }
    
    setError(null);
    
    setBookingData({
      ...bookingData,
      dateTime
    });
    
    setCurrentStep('confirmation');
  };
  
  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!bookingData.serviceId || !bookingData.professionalId || !bookingData.dateTime) {
      setError('Missing required booking information. Please go back and complete all steps.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('serviceId', bookingData.serviceId.toString());
      formData.append('professionalId', bookingData.professionalId.toString());
      formData.append('dateTime', bookingData.dateTime.toISOString());
      
      const result = await createAppointment(formData);
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      // Redirect happens in the server action
    } catch (error: any) {
      // Don't show NEXT_REDIRECT errors as they are normal behavior in Next.js 15
      if (error?.message?.includes('NEXT_REDIRECT') || error?.digest?.includes('NEXT_REDIRECT')) {
        // This is a successful redirect, don't show as error
        return;
      }
      
      setError(error.message || 'Failed to create appointment. Please try again.');
      setLoading(false);
    }
  };
  
  // Format price as currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  // Format duration as hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
    }
    
    return `${mins}m`;
  };
  
  // Format date and time
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };
  
  // Generate available time slots
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM
    const interval = 30; // 30 minutes
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        if (hour === endHour && minute > 0) continue;
        
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const time = `${formattedHour}:${formattedMinute}`;
        
        slots.push(time);
      }
    }
    
    return slots;
  };
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 'service':
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Select a Service</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading services...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="border rounded-lg p-4 hover:border-primary-500 hover:shadow-md cursor-pointer transition-all"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <h3 className="text-lg font-medium">{service.name}</h3>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-600">
                        {formatDuration(service.duration_minutes)}
                      </span>
                      <span className="font-semibold">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'professional':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Select a Professional</h2>
              <button
                type="button"
                onClick={() => setCurrentStep('service')}
                className="text-primary-600 hover:text-primary-800"
              >
                ← Back to Services
              </button>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-medium">Selected Service</h3>
              <div className="mt-2 flex justify-between">
                <span>{bookingData.serviceName}</span>
                <div>
                  <span className="text-gray-600 mr-2">
                    {formatDuration(bookingData.serviceDuration)}
                  </span>
                  <span className="font-semibold">
                    {formatPrice(bookingData.servicePrice)}
                  </span>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading professionals...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {professionals.map((professional) => (
                  <div
                    key={professional.id}
                    className="border rounded-lg p-4 hover:border-primary-500 hover:shadow-md cursor-pointer transition-all"
                    onClick={() => handleProfessionalSelect(professional)}
                  >
                    <h3 className="text-lg font-medium">{professional.name}</h3>
                    {professional.specialty && (
                      <p className="mt-1 text-sm text-gray-600">
                        {professional.specialty}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'datetime':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Select Date and Time</h2>
              <button
                type="button"
                onClick={() => setCurrentStep('professional')}
                className="text-primary-600 hover:text-primary-800"
              >
                ← Back to Professionals
              </button>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-md">
              <h3 className="font-medium">Booking Summary</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-medium">{bookingData.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Professional:</span>
                  <span className="font-medium">{bookingData.professionalName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{formatDuration(bookingData.serviceDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-semibold">{formatPrice(bookingData.servicePrice)}</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleDateTimeSelect} className="space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <select
                  id="time"
                  name="time"
                  defaultValue="10:00"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select a time</option>
                  {generateTimeSlots().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Continue to Confirmation
                </button>
              </div>
            </form>
          </div>
        );
      
      case 'confirmation':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Confirm Your Booking</h2>
              <button
                type="button"
                onClick={() => setCurrentStep('datetime')}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Date & Time
              </button>
            </div>
            
            <div className="bg-gray-100 p-6 rounded-md">
              <h3 className="font-medium text-lg mb-4">Booking Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium">{bookingData.serviceName || 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Professional:</span>
                  <span className="font-medium">{bookingData.professionalName || 'Not selected'}</span>
                </div>
                {bookingData.professionalSpecialty && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Specialty:</span>
                    <span>{bookingData.professionalSpecialty}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span>{bookingData.dateTime ? formatDateTime(bookingData.dateTime) : 'Not selected'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span>{formatDuration(bookingData.serviceDuration)}</span>
                </div>
                <div className="flex justify-between border-t pt-4 mt-4">
                  <span className="text-gray-800 font-medium">Total Price:</span>
                  <span className="font-semibold">{formatPrice(bookingData.servicePrice)}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></span>
                    Processing...
                  </span>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </form>
          </div>
        );
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between">
          <div className={`text-center flex-1 ${currentStep === 'service' ? 'text-blue-600 font-medium' : ''}`}>
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${currentStep === 'service' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <span>Service</span>
          </div>
          <div className={`text-center flex-1 ${currentStep === 'professional' ? 'text-blue-600 font-medium' : ''}`}>
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${currentStep === 'professional' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <span>Professional</span>
          </div>
          <div className={`text-center flex-1 ${currentStep === 'datetime' ? 'text-blue-600 font-medium' : ''}`}>
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${currentStep === 'datetime' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <span>Date & Time</span>
          </div>
          <div className={`text-center flex-1 ${currentStep === 'confirmation' ? 'text-blue-600 font-medium' : ''}`}>
            <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${currentStep === 'confirmation' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              4
            </div>
            <span>Confirmation</span>
          </div>
        </div>
        <div className="relative mt-2">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="h-0.5 w-full bg-gray-200"></div>
          </div>
          <div className="relative flex justify-between">
            <div className={`w-8 h-0.5 ${currentStep !== 'service' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-0.5 ${currentStep === 'datetime' || currentStep === 'confirmation' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-0.5 ${currentStep === 'confirmation' ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          </div>
        </div>
      </div>
      
      {/* Current step content */}
      <div className="bg-white shadow rounded-lg p-6">
        {renderStep()}
      </div>
    </div>
  );
}
