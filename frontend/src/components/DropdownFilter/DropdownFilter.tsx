"use client"

import type React from "react"

import { useState, forwardRef, type SelectHTMLAttributes } from "react"

interface DropdownOption {
  value: string
  label: string
}

interface DropdownFilterProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string
  placeholder?: string
  options: DropdownOption[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  isRequired?: boolean
}

const DropdownFilter = forwardRef<HTMLSelectElement, DropdownFilterProps>(
  (
    {
      label,
      placeholder = "Selecciona una opción",
      options,
      value,
      onChange,
      error,
      isRequired,
      className = "",
      ...props
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false)

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = event.target.value
      onChange?.(selectedValue)
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-gray-700 text-sm font-medium mb-2">
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            value={value || ""}
            onChange={handleSelectChange}
            className={`
              w-full px-4 py-3 pr-10 rounded-lg border border-gray-300
              bg-white text-gray-800 
              focus:ring-2 focus:ring-federal-blue focus:border-federal-blue
              focus:outline-none
              appearance-none cursor-pointer
              transition-all duration-200
              ${error ? "border-red-400 ring-2 ring-red-400" : ""}
              ${props.disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}
              ${className}
            `}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                isOpen ? "transform rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mt-1 ml-1">{error}</p>}
      </div>
    )
  },
)

DropdownFilter.displayName = "DropdownFilter"

export default DropdownFilter
