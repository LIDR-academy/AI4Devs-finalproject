import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  CalendarIcon,
  CalendarDaysIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user } = useAuth();
  const userRoles = user?.roles || [];

  const menuItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: HomeIcon,
      roles: ['cirujano', 'enfermeria', 'administrador'],
    },
    {
      path: '/hce',
      label: 'Historia Clínica',
      icon: DocumentTextIcon,
      roles: ['cirujano', 'enfermeria', 'administrador'],
    },
    {
      path: '/planning',
      label: 'Planificación Quirúrgica',
      icon: CalendarIcon,
      roles: ['cirujano', 'administrador'],
    },
    {
      path: '/planning/calendar',
      label: 'Calendario Quirófanos',
      icon: CalendarDaysIcon,
      roles: ['cirujano', 'enfermeria', 'administrador'],
    },
    {
      path: '/checklist',
      label: 'Checklist WHO',
      icon: ClipboardDocumentCheckIcon,
      roles: ['cirujano', 'enfermeria', 'administrador'],
    },
    {
      path: '/patients',
      label: 'Pacientes',
      icon: UserGroupIcon,
      roles: ['cirujano', 'enfermeria', 'administrador'],
    },
    {
      path: '/notifications',
      label: 'Notificaciones',
      icon: BellAlertIcon,
      roles: ['cirujano', 'enfermeria', 'administrador'],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.roles.some((role) => userRoles.includes(role))
  );

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-medical-dark text-white pt-6 rounded-r-lg">
      <nav className="px-4">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-medical-primary text-white border-l-4 border-medical-secondary'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
