import React, { useState, useEffect } from 'react';
import { RatingsService, RatingDto } from '../../api/ratings';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface RatingsListProps {
  userId: string;
  userName?: string;
}

export function RatingsList({ userId, userName }: RatingsListProps) {
  const [ratings, setRatings] = useState<RatingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRatings();
  }, [userId]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      setError(null);
      const ratingsData = await RatingsService.getRatingsForUser(userId);
      setRatings(ratingsData);
    } catch (err) {
      setError('Error al cargar las valoraciones');
      console.error('Error loading ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner size="md" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center text-red-600 p-4">
          {error}
        </div>
      </Card>
    );
  }

  if (ratings.length === 0) {
    return (
      <Card>
        <div className="text-center text-gray-600 p-4">
          No hay valoraciones disponibles
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Valoraciones {userName && `de ${userName}`}
        </h3>

        <div className="space-y-4">
          {ratings.map((rating) => (
            <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl ${
                    rating.ratingType === 'THUMBS_UP' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {rating.ratingType === 'THUMBS_UP' ? '👍' : '👎'}
                  </span>
                  <span className="text-sm text-gray-600">
                    {formatDate(rating.createdAt)}
                  </span>
                </div>
                {rating.tripId && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Viaje específico
                  </span>
                )}
              </div>

              {rating.tags.length > 0 && (
                <div className="mb-2">
                  <div className="flex flex-wrap gap-1">
                    {rating.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {rating.comment && (
                <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  "{rating.comment}"
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}









