import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TaskFilters, TaskStatus } from '../types';

export const useUrlParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Convertir URL params a TaskFilters
  const getFiltersFromUrl = useCallback((): TaskFilters => {
    const filters: TaskFilters = {};

    const department = searchParams.get('department');
    if (department) filters.department = parseInt(department);

    const status = searchParams.get('status');
    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      filters.status = status as TaskStatus;
    }

    const team = searchParams.get('team');
    if (team) filters.team = parseInt(team);

    const priority = searchParams.get('priority');
    if (priority) filters.priority = parseInt(priority);



    const hasResponsible = searchParams.get('hasResponsible');
    if (hasResponsible === 'false') filters.hasResponsible = false;
    if (hasResponsible === 'true') filters.hasResponsible = true;

    const hasFunctional = searchParams.get('hasFunctional');
    if (hasFunctional === 'false') filters.hasFunctional = false;
    if (hasFunctional === 'true') filters.hasFunctional = true;

    const hasEstimation = searchParams.get('hasEstimation');
    if (hasEstimation === 'false') filters.hasEstimation = false;
    if (hasEstimation === 'true') filters.hasEstimation = true;

    const startDate = searchParams.get('startDate');
    if (startDate) filters.startDate = new Date(startDate);

    const endDate = searchParams.get('endDate');
    if (endDate) filters.endDate = new Date(endDate);

    return filters;
  }, [searchParams]);

  // Convertir TaskFilters a URL params
  const updateUrlFromFilters = useCallback((filters: TaskFilters) => {
    const newParams = new URLSearchParams();

    if (filters.department) newParams.set('department', filters.department.toString());
    if (filters.status) newParams.set('status', filters.status);
    if (filters.team) newParams.set('team', filters.team.toString());
    if (filters.priority) newParams.set('priority', filters.priority.toString());

    if (filters.hasResponsible !== undefined) newParams.set('hasResponsible', filters.hasResponsible.toString());
    if (filters.hasFunctional !== undefined) newParams.set('hasFunctional', filters.hasFunctional.toString());
    if (filters.hasEstimation !== undefined) newParams.set('hasEstimation', filters.hasEstimation.toString());
    if (filters.startDate) newParams.set('startDate', filters.startDate.toISOString().split('T')[0]);
    if (filters.endDate) newParams.set('endDate', filters.endDate.toISOString().split('T')[0]);

    setSearchParams(newParams);
  }, [setSearchParams]);

  // Limpiar todos los filtros
  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // Contar filtros activos
  const getActiveFiltersCount = useCallback((filters: TaskFilters): number => {
    let count = 0;
    if (filters.department) count++;
    if (filters.status) count++;
    if (filters.team) count++;
    if (filters.priority) count++;

    if (filters.hasResponsible !== undefined) count++;
    if (filters.hasFunctional !== undefined) count++;
    if (filters.hasEstimation !== undefined) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    return count;
  }, []);

  return {
    getFiltersFromUrl,
    updateUrlFromFilters,
    clearFilters,
    getActiveFiltersCount
  };
}; 