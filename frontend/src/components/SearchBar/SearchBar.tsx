"use client"

import type React from "react"
import { useState } from "react"

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  className?: string
  size?: "sm" | "md" | "lg"
  showSearchButton?: boolean
  disabled?: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Buscar especialista",
  value = "",
  onChange,
  onSearch,
  className = "",
  size = "md",
  showSearchButton = false,
  disabled = false,
}) => {
  const [searchValue, setSearchValue] = useState(value)

  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10 text-sm",
    lg: "h-12 text-base",
  }

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const paddingClasses = {
    sm: showSearchButton ? "pl-8 pr-16" : "pl-8 pr-3",
    md: showSearchButton ? "pl-10 pr-20" : "pl-10 pr-3",
    lg: showSearchButton ? "pl-12 pr-24" : "pl-12 pr-4",
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchValue(newValue)
    onChange?.(newValue)
  }

  const handleSearch = () => {
    onSearch?.(searchValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
        <svg
          className={`${iconSizeClasses[size]} text-gray-400`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={searchValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          block w-full ${sizeClasses[size]} ${paddingClasses[size]}
          border border-gray-300 rounded-md leading-5 bg-white
          placeholder-gray-500 text-gray-900
          focus:outline-none focus:placeholder-gray-400 
          focus:ring-2 focus:ring-federal-blue focus:border-federal-blue
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          transition-colors duration-200
        `}
        aria-label={placeholder}
      />

      {/* Search Button (Optional) */}
      {showSearchButton && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          <button
            type="button"
            onClick={handleSearch}
            disabled={disabled}
            className={`
              ${size === "sm" ? "px-2 py-1 text-xs" : size === "md" ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-base"}
              bg-federal-blue hover:bg-honolulu-blue text-white font-medium rounded-md
              transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-federal-blue
              disabled:bg-gray-300 disabled:cursor-not-allowed
            `}
            aria-label="Buscar"
          >
            Buscar
          </button>
        </div>
      )}
    </div>
  )
}

export default SearchBar
