export interface Report {
  id: string;
  mascota: {
    id: string;
    nombre: string;
    tipo: string;
    raza: string;
    color: string;
    edad: number;
    sexo: string;
    imagenes: Array<{
      id: string;
      url: string;
      key: string;
    }>;
  };
  ubicacion: string;
  fechaReporte: Date;
  estado: 'ABIERTO' | 'EN_PROCESO' | 'RESUELTO' | 'CERRADO';
  descripcion: string;
  encontrada: boolean;
  email: string;
  telefono: string;
  createdAt: Date;
  updatedAt: Date;
} 