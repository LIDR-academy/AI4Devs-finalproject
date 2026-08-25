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
  Users,
  History,
  BookOpen,
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
import { UserManagementPanel } from './features/auth/components/UserManagementPanel.js';
import { MovementHistoryPanel } from './features/stock/components/MovementHistoryPanel.js';
import { CatalogManagementPanel } from './features/catalog/components/CatalogManagementPanel.js';

interface DashboardHeaderProps {
  currentUser: { name: string; role: string };
  isLoading: boolean;
  onReconcile: () => void;
  onReports: () => void;
  onUserManagement: () => void;
  onMovementHistory: () => void;
  onCatalogManagement: () => void;
  onSync: () => void;
  onLogout: () => void;
}

const UserBadge: React.FC<{ name: string; role: string }> = ({ name, role }) => (
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
      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{name}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{role}</div>
    </div>
  </div>
);

interface HeaderActionsProps {
  isLoading: boolean;
  onReconcile: () => void;
  onReports: () => void;
  onUserManagement: () => void;
  onMovementHistory: () => void;
  onCatalogManagement: () => void;
  onSync: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  isLoading,
  onReconcile,
  onReports,
  onUserManagement,
  onMovementHistory,
  onCatalogManagement,
  onSync,
}) => (
  <>
    <button className="btn-touch btn-secondary" onClick={onReconcile} id="btn-open-reconciliation" title="Cierre de Turno y Conciliación">
      <ClipboardCheck size={20} />
      Conciliar Turno
    </button>

    <button className="btn-touch btn-secondary" onClick={onReports} id="btn-open-reports" title="Reportes de Mermas">
      <BarChart3 size={20} />
      Reportes
    </button>

    <button className="btn-touch btn-secondary" onClick={onUserManagement} id="btn-open-user-management" title="Gestión de Personal">
      <Users size={20} />
      Personal
    </button>

    <button className="btn-touch btn-secondary" onClick={onMovementHistory} id="btn-open-movement-history" title="Auditoría de Movimientos">
      <History size={20} />
      Movimientos
    </button>

    <button className="btn-touch btn-secondary" onClick={onCatalogManagement} id="btn-open-catalog-management" title="Gestión de Catálogo">
      <BookOpen size={20} />
      Catálogo
    </button>

    <button className="btn-touch btn-secondary" onClick={onSync} disabled={isLoading} id="btn-sync-remanentes" title="Sincronizar Remanentes">
      <RefreshCw size={20} className={isLoading ? 'spin' : ''} />
      Sincronizar
    </button>
  </>
);

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  isLoading,
  onReconcile,
  onReports,
  onUserManagement,
  onMovementHistory,
  onCatalogManagement,
  onSync,
  onLogout,
}) => (
  <header
    style={{
      marginBottom: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '16px',
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Package style={{ color: 'var(--color-primary)' }} /> RestoStock FEFO Dashboard - Control de Inventario FEFO
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '0.9rem' }}>
          Sistema Táctil de Inventario en Tiempo Real para Cocinas Industriales
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <UserBadge name={currentUser.name} role={currentUser.role} />
        <button className="btn-touch btn-danger" onClick={onLogout} id="btn-logout">
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <HeaderActions
        isLoading={isLoading}
        onReconcile={onReconcile}
        onReports={onReports}
        onUserManagement={onUserManagement}
        onMovementHistory={onMovementHistory}
        onCatalogManagement={onCatalogManagement}
        onSync={onSync}
      />
    </div>
  </header>
);

interface SummaryCardsProps {
  remanentesCount: number;
  criticalCount: number;
  onExtract: () => void;
  onPrepareRecipe: () => void;
}

const MetricCard: React.FC<{ icon: React.ReactNode; iconBg?: string; title: string; value: number; unitLabel: string; valueColor: string }> = ({
  icon,
  iconBg,
  title,
  value,
  unitLabel,
  valueColor,
}) => (
  <div className="card-dashboard">
    <div className="card-header">
      <div className="card-badge-icon" style={iconBg ? { backgroundColor: iconBg, color: valueColor } : undefined}>
        {icon}
      </div>
      <h2 className="card-title">{title}</h2>
    </div>
    {/* La cifra siempre en --text-primary (nunca en el tono de valueColor): a este tamaño ningun acento
        alcanza el 7:1 exigido para "numeros principales"; valueColor queda reservado al icono (no-texto). */}
    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
      {value} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{unitLabel}</span>
    </div>
  </div>
);

