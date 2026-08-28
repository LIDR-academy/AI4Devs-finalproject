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

import { RestaurantSettingsModal } from './features/settings/components/RestaurantSettingsModal.js';
import { LocationsManagementModal } from './features/stock/components/LocationsManagementModal.js';
import { RolesManagementModal } from './features/security/components/RolesManagementModal.js';
import { FEFOInventoryHealthBar } from './features/kitchen/components/FEFOInventoryHealthBar.js';
import { LocationFilterTabs, LocationFilter } from './features/kitchen/components/LocationFilterTabs.js';
import { AdminDropdownMenu } from './features/security/components/AdminDropdownMenu.js';

interface DashboardHeaderProps {
  currentUser: { name: string; role: string };
  isLoading: boolean;
  restaurantName?: string;
  onReconcile: () => void;
  onReports: () => void;
  onUserManagement: () => void;
  onMovementHistory: () => void;
  onCatalogManagement: () => void;
  onSettingsManagement: () => void;
  onLocationsManagement: () => void;
  onRolesManagement: () => void;
  onSync: () => void;
  onLogout: () => void;
}

const UserBadge: React.FC<{ name: string; role: string }> = ({ name, role }) => (
  <div className="user-badge">
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
  onSettingsManagement: () => void;
  onLocationsManagement: () => void;
  onRolesManagement: () => void;
  onSync: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({
  isLoading,
  onReconcile,
  onReports,
  onUserManagement,
  onMovementHistory,
  onCatalogManagement,
  onSettingsManagement,
  onLocationsManagement,
  onRolesManagement,
  onSync,
}) => (
  <>
    <button className="btn-touch btn-secondary" onClick={onReconcile} id="btn-open-reconciliation" title="Cierre de Turno y Conciliación">
      <ClipboardCheck size={20} />
      Conciliar Turno
    </button>

    <AdminDropdownMenu
      onReports={onReports}
      onUserManagement={onUserManagement}
      onMovementHistory={onMovementHistory}
      onCatalogManagement={onCatalogManagement}
      onSettingsManagement={onSettingsManagement}
      onLocationsManagement={onLocationsManagement}
      onRolesManagement={onRolesManagement}
    />

    <button className="btn-touch btn-secondary" onClick={onSync} disabled={isLoading} id="btn-sync-remanentes" title="Sincronizar Remanentes">
      <RefreshCw size={20} className={isLoading ? 'spin' : ''} />
      Sincronizar
    </button>
  </>
);

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  currentUser,
  isLoading,
  onLogout,
  onReconcile,
  onReports,
  onUserManagement,
  onMovementHistory,
  onCatalogManagement,
  onSettingsManagement,
  onLocationsManagement,
  onRolesManagement,
  onSync,
}) => (
  <header className="flex-between flex-wrap" style={{ marginBottom: '24px', gap: '16px', alignItems: 'flex-start' }}>
    <div className="flex-column" style={{ gap: '12px' }}>
      <div>
        <h1 className="flex-gap-xs" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', gap: '10px' }}>
          <Package className="text-primary-color" /> RestoStock FEFO Dashboard - Control de Inventario FEFO
        </h1>
        <p className="text-secondary-color" style={{ marginTop: '4px', fontSize: '0.9rem' }}>
          Sistema Táctil de Inventario en Tiempo Real para Cocinas Industriales
        </p>
      </div>

      <div className="flex-gap-md">
        <UserBadge name={currentUser.name} role={currentUser.role} />
        <button className="btn-touch btn-danger" onClick={onLogout} id="btn-logout">
          <LogOut size={20} />
          Cerrar Sesión
        </button>
      </div>
    </div>

    <div className="flex-gap-md flex-wrap">
      <HeaderActions
        isLoading={isLoading}
        onReconcile={onReconcile}
        onReports={onReports}
        onUserManagement={onUserManagement}
        onMovementHistory={onMovementHistory}
        onCatalogManagement={onCatalogManagement}
        onSettingsManagement={onSettingsManagement}
        onLocationsManagement={onLocationsManagement}
        onRolesManagement={onRolesManagement}
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
    <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
      {value} <span className="text-secondary-color" style={{ fontSize: '0.9rem' }}>{unitLabel}</span>
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
  <div className="card-dashboard flex-column flex-center" style={{ backgroundColor: tint, border: `1px dashed ${accentColor}` }}>
    <button
      className={`btn-touch w-full flex-center flex-gap-xs ${className}`}
      onClick={onClick}
      style={{ height: '56px', fontSize: '1rem', fontWeight: 700, gap: '10px' }}
      id={id}
    >
      {icon}
      {label}
    </button>
  </div>
);

