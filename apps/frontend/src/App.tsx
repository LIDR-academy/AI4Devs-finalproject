import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  AlertTriangle,
  RefreshCw,
  LogOut,
  User,
  PlusCircle,
  Clock,
  ShieldCheck,
  Utensils,
  ClipboardCheck,
  BarChart3,
} from 'lucide-react';
import { PinLoginModal } from './features/auth/components/PinLoginModal.js';
import { AuthService } from './features/auth/services/auth.service.js';
import { KitchenService, RemanenteFEFOItem } from './features/kitchen/services/kitchen.service.js';
import { ActiveRemanentesList } from './features/kitchen/components/ActiveRemanentesList.js';
import { WarehouseExtractionModal } from './features/stock/components/WarehouseExtractionModal.js';
import { DiscardModal } from './features/kitchen/components/DiscardModal.js';
import { RecipeSelectorModal } from './features/kitchen/components/RecipeSelectorModal.js';
import { ShiftReconciliationWizard } from './features/kitchen/components/ShiftReconciliationWizard.js';
import { ReportsDashboard } from './features/reports/components/ReportsDashboard.js';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(AuthService.getStoredUser());
  const [remanentes, setRemanentes] = useState<RemanenteFEFOItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modales
  const [isExtractionOpen, setIsExtractionOpen] = useState(false);
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [isReconciliationOpen, setIsReconciliationOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [discardTarget, setDiscardTarget] = useState<RemanenteFEFOItem | null>(null);

  const loadRemanentes = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await KitchenService.fetchActiveRemanentes();
      setRemanentes(items);
    } catch (err) {
      console.error('[App] Error cargando remanentes activos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadRemanentes();
    }
  }, [currentUser, loadRemanentes]);

  const handleLoginSuccess = () => {
    setCurrentUser(AuthService.getStoredUser());
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  const handleConsume = async (id: string, qty: number) => {
    await KitchenService.consumeRemanente(id, qty);
    await loadRemanentes();
  };

  if (!currentUser) {
    return <PinLoginModal onSuccess={handleLoginSuccess} />;
  }

  const criticalCount = remanentes.filter((r) => r.hoursRemaining < 24).length;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      {/* Header Principal Ergonomico */}
      <header
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package style={{ color: 'var(--color-primary)' }} /> RestoStock FEFO Dashboard - Control de Inventario FEFO
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
            Sistema Táctil de Inventario en Tiempo Real para Cocinas Industriales
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

          <button
            className="btn-touch btn-secondary"
            onClick={() => setIsReconciliationOpen(true)}
            id="btn-open-reconciliation"
            title="Cierre de Turno y Conciliación"
          >
            <ClipboardCheck size={20} />
            Conciliar Turno
          </button>

          <button
            className="btn-touch btn-secondary"
            onClick={() => setIsReportsOpen(true)}
            id="btn-open-reports"
            title="Reportes de Mermas"
          >
            <BarChart3 size={20} />
            Reportes
          </button>

          <button
            className="btn-touch btn-secondary"
            onClick={loadRemanentes}
            disabled={isLoading}
            id="btn-sync-remanentes"
            title="Sincronizar Remanentes"
          >
            <RefreshCw size={20} className={isLoading ? 'spin' : ''} />
            Sincronizar
          </button>

          <button className="btn-touch btn-danger" onClick={handleLogout} id="btn-logout">
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Barra de Acciones Rapidas & Resumen FEFO */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        {/* Tarjeta 1: Total Remanentes */}
        <div className="card-dashboard">
          <div className="card-header">
            <div className="card-badge-icon">
              <Clock size={20} />
            </div>
            <h2 className="card-title">Remanentes Abiertos</h2>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {remanentes.length}{' '}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>lotes FEFO</span>
          </div>
        </div>

        {/* Tarjeta 2: Alertas Críticas */}
        <div className="card-dashboard">
          <div className="card-header">
            <div
              className="card-badge-icon"
              style={{ backgroundColor: 'rgba(255, 42, 42, 0.15)', color: 'var(--color-danger)' }}
            >
              <AlertTriangle size={20} />
            </div>
            <h2 className="card-title">Vencimiento Próximo (&lt;24h)</h2>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-danger)' }}>
            {criticalCount}{' '}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>lotes críticos</span>
          </div>
        </div>

        {/* Tarjeta 3: Accion de Extraccion Bodega */}
        <div
          className="card-dashboard"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 210, 190, 0.05)',
            border: '1px dashed var(--color-primary)',
          }}
        >
          <button
            className="btn-touch btn-primary"
            onClick={() => setIsExtractionOpen(true)}
            style={{ width: '100%', height: '56px', fontSize: '1rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            id="btn-open-extraction"
          >
            <PlusCircle size={22} />
            Extraer Insumo de Bodega
          </button>
        </div>

        {/* Tarjeta 4: Preparar Receta en Cascada FEFO */}
        <div
          className="card-dashboard"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 170, 0, 0.05)',
            border: '1px dashed var(--color-warning)',
          }}
        >
          <button
            className="btn-touch btn-warning"
            onClick={() => setIsRecipeOpen(true)}
            style={{ width: '100%', height: '56px', fontSize: '1rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
            id="btn-open-recipe"
          >
            <Utensils size={22} />
            Preparar Receta FEFO
          </button>
        </div>
      </section>

      {/* Titulo del Tablero de Cocina */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck style={{ color: 'var(--color-primary)' }} /> Tablero FEFO de Cocina (Prioridad por Expiración)
        </h2>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Botones táctiles optimizados a <strong>&ge;48px</strong>
        </span>
      </div>

      {/* Lista de Remanentes Activos FEFO */}
      <main>
        <ActiveRemanentesList
          items={remanentes}
          onConsume={handleConsume}
          onDiscard={(item) => setDiscardTarget(item)}
        />
      </main>

      {/* Modales */}
      <WarehouseExtractionModal
        isOpen={isExtractionOpen}
        onClose={() => setIsExtractionOpen(false)}
        onSuccess={loadRemanentes}
      />

      <RecipeSelectorModal
        isOpen={isRecipeOpen}
        onClose={() => setIsRecipeOpen(false)}
        onSuccess={loadRemanentes}
      />

      <DiscardModal
        remanente={discardTarget}
        onClose={() => setDiscardTarget(null)}
        onSuccess={loadRemanentes}
      />

      <ShiftReconciliationWizard
        isOpen={isReconciliationOpen}
        remanentes={remanentes}
        operatorId={currentUser.id}
        onClose={() => setIsReconciliationOpen(false)}
        onSuccess={loadRemanentes}
      />

      <ReportsDashboard
        isOpen={isReportsOpen}
        userRole={currentUser.role}
        onClose={() => setIsReportsOpen(false)}
      />
    </div>
  );
};

export default App;
