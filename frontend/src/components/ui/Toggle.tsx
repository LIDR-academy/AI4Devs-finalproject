"use client"

import type React from "react"

interface ToggleProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, disabled = false, className = "" }) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-white text-sm font-medium">{label}</span>
      <div className="flex items-center">
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50
            ${checked ? "bg-yellow-400" : "bg-gray-400"}
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out
              ${checked ? "translate-x-6" : "translate-x-1"}
            `}
          />
        </button>
        <span className="text-white text-sm font-medium ml-2">{checked ? "Sí" : "No"}</span>
      </div>
    </div>
  )
}

export default Toggle
