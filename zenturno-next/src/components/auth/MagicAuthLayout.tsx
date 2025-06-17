'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DotPattern } from '@/components/magicui/dot-pattern'
import { AuroraText } from '@/components/magicui/aurora-text'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showLogo?: boolean
}

export default function MagicAuthLayout({
  children,
  title,
  subtitle = 'Sign in to your account to continue',
  showLogo = true,
}: AuthLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden relative">
      {/* DotPattern covering the entire page */}
      <DotPattern 
        className="absolute inset-0 z-0 text-blue-500/20" 
        width={20}
        height={20}
        cr={1.5}
      />
      
      <header className="w-full py-8 flex items-center justify-center relative z-10">
        <Link href="/" className="flex flex-col items-center group">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">Z</div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">ZenTurno</span>
          </div>
          <span className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">Return to home</span>
        </Link>
      </header>

      <div className="flex flex-grow items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        
        <div className="w-full max-w-[600px] rounded-xl bg-gray-800/50 backdrop-blur-sm shadow-2xl border border-gray-700 z-10">
          <div className="flex flex-wrap items-center">
            <div className="w-full">
              <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
                <h2 className="mb-1.5 text-2xl font-bold text-white sm:text-title-xl">
                  <AuroraText colors={["#3b82f6", "#8b5cf6", "#ec4899", "#3b82f6"]} speed={0.8}>
                    {title}
                  </AuroraText>
                </h2>
                <p className="mb-9 text-base font-medium text-gray-400">
                  {subtitle}
                </p>

                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
