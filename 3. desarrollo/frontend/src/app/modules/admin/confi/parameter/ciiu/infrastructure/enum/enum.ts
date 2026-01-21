import { envs } from 'app/common';

export const CiiuEnum = {
  title: 'Catálogo CIIU - Actividades Económicas',
  titleActividad: 'Actividad Económica',
  
  // API endpoints
  api: `${envs.apiUrl}/ciiu`,
  apiActividades: `${envs.apiUrl}/ciiu/actividades`,
  apiActividadesSearch: `${envs.apiUrl}/ciiu/actividades/search`,
  apiArbol: `${envs.apiUrl}/ciiu/arbol`,
  
  // Route
  route: '/confi/parameter/ciiu',
};

