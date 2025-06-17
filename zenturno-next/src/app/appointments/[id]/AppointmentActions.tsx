'use client';

import { useState } from 'react';
import { UserRole } from '@/domain/user/UserRole';
import { AppointmentStatus } from '@/domain/appointment/Appointment';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

interface AppointmentActionsProps {
  appointmentId: string | number;
  status: AppointmentStatus;
  canReschedule: boolean;
  userRole: string;
}

export default function AppointmentActions({ 
  appointmentId, 
  status, 
  canReschedule, 
  userRole 
}: AppointmentActionsProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/confirm`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        window.location.href = '/appointments?status=confirmed';
      } else {
        alert('Error: ' + (result.error || 'Unknown error occurred'));
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('An error occurred while confirming the appointment');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    setIsLoading(true);
    setShowCancelModal(false);
    
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        window.location.href = '/appointments?status=cancelled';
      } else {
        alert('Error: ' + (result.error || 'Unknown error occurred'));
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('An error occurred while cancelling the appointment');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/complete`, {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        window.location.href = '/appointments?status=completed';
      } else {
        alert('Error: ' + (result.error || 'Unknown error occurred'));
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('An error occurred while completing the appointment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {/* Show different actions based on role and appointment status */}
        {status === 'pending' && (
          <>
            <a 
              href={`/appointments/${appointmentId}/reschedule`}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Reschedule
            </a>
            
            {userRole === 'professional' && (
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Confirm
              </button>
            )}
            
            <button
              onClick={handleCancelClick}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
        
        {status === 'confirmed' && (
          <>
            {canReschedule && (
              <a 
                href={`/appointments/${appointmentId}/reschedule`}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Reschedule
              </a>
            )}
            
            {userRole === 'professional' && (
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Mark Completed
              </button>
            )}
            
            <button
              onClick={handleCancelClick}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="Keep Appointment"
        type="danger"
      />
    </>
  );
} 