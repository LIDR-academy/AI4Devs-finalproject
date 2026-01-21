import { TblInterface } from "..";

export interface FormInterface {
  value?: string | number;
  name: string; // Nombre del campo
  type: string; // Tipo de input (text, email, number, etc.)
  label: string; // Etiqueta del campo
  class?: string; // Texto de ayuda en el input
  placeholder: string; // Texto de ayuda en el input
  file?: {
    accept?: string;
    multiple: boolean;
  }; // Aceptar el input
  options?: { id: any; label: string, detail?: string }[]; // Opciones para selects o radios
  data?: TblInterface;
  validations?: { type: string; value?: any; message: string }[]; // Validaciones
  component?: string; // Agregamos esta línea para el componente personalizado
  disabled?: boolean;
}


