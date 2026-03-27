'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/api';

export const LoginModal = () => {
  const { isLoginModalOpen, closeLoginModal, login: setAuth } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: 'test@latearte.com', // Valores predeterminados para facilidad de prueba
    password: 'password123',
    nombre: 'Usuario de Prueba',
  });

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, nombre: formData.nombre };

      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setAuth(data.access_token, data.user);
      closeLoginModal();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeLoginModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8"
        >
          <button 
            onClick={closeLoginModal}
            className="absolute top-6 right-6 p-2 text-white/30 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          <header className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Bienvenido' : 'Crea tu Cuenta'}
            </h2>
            <p className="text-sm text-white/40">
              {isLogin ? 'Ingresa para guardar tus obras favoritas' : 'Únete a latearte y personaliza tu experiencia'}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold ml-1">Nombre</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="email@ejemplo.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-400 bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                  {isLogin ? 'Entrar ahora' : 'Registrarme'}
                </>
              )}
            </button>
          </form>

          <footer className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-white/40 hover:text-cyan-400 transition-colors"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate gratis' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </footer>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
