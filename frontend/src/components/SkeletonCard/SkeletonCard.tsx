'use client';

import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="flex flex-col h-[320px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden animate-pulse">
      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="h-3 w-16 bg-white/10 rounded" />
          <div className="h-4 w-20 bg-white/10 rounded" />
        </div>
        
        {/* Title & Director */}
        <div className="space-y-3 mb-6">
          <div className="h-6 w-3/4 bg-white/10 rounded" />
          <div className="h-3 w-1/2 bg-white/10 rounded" />
        </div>

        {/* Badge */}
        <div className="h-6 w-24 bg-white/10 rounded-lg mb-6" />

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-2 w-10 bg-white/10 rounded" />
            <div className="h-5 w-16 bg-white/10 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-full bg-white/10" />
            <div className="w-10 h-10 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
};
