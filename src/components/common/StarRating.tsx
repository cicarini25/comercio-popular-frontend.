import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5 (e.g. 4.8)
  reviewCount?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showCount?: boolean;
  showScore?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
  idPrefix?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  reviewCount,
  size = 'sm',
  showCount = true,
  showScore = true,
  interactive = false,
  onRatingChange,
  className = '',
  idPrefix = 'star-rating'
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    xs: 12,
    sm: 14,
    md: 18,
    lg: 24
  };

  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* 5 Stars Array */}
      <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined}>
        {[1, 2, 3, 4, 5].map((starValue) => {
          const isFilled = currentDisplayRating >= starValue;
          const isPartial = !isFilled && currentDisplayRating > starValue - 1;

          return (
            <button
              key={starValue}
              type="button"
              disabled={!interactive}
              id={interactive ? `${idPrefix}-star-${starValue}` : undefined}
              onClick={() => {
                if (interactive && onRatingChange) {
                  onRatingChange(starValue);
                }
              }}
              onMouseEnter={() => {
                if (interactive) setHoverRating(starValue);
              }}
              onMouseLeave={() => {
                if (interactive) setHoverRating(null);
              }}
              aria-label={interactive ? `${starValue} estrelas de 5` : undefined}
              className={`relative p-0.5 transition-transform ${
                interactive
                  ? 'cursor-pointer hover:scale-125 focus:outline-hidden focus:scale-125'
                  : 'cursor-default pointer-events-none'
              }`}
            >
              {/* Background empty star */}
              <Star
                size={starSizes[size]}
                className={`transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isPartial
                    ? 'fill-amber-200 text-amber-400'
                    : 'text-neutral-300 fill-neutral-100'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Numerical score & reviews count */}
      {(showScore || (showCount && reviewCount !== undefined)) && (
        <div className="flex items-center gap-1 leading-none text-neutral-700">
          {showScore && (
            <span
              className={`font-extrabold ${
                size === 'lg' ? 'text-lg font-display text-neutral-900' : 'text-xs text-neutral-800'
              }`}
            >
              {Number(rating).toFixed(1)}
            </span>
          )}
          {showCount && reviewCount !== undefined && (
            <span
              className={`text-neutral-500 font-medium ${
                size === 'lg' ? 'text-xs' : 'text-[11px]'
              }`}
            >
              ({reviewCount.toLocaleString('pt-BR')} {reviewCount === 1 ? 'avaliação' : 'avaliações'})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
