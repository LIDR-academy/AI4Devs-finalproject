const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const reporteService = {
  async crearReporte(formData: FormData) {
    try {
      const response = await fetch(`${API_URL}/reportes-perdida`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al crear el reporte');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en crearReporte:', error);
      throw error;
    }
  },

  async obtenerReportes() {
    try {
      const response = await fetch(`${API_URL}/reportes-perdida`);
      
      if (!response.ok) {
        throw new Error('Error al obtener los reportes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerReportes:', error);
      throw error;
    }
  },

  async obtenerReportePorId(id: string) {
    try {
      const response = await fetch(`${API_URL}/reportes-perdida/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener el reporte');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en obtenerReportePorId:', error);
      throw error;
    }
  }
}; 