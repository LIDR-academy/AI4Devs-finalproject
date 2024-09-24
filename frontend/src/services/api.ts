import axios from 'axios';
import { API_HOST, API_PORT } from '../config/config';

const API_URLS = {
  portfolio: `${API_HOST}:${API_PORT}/portfolio`,
  valorizacionDiaria: (portfolioId: number) => `${API_HOST}:${API_PORT}/valorizacion-diaria/${portfolioId}`,
  activos: (portfolioId: number) => `${API_HOST}:${API_PORT}/activos/${portfolioId}`
};

export const fetchPortfolio = async () => {
  const response = await axios.get(API_URLS.portfolio);
  return response.data;
};

export const fetchValorizacionDiaria = async (portfolioId: number) => {
  const response = await axios.get(API_URLS.valorizacionDiaria(portfolioId));
  return response.data;
};

export const fetchActivos = async (portfolioId: number) => {
  const response = await axios.get(API_URLS.activos(portfolioId));
  return response.data;
};



