import { forwardRef, type InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  isRequired?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, isRequired, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-white text-sm font-medium mb-2">
            {label}
            {isRequired && <span className="text-yellow-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-full border-0 outline-none
            bg-white text-gray-800 placeholder-gray-400
            focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50
            transition-all duration-200
            ${error ? "ring-2 ring-red-400" : ""}
            ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="text-red-300 text-sm mt-1 ml-4">{error}</p>}
      </div>
    )
  },
)

Input.displayName = "Input"

export default Input
