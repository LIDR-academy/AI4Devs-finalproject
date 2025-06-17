import { User, UserRole } from '../../types';

export const mockUsers: User[] = [
  // Usuarios de tecnología
  { id: 1, username: 'jperez', name: 'Juan Pérez', email: 'juan.perez@company.com', role: UserRole.TECNOLOGIA },
  { id: 2, username: 'mgarcia', name: 'María García', email: 'maria.garcia@company.com', role: UserRole.TECNOLOGIA },
  { id: 3, username: 'alopez', name: 'Ana López', email: 'ana.lopez@company.com', role: UserRole.TECNOLOGIA },
  
  // Usuarios de negocio - Marketing
  { id: 4, username: 'cmartinez', name: 'Carlos Martínez', email: 'carlos.martinez@company.com', role: UserRole.NEGOCIO, department: 2 },
  { id: 5, username: 'lrodriguez', name: 'Laura Rodríguez', email: 'laura.rodriguez@company.com', role: UserRole.NEGOCIO, department: 2 },
  
  // Usuarios de negocio - Ventas
  { id: 6, username: 'dhernandez', name: 'David Hernández', email: 'david.hernandez@company.com', role: UserRole.NEGOCIO, department: 3 },
  { id: 7, username: 'sgonzalez', name: 'Sara González', email: 'sara.gonzalez@company.com', role: UserRole.NEGOCIO, department: 3 },
  
  // Usuarios de negocio - RRHH
  { id: 8, username: 'rmoreno', name: 'Roberto Moreno', email: 'roberto.moreno@company.com', role: UserRole.NEGOCIO, department: 4 },
  
  // Usuarios de negocio - Finanzas
  { id: 9, username: 'pjimenez', name: 'Patricia Jiménez', email: 'patricia.jimenez@company.com', role: UserRole.NEGOCIO, department: 5 },
  
  // Usuarios de negocio - Operaciones
  { id: 10, username: 'fruiz', name: 'Fernando Ruiz', email: 'fernando.ruiz@company.com', role: UserRole.NEGOCIO, department: 6 },
  
  // Usuarios de negocio - Atención al Cliente
  { id: 11, username: 'mvazquez', name: 'Mónica Vázquez', email: 'monica.vazquez@company.com', role: UserRole.NEGOCIO, department: 7 },
  
  // Usuarios de negocio - Producto
  { id: 12, username: 'jcastro', name: 'Jorge Castro', email: 'jorge.castro@company.com', role: UserRole.NEGOCIO, department: 8 },
  
  // Administradores
  { id: 13, username: 'admin', name: 'Administrador', email: 'admin@company.com', role: UserRole.ADMIN }
];

export const getUserById = (id: number): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getUserName = (id: number): string => {
  const user = getUserById(id);
  return user ? user.name : 'Sin asignar';
};

export const getUsersByRole = (role: UserRole): User[] => {
  return mockUsers.filter(user => user.role === role);
};

export const getUsersByDepartment = (departmentId: number): User[] => {
  return mockUsers.filter(user => user.department === departmentId);
}; 