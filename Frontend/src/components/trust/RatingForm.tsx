import React, { useState } from 'react';
import { RatingsService, RatingCreateDto } from '../../api/ratings';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

interface RatingFormProps {
  ratedUserId: string;
  ratedUserName?: string;
  tripId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const COMMON_TAGS = [
  'puntual',
  'amigable',
  'seguro',
  'respetuoso',
  'comunicativo',
  'flexible',
  'organizado',
  'confiable'
];

export function RatingForm({ ratedUserId, ratedUserName, tripId, onSuccess, onCancel }: RatingFormProps) {
  const [ratingType, setRatingType] = useState<'THUMBS_UP' | 'THUMBS_DOWN'>('THUMBS_UP');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTags.length === 0) {
      setError('Selecciona al menos una etiqueta');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const ratingData: RatingCreateDto = {
        ratedId: ratedUserId,
        tripId,
        ratingType,
        tags: selectedTags,
        comment: comment.trim() || undefined
      };

      await RatingsService.createRating(ratingData);
      setSuccess(true);
      
      // Auto-close after showing success message
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError('Error al crear la valoración');
      console.error('Error creating rating:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Valorar a {ratedUserName || 'usuario'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de valoración
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="ratingType"
                  value="THUMBS_UP"
                  checked={ratingType === 'THUMBS_UP'}
                  onChange={(e) => setRatingType(e.target.value as 'THUMBS_UP')}
                  className="mr-2"
                />
                <span className="text-green-600">👍 Positivo</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="ratingType"
                  value="THUMBS_DOWN"
                  checked={ratingType === 'THUMBS_DOWN'}
                  onChange={(e) => setRatingType(e.target.value as 'THUMBS_DOWN')}
                  className="mr-2"
                />
                <span className="text-red-600">👎 Negativo</span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas (selecciona al menos una)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_TAGS.map((tag) => (
                <label key={tag} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => handleTagToggle(tag)}
                    className="mr-2"
                  />
                  <span className="text-sm">{tag}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe tu experiencia..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
            />
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    ¡Valoración enviada correctamente!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Tu valoración ha sido guardada y será visible para otros usuarios.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error al enviar la valoración
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            {onCancel && !success && (
              <Button
                type="button"
                variant="secondary"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={loading || selectedTags.length === 0 || success}
            >
              {loading ? 'Guardando...' : success ? '¡Enviado!' : 'Enviar Valoración'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}

