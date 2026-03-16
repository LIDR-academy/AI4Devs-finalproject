import { Filter, Search } from "lucide-react";
import { ReactNode } from "react";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  filters?: ReactNode;
  className?: string;
}

export const SearchFilter = ({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  placeholder = "Search...",
  filters,
  className = ""
}: SearchFilterProps) => {
  return (
    <div className={`animate-scale-in ${className}`}>
      <div className="bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <Filter className="w-5 h-5 text-gray-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={onSearchSubmit} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>
          </form>

          {filters && (
            <div className="flex gap-3 items-stretch">
              {filters}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 