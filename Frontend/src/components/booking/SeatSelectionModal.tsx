import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

// Interface Segregation Principle: Small, focused interface
interface SeatSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (seats: number) => void;
  maxSeats: number;
  loading?: boolean;
}

// Single Responsibility Principle: Component only handles seat selection UI
export const SeatSelectionModal: React.FC<SeatSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  maxSeats,
  loading = false
}) => {
  const { t } = useTranslation('matches');
  const [selectedSeats, setSelectedSeats] = useState(1);

  // Reset selection when modal opens (Dependency Inversion: depends on abstraction)
  useEffect(() => {
    if (isOpen) {
      setSelectedSeats(1);
    }
  }, [isOpen]);

  // Open/Closed Principle: Easy to extend with new seat selection logic
  const handleSeatSelection = (seatCount: number) => {
    if (seatCount >= 1 && seatCount <= maxSeats) {
      setSelectedSeats(seatCount);
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedSeats);
  };

  // Liskov Substitution Principle: Component can be replaced with any modal implementation
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{t('match.selectSeats')}</CardTitle>
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                disabled={loading}
                aria-label="Close modal"
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Information section */}
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900">
                  {t('match.availableSeats', { seats: maxSeats })}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {t('match.selectSeatsDescription')}
                </p>
              </div>

              {/* Seat selection buttons */}
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: maxSeats }, (_, i) => i + 1).map((seatCount) => (
                  <Button
                    key={seatCount}
                    variant={selectedSeats === seatCount ? 'primary' : 'secondary'}
                    size="lg"
                    onClick={() => handleSeatSelection(seatCount)}
                    className="aspect-square text-xl font-bold py-4"
                    aria-label={`Select ${seatCount} seat${seatCount > 1 ? 's' : ''}`}
                  >
                    {seatCount}
                  </Button>
                ))}
              </div>

              {/* Selection summary */}
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">
                  {t('match.selectedSeats')}
                </p>
                <p className="text-2xl font-bold text-primary-600">
                  {selectedSeats} {selectedSeats === 1 ? t('match.seat') : t('match.seats')}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="primary"
                  onClick={handleConfirm}
                  loading={loading}
                  disabled={loading}
                  className="flex-1"
                >
                  {t('match.confirmBooking')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1"
                >
                  {t('common:cancel')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
