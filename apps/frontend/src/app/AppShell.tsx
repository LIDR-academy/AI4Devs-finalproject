import React from 'react';
import { Outlet } from 'react-router-dom';
import { PinLoginModal } from '../features/auth/components/PinLoginModal.js';
import { ForceChangePinModal } from '../features/auth/components/ForceChangePinModal.js';
import { ResetPinModal } from '../features/auth/components/ResetPinModal.js';
import { AppSidebar } from './AppSidebar.js';
import { AppTopBar } from './AppTopBar.js';
import { AppShellCtx, type AppShellContext } from './session.js';
import { useFefoTheme } from './useFefoTheme.js';
import { useSession } from './useSession.js';
import { useResetPinToken } from './useResetPinToken.js';
import styles from './AppShell.module.css';

/**
 * Contenedor raíz de la aplicación (US-023/TK-085-FE). Envuelve todas las rutas
 * con la barra lateral tipo comanda + la topbar de navegación, y concentra el
 * gating de sesión (PIN), el tema Día/Noche y el manejo del magic link de
 * recuperación de PIN. Se monta como `element` de la ruta raíz del router.
 */
export const AppShell: React.FC = () => {
  const { theme, setTheme } = useFefoTheme();
  const { currentUser, sessionNotice, login, logout, reloadUser, notify } = useSession();
  const resetToken = useResetPinToken();

  if (resetToken.token) {
    return (
      <ResetPinModal
        token={resetToken.token}
        isOpen
        onSuccess={() => {
          resetToken.clear();
          notify('¡PIN restablecido con éxito! Ingrese con su nuevo PIN.');
        }}
        onCancel={resetToken.clear}
      />
    );
  }

  if (!currentUser) {
    return <PinLoginModal onSuccess={login} initialNotice={sessionNotice ?? undefined} />;
  }

  if (currentUser.mustChangePin) {
    return <ForceChangePinModal userId={currentUser.id} onSuccess={reloadUser} />;
  }

  const context: AppShellContext = { currentUser, onLogout: () => logout(), reloadUser };

  return (
    <div className={styles.shell}>
      <AppSidebar />
      <div className={styles.body}>
        <AppTopBar
          currentUser={currentUser}
          theme={theme}
          onThemeChange={setTheme}
          onLogout={() => logout()}
        />
        <main className={styles.content}>
          <AppShellCtx.Provider value={context}>
            <Outlet context={context} />
          </AppShellCtx.Provider>
        </main>
      </div>
    </div>
  );
};