const SummaryCards: React.FC<SummaryCardsProps> = ({ remanentesCount, criticalCount, onExtract, onPrepareRecipe }) => (
  <section className="metrics-grid">
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
  isSettingsOpen: boolean;
  isLocationsOpen: boolean;
  isRolesOpen: boolean;
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
  onCloseSettingsManagement: () => void;
  onCloseLocationsManagement: () => void;
  onCloseRolesManagement: () => void;
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
  isSettingsOpen,
  isLocationsOpen,
  isRolesOpen,
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
  onCloseSettingsManagement,
  onCloseLocationsManagement,
  onCloseRolesManagement,
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
    <RestaurantSettingsModal isOpen={isSettingsOpen} onClose={onCloseSettingsManagement} />
    <LocationsManagementModal isOpen={isLocationsOpen} onClose={onCloseLocationsManagement} />
    <RolesManagementModal isOpen={isRolesOpen} onClose={onCloseRolesManagement} />
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const [isRolesOpen, setIsRolesOpen] = useState(false);
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
    isSettingsOpen,
    setIsSettingsOpen,
    isLocationsOpen,
    setIsLocationsOpen,
    isRolesOpen,
    setIsRolesOpen,
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
    onSettingsManagement: () => dashboard.setIsSettingsOpen(true),
    onLocationsManagement: () => dashboard.setIsLocationsOpen(true),
    onRolesManagement: () => dashboard.setIsRolesOpen(true),
    onExtract: () => dashboard.setIsExtractionOpen(true),
    onPrepareRecipe: () => dashboard.setIsRecipeOpen(true),
    onCloseExtraction: () => dashboard.setIsExtractionOpen(false),
    onCloseRecipe: () => dashboard.setIsRecipeOpen(false),
    onCloseReconciliation: () => dashboard.setIsReconciliationOpen(false),
    onCloseReports: () => dashboard.setIsReportsOpen(false),
    onCloseUserManagement: () => dashboard.setIsUserManagementOpen(false),
    onCloseMovementHistory: () => dashboard.setIsMovementHistoryOpen(false),
    onCloseCatalogManagement: () => dashboard.setIsCatalogManagementOpen(false),
    onCloseSettingsManagement: () => dashboard.setIsSettingsOpen(false),
    onCloseLocationsManagement: () => dashboard.setIsLocationsOpen(false),
    onCloseRolesManagement: () => dashboard.setIsRolesOpen(false),
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

const App: React.FC = () => {
  const dashboard = useDashboardState();
  const { currentUser, remanentes, isLoading, loadRemanentes, handleLoginSuccess, handleLogout, handleConsume } = dashboard;
  const handlers = useAppHandlers(dashboard);
  const [activeLocation, setActiveLocation] = useState<LocationFilter>('ALL');

  if (!currentUser) {
    return <PinLoginModal onSuccess={handleLoginSuccess} />;
  }

  const criticalCount = remanentes.filter((r) => r.hoursRemaining < 24).length;

  const counts: Record<LocationFilter, number> = {
    ALL: remanentes.length,
    KITCHEN_FRIDGE: remanentes.filter((r) => r.location === 'KITCHEN_FRIDGE').length,
    KITCHEN_PREP: remanentes.filter((r) => r.location === 'KITCHEN_PREP').length,
    KITCHEN_LINE: remanentes.filter((r) => r.location === 'KITCHEN_LINE').length,
  };

  const filteredRemanentes = activeLocation === 'ALL' ? remanentes : remanentes.filter((r) => r.location === activeLocation);

  return (
    <div className="dashboard-container">
      <DashboardHeader currentUser={currentUser} isLoading={isLoading} onSync={loadRemanentes} onLogout={handleLogout} {...handlers} />

      <FEFOInventoryHealthBar remanentes={remanentes} />

      <SummaryCards remanentesCount={remanentes.length} criticalCount={criticalCount} {...handlers} />

      <KitchenBoardTitle />

      <LocationFilterTabs activeLocation={activeLocation} onLocationSelect={setActiveLocation} counts={counts} />

      {/* Lista de Remanentes Activos FEFO */}
      <main>
        <ActiveRemanentesList
          items={filteredRemanentes}
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
        isSettingsOpen={dashboard.isSettingsOpen}
        isLocationsOpen={dashboard.isLocationsOpen}
        isRolesOpen={dashboard.isRolesOpen}
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

export { App };
export default App;


