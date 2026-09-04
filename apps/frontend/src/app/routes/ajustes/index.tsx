import React from 'react';
import { RestaurantSettingsPanel } from '../../../features/settings/components/RestaurantSettingsPanel.js';
import { UserManagementPanel } from '../../../features/auth/components/UserManagementPanel.js';
import { RolesManagementPanel } from '../../../features/security/components/RolesManagementPanel.js';
import { MovementHistoryPanel } from '../../../features/stock/components/MovementHistoryPanel.js';
import { ConsumptionReasonsManagementPanel } from '../../../features/kitchen/components/ConsumptionReasonsManagementPanel.js';

/** Sub-rutas de `/ajustes` (US-024) — cada panel administrativo montado inline. */
export const ConfiguracionRoute: React.FC = () => <RestaurantSettingsPanel />;
export const PersonalRoute: React.FC = () => <UserManagementPanel />;
export const RolesRoute: React.FC = () => <RolesManagementPanel />;
export const MovimientosRoute: React.FC = () => <MovementHistoryPanel />;
// US-030 / ADR-004 / TK-107-FE: catálogo administrable de motivos de consumo.
export const MotivosRoute: React.FC = () => <ConsumptionReasonsManagementPanel />;
