import type React from "react"

interface StarRatingProps {
  rating: number // Rating from 0 to 5
  maxStars?: number // Maximum number of stars (default 5)
  size?: "sm" | "md" | "lg"
  className?: string
  showRating?: boolean // Show numeric rating next to stars
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  size = "md",
  className = "",
  showRating = false,
}) => {
  // Ensure rating is between 0 and maxStars
  const normalizedRating = Math.max(0, Math.min(rating, maxStars))

  // Size classes for stars
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  // Text size classes for rating display
  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  }

  const renderStar = (index: number) => {
    const isFilled = index < normalizedRating
    const isPartiallyFilled = index < normalizedRating && index + 1 > normalizedRating

    return (
      <div key={index} className="relative">
        {/* Background star (empty) */}
        <svg
          className={`${sizeClasses[size]} text-gray-300`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>

        {/* Filled star overlay */}
        {(isFilled || isPartiallyFilled) && (
          <svg
            className={`${sizeClasses[size]} text-yellow-400 absolute top-0 left-0`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              clipPath: isPartiallyFilled ? `inset(0 ${100 - (normalizedRating - index) * 100}% 0 0)` : undefined,
            }}
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Stars container */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: maxStars }, (_, index) => renderStar(index))}
      </div>

      {/* Rating number display */}
      {showRating && (
        <span className={`ml-2 font-medium text-gray-600 ${textSizeClasses[size]}`}>{normalizedRating.toFixed(1)}</span>
      )}
    </div>
  )
}

export { StarRating }
export default StarRating
