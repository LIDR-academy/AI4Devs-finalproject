import React from 'react';
import { useTranslation } from 'react-i18next';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export default function ScoreBadge({ 
  score, 
  size = 'md', 
  showPercentage = true, 
  className = '' 
}: ScoreBadgeProps) {
  const { t } = useTranslation('matches');

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    if (score >= 0.4) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return t('match.score.excellent');
    if (score >= 0.6) return t('match.score.good');
    if (score >= 0.4) return t('match.score.regular');
    return t('match.score.low');
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-3 py-2 text-sm';
      default:
        return 'px-2 py-1 text-xs';
    }
  };

  const colorClasses = getScoreColor(score);
  const sizeClasses = getSizeClasses(size);
  const percentage = Math.round(score * 100);

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium border ${colorClasses} ${sizeClasses} ${className}`}
      title={t('match.score.description', { score: percentage })}
    >
      {getScoreLabel(score)}
      {showPercentage && (
        <span className="ml-1">
          ({percentage}%)
        </span>
      )}
    </span>
  );
}
