export type NavItem = {
  to: string;
  label: string;
  end?: boolean;
};

/** PRD §4 / README §1.3 — single sitemap for the unified sidebar (KAN-19). */
export const APP_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/book-tracker', label: 'Todas mis lecturas' },
  { to: '/stats', label: 'Estadísticas de lectura' },
  { to: '/lists', label: 'Listas' },
  { to: '/goals', label: 'Metas' },
  { to: '/library', label: 'Biblioteca' },
  { to: '/recap', label: 'Resumen e insights' },
  { to: '/import-export', label: 'Importar / Exportar' },
  { to: '/profile', label: 'Perfil / Ajustes' },
];
