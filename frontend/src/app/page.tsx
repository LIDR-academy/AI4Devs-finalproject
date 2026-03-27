'use client';

import { Suspense } from 'react';
import { User, LogOut, Sparkles } from 'lucide-react';
import { DialDeTiempo } from '@/components/DialDeTiempo/DialDeTiempo';
import { MoodSelector } from '@/components/MoodSelector/MoodSelector';
import { ObraCard } from '@/components/ObraCard/ObraCard';
import { LoginModal } from '@/components/LoginModal/LoginModal';
import { SkeletonCard } from '@/components/SkeletonCard/SkeletonCard';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { useObrasFiltradas } from '@/hooks/useObrasFiltradas';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useAuth } from '@/context/AuthContext';

function Header() {
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();

  return (
    <header className="w-full flex justify-between items-center mb-6">
      <div className="space-y-0.5 text-left">
        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-zinc-400 to-zinc-800 bg-clip-text text-transparent">
          late<span className="text-cyan-500">arte</span>
        </h1>
        <p className="text-[10px] font-bold text-zinc-600 tracking-[0.3em] uppercase transition-all duration-300">
          Punto de Encuentro Cultural
        </p>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <div className="flex items-center gap-3 p-1 px-3 bg-white/5 border border-white/10 rounded-full">
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Sesión</span>
              <span className="text-xs font-bold text-white/80">{user?.nombre}</span>
            </div>
            <button 
              onClick={logout}
              className="p-1.5 hover:bg-white/5 rounded-full text-white/20 hover:text-red-400 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            onClick={openLoginModal}
            className="flex items-center gap-2 px-5 py-2 bg-white text-black text-[11px] font-black uppercase tracking-wider rounded-full hover:bg-cyan-400 transition-all duration-300 shadow-lg"
          >
            <User size={14} /> Entrar
          </button>
        )}
      </div>
    </header>
  );
}

function ObrasGrid() {
  const { obras, loading, error } = useObrasFiltradas();
  const { isSaved, toggleWatchlist } = useWatchlist();

  const handleSurprise = () => {
    if (obras.length === 0) return;
    const randomIndex = Math.floor(Math.random() * obras.length);
    const randomObra = obras[randomIndex];
    window.open(randomObra.url_contenido, '_blank');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 bg-red-500/10 border border-red-500/20 rounded-2xl w-full">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (obras.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-8 w-full">
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-medium">
          Mostrando {obras.length} obras seleccionadas
        </p>
        <button
          onClick={handleSurprise}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-full text-[11px] font-bold uppercase tracking-widest text-cyan-400 hover:from-cyan-500/20 hover:to-purple-500/20 hover:border-cyan-500/40 transition-all duration-300"
        >
          <Sparkles size={14} className="animate-pulse" /> Sorpréndeme
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full pb-24">
        {obras.map((obra) => (
          <ObraCard
            key={obra.id}
            obra={obra}
            isSaved={isSaved(obra.id)}
            onToggleWatchlist={toggleWatchlist}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 bg-[#050505] text-white overflow-x-hidden selection:bg-cyan-500/30">
      <div className="z-10 max-w-7xl w-full flex flex-col gap-4 sm:gap-6">
        <Header />

        <section className="w-full flex flex-col gap-4 sm:gap-6">
          {/* SECCIÓN 1: FILTRADO ULTRA COMPACTO */}
          <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
            <Suspense fallback={<div className="h-32 w-64 animate-pulse bg-white/5 rounded-3xl" />}>
              <DialDeTiempo />
            </Suspense>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[8px] text-white/10 uppercase tracking-[0.4em] font-black">Vibe Selector</span>
              <MoodSelector />
            </div>
          </div>
          
          <LoginModal />

          {/* SECCIÓN 2: RESULTADOS */}
          <section className="w-full">
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2,3].map(i => <SkeletonCard key={i} />)}
              </div>
            }>
              <ObrasGrid />
            </Suspense>
          </section>
        </section>
      </div>
    </main>
  );
}
