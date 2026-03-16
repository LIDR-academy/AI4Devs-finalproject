import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: "blue" | "green" | "orange" | "purple" | "red";
  actions?: ReactNode;
  className?: string;
}

const colorClasses = {
  blue: {
    bg: "from-blue-50 to-sky-50",
    border: "border-blue-100",
    iconBg: "from-blue-500 to-blue-600"
  },
  green: {
    bg: "from-green-50 to-emerald-50", 
    border: "border-green-100",
    iconBg: "from-green-500 to-green-600"
  },
  orange: {
    bg: "from-orange-50 to-amber-50",
    border: "border-orange-100", 
    iconBg: "from-orange-500 to-orange-600"
  },
  purple: {
    bg: "from-purple-50 to-violet-50",
    border: "border-purple-100",
    iconBg: "from-purple-500 to-purple-600"
  },
  red: {
    bg: "from-red-50 to-rose-50",
    border: "border-red-100",
    iconBg: "from-red-500 to-red-600"
  }
};

export const PageHeader = ({ 
  title, 
  description, 
  icon: Icon, 
  iconColor = "blue",
  actions,
  className = ""
}: PageHeaderProps) => {
  const colors = colorClasses[iconColor];
  
  return (
    <div className={`bg-gradient-to-r ${colors.bg} rounded-xl p-6 border ${colors.border} animate-slide-up ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${colors.iconBg} rounded-lg flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}; 