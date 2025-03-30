const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const getReporteDetalle = async (id: string) => {
    try {
        const response = await fetch(`${API_URL}/reportes/${id}`);
        if (!response.ok) {
            throw new Error('Error al obtener los detalles del reporte');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching reporte details:', error);
        throw error;
    }
}; 