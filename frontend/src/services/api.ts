import axios from 'axios';
import { API_URLS } from '../config/config';

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
