'use client';

import React, { useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { MOODS } from '@/utils/moods';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const MoodSelector = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedMood = searchParams.get('mood');

  const toggleMood = useCallback(
    (moodId: string) => {
      const params = new URLSearchParams(searchParams);
      if (selectedMood === moodId) {
        params.delete('mood');
      } else {
        params.set('mood', moodId);
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router, selectedMood]
  );

  return (
    <div className="flex flex-wrap justify-center gap-2.5 p-2">
      {MOODS.map((mood) => {
        const isSelected = selectedMood === mood.id;
        const Icon = mood.icon;

        return (
          <motion.button
            key={mood.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleMood(mood.id)}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-500",
              isSelected
                ? "bg-white/10 border border-white/20 text-white shadow-lg"
                : "bg-zinc-900/40 border border-white/5 text-white/20 hover:text-white/40 hover:border-white/10"
            )}
          >
            <Icon size={10} className={cn(isSelected ? mood.color : "text-white/10")} />
            {mood.label}
          </motion.button>
        );
      })}
    </div>
  );
};
