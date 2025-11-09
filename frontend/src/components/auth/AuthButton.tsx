import { Loader2 } from "lucide-react";
import React from "react";

interface AuthButtonProps {
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  onClick,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-disabled={disabled || loading}
      className={`
        ${fullWidth ? "w-full" : ""}
        flex justify-center items-center py-2 px-4 border border-transparent
        rounded-md shadow-sm text-sm font-medium text-white
        bg-indigo-600 hover:bg-indigo-700
        dark:bg-indigo-500 dark:hover:bg-indigo-600
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
      `}
    >
      {loading && (
        <Loader2
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
};

export default AuthButton;