const ActionCard: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; id: string; accentColor: string; tint: string; className: string }> = ({
  icon,
  label,
  onClick,
  id,
  accentColor,
  tint,
  className,
}) => (
  <div className="card-dashboard" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', backgroundColor: tint, border: `1px dashed ${accentColor}` }}>
    <button
      className={`btn-touch ${className}`}
      onClick={onClick}
      style={{ width: '100%', height: '56px', fontSize: '1rem', fontWeight: 700, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
      id={id}
    >
      {icon}
      {label}
    </button>
  </div>
);

const SummaryCards: React.FC<SummaryCardsProps> = ({ remanentesCount, criticalCount, onExtract, onPrepareRecipe }) => (
  <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
    <MetricCard icon={<Clock size={20} />} title="Remanentes Abiertos" value={remanentesCount} unitLabel="lotes FEFO" valueColor="var(--color-primary)" />
    <MetricCard
      icon={<AlertTriangle size={20} />}
      iconBg="rgba(225, 6, 0, 0.15)"
      title="Vencimiento Próximo (<24h)"
      value={criticalCount}
      unitLabel="lotes críticos"
      valueColor="var(--color-danger)"
    />
    <ActionCard
      icon={<PlusCircle size={22} />}
      label="Extraer Insumo de Bodega"
      onClick={onExtract}
      id="btn-open-extraction"
      accentColor="var(--color-primary)"
      tint="rgba(255, 106, 0, 0.05)"
      className="btn-primary"
    />
    <ActionCard
      icon={<Utensils size={22} />}
      label="Preparar Receta FEFO"
      onClick={onPrepareRecipe}
      id="btn-open-recipe"
      accentColor="var(--color-warning)"
      tint="rgba(255, 106, 0, 0.05)"
      className="btn-warning"
    />
  </section>
);

interface AppModalsProps {
  isExtractionOpen: boolean;
  isRecipeOpen: boolean;
  isReconciliationOpen: boolean;
  isReportsOpen: boolean;
  isUserManagementOpen: boolean;
  isMovementHistoryOpen: boolean;
  isCatalogManagementOpen: boolean;
  discardTarget: RemanenteFEFOItem | null;
  remanentes: RemanenteFEFOItem[];
  operatorId: string;
  userRole: string;
  onCloseExtraction: () => void;
  onCloseRecipe: () => void;
  onCloseReconciliation: () => void;
  onCloseReports: () => void;
  onCloseUserManagement: () => void;
  onCloseMovementHistory: () => void;
  onCloseCatalogManagement: () => void;
  onCloseDiscard: () => void;
  onSuccess: () => void;
}

const AppModals: React.FC<AppModalsProps> = ({
  isExtractionOpen,
  isRecipeOpen,
  isReconciliationOpen,
  isReportsOpen,
  isUserManagementOpen,
  isMovementHistoryOpen,
  isCatalogManagementOpen,
  discardTarget,
  remanentes,
  operatorId,
  userRole,
  onCloseExtraction,
  onCloseRecipe,
  onCloseReconciliation,
  onCloseReports,
  onCloseUserManagement,
  onCloseMovementHistory,
  onCloseCatalogManagement,
  onCloseDiscard,
  onSuccess,
}) => (
  <>
    <WarehouseExtractionModal isOpen={isExtractionOpen} onClose={onCloseExtraction} onSuccess={onSuccess} />
    <RecipeSelectorModal isOpen={isRecipeOpen} onClose={onCloseRecipe} onSuccess={onSuccess} />
    <DiscardModal remanente={discardTarget} onClose={onCloseDiscard} onSuccess={onSuccess} />
    <UserManagementPanel isOpen={isUserManagementOpen} userRole={userRole} onClose={onCloseUserManagement} />
    <MovementHistoryPanel isOpen={isMovementHistoryOpen} userRole={userRole} onClose={onCloseMovementHistory} />
    <CatalogManagementPanel isOpen={isCatalogManagementOpen} userRole={userRole} onClose={onCloseCatalogManagement} />
    <ShiftReconciliationWizard
      isOpen={isReconciliationOpen}
      remanentes={remanentes}
      operatorId={operatorId}
      onClose={onCloseReconciliation}
      onSuccess={onSuccess}
    />
    <ReportsDashboard isOpen={isReportsOpen} userRole={userRole} onClose={onCloseReports} />
  </>
);

function useModalVisibility() {
  const [isExtractionOpen, setIsExtractionOpen] = useState(false);
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [isReconciliationOpen, setIsReconciliationOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isMovementHistoryOpen, setIsMovementHistoryOpen] = useState(false);
  const [isCatalogManagementOpen, setIsCatalogManagementOpen] = useState(false);
  const [discardTarget, setDiscardTarget] = useState<RemanenteFEFOItem | null>(null);

  return {
    isExtractionOpen,
    setIsExtractionOpen,
    isRecipeOpen,
    setIsRecipeOpen,
    isReconciliationOpen,
    setIsReconciliationOpen,
    isReportsOpen,
    setIsReportsOpen,
    isUserManagementOpen,
    setIsUserManagementOpen,
    isMovementHistoryOpen,
    setIsMovementHistoryOpen,
    isCatalogManagementOpen,
    setIsCatalogManagementOpen,
    discardTarget,
    setDiscardTarget,
  };
}

function useDashboardState() {
  const [currentUser, setCurrentUser] = useState(AuthService.getStoredUser());
  const [remanentes, setRemanentes] = useState<RemanenteFEFOItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const modals = useModalVisibility();

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

  const handleLoginSuccess = () => setCurrentUser(AuthService.getStoredUser());

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  const handleConsume = async (id: string, qty: number) => {
    await KitchenService.consumeRemanente(id, qty);
    await loadRemanentes();
  };

  return {
    currentUser,
    remanentes,
    isLoading,
    ...modals,
    loadRemanentes,
    handleLoginSuccess,
    handleLogout,
    handleConsume,
  };
}

function useAppHandlers(dashboard: ReturnType<typeof useDashboardState>) {
  return {
    onReconcile: () => dashboard.setIsReconciliationOpen(true),
    onReports: () => dashboard.setIsReportsOpen(true),
    onUserManagement: () => dashboard.setIsUserManagementOpen(true),
    onMovementHistory: () => dashboard.setIsMovementHistoryOpen(true),
    onCatalogManagement: () => dashboard.setIsCatalogManagementOpen(true),
    onExtract: () => dashboard.setIsExtractionOpen(true),
    onPrepareRecipe: () => dashboard.setIsRecipeOpen(true),
    onCloseExtraction: () => dashboard.setIsExtractionOpen(false),
    onCloseRecipe: () => dashboard.setIsRecipeOpen(false),
    onCloseReconciliation: () => dashboard.setIsReconciliationOpen(false),
    onCloseReports: () => dashboard.setIsReportsOpen(false),
    onCloseUserManagement: () => dashboard.setIsUserManagementOpen(false),
    onCloseMovementHistory: () => dashboard.setIsMovementHistoryOpen(false),
    onCloseCatalogManagement: () => dashboard.setIsCatalogManagementOpen(false),
    onCloseDiscard: () => dashboard.setDiscardTarget(null),
  };
}

const KitchenBoardTitle: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <ShieldCheck style={{ color: 'var(--color-primary)' }} /> Tablero FEFO de Cocina (Prioridad por Expiración)
    </h2>
    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
      Botones táctiles optimizados a <strong>&ge;48px</strong>
    </span>
  </div>
);

export const App: React.FC = () => {
  const dashboard = useDashboardState();
  const { currentUser, remanentes, isLoading, loadRemanentes, handleLoginSuccess, handleLogout, handleConsume } = dashboard;
  const handlers = useAppHandlers(dashboard);

  if (!currentUser) {
    return <PinLoginModal onSuccess={handleLoginSuccess} />;
  }

  const criticalCount = remanentes.filter((r) => r.hoursRemaining < 24).length;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh' }}>
      <DashboardHeader currentUser={currentUser} isLoading={isLoading} onSync={loadRemanentes} onLogout={handleLogout} {...handlers} />

      <SummaryCards remanentesCount={remanentes.length} criticalCount={criticalCount} {...handlers} />

      <KitchenBoardTitle />

      {/* Lista de Remanentes Activos FEFO */}
      <main>
        <ActiveRemanentesList
          items={remanentes}
          onConsume={handleConsume}
          onDiscard={(item) => dashboard.setDiscardTarget(item)}
        />
      </main>

      <AppModals
        isExtractionOpen={dashboard.isExtractionOpen}
        isRecipeOpen={dashboard.isRecipeOpen}
        isReconciliationOpen={dashboard.isReconciliationOpen}
        isReportsOpen={dashboard.isReportsOpen}
        isUserManagementOpen={dashboard.isUserManagementOpen}
        isMovementHistoryOpen={dashboard.isMovementHistoryOpen}
        isCatalogManagementOpen={dashboard.isCatalogManagementOpen}
        discardTarget={dashboard.discardTarget}
        remanentes={remanentes}
        operatorId={currentUser.id}
        userRole={currentUser.role}
        onSuccess={loadRemanentes}
        {...handlers}
      />
    </div>
  );
};

export default App;
