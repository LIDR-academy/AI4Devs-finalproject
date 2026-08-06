import React, { useState } from 'react';
import { Package, AlertTriangle, ShieldCheck, RefreshCw, LogOut, User } from 'lucide-react';
import { PinLoginModal } from './features/auth/components/PinLoginModal.js';
import { AuthService } from './features/auth/services/auth.service.js';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(AuthService.getStoredUser());

  const handleLoginSuccess = () => {
    setCurrentUser(AuthService.getStoredUser());
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <PinLoginModal onSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Principal */}
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            RestoStock - Control de Inventario FEFO
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Sistema Táctil de Cocina & Bodega (Dark Petrol Dashboard)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Badge del Usuario Autenticado */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-card)',
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <User size={18} style={{ color: 'var(--color-primary)' }} />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{currentUser.role}</div>
            </div>
          </div>

          <button className="btn-touch btn-primary" id="btn-sync-remanentes">
            <RefreshCw size={20} />
            Sincronizar
          </button>

          <button className="btn-touch btn-danger" onClick={handleLogout} id="btn-logout">
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Rejilla de Tarjetas (Dashboard Grid) */}
      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Tarjeta 1: Remanentes Activos */}
        <section className="card-dashboard">
          <div className="card-header">
            <div className="card-badge-icon">
              <Package size={20} />
            </div>
            <h2 className="card-title">Remanentes Activos FEFO</h2>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            24 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>porciones</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.9rem' }}>
            Consumo guiado por expiración próxima
          </p>
        </section>

        {/* Tarjeta 2: Alertas Críticas < 24h */}
        <section className="card-dashboard">
          <div className="card-header">
            <div className="card-badge-icon" style={{ backgroundColor: 'rgba(255, 42, 42, 0.15)', color: 'var(--color-danger)' }}>
              <AlertTriangle size={20} />
            </div>
            <h2 className="card-title">Alertas por Vencer (&lt; 24h)</h2>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-danger)' }}>
            3 <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>lotes críticos</span>
          </div>
          <div style={{ marginTop: '16px' }}>
            <button className="btn-touch btn-danger" id="btn-descarte-merma" style={{ width: '100%' }}>
              Registrar Descarte de Merma
            </button>
          </div>
        </section>

        {/* Tarjeta 3: Ergonomía & Salud */}
        <section className="card-dashboard">
          <div className="card-header">
            <div className="card-badge-icon">
              <ShieldCheck size={20} />
            </div>
            <h2 className="card-title">Ergonomía Táctil Certified</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            <div>✔️ Áreas interactivas de mínimo <strong>48px x 48px</strong>.</div>
            <div>✔️ Teclado PinPad táctil de <strong>64px x 64px</strong>.</div>
            <div>✔️ Sesión JWT válida por 12 horas.</div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
