import { envs } from 'app/common';

export const GeoEnum = {
  title: 'Catálogo Geográfico',
  titleProvincia: 'Provincia',
  titleCanton: 'Cantón',
  titleParroquia: 'Parroquia',
  
  // API endpoints
  api: `${envs.apiUrl}/geo`,
  apiProvincias: `${envs.apiUrl}/geo/provincias`,
  apiCantones: `${envs.apiUrl}/geo/cantones`,
  apiParroquias: `${envs.apiUrl}/geo/parroquias`,
  
  // Route
  route: '/configuracion/catalogo-geografico',
};

