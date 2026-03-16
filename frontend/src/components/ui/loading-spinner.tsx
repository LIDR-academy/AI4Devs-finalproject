import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6", 
  lg: "h-8 w-8",
  xl: "h-12 w-12"
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg", 
  xl: "text-xl"
};

export const LoadingSpinner = ({ 
  size = "md", 
  className,
  text 
}: LoadingSpinnerProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-gray-300 border-t-primary",
          sizeClasses[size],
          className
        )}
      />
      {text && (
        <p className={cn(
          "text-gray-600 animate-pulse",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
};

export const LoadingPage = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <LoadingSpinner size="xl" text={text} />
    </div>
  );
};

export const LoadingCard = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};

export const LoadingButton = ({ size = "sm" }: { size?: "sm" | "md" }) => {
  return (
    <LoadingSpinner 
      size={size} 
      className="border-white border-t-transparent" 
    />
  );
}; 