import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { LoadingButton } from "./loading-spinner";

interface ActionButtonProps {
  children: ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
}

const variantClasses = {
  primary: "bg-blue-500 hover:bg-blue-600 text-white",
  secondary: "bg-gray-500 hover:bg-gray-600 text-white", 
  success: "bg-green-500 hover:bg-green-600 text-white",
  warning: "bg-orange-500 hover:bg-orange-600 text-white",
  danger: "bg-red-500 hover:bg-red-600 text-white"
};

const sizeClasses = {
  sm: "py-1.5 px-3 text-xs h-8",
  md: "py-2 px-4 text-sm h-10", 
  lg: "py-3 px-6 text-base h-12"
};

export const ActionButton = ({
  children,
  icon: Icon,
  onClick,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button"
}: ActionButtonProps) => {
  const baseClasses = "font-medium rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
    >
      {loading ? (
        <LoadingButton size={size === "sm" ? "sm" : "md"} />
      ) : (
        Icon && <Icon className="w-4 h-4" />
      )}
      {children}
    </button>
  );
}; 