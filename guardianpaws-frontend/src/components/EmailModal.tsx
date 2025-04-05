import { useState } from 'react';
import { useEmail } from '@/contexts/EmailContext';

interface EmailModalProps {
  onSubmit: (email: string) => void;
}

export default function EmailModal({ onSubmit }: EmailModalProps) {
  const { setCurrentUserEmail } = useEmail();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }
    if (!email.includes('@')) {
      setError('Por favor, ingresa un correo electrónico válido');
      return;
    }
    
    // Use the context to set the email
    setCurrentUserEmail(email);
    
    onSubmit(email);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold text-white mb-4">
          Ingresa tu correo electrónico
        </h2>
        <p className="text-gray-400 mb-6">
          Para ver tus reportes, necesitamos tu correo electrónico
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="tu@correo.com"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continuar
          </button>
        </form>
      </div>
    </div>
  );
} 