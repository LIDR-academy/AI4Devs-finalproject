export const API_URLS = {
  portfolio: 'http://localhost:8080/portfolio',
  valorizacionDiaria: (portfolioId: number) => `http://localhost:8080/valorizacion-diaria/${portfolioId}`,
  activos: (portfolioId: number) => `http://localhost:8080/activos/${portfolioId}`,
};
