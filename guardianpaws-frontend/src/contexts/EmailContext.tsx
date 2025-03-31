'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import EmailModal from '@/components/EmailModal';

interface EmailContextType {
  currentUserEmail: string;
  setCurrentUserEmail: (email: string) => void;
}

const EmailContext = createContext<EmailContextType | undefined>(undefined);

export function EmailProvider({ children }: { children: ReactNode }) {
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('currentUserEmail');
    if (!email) {
      setShowEmailModal(true);
      return;
    }
    setCurrentUserEmail(email);
  }, []);

  const handleEmailSubmit = (email: string) => {
    localStorage.setItem('currentUserEmail', email);
    setCurrentUserEmail(email);
    setShowEmailModal(false);
  };

  return (
    <EmailContext.Provider value={{ currentUserEmail, setCurrentUserEmail }}>
      {children}
      {showEmailModal && (
        <EmailModal onSubmit={handleEmailSubmit} />
      )}
    </EmailContext.Provider>
  );
}

export function useEmail() {
  const context = useContext(EmailContext);
  if (context === undefined) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
} 