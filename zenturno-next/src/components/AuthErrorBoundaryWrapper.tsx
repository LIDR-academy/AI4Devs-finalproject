"use client";

import { ReactNode } from 'react';
import { AuthErrorBoundary } from './AuthErrorBoundary';

interface AuthErrorBoundaryWrapperProps {
  children: ReactNode;
}

export function AuthErrorBoundaryWrapper({ children }: AuthErrorBoundaryWrapperProps) {
  return <AuthErrorBoundary>{children}</AuthErrorBoundary>;
}
