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
  
  // Helper functions for formatting
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };
  
  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };
  
  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 9; i <= 17; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      if (i < 17) {
        slots.push(`${i.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 'service':
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Service</h2>
              <p className="text-lg text-gray-600">Select the service you'd like to book</p>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-6 text-lg text-gray-600">Loading services...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <div className="absolute top-4 right-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors"></div>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-600">
                          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium">{formatDuration(service.duration_minutes)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-blue-600">{formatPrice(service.price)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Select this service</span>
                        <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'professional':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Professional</h2>
                <p className="text-lg text-gray-600">Select who you'd like to provide your service</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep('service')}
                className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Services
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Selected Service</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Service Name</p>
                  <p className="font-bold text-gray-900">{bookingData.serviceName}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-bold text-gray-900">{formatDuration(bookingData.serviceDuration)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="font-bold text-blue-600 text-lg">{formatPrice(bookingData.servicePrice)}</p>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-6 text-lg text-gray-600">Loading professionals...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
                <div className="flex items-center">
                  <svg className="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {professionals.map((professional) => (
                  <div
                    key={professional.id}
                    className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-xl cursor-pointer transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => handleProfessionalSelect(professional)}
                  >
                    <div className="absolute top-4 right-4">
                      <div className="w-3 h-3 bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors"></div>
                    </div>
                    
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-lg">
                          {professional.name?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{professional.name}</h3>
                        <p className="text-sm text-gray-600">Professional</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Select this professional</span>
                        <svg className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'datetime':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
                <p className="text-lg text-gray-600">Choose when you'd like your appointment</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep('professional')}
                className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Professionals
              </button>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Booking Summary</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Service</p>
                  <p className="font-bold text-gray-900">{bookingData.serviceName}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Professional</p>
                  <p className="font-bold text-gray-900">{bookingData.professionalName}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-bold text-gray-900">{formatDuration(bookingData.serviceDuration)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Price</p>
                  <p className="font-bold text-green-600 text-lg">{formatPrice(bookingData.servicePrice)}</p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleDateTimeSelect} className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl border-2 border-gray-200 p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="date" className="block text-lg font-bold text-gray-900 mb-3">
                      <div className="flex items-center">
                        <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Select Date
                      </div>
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      min={new Date().toISOString().split('T')[0]}
                      defaultValue={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="time" className="block text-lg font-bold text-gray-900 mb-3">
                      <div className="flex items-center">
                        <svg className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Select Time
                      </div>
                    </label>
                    <select
                      id="time"
                      name="time"
                      defaultValue="10:00"
                      className="w-full p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                      required
                    >
                      <option value="">Choose a time</option>
                      {generateTimeSlots().map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
                    <div className="flex items-center">
                      <svg className="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <p className="text-red-700 font-medium">{error}</p>
                    </div>
                  </div>
                )}
                
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Continue to Confirmation
                </button>
              </div>
            </form>
          </div>
        );
      
      case 'confirmation':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Booking</h2>
                <p className="text-lg text-gray-600">Review your appointment details</p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep('datetime')}
                className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Date & Time
              </button>
            </div>
            
            <div className="max-w-2xl mx-auto bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Appointment Summary</h3>
                <p className="text-purple-100">Please review your booking details</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Service</p>
                    <p className="text-lg font-bold text-gray-900">{bookingData.serviceName || 'Not selected'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Professional</p>
                    <p className="text-lg font-bold text-gray-900">{bookingData.professionalName || 'Not selected'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                    <p className="text-lg font-bold text-gray-900">{bookingData.dateTime ? formatDateTime(bookingData.dateTime) : 'Not selected'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                    <p className="text-lg font-bold text-gray-900">{formatDuration(bookingData.serviceDuration)}</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg className="h-8 w-8 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span className="text-xl font-bold text-gray-900">Total Price</span>
                    </div>
                    <span className="text-3xl font-bold text-green-600">{formatPrice(bookingData.servicePrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg mb-6">
                  <div className="flex items-center">
                    <svg className="h-6 w-6 text-red-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm Booking
                  </span>
                )}
              </button>
            </form>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Progress indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {[
              { step: 'service', number: 1, label: 'Service', icon: '🎯' },
              { step: 'professional', number: 2, label: 'Professional', icon: '👤' },
              { step: 'datetime', number: 3, label: 'Date & Time', icon: '📅' },
              { step: 'confirmation', number: 4, label: 'Confirmation', icon: '✅' }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                    currentStep === item.step 
                      ? 'bg-blue-600 text-white shadow-lg scale-110' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep === item.step ? item.icon : item.number}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    currentStep === item.step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </div>
                
                {/* Connector Line */}
                {index < 3 && (
                  <div className="flex-1 h-1 mx-4 bg-gray-200 rounded-full">
                    <div className={`h-full rounded-full transition-all duration-500 ${
                      (currentStep === 'professional' && index === 0) ||
                      (currentStep === 'datetime' && index <= 1) ||
                      (currentStep === 'confirmation' && index <= 2)
                        ? 'bg-blue-600 w-full' 
                        : 'bg-gray-200 w-0'
                    }`}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Current step content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
