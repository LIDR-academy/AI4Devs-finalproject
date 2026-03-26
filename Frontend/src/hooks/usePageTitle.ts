import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeTitles: Record<string, string> = {
  '/': 'Inicio - TravelSplit',
  '/login': 'Iniciar sesión - TravelSplit',
  '/register': 'Crear cuenta - TravelSplit',
  '/trips': 'Mis Viajes - TravelSplit',
  '/trips/new': 'Crear Viaje - TravelSplit',
  '/profile': 'Mi Perfil - TravelSplit',
};

export const usePageTitle = () => {
  const location = useLocation();

  useEffect(() => {
    if (routeTitles[location.pathname]) {
      document.title = routeTitles[location.pathname];
    } else if (location.pathname.startsWith('/trips/') && location.pathname.endsWith('/expenses/new')) {
      document.title = 'Agregar Gasto - TravelSplit';
    } else if (location.pathname.startsWith('/trips/')) {
      document.title = 'Detalle del Viaje - TravelSplit';
    } else {
      document.title = 'TravelSplit';
    }
  }, [location.pathname]);
};
