import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center transition-opacity duration-300 page-loader-enter"
      role="status"
      aria-label="Loading page"
    >
      <div className="flex flex-col items-center gap-4">
        {/* ShopMefy Logo with Animation */}
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-shopmefy-500 to-shopmefy-600 rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          {/* Rotating Ring */}
          <div className="absolute inset-0 border-4 border-transparent border-t-shopmefy-500 rounded-xl animate-spin"></div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-shopmefy-600 to-green-600 bg-clip-text text-transparent">
            ShopMefy
          </h3>
          <p className="text-sm text-gray-500 mt-1 animate-pulse">Loading...</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-shopmefy-500 to-green-500 rounded-full progress-bar-animation"></div>
        </div>
      </div>
    </div>
  );
};

export default PageLoader; 