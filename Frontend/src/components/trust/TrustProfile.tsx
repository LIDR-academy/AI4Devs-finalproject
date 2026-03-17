import React, { useState, useEffect } from 'react';
import { RatingsService, TrustStats } from '../../api/ratings';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface TrustProfileProps {
  userId: string;
  userName?: string;
}

export function TrustProfile({ userId, userName }: TrustProfileProps) {
  const [trustStats, setTrustStats] = useState<TrustStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTrustStats();
  }, [userId]);

  const loadTrustStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await RatingsService.getTrustStats(userId);
      setTrustStats(stats);
    } catch (err: any) {
      console.error('Error loading trust stats:', err);
      
      if (err.response?.status === 404) {
        setError('Este usuario aún no tiene valoraciones de confianza');
      } else if (err.response?.status === 403) {
        setError('No tienes permisos para ver este perfil de confianza');
      } else if (err.response?.status >= 500) {
        setError('Error del servidor. Inténtalo más tarde');
      } else {
        setError('Error al cargar estadísticas de confianza');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrustScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excelente';
    if (score >= 0.6) return 'Bueno';
    if (score >= 0.4) return 'Regular';
    return 'Bajo';
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

  if (!trustStats) {
    return (
      <Card>
        <div className="text-center text-gray-600 p-4">
          No hay estadísticas de confianza disponibles
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Perfil de Confianza {userName && `- ${userName}`}
          </h3>
          <div className={`text-2xl font-bold ${getTrustScoreColor(trustStats.trustScore)}`}>
            {Math.round(trustStats.trustScore * 100)}%
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Puntuación de Confianza</span>
            <span className={`text-sm font-medium ${getTrustScoreColor(trustStats.trustScore)}`}>
              {getTrustScoreLabel(trustStats.trustScore)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                trustStats.trustScore >= 0.8 ? 'bg-green-500' :
                trustStats.trustScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${trustStats.trustScore * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{trustStats.totalRatings}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{trustStats.thumbsUp}</div>
            <div className="text-sm text-gray-600">👍 Positivos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{trustStats.thumbsDown}</div>
            <div className="text-sm text-gray-600">👎 Negativos</div>
          </div>
        </div>

        {trustStats.mostCommonTags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Etiquetas más comunes</h4>
            <div className="flex flex-wrap gap-2">
              {trustStats.mostCommonTags.map((tag, index) => (
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
      </div>
    </Card>
  );
}
